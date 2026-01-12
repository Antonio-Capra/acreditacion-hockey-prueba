import { NextResponse } from 'next/server';

export async function GET() {
  // Crear el contenido del CSV con un ejemplo
  const csvContent = `nombre,apellido,rut,correo,empresa,area
Juan,Pérez,12345678-K,juan@example.com,Empresa A,Prensa
María,González,98765432-9,maria@example.com,Empresa B,Seguridad
Carlos,López,11223344-5,carlos@example.com,Empresa C,Producción
Ana,Martínez,44332211-3,ana@example.com,Empresa D,Catering`;

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv;charset=utf-8',
      'Content-Disposition': 'attachment; filename="template_acreditacion.csv"',
    },
  });
}
