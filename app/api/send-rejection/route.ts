import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para guardar logs
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ResendError {
  message: string;
  code?: string;
}

// 🔐 Configuración SEGURA para evitar bloqueos
const EMAIL_CONFIG = {
  default: "onboarding@resend.dev",
  verified: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
  custom: process.env.RESEND_VERIFIED_DOMAIN || null,
};

// Seleccionar email según ambiente
const getFromEmail = (): string => {
  if (EMAIL_CONFIG.custom) {
    return `Acreditaciones Cruzados <noreply.cruzados@${EMAIL_CONFIG.custom}>`;
  }
  if (EMAIL_CONFIG.verified && EMAIL_CONFIG.verified !== EMAIL_CONFIG.default) {
    return `Acreditaciones Cruzados <${EMAIL_CONFIG.verified}>`;
  }
  return `Acreditaciones Cruzados <${EMAIL_CONFIG.default}>`;
};

// Función para generar el HTML del email de rechazo
const generateRejectionHTML = (nombre: string, apellido: string): string => `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acreditación Rechazada</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; max-width: 100%;">
            <tr>
              <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 10px 0; font-weight: 700;">
                  <img src="https://res.cloudinary.com/dubnevl0h/image/upload/v1768312623/Escudo_Club_Deportivo_Universidad_Cat%C3%B3lica.svg_iwzca6.png" alt="Logo UC" style="height: 70px; margin-bottom: 10px;" />
                </h1>
                <p style="color: #ffffff; font-size: 16px; margin: 0; font-weight: 600;">
                  Sistema de Acreditaciones
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                    ❌ Acreditación Rechazada
                  </div>
                </div>
                <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0; line-height: 1.6;">
                  Estimado <strong>${nombre} ${apellido}</strong>,
                </p>
                <p style="font-size: 16px; color: #4b5563; margin: 0 0 30px 0; line-height: 1.6;">
                  Debido a la capacidad limitada de espacios disponibles en prensa para el partido Universidad Católica vs Deportes Concepción a disputarse el domingo 8 de febrero a las 20:30 horas en el Claro Arena, lamentamos informarle que su(s) acreditación(ones) ha(n) sido rechazada(s).
                </p>
                <p style="font-size: 16px; color: #4b5563; margin: 0 0 30px 0; line-height: 1.6;">
                  Agradecemos su interés y comprensión.
                </p>
                <p style="font-size: 16px; color: #4b5563; margin: 0 0 30px 0; line-height: 1.6;">
                  Saludos cordiales,<br>
                  Área de Prensa – Cruzados.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                  <strong>Acreditaciones Cruzados by Accredia</strong>
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  Este es un correo automático, por favor no responder.<br>
                  Para consultas, contacta al equipo organizador.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Check if it's a batch request
    if (Array.isArray(body)) {
      const emails = body.map((item: { nombre: string; apellido: string; correo: string }) => ({
        from: getFromEmail(),
        to: item.correo,
        replyTo: "palarcon@cruzados.cl",
        subject: "❌ Tu acreditación ha sido rechazada",
        html: generateRejectionHTML(item.nombre, item.apellido)
      }));

      const { data: batchResult, error } = await resend.batch.send(emails);

      if (error) {
        console.error("ERROR RESEND batch:", error);
        return NextResponse.json(
          { error: "Error al enviar correos", detalle: error },
          { status: 500 }
        );
      }

      // Guardar logs de cada email enviado
      const emailLogs = body.map((item: { id?: number; nombre: string; apellido: string; correo: string; eventoId?: number | null }, index: number) => ({
        acreditacion_id: item.id || null,
        evento_id: item.eventoId ?? null,
        resend_id: batchResult?.data?.[index]?.id || null,
        to_email: item.correo,
        email_type: "rejection",
        status: "sent",
        nombre: item.nombre,
        apellido: item.apellido,
      }));

      await supabaseAdmin.from("email_logs").insert(emailLogs);

      return NextResponse.json({ ok: true, sent: emails.length });
    } else {
      // Single email
      const { nombre, apellido, correo } = body;

      if (!correo) {
        return NextResponse.json(
          { error: "Falta el correo del destinatario" },
          { status: 400 }
        );
      }

      const { data: emailResult, error } = await resend.emails.send({
        from: getFromEmail(),
        to: correo,
        replyTo: "palarcon@cruzados.cl",
        subject: "❌ Tu acreditación ha sido rechazada",
        html: generateRejectionHTML(nombre, apellido)
      });

      if (error) {
        console.error("ERROR RESEND for", correo, ":", error);
        const errorType = typeof error === "object" ? (error as ResendError).message : String(error);
        console.error("[EMAIL_SECURITY] Error enviando correo a:", correo?.split("@")[1] || "unknown", "Error type:", errorType);

        return NextResponse.json(
          { error: "Error al enviar correo", detalle: error },
          { status: 500 }
        );
      }

      // Guardar log del email
      await supabaseAdmin.from("email_logs").insert({
        acreditacion_id: body.id || null,
        evento_id: body.eventoId ?? null,
        resend_id: emailResult?.id || null,
        to_email: correo,
        email_type: "rejection",
        status: "sent",
        nombre,
        apellido,
      });

      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    console.error("Exception in send-rejection:", err);
    return NextResponse.json(
      { error: "Error interno en send-rejection" },
      { status: 500 }
    );
  }
}
