const escapeHtml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const formatTemplateText = (value: string) => {
  return escapeHtml(value).replaceAll("\n", "<br />");
};

export const renderTemplate = (template: string, data: Record<string, string>) => {
  return Object.entries(data).reduce(
    (acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value),
    template
  );
};

export const generateApprovalHTML = (
  nombre: string,
  apellido: string,
  zona: string,
  area: string,
  introText?: string
): string => {
  const instruccionesAcceso = zona === "Cancha"
    ? `
      <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Acceso Reporteros Graficos:</h3>
      <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
        Primero deben acreditarse en Prensa (al sur de la mampara del Hall Central de la Tribuna Livingstone; en caso de que este punto aun no se encuentre habilitado al momento de su llegada, deberan registrarse y retirar su pulsera en Acreditacion Staff, al norte de la misma mampara). Luego, deberan trasladarse por fuera del estadio a Logistica Norte, donde se encuentra el paso a cancha.
      </p>
      <p style="margin: 0 0 15px 0; color: #dc2626; font-weight: 600; line-height: 1.6;">
        Atencion: El ingreso a cancha debe realizarse portando el peto. Ningun reportero grafico puede acceder a la zona de exclusion durante ni despues del partido.
      </p>
    `
    : `
      <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Acceso: Acreditacion Prensa</h3>
      <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
        Al sur de la mampara del Hall Central de la Tribuna Livingstone (En caso de que este punto aun no se encuentre habilitado al momento de su llegada, deberan registrarse y retirar su pulsera en Acreditacion Staff, al norte de la misma mampara).
      </p>
      <p style="margin: 0 0 15px 0; color: #dc2626; font-weight: 600; line-height: 1.6;">
        Atencion: Acreditados en Zona 2, sin caseta radial, deberan ubicarse en los pupitres del Piso 6, en el lugar asignado para su medio, sin posibilidad de cambio. Los unicos ascensores que llegan a ese sector son el 2 (sector Sala de Prensa) y el 5.
      </p>
    `;

  const informacionComun = `
    <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Informacion General</h3>
    <p style="margin: 0 0 10px 0; color: #4b5563; line-height: 1.6;">
      <strong>Apertura de puertas:</strong> 18:30 hrs.<br>
      <strong>Cierre de ingreso de prensa:</strong> 20:15 hrs. (sin excepciones).
    </p>
    <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
      Les recomendamos trasladarse e ingresar al recinto con tiempo y anticipacion, ademas de planificar su viaje.
    </p>

    <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Requisitos de ingreso</h3>
    <ul style="margin: 0 0 15px 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
      <li>Registro Nacional de Hinchas (RNH).</li>
      <li>Cedula de Identidad o Pasaporte vigente.</li>
      <li>Credenciales 2026 emitidas por: ANFP, Circulo de Periodistas Deportivos o Union de Reporteros Graficos y Camarografos de Chile.</li>
      <li>Reporteros graficos: peto oficial obligatorio.</li>
      <li>Pulsera identificatoria entregada al ingreso, en la zona de acreditacion (define la zona autorizada para ejercer la labor).</li>
    </ul>

    <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Normas de cobertura</h3>
    <ul style="margin: 0 0 15px 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
      <li>No esta permitido grabar imagenes de cancha desde la tribuna, ni realizar despachos en vivo desde el interior del Claro Arena.</li>
      <li>Los equipos tecnicos de medios radiales (con o sin caseta de transmision) deben instalar su equipamiento y cableado desde las 17:00 hrs.</li>
      <li>Los RUT quedaran cargados en el sistema de control de acceso. Cada acreditado debera presentar su cedula de identidad, la cual se validara con Asistente Digital Personal en el acceso.</li>
      <li>La Sala de Prensa estara habilitada y disponible para el trabajo de los medios. En este espacio se llevaran a cabo las conferencias postpartido de ambos directores tecnicos. Las declaraciones de los jugadores se realizaran en la Zona Mixta. Ambas instancias estaran ubicadas en el primer nivel del edificio Livingstone.</li>
    </ul>

    <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
      Dudas o consultas previas, contactar al Area de Comunicaciones de Cruzados, al correo palarcon@cruzados.cl.
    </p>
    <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
      Por favor compartir estas indicaciones de cobertura con sus profesionales.
    </p>

    <h3 style="color: #1e5799; margin: 20px 0 10px 0; font-size: 16px;">Estacionamientos</h3>
    <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
      Para Medios de Comunicacion contamos con un cupo limitado de estacionamientos en Estacionamiento Republica de Honduras. Se les enviara Ticket de Estacionamiento a quienes lo hayan solicitado conforme a las indicaciones de acreditacion, y bajo la distribucion y los criterios propios del Area de Comunicaciones. Ningun auto puede ingresar al recinto sin su respectivo ticket.
    </p>
    <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
      El acceso vehicular exclusivo habilitado sera por: Republica de Honduras.
    </p>
    <p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.6;">
      Recuerden utilizar unicamente los estacionamientos designados, respetando siempre las vias de acceso y la tranquilidad del vecindario.
    </p>

    <p style="margin: 0 0 15px 0; color: #dc2626; font-weight: 600; line-height: 1.6;">
      ***Solicitamos a todos los acreditados mantener un comportamiento respetuoso con colegas, staff y publico durante toda su permanencia en el Claro Arena. El buen desarrollo de la jornada depende tambien de la colaboracion y profesionalismo de cada uno.
    </p>
    <p style="margin: 0 0 15px 0; color: #dc2626; font-weight: 600; line-height: 1.6;">
      ***El incumplimiento de cualquiera de las disposiciones o instrucciones del club durante el partido facultará a Universidad Católica a evaluar la participación del/de la profesional en futuros procesos de acreditación.
    </p>
  `;

  const introBlock = introText
    ? `
        <div style="background-color: #f0f9ff; border-left: 4px solid #1e5799; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #0c4a6e; line-height: 1.6;">
            ${formatTemplateText(introText)}
          </p>
        </div>
      `
    : "";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Acreditacion Aprobada</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; max-width: 100%;">
              <tr>
                <td style="background: linear-gradient(135deg, #1e5799 0%, #2989d8 50%, #3c9de5 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 10px 0; font-weight: 700;">
                    <img src="https://res.cloudinary.com/dubnevl0h/image/upload/v1768312623/Escudo_Club_Deportivo_Universidad_Catolica.svg_iwzca6.png" alt="Logo UC" style="height: 70px; margin-bottom: 10px;" />
                  </h1>
                  <p style="color: #ffffff; font-size: 16px; margin: 0; font-weight: 600;">
                    Sistema de Acreditaciones
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                      Acreditacion Aprobada
                    </div>
                  </div>
                  <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0; line-height: 1.6;">
                    Hola <strong>${escapeHtml(nombre)} ${escapeHtml(apellido)}</strong>,
                  </p>
                  ${introBlock}
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 20px; background-color: #eff6ff; border-left: 4px solid #1e5799; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0 0 8px 0; color: #0c4a6e; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                          Area de Acreditacion
                        </p>
                        <p style="margin: 0; color: #1e5799; font-size: 18px; font-weight: 700;">
                          ${escapeHtml(area)}
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
                          ${escapeHtml(zona || "Por confirmar")}
                        </p>
                      </td>
                    </tr>
                  </table>
                  <div style="background-color: #eff6ff; border-left: 4px solid #1e5799; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0; color: #0c4a6e; font-weight: 600; font-size: 15px;">
                      Instrucciones de Acceso:
                    </p>
                    ${instruccionesAcceso}
                  </div>
                  <div style="background-color: #f9fafb; border-left: 4px solid #6b7280; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    ${informacionComun}
                  </div>
                  <p style="font-size: 16px; color: #4b5563; margin: 0; line-height: 1.6;">
                    Te esperamos en el evento.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                    <strong>Acreditaciones Cruzados by Accredia</strong>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                    Este es un correo automatico, por favor no responder.<br>
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
};

