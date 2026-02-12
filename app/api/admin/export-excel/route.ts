import { NextRequest, NextResponse } from "next/server";
import * as ExcelJS from "exceljs";
import * as XLSX from 'xlsx';
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

export async function GET(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "completo";
    const statusFilter = searchParams.get("status") || "all";
    let eventoId = Number(searchParams.get("evento_id")) || 0;

    // Si no se envía evento_id, buscar el evento activo
    if (!eventoId) {
      const { data: activeEvento } = await supabaseAdmin
        .from("eventos")
        .select("id")
        .eq("activo", true)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();
      eventoId = activeEvento?.id ?? 1;
    }

    let query = supabaseAdmin.from("acreditados").select("*").eq("evento_id", eventoId);
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: acreditados, error: acreditadosError } = await query;

    if (acreditadosError) throw new Error(acreditadosError.message);
    if (!acreditados || acreditados.length === 0) {
      return NextResponse.json({ error: "No hay datos para exportar" }, { status: 404 });
    }

    const { data: zonas } = await supabaseAdmin.from("zonas_acreditacion").select("id, nombre");
    const zonasMap = new Map(zonas?.map((z: Zona) => [z.id, z.nombre]) || []);

    interface Area {
      codigo: string;
      nombre: string;
    }

    const { data: areas } = await supabaseAdmin.from("areas_prensa").select("codigo, nombre");
    const areasMap = new Map(areas?.map((a: Area) => [a.codigo, a.nombre]) || []);

    const dateStr = new Date().toISOString().split("T")[0];

    // --- CASO 1: PUNTO TICKET (XLSX) ---
    if (format === "puntoticket") {
      // Construir workbook simple para Punto Ticket
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('PuntoTicket');

      worksheet.columns = [
        { key: 'Nombre', header: 'Nombre', width: 20 },
        { key: 'Apellido', header: 'Apellido', width: 25 },
        { key: 'RUT', header: 'RUT', width: 18 },
        { key: 'Empresa', header: 'Empresa', width: 25 },
        { key: 'Area', header: 'Área', width: 15 },
        { key: 'Acreditacion', header: 'Acreditación', width: 20 },
        { key: 'Patente', header: 'Patente', width: 15 },
      ];

      acreditados.forEach((a: Acreditado) => {
        worksheet.addRow({
          Nombre: a.nombre,
          Apellido: `${a.primer_apellido}${a.segundo_apellido ? ` ${a.segundo_apellido}` : ''}`,
          RUT: a.rut,
          Empresa: a.empresa,
          Area: 'CRUZADOS',
          Acreditacion: a.zona_id ? zonasMap.get(a.zona_id) || 'Sin asignar' : 'Sin asignar',
          Patente: '',
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="acreditados_puntoticket_${dateStr}.xlsx"`,
        },
      });
    }

    // --- CASO 2: COMPLETO (EXCEL REAL) ---
    else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Acreditados');

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

      // Estilo rápido cabecera
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E5799' } };
      worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

      acreditados.forEach((a: Acreditado) => {
        worksheet.addRow({
          nombre: a.nombre,
          primerApellido: a.primer_apellido,
          segundoApellido: a.segundo_apellido || "",
          rut: a.rut,
          email: a.email,
          cargo: a.cargo,
          tipoCredencial: a.tipo_credencial,
          numeroCredencial: a.numero_credencial || "",
          empresa: a.empresa,
          area: areasMap.get(a.area) || a.area,
          zona: a.zona_id ? zonasMap.get(a.zona_id) || "Sin asignar" : "Sin asignar",
          estado: a.status.charAt(0).toUpperCase() + a.status.slice(1),
          responsableNombre: a.responsable_nombre || "",
          responsablePrimerApellido: a.responsable_primer_apellido || "",
          responsableSegundoApellido: a.responsable_segundo_apellido || "",
          responsableRut: a.responsable_rut || "",
          responsableEmail: a.responsable_email || "",
          responsableTelefono: a.responsable_telefono || "",
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="acreditados_completo_${dateStr}.xlsx"`,
        },
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}