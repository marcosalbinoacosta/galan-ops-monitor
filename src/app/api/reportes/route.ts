import { NextRequest, NextResponse } from "next/server";
import { supabaseGet, supabasePost, isSupabaseConfigured } from "@/lib/supabase";
import { generateFallbackData } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const turno = searchParams.get("turno");
  const fecha = searchParams.get("fecha");
  const limit = searchParams.get("limit") || "10";

  if (isSupabaseConfigured()) {
    try {
      let params = `select=*&order=fecha.desc,turno.desc&limit=${limit}`;
      if (turno) params += `&turno=eq.${turno}`;
      if (fecha) params += `&fecha=eq.${fecha}`;
      const data = await supabaseGet("reportes", params);
      return NextResponse.json({ source: "supabase", reportes: data });
    } catch {
      // Fall through
    }
  }

  let reportes = generateFallbackData().reportes as Array<Record<string, unknown>>;
  if (turno) {
    reportes = reportes.filter((r) => r.turno === turno);
  }
  if (fecha) {
    reportes = reportes.filter((r) => r.fecha === fecha);
  }
  return NextResponse.json({ source: "generated", reportes });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reporte = {
      id: body.id || `RT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${(body.turno || "M")[0].toUpperCase()}`,
      turno: body.turno,
      fecha: body.fecha || new Date().toISOString().slice(0, 10),
      supervisor: body.supervisor || "Sistema automático",
      resumen_ia: body.resumen_ia || "",
      produccion_ton: body.produccion_ton || 0,
      alertas_generadas: body.alertas_generadas || 0,
      alertas_resueltas: body.alertas_resueltas || 0,
      personal_presente: body.personal_presente || 0,
      novedades: body.novedades || [],
      estado: body.estado || "borrador",
    };

    if (isSupabaseConfigured()) {
      const result = await supabasePost("reportes", reporte);
      return NextResponse.json({ source: "supabase", reporte: result }, { status: 201 });
    }

    return NextResponse.json({ source: "memory", reporte, message: "Reporte registrado (modo demo sin persistencia)" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: `Error procesando reporte: ${err}` }, { status: 400 });
  }
}
