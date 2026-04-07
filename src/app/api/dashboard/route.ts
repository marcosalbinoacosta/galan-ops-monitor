import { NextResponse } from "next/server";
import { supabaseGet, isSupabaseConfigured } from "@/lib/supabase";
import { generateFallbackData } from "@/lib/fallback-data";

export const dynamic = "force-dynamic";

function rand(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

export async function GET() {
  if (isSupabaseConfigured()) {
    try {
      const [estadoRows, alertasRows, reportesRows] = await Promise.all([
        supabaseGet("estado_actual", "select=*"),
        supabaseGet("alertas", "select=*&order=timestamp.desc&limit=10"),
        supabaseGet("reportes", "select=*&order=fecha.desc,turno.desc&limit=5"),
      ]);

      const estado = estadoRows as Array<{ id: string; tipo: string; data: Record<string, unknown> }>;
      const alertas = alertasRows as Array<Record<string, unknown>>;
      const reportes = reportesRows as Array<Record<string, unknown>>;

      if (estado.length > 0) {
        const pozos = estado.filter((e) => e.tipo === "pozo").map((e) => ({ id: e.id, ...e.data } as Record<string, unknown>));
        const meteoRow = estado.find((e) => e.tipo === "meteo");
        const seguridadRow = estado.find((e) => e.tipo === "seguridad");
        const plantaNfRow = estado.find((e) => e.tipo === "planta_nf");

        const meteo = meteoRow?.data ?? {};
        const seguridad = seguridadRow?.data ?? {};
        const plantaNf = plantaNfRow?.data ?? {};

        const pozosActivos = pozos.filter((p) => p.estado === "activo");
        const liPromedio = pozosActivos.length > 0
          ? Math.round(pozosActivos.reduce((s, p) => s + Number(p.concentracion_li_mgl ?? 859), 0) / pozosActivos.length)
          : 859;

        const alertasActivas = alertas.filter((a) => a.estado !== "resuelta");

        return NextResponse.json({
          timestamp: new Date().toISOString(),
          source: "supabase",
          kpis: {
            produccion_hoy_ton: rand(3.5, 4.8),
            produccion_mes_ton: rand(100, 140),
            target_mes_ton: 433,
            inventario_pozas_lce_ton: Math.round(10000 + (Math.random() - 0.5) * 200),
            pozos_activos: pozosActivos.length,
            pozos_total: pozos.length,
            pozas_operativas: 5,
            pozas_total: 6,
            planta_nf_estado: plantaNf.estado ?? "operativa",
            concentracion_promedio_li: liPromedio,
            dias_sin_lti: Number(seguridad.dias_sin_lti ?? 187),
            personal_en_sitio: Number(seguridad.personal_en_sitio ?? 234),
            consumo_agua_m3_ton: rand(1.5, 2.1),
            temperatura_actual_c: Number(meteo.temperatura_c ?? 12),
            viento_actual_kmh: Number(meteo.velocidad_viento_kmh ?? 14),
            tasa_evaporacion_hoy: Number(meteo.tasa_evaporacion_mm_dia ?? 5.6),
            alertas_activas: alertasActivas.length,
            alertas_criticas: alertasActivas.filter((a) => a.severidad === "critica").length,
          },
          pozos,
          planta_nf: plantaNf,
          meteo,
          seguridad,
          alertas,
          reportes,
        });
      }
    } catch {
      // Supabase no disponible, caer a datos generados
    }
  }

  return NextResponse.json(generateFallbackData());
}
