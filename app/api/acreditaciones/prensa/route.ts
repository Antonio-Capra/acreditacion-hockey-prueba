import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface Acreditado {
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  rut: string;
  email: string;
  cargo: string;
  tipo_credencial: string;
  numero_credencial: string;
}

interface AccreditacionRequest {
  responsable_nombre: string;
  responsable_primer_apellido: string;
  responsable_segundo_apellido: string;
  responsable_rut: string;
  responsable_email: string;
  responsable_telefono: string;
  empresa: string;
  area: string;
  acreditados: Acreditado[];
  evento_id?: number;
}

// Fallback areas data in case Supabase table doesn't exist
const FALLBACK_AREAS = [
  { id: 1, codigo: "prensa", cupo_maximo: 50, evento_id: 1 },
  { id: 2, codigo: "seguridad", cupo_maximo: 30, evento_id: 1 },
  { id: 3, codigo: "produccion", cupo_maximo: 40, evento_id: 1 },
  { id: 4, codigo: "catering", cupo_maximo: 20, evento_id: 1 },
];

export async function POST(req: Request) {
  // Cliente anónimo para INSERT
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Cliente con service role para SELECT (sin restricciones RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const data: AccreditacionRequest = await req.json();
    const {
      responsable_nombre,
      responsable_primer_apellido,
      responsable_segundo_apellido,
      responsable_rut,
      responsable_email,
      responsable_telefono,
      empresa,
      area,
      acreditados,
      evento_id: requestEventoId
    } = data;

    // Determinar evento_id: usar el enviado o buscar el evento activo
    let eventoId = requestEventoId;
    if (!eventoId) {
      const { data: activeEvento } = await supabaseAdmin
        .from("eventos")
        .select("id")
        .eq("activo", true)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();
      eventoId = activeEvento?.id ?? 1;
    }

    // Validaciones básicas
    if (!responsable_email || !responsable_nombre || !responsable_rut || !empresa || !area || !acreditados.length) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // 1. Obtener información de áreas
    let areasData;
    try {
      const { data, error: areasError } = await supabaseAdmin
        .from("areas_prensa")
        .select("id, codigo, cupo_maximo");

      if (areasError) {
        console.warn("Error al acceder a la tabla areas_prensa, usando datos de fallback:", areasError.message);
        areasData = FALLBACK_AREAS;
      } else {
        areasData = data || FALLBACK_AREAS;
      }
    } catch (err) {
      console.warn("Error al consultar áreas, usando datos de fallback:", err);
      areasData = FALLBACK_AREAS;
    }

    // 2. Validar cupos para CADA acreditado
    // IMPORTANTE: Contar existentes PERO considerar que estamos insertando múltiples
    const areaRecord = areasData?.find((a) => a.codigo === area);
    
    if (!areaRecord) {
      return NextResponse.json(
        { error: `Área ${area} no encontrada` },
        { status: 400 }
      );
    }

    // Contar acreditados EXISTENTES para esta área + empresa
    // NOTA: usando ilike para case-insensitive comparison
    const { count: countAll, error: countError1 } = await supabaseAdmin
      .from("acreditados")
      .select("*", { count: "exact", head: true })
      .eq("evento_id", eventoId)
      .ilike("area", area)
      .ilike("empresa", empresa);

    if (countError1) throw countError1;

    // Contar acreditados RECHAZADOS para esta área + empresa
    // NOTA: usando ilike para case-insensitive comparison
    const { count: countRechazados, error: countError2 } = await supabaseAdmin
      .from("acreditados")
      .select("*", { count: "exact", head: true })
      .eq("evento_id", eventoId)
      .ilike("area", area)
      .ilike("empresa", empresa)
      .eq("status", "rechazado");

    if (countError2) throw countError2;

    // Acreditados válidos = todos - rechazados
    const currentCount = (countAll || 0) - (countRechazados || 0);
    const totalAfterInsert = currentCount + acreditados.length;

    if (totalAfterInsert > areaRecord.cupo_maximo) {
      return NextResponse.json(
        {
          error: `No hay cupos disponibles para ${empresa} en el área ${area}. Máximo: ${areaRecord.cupo_maximo}, Acreditados existentes: ${currentCount}, Solicitados: ${acreditados.length}, Total: ${totalAfterInsert}`,
          area: area,
          empresa: empresa,
          cupos_disponibles: Math.max(0, areaRecord.cupo_maximo - currentCount),
          cupo_maximo: areaRecord.cupo_maximo,
          acreditados_existentes: currentCount,
          acreditados_solicitados: acreditados.length,
        },
        { status: 400 }
      );
    }

    // 2.5. Obtener zonas para asignación automática
    const { data: zonasData, error: zonasError } = await supabaseAdmin
      .from("zonas_acreditacion")
      .select("id, nombre");

    if (zonasError) {
      console.warn("Error al obtener zonas:", zonasError.message);
    }

    // Función para determinar zona basada en cargo
    const getZonaIdByCargo = (cargo: string): number | null => {
      if (!zonasData) return null;
      
      const cargoLower = cargo.toLowerCase();
      
      // Cargos que van a "Prensa"
      const prensaCargos = [
        "periodista",
        "periodista pupitre", 
        "relator",
        "comentarista",
        "camarógrafo",
        "técnico"
      ];
      
      // Cargos que van a "Cancha"
      const canchaCargos = [
        "reportero gráfico cancha",
        "equipo comunicaciones visita"
      ];
      
      if (prensaCargos.some(c => cargoLower.includes(c))) {
        const zonaPrensa = zonasData.find(z => z.nombre.toLowerCase() === "prensa");
        return zonaPrensa ? zonaPrensa.id : null;
      }
      
      if (canchaCargos.some(c => cargoLower.includes(c))) {
        const zonaCancha = zonasData.find(z => z.nombre.toLowerCase() === "cancha");
        return zonaCancha ? zonaCancha.id : null;
      }
      
      return null; // Sin zona asignada automáticamente
    };

    // 3. Insertar acreditados
    const acreditadosToInsert = acreditados.map((acreditado: Acreditado) => ({
      evento_id: eventoId,
      nombre: acreditado.nombre,
      primer_apellido: acreditado.primer_apellido,
      segundo_apellido: acreditado.segundo_apellido,
      rut: acreditado.rut,
      email: acreditado.email,
      cargo: acreditado.cargo,
      tipo_credencial: acreditado.tipo_credencial,
      numero_credencial: acreditado.numero_credencial,
      area: area,
      empresa: empresa,
      zona_id: getZonaIdByCargo(acreditado.cargo),
      status: "pendiente",
      responsable_nombre,
      responsable_primer_apellido,
      responsable_segundo_apellido,
      responsable_rut,
      responsable_email,
      responsable_telefono,
    }));

    const { error: insertError } = await supabaseAnon
      .from("acreditados")
      .insert(acreditadosToInsert);

    if (insertError) throw insertError;

    return NextResponse.json(
      {
        success: true,
        message: "Acreditación enviada correctamente",
        acreditados_insertados: acreditados.length,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : error,
      },
      { status: 500 }
    );
  }
}
