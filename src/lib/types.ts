// ============================================================
// Galan Ops Monitor - Tipos del sistema
// Basado en operaciones reales de HMW (Hombre Muerto West)
// Galan Lithium Ltd (ASX: GLN)
// ============================================================

// --- Pozos de extraccion ---
export interface Pozo {
  id: string;
  nombre: string; // P-01 a P-07
  estado: "activo" | "mantenimiento" | "standby";
  caudal_lps: number; // Litros por segundo (5-40 L/s)
  concentracion_li_mgl: number; // mg/L de litio (800-900)
  presion_cabezal_bar: number; // Presion en bar (0.5-3.0)
  temperatura_salmuera_c: number; // Celsius (15-25)
  drawdown_m: number; // Metros de abatimiento (0.5-5.0)
  horas_operacion: number;
  ultima_lectura: string; // ISO timestamp
}

// --- Pozas de evaporacion ---
export type EtapaPoza =
  | "halita" // Etapa 1: precipitacion NaCl
  | "silvinita" // Etapa 2: precipitacion KCl
  | "carnalita" // Etapa 3: precipitacion sales de Mg
  | "concentracion_final"; // Etapa 4: salmuera rica en Li

export interface PozaEvaporacion {
  id: string;
  nombre: string;
  etapa: EtapaPoza;
  estado: "operativa" | "carga" | "mantenimiento" | "secado";
  area_m2: number;
  profundidad_cm: number; // Profundidad actual de salmuera
  freeboard_cm: number; // Distancia al borde (min 30cm)
  densidad_entrada: number; // g/cm3
  densidad_salida: number;
  concentracion_li_mgl: number;
  tasa_evaporacion_mm_dia: number;
  dias_residencia: number;
  dias_transcurridos: number;
  ultima_lectura: string;
}

// --- Planta de nanofiltracion ---
export interface PlantaNanofiltracion {
  estado: "operativa" | "comisionamiento" | "mantenimiento" | "detenida";
  throughput_m3h: number; // m3/hora procesados
  recuperacion_li_pct: number; // % de recuperacion de litio
  presion_entrada_bar: number;
  presion_salida_bar: number;
  concentracion_entrada_mgl: number;
  concentracion_salida_mgl: number;
  ratio_mg_li: number; // Ratio Mg:Li (objetivo <2.8)
  horas_operacion: number;
  ultima_lectura: string;
}

// --- Produccion ---
export interface ProduccionDiaria {
  fecha: string;
  licl_producido_ton: number; // Toneladas de LiCl concentrado al 6%
  licl_acumulado_mes_ton: number;
  inventario_pozas_lce_ton: number; // ~10,000t actual
  target_anual_tpa: number; // 5,200 tpa Phase 1
  cumplimiento_pct: number;
}

// --- Meteorologia (critico para evaporacion) ---
export interface DatosMeteo {
  timestamp: string;
  temperatura_c: number; // -20 a 25°C
  humedad_relativa_pct: number; // 10-45%
  velocidad_viento_kmh: number; // 5-80 km/h
  direccion_viento: string; // NW dominante
  radiacion_solar_kwh_m2: number; // 5.5-8.5 kWh/m2/dia
  indice_uv: number; // 10-16 (extremo)
  precipitacion_mm: number; // 0-20mm eventos raros
  presion_barometrica_mbar: number; // 600-640 (por altitud 4000m)
  tasa_evaporacion_mm_dia: number; // 3-8 mm/dia efectiva
}

// --- Seguridad ---
export interface MetricasSeguridad {
  ltifr: number; // Lost Time Injury Frequency Rate (<1.0)
  trifr: number; // Total Recordable Injury Frequency Rate (<3.0)
  dias_sin_lti: number; // Dias sin incidente con baja
  near_misses_mes: number;
  observaciones_seguridad_mes: number;
  personal_en_sitio: number; // 150-400 personas
  incidentes_altitud_mes: number; // Mal de altura (4000m)
  permisos_trabajo_activos: number;
  simulacros_completados_mes: number;
}

// --- Monitoreo ambiental ---
export interface MonitoreoAmbiental {
  timestamp: string;
  nivel_freatico_m: number; // Profundidad del nivel de agua
  tendencia_freatico_cm_mes: number; // Variacion mensual
  pm10_ug_m3: number; // Particulas (max 150)
  pm25_ug_m3: number; // Particulas finas (max 50)
  conductividad_agua_us_cm: number; // Agua superficial cercana
  li_en_arroyos_mgl: number; // <5 mg/L
  conteo_flamencos: number; // Fauna monitoreada
  conteo_vicunas: number;
  indice_vegetacion_ndvi: number; // 0.1-0.4
}

// --- Alertas ---
export type SeveridadAlerta = "baja" | "media" | "alta" | "critica";
export type CategoriaAlerta =
  | "produccion"
  | "seguridad"
  | "ambiental"
  | "equipamiento"
  | "meteorologia"
  | "calidad";

export interface Alerta {
  id: string;
  timestamp: string;
  categoria: CategoriaAlerta;
  severidad: SeveridadAlerta;
  titulo: string;
  descripcion: string;
  recomendacion_ia: string; // Generada por LLM
  origen: string; // Sensor/sistema que la genero
  estado: "activa" | "reconocida" | "resuelta";
  resuelta_por?: string;
  resuelta_en?: string;
}

// --- Reportes de turno ---
export interface ReporteTurno {
  id: string;
  turno: "manana" | "tarde" | "noche";
  fecha: string;
  supervisor: string;
  resumen_ia: string; // Generado por LLM
  produccion_ton: number;
  alertas_generadas: number;
  alertas_resueltas: number;
  personal_presente: number;
  novedades: string[];
  estado: "borrador" | "aprobado";
}

// --- Dashboard KPIs ---
export interface DashboardKPIs {
  // Produccion
  produccion_hoy_ton: number;
  produccion_mes_ton: number;
  target_mes_ton: number;
  inventario_pozas_lce_ton: number;

  // Operacion
  pozos_activos: number;
  pozos_total: number;
  pozas_operativas: number;
  pozas_total: number;
  planta_nf_estado: string;
  concentracion_promedio_li: number;

  // Seguridad
  dias_sin_lti: number;
  personal_en_sitio: number;

  // Ambiental
  consumo_agua_m3_ton: number; // m3 por tonelada LCE (<2)

  // Meteo
  temperatura_actual_c: number;
  viento_actual_kmh: number;
  tasa_evaporacion_hoy: number;

  // Alertas
  alertas_activas: number;
  alertas_criticas: number;
}
