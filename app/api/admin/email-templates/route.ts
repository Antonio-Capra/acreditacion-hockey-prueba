import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface EmailTemplate {
  id?: number;
  evento_id: number;
  tipo: "approval" | "rejection";
  zona_key: "cancha" | "default";
  subject: string | null;
  partido_descripcion: string | null;
  partido_fecha: string | null;
  sede: string | null;
  apertura_puertas: string | null;
  cierre_ingreso_prensa: string | null;
  contacto_email: string | null;
  reply_to: string | null;
  instrucciones_acceso_override: string | null;
  info_general_override: string | null;
  intro_text_override: string | null;
}

// GET: obtener templates para un evento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventoId = Number(searchParams.get("evento_id"));

    if (!eventoId) {
      return NextResponse.json(
        { error: "evento_id es requerido" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .select("*")
      .eq("evento_id", eventoId)
      .order("tipo")
      .order("zona_key");

    if (error) throw error;

    return NextResponse.json({ templates: data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: upsert un template
export async function PUT(request: NextRequest) {
  try {
    const body: EmailTemplate = await request.json();

    if (!body.evento_id || !body.tipo || !body.zona_key) {
      return NextResponse.json(
        { error: "evento_id, tipo y zona_key son requeridos" },
        { status: 400 }
      );
    }

    const upsertData = {
      evento_id: body.evento_id,
      tipo: body.tipo,
      zona_key: body.zona_key,
      subject: body.subject || null,
      partido_descripcion: body.partido_descripcion || null,
      partido_fecha: body.partido_fecha || null,
      sede: body.sede || null,
      apertura_puertas: body.apertura_puertas || null,
      cierre_ingreso_prensa: body.cierre_ingreso_prensa || null,
      contacto_email: body.contacto_email || null,
      reply_to: body.reply_to || null,
      instrucciones_acceso_override: body.instrucciones_acceso_override || null,
      info_general_override: body.info_general_override || null,
      intro_text_override: body.intro_text_override || null,
    };

    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .upsert(upsertData, {
        onConflict: "evento_id,tipo,zona_key",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ template: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
