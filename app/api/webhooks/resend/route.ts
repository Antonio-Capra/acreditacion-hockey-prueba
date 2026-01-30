import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase con service role para operaciones del servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Tipos de eventos de Resend
type ResendEventType = 
  | "email.sent"
  | "email.delivered" 
  | "email.delivery_delayed"
  | "email.complained"
  | "email.bounced"
  | "email.opened"
  | "email.clicked";

interface ResendWebhookPayload {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Para bounces
    bounce?: {
      message: string;
      type: "hard" | "soft";
    };
    // Para clicks
    click?: {
      link: string;
      timestamp: string;
    };
  };
}

// Mapeo de eventos de Resend a nuestro status
const eventToStatus: Record<ResendEventType, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delayed",
  "email.complained": "complained",
  "email.bounced": "bounced",
  "email.opened": "opened",
  "email.clicked": "clicked",
};

export async function POST(req: Request) {
  try {
    const payload: ResendWebhookPayload = await req.json();
    
    console.log("[RESEND WEBHOOK] Received:", payload.type, payload.data.email_id);

    const { type, data } = payload;
    const status = eventToStatus[type] || type;
    const toEmail = data.to[0]; // Primer destinatario

    // Buscar el registro del email por resend_id
    const { data: existingLog } = await supabaseAdmin
      .from("email_logs")
      .select("id")
      .eq("resend_id", data.email_id)
      .single();

    if (existingLog) {
      // Actualizar el registro existente
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Si es un bounce, agregar detalles
      if (type === "email.bounced" && data.bounce) {
        updateData.bounce_type = data.bounce.type;
        updateData.bounce_message = data.bounce.message;
      }

      await supabaseAdmin
        .from("email_logs")
        .update(updateData)
        .eq("resend_id", data.email_id);

      console.log("[RESEND WEBHOOK] Updated log:", data.email_id, "->", status);
    } else {
      // Si no existe, crear uno nuevo (por si el webhook llega antes de que se guarde)
      const insertData: Record<string, unknown> = {
        resend_id: data.email_id,
        to_email: toEmail,
        email_type: "unknown",
        status,
      };

      if (type === "email.bounced" && data.bounce) {
        insertData.bounce_type = data.bounce.type;
        insertData.bounce_message = data.bounce.message;
      }

      await supabaseAdmin.from("email_logs").insert(insertData);

      console.log("[RESEND WEBHOOK] Created new log:", data.email_id, "->", status);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[RESEND WEBHOOK] Error:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}

// Resend verifica el endpoint con GET
export async function GET() {
  return NextResponse.json({ status: "Resend webhook endpoint active" });
}
