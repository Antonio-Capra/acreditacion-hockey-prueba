import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
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
    const statusFilter = searchParams.get("status") || "all"; // "all", "aprobada", "pendiente", "rechazada"

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
      const msg = statusFilter === "aprobada" 
        ? "No hay acreditaciones APROBADAS aún. Debes aprobar algunas acreditaciones primero para exportarlas."
        : statusFilter === "pendiente"
        ? "No hay acreditaciones PENDIENTES."
        : statusFilter === "rechazada"
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

    let dataExcel: ExcelRow[];
    let sheetName: string;

    if (format === "puntoticket") {
      // Formato específico para Punto Ticket
      // Estructura: Nombre, Apellido, RUT, Empresa, Área Claro Arena/Cruzados, Acreditación, Patente
      dataExcel = acreditados.map((a: Acreditado) => ({
        Nombre: a.nombre,
        Apellido: a.primer_apellido + (a.segundo_apellido ? ` ${a.segundo_apellido}` : ""),
        RUT: a.rut,
        Empresa: a.empresa,
        "Área Claro Arena/Cruzados": "Cruzados",
        Acreditación: a.zona_id ? zonasMap.get(a.zona_id) || "Sin asignar" : "Sin asignar",
        Patente: "", // Campo vacío para que lo llenen
      }));
      sheetName = "Punto Ticket";
    } else {
      // Formato completo con toda la información
      dataExcel = acreditados.map((a: Acreditado) => ({
        Nombre: a.nombre,
        "Primer Apellido": a.primer_apellido,
        "Segundo Apellido": a.segundo_apellido || "",
        RUT: a.rut,
        Email: a.email,
        Cargo: a.cargo,
        "Tipo Credencial": a.tipo_credencial,
        "N° Credencial": a.numero_credencial || "",
        Empresa: a.empresa,
        "Área": a.area,
        Zona: a.zona_id ? zonasMap.get(a.zona_id) || "Sin asignar" : "Sin asignar",
        Estado: a.status.charAt(0).toUpperCase() + a.status.slice(1),
        "Responsable": a.responsable_nombre || "",
        "Primer Apellido Responsable": a.responsable_primer_apellido || "",
        "Segundo Apellido Responsable": a.responsable_segundo_apellido || "",
        "RUT Responsable": a.responsable_rut || "",
        "Email Responsable": a.responsable_email || "",
        "Teléfono Responsable": a.responsable_telefono || "",
      }));
      sheetName = "Acreditados";
    }

    // Crear workbook
    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Ajustar ancho de columnas automáticamente
    const colWidths = Object.keys(dataExcel[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    ws["!cols"] = colWidths;

    // Generar buffer
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

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
