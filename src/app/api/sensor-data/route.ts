import { NextRequest, NextResponse } from "next/server";
import { supabaseUpsert, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Endpoint para recibir datos del simulador Python o de n8n.
 * POST /api/sensor-data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timestamp, records, anomalias } = body;

    if (isSupabaseConfigured() && records) {
      await supabaseUpsert("estado_actual", records);
    }

    return NextResponse.json({
      received: true,
      timestamp: timestamp || new Date().toISOString(),
      records_count: records?.length || 0,
      anomalias_count: anomalias?.length || 0,
    });
  } catch (err) {
    return NextResponse.json({ error: `Error procesando sensor data: ${err}` }, { status: 400 });
  }
}
