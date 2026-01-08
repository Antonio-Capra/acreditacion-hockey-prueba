import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { nombre, apellido, correo, zona, area } = await req.json();

    if (!correo) {
      return NextResponse.json(
        { error: "Falta el correo del destinatario" },
        { status: 400 }
      );
    }

    // 👇 Para desarrollo: usar SIEMPRE onboarding@resend.dev
    const from = "Acreditaciones Mundial <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from,
      to: correo,
      subject: "Acreditación aprobada · Mundial de Hockey",
      html: `
        <p>Hola ${nombre} ${apellido},</p>
        <p>Tu acreditación para el área <strong>${area}</strong> ha sido aprobada.</p>
        <p>Zona asignada: <strong>${zona ?? "Por definir"}</strong></p>
        <p>¡Te esperamos en el evento!</p>
      `,
    });

    if (error) {
      console.error("ERROR RESEND:", error);
      return NextResponse.json(
        { error: "Error al enviar correo", detalle: error },
        { status: 500 }
      );
    }

    console.log("RESEND OK:", data);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ERROR send-approval:", err);
    return NextResponse.json(
      { error: "Error interno en send-approval" },
      { status: 500 }
    );
  }
}
