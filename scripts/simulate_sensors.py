"""
Simulador de sensores HMW Phase 1 - Galan Lithium
Genera lecturas realistas y las envia a:
  1. Supabase (actualiza estado_actual + inserta sensor_readings)
  2. n8n webhook (para evaluacion de alertas con IA)

Uso:
    python simulate_sensors.py                # Corre cada 30s
    python simulate_sensors.py --interval 10  # Corre cada 10s
    python simulate_sensors.py --once         # Una sola vez
"""

import random
import time
import json
import math
import argparse
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import URLError

# ============================================================
# CONFIGURACION (usar variables de entorno o valores default)
# ============================================================
import os
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
N8N_WEBHOOK = os.environ.get("N8N_WEBHOOK_URL", "http://localhost:5678/webhook") + "/sensor-data"
APP_URL = os.environ.get("APP_URL", "http://localhost:3000")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=representation",
}

# Parametros reales HMW
HMW = {
    "li_min": 820, "li_max": 900, "li_avg": 859,
    "caudal_min": 15, "caudal_max": 40,
    "temp_min": -20, "temp_max": 25,
    "viento_avg": 15, "viento_max": 80,
    "radiacion_max": 8.5,
    "presion_base": 620,
}


def rand(min_v, max_v):
    return round(min_v + random.random() * (max_v - min_v), 1)


def gauss(media, desv):
    u1 = max(1e-10, random.random())
    u2 = random.random()
    z = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
    return media + z * desv


def hora_local():
    return (datetime.now(timezone.utc).hour - 3 + 24) % 24


def supabase_upsert(table, data):
    """Upsert a Supabase."""
    try:
        body = json.dumps(data if isinstance(data, list) else [data]).encode()
        req = Request(f"{SUPABASE_URL}/rest/v1/{table}", data=body, headers=HEADERS, method="POST")
        resp = urlopen(req, timeout=10)
        return resp.status
    except URLError as e:
        print(f"  Supabase error: {e}")
        return 0


def n8n_send(data):
    """Enviar datos al webhook de n8n."""
    try:
        body = json.dumps(data).encode()
        req = Request(N8N_WEBHOOK, data=body, headers={"Content-Type": "application/json"}, method="POST")
        resp = urlopen(req, timeout=10)
        return resp.status
    except URLError as e:
        print(f"  n8n error: {e}")
        return 0


def generar_meteo():
    hora = hora_local()
    fase = ((hora - 6) / 24) * 2 * math.pi
    temp = round(2.5 + 22.5 * math.sin(fase) + gauss(0, 1.5), 1)
    radiacion = 0 if (hora < 6 or hora > 20) else round(max(0, 8.5 * math.exp(-0.5 * ((hora - 13) / 3) ** 2) + gauss(0, 0.3)), 1)
    viento = round(max(0, 15 + gauss(0, 8)), 1)
    if random.random() < 0.05:
        viento = round(random.uniform(50, 80), 1)
    dirs = ["N", "NE", "NW", "W", "SW", "S"]
    pesos = [0.1, 0.1, 0.35, 0.2, 0.15, 0.1]
    r = random.random()
    acum = 0
    direccion = "NW"
    for i, p in enumerate(pesos):
        acum += p
        if r < acum:
            direccion = dirs[i]
            break
    evap = round(min(8, 3 + 5 * (radiacion / 8.5) * 0.7 + viento * 0.02 + gauss(0, 0.3)), 1)

    return {
        "temperatura_c": temp,
        "humedad_relativa_pct": round(max(10, min(45, 18 + gauss(0, 5)))),
        "velocidad_viento_kmh": viento,
        "direccion_viento": direccion,
        "radiacion_solar_kwh_m2": radiacion,
        "indice_uv": round(max(0, min(16, 13 + gauss(0, 1.5)))) if 6 <= hora <= 20 else 0,
        "precipitacion_mm": 0 if random.random() > 0.02 else round(random.uniform(1, 15), 1),
        "presion_barometrica_mbar": round(620 + gauss(0, 3)),
        "tasa_evaporacion_mm_dia": evap,
    }


def generar_pozos():
    activos = [1, 2, 3, 5, 6]  # P-04 en mantenimiento, P-07 standby
    pozos = []
    for i in range(1, 8):
        if i in activos:
            pozos.append({
                "id": f"P-{i:02d}", "tipo": "pozo",
                "data": {
                    "nombre": f"Pozo HMW-{i:02d}", "estado": "activo",
                    "caudal_lps": rand(20, 38),
                    "concentracion_li_mgl": round(gauss(859, 15)),
                    "presion_cabezal_bar": rand(1.2, 2.6),
                    "temperatura_salmuera_c": rand(17, 21),
                    "drawdown_m": rand(1.0, 3.5),
                    "horas_operacion": 10000 + i * 1000,
                }
            })
        elif i == 4:
            pozos.append({"id": "P-04", "tipo": "pozo", "data": {"nombre": "Pozo HMW-04", "estado": "mantenimiento", "caudal_lps": 0, "concentracion_li_mgl": 855, "presion_cabezal_bar": 0, "temperatura_salmuera_c": 17.3, "drawdown_m": 0.5, "horas_operacion": 9876}})
        else:
            pozos.append({"id": "P-07", "tipo": "pozo", "data": {"nombre": "Pozo HMW-07", "estado": "standby", "caudal_lps": 0, "concentracion_li_mgl": 869, "presion_cabezal_bar": 0, "temperatura_salmuera_c": 18.1, "drawdown_m": 0.8, "horas_operacion": 6543}})
    return pozos


