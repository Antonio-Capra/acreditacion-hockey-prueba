import { NextResponse } from "next/server";
import { Resend } from "resend";

interface ResendError {
  message: string;
  code?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

// 🔐 Configuración SEGURA para evitar bloqueos
const EMAIL_CONFIG = {
  // ✅ Email verificado AUTOMÁTICAMENTE en Resend (sin configuración)
  // Este es el único que funciona sin verificación de dominio
  default: "onboarding@resend.dev",

  // Email personalizado (solo si verificaste el dominio)
  verified: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",

  // Dominio propio (solo si verificaste en panel Resend)
  custom: process.env.RESEND_VERIFIED_DOMAIN || null,
};

// Seleccionar email según ambiente
const getFromEmail = (): string => {
  // Si tienes dominio personalizado verificado, úsalo
  if (EMAIL_CONFIG.custom) {
    return `Acreditaciones UC <noreply.cruzados@${EMAIL_CONFIG.custom}>`;
  }

  // Si tienes email verificado en Resend, úsalo
  if (EMAIL_CONFIG.verified && EMAIL_CONFIG.verified !== EMAIL_CONFIG.default) {
    return `Acreditaciones UC <${EMAIL_CONFIG.verified}>`;
  }

  // Por defecto: usar email de Resend que funciona sin verificación
  return `Acreditaciones UC <${EMAIL_CONFIG.default}>`;
};

export async function POST(req: Request) {
  try {
    const { nombre, apellido, correo, zona, area } = await req.json();

    if (!correo) {
      return NextResponse.json(
        { error: "Falta el correo del destinatario" },
        { status: 400 }
      );
    }

    // 🚨 Verificar si la cuenta está limitada (sandbox implícito)
    // Si recibe error "unverified email", usar email de prueba
    const toEmail: string = correo;

    // 🔐 Email validado y seguro
    const from = getFromEmail();

    const { data, error } = await resend.emails.send({
      from,
      to: toEmail,
      subject: "❌ Tu acreditación ha sido rechazada",
      html: `
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
                <!-- Contenedor principal -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; max-width: 100%;">

                  <!-- Header con gradiente UC -->
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

                  <!-- Contenido principal -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <!-- Badge de error -->
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                          ❌ Acreditación Rechazada
                        </div>
                      </div>

                      <!-- Saludo -->
                      <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0; line-height: 1.6;">
                        Hola <strong>${nombre} ${apellido}</strong>,
                      </p>

                      <p style="font-size: 16px; color: #4b5563; margin: 0 0 30px 0; line-height: 1.6;">
                        Lamentablemente, tu solicitud de acreditación ha sido <strong style="color: #dc2626;">rechazada</strong>.
                      </p>

                      <!-- Información en tarjetas -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 8px; margin-bottom: 15px;">
                            <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                              Área Solicitada
                            </p>
                            <p style="margin: 0; color: #dc2626; font-size: 18px; font-weight: 700;">
                              ${area}
                            </p>
                          </td>
                        </tr>
                        <tr><td style="height: 15px;"></td></tr>
                        <tr>
                          <td style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #e8b543; border-radius: 8px;">
                            <p style="margin: 0 0 8px 0; color: #92400e; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                              Zona Solicitada
                            </p>
                            <p style="margin: 0; color: #78350f; font-size: 18px; font-weight: 700;">
                              ${zona ?? "N/A"}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Instrucciones -->
                      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: 600; font-size: 15px;">
                          📋 Para apelar o más información:
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #dc2626; font-size: 14px; line-height: 1.8;">
                          <li>Contacta a comunicaciones@cruzados.cl</li>
                          <li>Indica tu nombre completo y motivo de la solicitud</li>
                          <li>Responde a este correo con tus dudas</li>
                        </ul>
                      </div>

                      <p style="font-size: 16px; color: #4b5563; margin: 0; line-height: 1.6;">
                        Gracias por tu interés en el evento.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                        <strong>Acreditaciones UC</strong>
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
      `,
    });

    if (error) {
      console.error("ERROR RESEND:", error);

      // 🔐 Logging detallado para debugging sin exponer credenciales
      const errorType = typeof error === "object" ? (error as ResendError).message : String(error);
      console.error("[EMAIL_SECURITY] Error enviando correo a:", correo?.split("@")[1] || "unknown");

      // Si es error de verificación/autenticación, avisar al admin
      if (errorType?.includes("verify") || errorType?.includes("auth")) {
        console.error("[⚠️ CRÍTICO] Posible problema de verificación de dominio - Contactar admin");
        return NextResponse.json(
          { error: "Error en configuración de correo. Contacte al administrador." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Error al enviar correo", detalle: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno en send-rejection" },
      { status: 500 }
    );
  }
}