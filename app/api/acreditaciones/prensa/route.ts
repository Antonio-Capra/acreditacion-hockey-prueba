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

export async function POST(req: Request) {
  try {
    const data: AccreditacionRequest = await req.json();
    const { 
      responsable_nombre, 
      responsable_primer_apellido, 
      responsable_email, 
      responsable_telefono,
      empresa,
      area,
      acreditados 
    } = data;

    console.log("\n========== API POST /acreditaciones/prensa ==========");
    console.log(`⏰ ${new Date().toISOString()}`);
    console.log(`REQUEST RECIBIDO:`);
    console.log(`  - Responsable: ${responsable_nombre}`);
    console.log(`  - Empresa: "${empresa}"`);
    console.log(`  - Área: "${area}"`);
    console.log(`  - Acreditados: ${acreditados?.length}`);
    console.log("===================================================\n");

    // Validaciones básicas
    if (!responsable_email || !responsable_nombre || !empresa || !area || !acreditados.length) {
      console.log("VALIDACIÓN FALLIDA: datos incompletos");
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

    console.log("=== VALIDACIÓN DE CUPOS ===");
    console.log(`Empresa: "${empresa}"`);
    console.log(`Área: "${area}" (Máximo: ${areaRecord.cupo_maximo})`);
    console.log(`Total en BD: ${countAll || 0}`);
    console.log(`Rechazados: ${countRechazados || 0}`);
    console.log(`Válidos (total - rechazados): ${currentCount}`);
    console.log(`Nuevos a insertar: ${acreditados.length}`);
    console.log(`Total después de insertar: ${totalAfterInsert}`);
    console.log(`LÍMITE MÁXIMO: ${areaRecord.cupo_maximo}`);
    console.log(`¿Permitir?: ${totalAfterInsert} <= ${areaRecord.cupo_maximo} = ${totalAfterInsert <= areaRecord.cupo_maximo}`);
    console.log("=========================");

    if (totalAfterInsert > areaRecord.cupo_maximo) {
      console.log(`❌ VALIDACIÓN FALLIDA: Total (${totalAfterInsert}) > Máximo (${areaRecord.cupo_maximo})`);
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

    const { data: insertedData, error: insertError } = await supabaseAnon
      .from("acreditados")
      .insert(acreditadosToInsert);

    if (insertError) throw insertError;

    console.log("ACREDITADOS INSERTADOS");

    return NextResponse.json(
      {
        success: true,
        message: "Acreditación enviada correctamente",
        acreditados_insertados: acreditados.length,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("ERROR EN API:", error);
    return NextResponse.json(
      {
        error: error.message || "Error al procesar la acreditación",
        details: error,
      },
      { status: 500 }
    );
  }
}
