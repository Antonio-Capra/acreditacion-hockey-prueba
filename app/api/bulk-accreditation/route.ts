import { NextResponse } from 'next/server';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

interface FileWithName extends Blob {
  name?: string;
}

interface AccreditacionRecord {
  nombre: string;
  apellido: string;
  rut?: string;
  correo: string;
  empresa?: string;
  area: string;
}

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Archivo no proporcionado o inválido.' }, { status: 400 });
    }

    const fileName = (file as FileWithName).name || '';
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const records: AccreditacionRecord[] = [];

    if (isExcel) {
      // Procesar Excel
      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<AccreditacionRecord>(sheet);
      records.push(...data);
    } else {
      // Procesar CSV
      const fileStream = Readable.from(Buffer.from(await file.arrayBuffer()));
      const parser = fileStream.pipe(parse({ columns: true }));

      for await (const record of parser) {
        records.push(record);
      }
    }

    // Validar que los registros tengan los campos requeridos
    const recordsValidos = records.filter(record => {
      return record.nombre && record.apellido && record.correo && record.area;
    });

    if (recordsValidos.length === 0) {
      return NextResponse.json({ 
        error: 'No hay registros válidos. Asegúrate de que cada fila tenga nombre, apellido, correo y area.' 
      }, { status: 400 });
    }

    // Preparar los datos para insertar en Supabase
    const datosParaInsertar = recordsValidos.map(record => ({
      nombre: record.nombre.trim(),
      apellido: record.apellido.trim(),
      rut: record.rut?.trim() || '',
      correo: record.correo.trim().toLowerCase(),
      empresa: record.empresa?.trim() || '',
      area: record.area.trim(),
    }));

    // Insertar en Supabase
    const { error } = await supabase
      .from('acreditaciones')
      .insert(datosParaInsertar);

    if (error) {
      console.error('Error al insertar en Supabase:', error);
      return NextResponse.json({ 
        error: `Error al guardar en la base de datos: ${error.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `${recordsValidos.length} acreditaciones cargadas exitosamente.`,
      insertados: recordsValidos.length,
      totalLineas: records.length
    });
  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    return NextResponse.json({ error: 'Error al procesar el archivo.' }, { status: 500 });
  }
}