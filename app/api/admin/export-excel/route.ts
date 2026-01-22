import { NextRequest, NextResponse } from "next/server";
import * as ExcelJS from "exceljs";
import { createClient } from "@supabase/supabase-js";

interface Acreditado {
  id: number;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  rut: string;
  email: string;
  cargo: string;
  tipo_credencial: string;
  numero_credencial?: string;
  empresa: string;
  area: string;
  zona_id?: number;
  status: string;
  responsable_nombre?: string;
  responsable_primer_apellido?: string;
  responsable_segundo_apellido?: string;
  responsable_rut?: string;
  responsable_email?: string;
  responsable_telefono?: string;
}

interface Zona {
  id: number;
  nombre: string;
}

interface ExcelRow {
  [key: string]: string | number | undefined;
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "completo"; // "completo" o "puntoticket"
    const statusFilter = searchParams.get("status") || "all"; // "all", "aprobado", "pendiente", "rechazado"

    // Construir query
    let query = supabaseAdmin
      .from("acreditados")
      .select("*")
      .eq("evento_id", 1);

    // Aplicar filtro de estado si no es "all"
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: acreditados, error: acreditadosError } = await query;

    if (acreditadosError) {
      throw new Error(`Error al obtener acreditados: ${acreditadosError.message}`);
    }

    if (!acreditados || acreditados.length === 0) {
      const msg = statusFilter === "aprobado"
        ? "No hay acreditaciones APROBADAS aún. Debes aprobar algunas acreditaciones primero para exportarlas."
        : statusFilter === "pendiente"
        ? "No hay acreditaciones PENDIENTES."
        : statusFilter === "rechazado"
        ? "No hay acreditaciones RECHAZADAS."
        : "No hay acreditaciones para exportar.";

      return NextResponse.json(
        {
          error: msg,
          suggestion: "Cambia el filtro de estado en el dashboard o aprueba algunas acreditaciones primero."
        },
        { status: 404 }
      );
    }

    // Obtener zonas para mapear zona_id a nombre
    const { data: zonas, error: zonasError } = await supabaseAdmin
      .from("zonas_acreditacion")
      .select("id, nombre")
      .eq("evento_id", 1);

    if (zonasError) {
      console.warn("⚠️ Error al obtener zonas:", zonasError.message);
    }

    const zonasMap = new Map(zonas?.map((z: Zona) => [z.id, z.nombre]) || []);

    // Crear workbook con ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Acreditados');

    if (format === "puntoticket") {
      // Formato específico para Punto Ticket con 7 columnas simplificadas
      worksheet.columns = [
        { key: 'nombre', header: 'Nombre', width: 20 },
        { key: 'apellido', header: 'Apellido', width: 30 },
        { key: 'rut', header: 'RUT', width: 18 },
        { key: 'empresa', header: 'Empresa', width: 25 },
        { key: 'area', header: 'Área', width: 20 },
        { key: 'acreditacion', header: 'Acreditación', width: 15 },
        { key: 'patente', header: 'Patente', width: 15 },
      ];

      // Estilo de cabecera
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E5799' } // Azul #1E5799
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // Blanco
          bold: true,
          size: 10,
          name: 'Arial'
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Altura de fila de cabecera
      worksheet.getRow(1).height = 30;

      // Agregar datos
      acreditados.forEach((acreditado: Acreditado) => {
        const apellidoCompleto = `${acreditado.primer_apellido}${acreditado.segundo_apellido ? ` ${acreditado.segundo_apellido}` : ''}`;

        worksheet.addRow({
          nombre: acreditado.nombre,
          apellido: apellidoCompleto,
          rut: acreditado.rut,
          empresa: acreditado.empresa,
          area: "CRUZADOS",
          acreditacion: acreditado.zona_id ? zonasMap.get(acreditado.zona_id) || "Sin asignar" : "Sin asignar",
          patente: "",
        });
      });

      // Aplicar estilos a todas las celdas de datos
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Saltar cabecera
          row.eachCell((cell) => {
            cell.font = {
              name: 'Arial',
              size: 10
            };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        }
      });

      // Activar filtros automáticos
      worksheet.autoFilter = {
        from: 'A1',
        to: 'G1' // Hasta la columna G (7 columnas)
      };

    } else {
      // Formato completo con toda la información
      worksheet.columns = [
        { key: 'nombre', header: 'Nombre', width: 20 },
        { key: 'primerApellido', header: 'Primer Apellido', width: 20 },
        { key: 'segundoApellido', header: 'Segundo Apellido', width: 20 },
        { key: 'rut', header: 'RUT', width: 18 },
        { key: 'email', header: 'Email', width: 30 },
        { key: 'cargo', header: 'Cargo', width: 20 },
        { key: 'tipoCredencial', header: 'Tipo Credencial', width: 20 },
        { key: 'numeroCredencial', header: 'N° Credencial', width: 15 },
        { key: 'empresa', header: 'Empresa', width: 25 },
        { key: 'area', header: 'Área', width: 20 },
        { key: 'zona', header: 'Zona', width: 25 },
        { key: 'estado', header: 'Estado', width: 15 },
        { key: 'responsableNombre', header: 'Responsable', width: 25 },
        { key: 'responsablePrimerApellido', header: 'Primer Apellido Resp.', width: 25 },
        { key: 'responsableSegundoApellido', header: 'Segundo Apellido Resp.', width: 25 },
        { key: 'responsableRut', header: 'RUT Responsable', width: 18 },
        { key: 'responsableEmail', header: 'Email Responsable', width: 30 },
        { key: 'responsableTelefono', header: 'Teléfono Responsable', width: 20 },
      ];

      // Estilo de cabecera
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E5799' } // Azul #1E5799
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // Blanco
          bold: true,
          size: 10,
          name: 'Arial'
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Altura de fila de cabecera
      worksheet.getRow(1).height = 30;

      // Agregar datos
      acreditados.forEach((acreditado: Acreditado) => {
        worksheet.addRow({
          nombre: acreditado.nombre,
          primerApellido: acreditado.primer_apellido,
          segundoApellido: acreditado.segundo_apellido || "",
          rut: acreditado.rut,
          email: acreditado.email,
          cargo: acreditado.cargo,
          tipoCredencial: acreditado.tipo_credencial,
          numeroCredencial: acreditado.numero_credencial || "",
          empresa: acreditado.empresa,
          area: acreditado.area,
          zona: acreditado.zona_id ? zonasMap.get(acreditado.zona_id) || "Sin asignar" : "Sin asignar",
          estado: acreditado.status.charAt(0).toUpperCase() + acreditado.status.slice(1),
          responsableNombre: acreditado.responsable_nombre || "",
          responsablePrimerApellido: acreditado.responsable_primer_apellido || "",
          responsableSegundoApellido: acreditado.responsable_segundo_apellido || "",
          responsableRut: acreditado.responsable_rut || "",
          responsableEmail: acreditado.responsable_email || "",
          responsableTelefono: acreditado.responsable_telefono || "",
        });
      });

      // Aplicar estilos a todas las celdas de datos
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Saltar cabecera
          row.eachCell((cell) => {
            cell.font = {
              name: 'Arial',
              size: 10
            };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        }
      });

      // Activar filtros automáticos
      worksheet.autoFilter = {
        from: 'A1',
        to: 'R1' // Hasta la columna R (18 columnas)
      };
    }

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Crear respuesta con headers para descarga
    const response = new NextResponse(buffer);
    response.headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="acreditados_${format}_${new Date().toISOString().split("T")[0]}.xlsx"`
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al generar Excel",
      },
      { status: 500 }
    );
  }
}
