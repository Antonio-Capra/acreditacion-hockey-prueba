import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { 
      responsable_nombre, 
      responsable_apellido, 
      responsable_rut, 
      responsable_email, 
      responsable_telefono, 
      medio, 
      acreditados 
    } = await req.json();

    console.log("REQUEST RECIBIDO:", { 
      responsable_nombre, 
      medio, 
      acreditados_count: acreditados?.length 
    });

    // Validaciones
    if (!responsable_email || !responsable_nombre || !acreditados.length) {
      console.log("VALIDACIÓN FALLIDA: datos incompletos");
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // 1. Obtener el medio por nombre (exacta primero, luego flexible)
    const medioTrimmed = medio.trim();
    
    // Buscar coincidencia exacta primero
    let { data: medioData, error: medioError } = await supabase
      .from("medios")
      .select("id, cupo_disponible")
      .eq("nombre", medioTrimmed)
      .maybeSingle();

    // Si no encuentra coincidencia exacta, buscar parcial
    if (!medioData) {
      const { data: medioParcial } = await supabase
        .from("medios")
        .select("id, cupo_disponible, nombre")
        .ilike("nombre", `%${medioTrimmed}%`)
        .maybeSingle();
      
      medioData = medioParcial;
      console.log("Búsqueda parcial:", { medioTrimmed, encontrado: !!medioParcial });
    } else {
      console.log("Búsqueda exacta exitosa:", medioTrimmed);
    }

    if (!medioData) {
      // Debug: obtener todos los medios
      const { data: todosMedios } = await supabase
        .from("medios")
        .select("nombre");
      
      console.error("Medio no encontrado:", { 
        buscado: medioTrimmed,
        disponibles: todosMedios?.map(m => m.nombre)
      });
      
      return NextResponse.json(
        { error: `Medio no encontrado. Buscado: "${medioTrimmed}"` },
        { status: 400 }
      );
    }

    // 2. Validar cupos
    if (medioData.cupo_disponible < acreditados.length) {
      return NextResponse.json(
        { 
          error: `Cupos insuficientes. Disponibles: ${medioData.cupo_disponible}, Solicitados: ${acreditados.length}` 
        },
        { status: 400 }
      );
    }

    // 3. Crear registro en acreditaciones_prensa
    const { data: acreditacionData, error: acreditacionError } = await supabase
      .from("acreditaciones_prensa")
      .insert([
        {
          responsable_nombre,
          responsable_apellido,
          responsable_rut,
          responsable_email,
          responsable_telefono,
          medio_id: medioData.id,
          estado: "pendiente",
        },
      ])
      .select()
      .single();

    if (acreditacionError || !acreditacionData) {
      console.error("Error creando acreditación:", acreditacionError);
      return NextResponse.json(
        { error: "Error al crear la solicitud" },
        { status: 500 }
      );
    }

    // 4. Crear registros en acreditados_prensa
    const acreditadosToInsert = acreditados.map((acreditado: any) => ({
      acreditacion_id: acreditacionData.id,
      nombre: acreditado.nombre,
      apellido: acreditado.apellido,
      rut: acreditado.rut,
      email: acreditado.email,
      cargo: acreditado.cargo,
      tipo_credencial: acreditado.tipo_credencial,
      numero_credencial: acreditado.numero_credencial,
      activo: true,
    }));

    const { error: acreditadosError } = await supabase
      .from("acreditados_prensa")
      .insert(acreditadosToInsert);

    if (acreditadosError) {
      console.error("Error creando acreditados:", acreditadosError);
      return NextResponse.json(
        { error: "Error al registrar acreditados" },
        { status: 500 }
      );
    }

    // 5. Actualizar cupos disponibles
    const { error: updateError } = await supabase
      .from("medios")
      .update({ 
        cupo_disponible: medioData.cupo_disponible - acreditados.length 
      })
      .eq("id", medioData.id);

    if (updateError) {
      console.error("Error actualizando cupos:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar cupos" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Solicitud registrada exitosamente",
      acreditacion_id: acreditacionData.id 
    });

  } catch (err) {
    console.error("ERROR prensa:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
