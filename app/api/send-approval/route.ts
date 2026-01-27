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

    // Determinar instrucciones según la zona
    const instruccionesAcceso = zona === "Cancha" 
      ? `
        <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Acceso Reporteros Gráficos:</h3>
        <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
          Primero deben acreditarse en Prensa (al sur de la mampara del Hall Central de la Tribuna Livingstone; en caso de que este punto aún no se encuentre habilitado al momento de su llegada, deberán registrarse y retirar su pulsera en Acreditación Staff, al norte de la misma mampara). Luego, deberán trasladarse por fuera del estadio a Logística Norte, donde se encuentra el paso a cancha.
        </p>
        <p style="margin: 0 0 15px 0; color: #dc2626; font-weight: 600; line-height: 1.6;">
          ¡Atención! El ingreso a cancha debe realizarse portando el peto. Ningún reportero gráfico puede acceder a la zona de exclusión durante ni después del partido.
        </p>
      `
      : `
        <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Acceso: Acreditación Prensa</h3>
        <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
          Al sur de la mampara del Hall Central de la Tribuna Livingstone (En caso de que este punto aún no se encuentre habilitado al momento de su llegada, deberán registrarse y retirar su pulsera en Acreditación Staff, al norte de la misma mampara).
        </p>
        <p style="margin: 0 0 15px 0; color: #dc2626; font-weight: 600; line-height: 1.6;">
          ¡Atención! Acreditados en Zona 2, sin caseta radial, deberán ubicarse en los pupitres del Piso 6, en el lugar asignado para su medio, sin posibilidad de cambio. Los únicos ascensores que llegan a ese sector son el 2 (sector Sala de Prensa) y el 5.
        </p>
      `;

    const informacionComun = `
      <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Información General</h3>
      <p style="margin: 0 0 10px 0; color: #4b5563; line-height: 1.6;">
        <strong>Apertura de puertas:</strong> 18:00 hrs.<br>
        <strong>Cierre de ingreso de prensa:</strong> 19:30 hrs. (sin excepciones).
      </p>
      <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
        Les recomendamos trasladarse e ingresar al recinto con tiempo y anticipación, además de planificar su viaje.
      </p>

      <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Requisitos de ingreso</h3>
      <ul style="margin: 0 0 15px 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
        <li>Registro Nacional de Hinchas (RNH).</li>
        <li>Cédula de Identidad o Pasaporte vigente.</li>
        <li>Credenciales 2026 emitidas por: ANFP, Círculo de Periodistas Deportivos o Unión de Reporteros Gráficos y Camarógrafos de Chile.</li>
        <li>Reporteros gráficos: peto oficial obligatorio.</li>
        <li>Pulsera identificatoria entregada al ingreso, en la zona de acreditación (define la zona autorizada para ejercer la labor).</li>
      </ul>

      <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Normas de cobertura</h3>
      <ul style="margin: 0 0 15px 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
        <li>No está permitido grabar imágenes de cancha desde la tribuna, ni realizar despachos en vivo desde el interior del Claro Arena.</li>
        <li>Los equipos técnicos de medios radiales (con o sin caseta de transmisión) deben instalar su equipamiento y cableado desde las 17:00 hrs.</li>
        <li>Los RUT quedarán cargados en el sistema de control de acceso. Cada acreditado deberá presentar su cédula de identidad, la cual se validará con Asistente Digital Personal en el acceso.</li>
        <li>La Sala de Prensa estará habilitada y disponible para el trabajo de los medios. En este espacio se llevarán a cabo las conferencias postpartido de ambos directores técnicos. Las declaraciones de los jugadores se realizarán en la Zona Mixta. Ambas instancias estarán ubicadas en el primer nivel del edificio Livingstone.</li>
      </ul>

      <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
        Dudas o consultas previas, contactar al Área de Comunicaciones de Cruzados, al correo palarcon@cruzados.cl.
      </p>
      <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
        Por favor compartir estas indicaciones de cobertura con sus profesionales.
      </p>

      <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Estacionamientos</h3>
      <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
        Para Medios de Comunicación contamos con un cupo limitado de estacionamientos en Estacionamiento República de Honduras. Se les enviará Ticket de Estacionamiento a quienes lo hayan solicitado conforme a las indicaciones de acreditación, y bajo la distribución y los criterios propios del Área de Comunicaciones. Ningún auto puede ingresar al recinto sin su respectivo ticket.
      </p>
      <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
        El acceso vehicular exclusivo habilitado será por: República de Honduras.
      </p>
      <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
        Recuerden utilizar únicamente los estacionamientos designados, respetando siempre las vías de acceso y la tranquilidad del vecindario.
      </p>

      <p style="margin: 0 0 15px 0; color: #dc2626; font-weight: 600; line-height: 1.6;">
        ***Solicitamos a todos los acreditados mantener un comportamiento respetuoso con colegas, staff y público durante toda su permanencia en el Claro Arena. El buen desarrollo de la jornada depende también de la colaboración y profesionalismo de cada uno.
      </p>
      <p style="margin: 0 0 15px 0; color: #dc2626; font-weight: 600; line-height: 1.6;">
        ***El incumplimiento de cualquiera de las disposiciones o instrucciones del club durante el partido facultará a Universidad Católica a evaluar la participación del/de la profesional en futuros procesos de acreditación.
      </p>
    `;

    const { error } = await resend.emails.send({
      from,
      to: toEmail,
      replyTo: "palarcon@cruzados.cl",
      subject: "✅ Tu acreditación ha sido aprobada",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Acreditación Aprobada</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Contenedor principal -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; max-width: 100%;">
                  
                  <!-- Header con gradiente UC -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e5799 0%, #2989d8 50%, #3c9de5 100%); padding: 40px 30px; text-align: center;">
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
                      <!-- Badge de éxito -->
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                          ✅ Acreditación Aprobada
                        </div>
                      </div>

                      <!-- Saludo -->
                      <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0; line-height: 1.6;">
                        Hola <strong>${nombre} ${apellido}</strong>,
                      </p>

                      <p style="font-size: 16px; color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
                        Nos complace informarte que tu solicitud de acreditación ha sido <strong style="color: #10b981;">aprobada exitosamente</strong>.
                      </p>

                      <p style="font-size: 16px; color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
                        <strong>Su solicitud de acreditación para el partido Universidad Católica vs. Deportes Concepción a disputarse el domingo 8 de febrero a las 20:30 horas en el Claro Arena, ha sido aceptada.</strong>
                      </p>

                      <!-- Información en tarjetas -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px; background-color: #eff6ff; border-left: 4px solid #1e5799; border-radius: 8px; margin-bottom: 15px;">
                            <p style="margin: 0 0 8px 0; color: #0c4a6e; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                              Área de Acreditación
                            </p>
                            <p style="margin: 0; color: #1e5799; font-size: 18px; font-weight: 700;">
                              ${area}
                            </p>
                          </td>
                        </tr>
                        <tr><td style="height: 15px;"></td></tr>
                        <tr>
                          <td style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #e8b543; border-radius: 8px;">
                            <p style="margin: 0 0 8px 0; color: #92400e; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                              Zona Asignada
                            </p>
                            <p style="margin: 0; color: #78350f; font-size: 18px; font-weight: 700;">
                              ${zona ?? "Por confirmar"}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Instrucciones de Acceso -->
                      <div style="background-color: #eff6ff; border-left: 4px solid #1e5799; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0 0 10px 0; color: #0c4a6e; font-weight: 600; font-size: 15px;">
                          📋 Instrucciones de Acceso:
                        </p>
                        ${instruccionesAcceso}
                      </div>

                      <!-- Información General -->
                      <div style="background-color: #f9fafb; border-left: 4px solid #6b7280; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        ${informacionComun}
                      </div>

                      <p style="font-size: 16px; color: #4b5563; margin: 0; line-height: 1.6;">
                        ¡Te esperamos en el evento!
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
  } catch {
    return NextResponse.json(
      { error: "Error interno en send-approval" },
      { status: 500 }
    );
  }
}
