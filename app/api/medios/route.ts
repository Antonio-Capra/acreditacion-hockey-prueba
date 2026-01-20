import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET: Obtener medios por evento
export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { searchParams } = new URL(req.url);
    const eventoId = searchParams.get('evento_id');

    if (!eventoId) {
      return NextResponse.json(
        { error: 'evento_id es requerido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medios')
      .select('id, nombre, cupo_disponible, cupo_total')
      .eq('evento_id', parseInt(eventoId))
      .order('nombre');

    if (error) throw error;

    return NextResponse.json({ data, ok: true });
  } catch (error) {
    console.error('Error en GET medios:', error);
    return NextResponse.json(
      { error: 'Error al obtener medios' },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo medio
export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const body = await req.json();
    const { evento_id, nombre, cupo_total } = body;

    if (!evento_id || !nombre || !cupo_total) {
      return NextResponse.json(
        { error: 'evento_id, nombre y cupo_total son requeridos' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medios')
      .insert({
        evento_id,
        nombre: nombre.trim(),
        cupo_disponible: cupo_total,
        cupo_total,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, ok: true });
  } catch (error) {
    console.error('Error creando medio:', error);
    return NextResponse.json(
      { error: 'Error al crear medio' },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar cupos disponibles
export async function PATCH(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const body = await req.json();
    const { medio_id, cupo_disponible } = body;

    if (!medio_id || cupo_disponible === undefined) {
      return NextResponse.json(
        { error: 'medio_id y cupo_disponible son requeridos' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medios')
      .update({ cupo_disponible })
      .eq('id', medio_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, ok: true });
  } catch (error) {
    console.error('Error actualizando medio:', error);
    return NextResponse.json(
      { error: 'Error al actualizar medio' },
      { status: 500 }
    );
  }
}