export const generateRejectionHTML = (
  nombre: string,
  apellido: string,
  introText?: string
): string => {
  const introBlock = introText
    ? `
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #7f1d1d; line-height: 1.6;">
            ${formatTemplateText(introText)}
          </p>
        </div>
      `
    : "";

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acreditacion Rechazada</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; max-width: 100%;">
            <tr>
              <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 10px 0; font-weight: 700;">
                  <img src="https://res.cloudinary.com/dubnevl0h/image/upload/v1768312623/Escudo_Club_Deportivo_Universidad_Catolica.svg_iwzca6.png" alt="Logo UC" style="height: 70px; margin-bottom: 10px;" />
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
                    Acreditacion Rechazada
                  </div>
                </div>
                <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0; line-height: 1.6;">
                  Estimado <strong>${escapeHtml(nombre)} ${escapeHtml(apellido)}</strong>,
                </p>
                ${introBlock}
                <p style="font-size: 16px; color: #4b5563; margin: 0 0 30px 0; line-height: 1.6;">
                  Agradecemos su interes y comprension.
                </p>
                <p style="font-size: 16px; color: #4b5563; margin: 0 0 30px 0; line-height: 1.6;">
                  Saludos cordiales,<br>
                  Area de Prensa – Cruzados.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                  <strong>Acreditaciones Cruzados by Accredia</strong>
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  Este es un correo automatico, por favor no responder.<br>
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
};