def detectar_anomalias(pozos, meteo):
    """Detecta condiciones que deberian generar alertas."""
    anomalias = []

    for p in pozos:
        d = p["data"]
        if d["estado"] == "activo":
            # Vibracion simulada
            vibracion = round(3.0 + gauss(0, 1.5), 1)
            if vibracion > 5.5:
                anomalias.append({
                    "tipo": "equipamiento",
                    "origen": f"Sensor vibracion {p['id']}",
                    "detalle": f"Vibracion {vibracion} mm/s en bomba {p['id']} (umbral: 5.5)",
                    "severidad_sugerida": "alta" if vibracion > 7.0 else "media",
                    "datos": {"pozo": p["id"], "vibracion_mms": vibracion, "umbral": 5.5}
                })
            # Caudal bajo
            if d["caudal_lps"] < 18:
                anomalias.append({
                    "tipo": "produccion",
                    "origen": f"Caudalimetro {p['id']}",
                    "detalle": f"Caudal bajo en {p['id']}: {d['caudal_lps']} L/s (min operativo: 18)",
                    "severidad_sugerida": "media",
                    "datos": {"pozo": p["id"], "caudal": d["caudal_lps"]}
                })

    # Viento fuerte
    if meteo["velocidad_viento_kmh"] > 50:
        anomalias.append({
            "tipo": "meteorologia",
            "origen": "Estacion meteorologica HMW",
            "detalle": f"Viento {meteo['velocidad_viento_kmh']} km/h (umbral operativo: 60 km/h)",
            "severidad_sugerida": "alta" if meteo["velocidad_viento_kmh"] > 60 else "media",
            "datos": meteo
        })

    # Precipitacion
    if meteo["precipitacion_mm"] > 5:
        anomalias.append({
            "tipo": "ambiental",
            "origen": "Pluviometro HMW",
            "detalle": f"Precipitacion {meteo['precipitacion_mm']} mm detectada",
            "severidad_sugerida": "alta",
            "datos": {"precipitacion_mm": meteo["precipitacion_mm"]}
        })

    return anomalias


def run_cycle(mode="supabase"):
    ts = datetime.now(timezone.utc).isoformat()
    print(f"\n[{ts}] Generando lecturas...")

    meteo = generar_meteo()
    pozos = generar_pozos()
    anomalias = detectar_anomalias(pozos, meteo)

    all_records = pozos + [
        {"id": "meteo-hmw", "tipo": "meteo", "data": meteo},
        {"id": "seguridad-hmw", "tipo": "seguridad", "data": {
            "ltifr": 0.0, "trifr": 1.2, "dias_sin_lti": 187,
            "near_misses_mes": random.randint(5, 12),
            "observaciones_seguridad_mes": random.randint(120, 165),
            "personal_en_sitio": random.randint(225, 245),
            "incidentes_altitud_mes": random.randint(0, 2),
            "permisos_trabajo_activos": random.randint(8, 18),
            "simulacros_completados_mes": 3,
        }},
        {"id": "planta-nf", "tipo": "planta_nf", "data": {
            "estado": "operativa",
            "throughput_m3h": rand(82, 90),
            "recuperacion_li_pct": rand(91, 94),
            "presion_entrada_bar": rand(11, 14),
            "presion_salida_bar": rand(2.5, 4),
            "concentracion_entrada_mgl": 5400,
            "concentracion_salida_mgl": 58000,
            "ratio_mg_li": rand(1.5, 2.2),
            "horas_operacion": 1247,
        }},
    ]

    if mode == "stdout":
        print(json.dumps({"timestamp": ts, "records": all_records, "anomalias": anomalias}, indent=2))
        return len(anomalias)

    # 1. Supabase - estado_actual
    if SUPABASE_URL and SUPABASE_KEY:
        status = supabase_upsert("estado_actual", all_records)
        print(f"  Supabase estado_actual: {status}")
        reading = {"sitio": "HMW-Phase1", "data": {"meteo": meteo, "pozos": [p["data"] for p in pozos]}}
        status2 = supabase_upsert("sensor_readings", {"sitio": "HMW-Phase1", "data": reading})
        print(f"  Supabase sensor_readings: {status2}")
    else:
        print("  Supabase no configurado, saltando...")

    # 2. Si hay anomalias, enviar a n8n para procesamiento con IA
    if anomalias:
        print(f"  Anomalias detectadas: {len(anomalias)}")
        for a in anomalias:
            print(f"    - [{a['severidad_sugerida']}] {a['detalle']}")
        payload = {"timestamp": ts, "sitio": "HMW-Phase1", "anomalias": anomalias, "meteo": meteo}
        n8n_status = n8n_send(payload)
        print(f"  n8n webhook: {n8n_status}")
    else:
        print("  Sin anomalias")

    return len(anomalias)


def main():
    parser = argparse.ArgumentParser(description="Simulador de sensores HMW")
    parser.add_argument("--interval", type=int, default=30, help="Segundos entre lecturas")
    parser.add_argument("--once", action="store_true", help="Ejecutar una sola vez")
    parser.add_argument("--stdout", action="store_true", help="Imprimir JSON a consola (sin enviar)")
    args = parser.parse_args()

    mode = "stdout" if args.stdout else "supabase"

    print("=" * 60)
    print("Galan Ops Monitor - Simulador de Sensores HMW Phase 1")
    print(f"Modo: {mode}")
    if mode == "supabase":
        print(f"Supabase: {SUPABASE_URL or '(no configurado)'}")
        print(f"n8n webhook: {N8N_WEBHOOK}")
    print(f"Intervalo: {args.interval}s")
    print("=" * 60)

    if args.once:
        run_cycle(mode)
        return

    while True:
        run_cycle(mode)
        print(f"  Esperando {args.interval}s...")
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
