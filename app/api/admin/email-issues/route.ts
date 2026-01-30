import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Obtener emails con problemas (bounced o complained)
    const { data, error } = await supabaseAdmin
      .from("email_logs")
      .select("*")
      .in("status", ["bounced", "complained", "delayed"])
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching email issues:", error);
      return NextResponse.json(
        { error: "Error al obtener problemas de email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      issues: data || [],
      count: data?.length || 0,
    });
  } catch (err) {
    console.error("Exception in email-issues:", err);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
