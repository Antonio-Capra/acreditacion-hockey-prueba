import { NextResponse } from "next/server";
import { Resend } from "resend";

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
    return `Acreditaciones UC <noreply@${EMAIL_CONFIG.custom}>`;
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
    const { to, subject, message, acreditacion_id, estado } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Determine email template based on estado
    const emailBody = `
      <h2 style="color: #1e5799;">${subject}</h2>
      <p style="font-size: 16px; line-height: 1.6;">
        Estimado,<br><br>
        ${message}<br><br>
        ${
          estado === "aprobada"
            ? `
          Felicitaciones, tu solicitud de acreditación ha sido <strong>aprobada</strong>.<br><br>
          Se enviarán más detalles a los acreditados registrados.<br><br>
          <strong>Información importante:</strong><br>
          - Debes presentar tu credencial en la entrada del evento<br>
          - Acceso permitido desde 2 horas antes del evento<br>
          - No se permite ingreso de acompañantes sin credencial<br><br>
          `
            : `
          Lamentablemente, tu solicitud de acreditación ha sido <strong>rechazada</strong>.<br><br>
          Para más información o si deseas apelar esta decisión, contacta a:<br>
          comunicaciones@cruzados.cl<br><br>
          `
        }
        Si tienes dudas, no dudes en comunicarte.<br><br>
        Saludos cordiales,<br>
        <strong>Equipo de Acreditación</strong><br>
        Universidad Católica
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888;">
        Este es un correo automático. Por favor no respondas a este mensaje.
      </p>
    `;

    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to,
      subject,
      html: emailBody,
    });

    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { error: "Error al enviar email" },
        { status: 500 }
      );
    }

    console.log(`Email sent to ${to} for acreditacion ${acreditacion_id}`);

    return NextResponse.json({
      ok: true,
      message: "Email enviado exitosamente",
    });
  } catch (err) {
    console.error("ERROR admin prensa email:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
