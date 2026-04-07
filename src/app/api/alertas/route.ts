import { NextRequest, NextResponse } from "next/server";
import { supabaseGet, supabasePost, isSupabaseConfigured } from "@/lib/supabase";
import { generateFallbackData } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const severidad = searchParams.get("severidad");
  const estado = searchParams.get("estado");
  const limit = searchParams.get("limit") || "20";

  if (isSupabaseConfigured()) {
    try {
      let params = `select=*&order=timestamp.desc&limit=${limit}`;
      if (severidad && severidad !== "todas") params += `&severidad=eq.${severidad}`;
      if (estado) params += `&estado=eq.${estado}`;
      const data = await supabaseGet("alertas", params);
      return NextResponse.json({ source: "supabase", alertas: data });
    } catch {
      // Fall through to generated data
    }
  }

  // Fallback: alertas generadas
  let alertas = generateFallbackData().alertas as Array<Record<string, unknown>>;
  if (severidad && severidad !== "todas") {
    alertas = alertas.filter((a) => a.severidad === severidad);
  }
  if (estado) {
    alertas = alertas.filter((a) => a.estado === estado);
  }
  return NextResponse.json({ source: "generated", alertas });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const alerta = {
      id: body.id || `ALT-${Date.now()}`,
      timestamp: body.timestamp || new Date().toISOString(),
      categoria: body.categoria,
      severidad: body.severidad,
      titulo: body.titulo,
      descripcion: body.descripcion,
      recomendacion_ia: body.recomendacion_ia || "",
      origen: body.origen || "n8n workflow",
      estado: body.estado || "activa",
    };

    if (isSupabaseConfigured()) {
      const result = await supabasePost("alertas", alerta);
      return NextResponse.json({ source: "supabase", alerta: result }, { status: 201 });
    }

    // Sin Supabase: aceptar y confirmar (no-op storage)
    return NextResponse.json({ source: "memory", alerta, message: "Alerta registrada (modo demo sin persistencia)" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: `Error procesando alerta: ${err}` }, { status: 400 });
  }
}
