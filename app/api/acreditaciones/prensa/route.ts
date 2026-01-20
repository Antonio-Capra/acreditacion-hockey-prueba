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
  responsable_email: string;
  responsable_telefono: string;
  empresa: string;
  area: string;
  acreditados: Acreditado[];
}

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
      responsable_email, 
      responsable_telefono,
      empresa,
      area,
      acreditados 
    } = data;

    // Validaciones básicas
    if (!responsable_email || !responsable_nombre || !empresa || !area || !acreditados.length) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // 1. Obtener información de áreas
    const { data: areasData, error: areasError } = await supabaseAdmin
      .from("areas_prensa")
      .select("id, codigo, cupo_maximo")
      .eq("evento_id", 1);

    if (areasError) throw areasError;

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
      .eq("evento_id", 1)
      .ilike("area", area)
      .ilike("empresa", empresa);

    if (countError1) throw countError1;

    // Contar acreditados RECHAZADOS para esta área + empresa
    // NOTA: usando ilike para case-insensitive comparison
    const { count: countRechazados, error: countError2 } = await supabaseAdmin
      .from("acreditados")
      .select("*", { count: "exact", head: true })
      .eq("evento_id", 1)
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

    // 3. Insertar acreditados
    const acreditadosToInsert = acreditados.map((acreditado: Acreditado) => ({
      evento_id: 1,
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
      status: "pendiente",
      responsable_nombre,
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
