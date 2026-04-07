import type {
  Pozo,
  PozaEvaporacion,
  PlantaNanofiltracion,
  DatosMeteo,
  MetricasSeguridad,
  MonitoreoAmbiental,
  Alerta,
  ReporteTurno,
  DashboardKPIs,
  ProduccionDiaria,
} from "./types";

// ============================================================
// Datos simulados basados en operaciones reales de HMW Phase 1
// Galan Lithium - Salar del Hombre Muerto, Catamarca
// Coordenadas: 25°21'S, 67°04'W | Altitud: ~4,000 msnm
// ============================================================

// --- 7 Pozos de produccion (dato real: 7 production wells) ---
export const pozos: Pozo[] = [
  {
    id: "P-01",
    nombre: "Pozo HMW-01",
    estado: "activo",
    caudal_lps: 28.4,
    concentracion_li_mgl: 862,
    presion_cabezal_bar: 1.8,
    temperatura_salmuera_c: 19.2,
    drawdown_m: 2.1,
    horas_operacion: 12847,
    ultima_lectura: new Date().toISOString(),
  },
  {
    id: "P-02",
    nombre: "Pozo HMW-02",
    estado: "activo",
    caudal_lps: 32.1,
    concentracion_li_mgl: 878,
    presion_cabezal_bar: 2.1,
    temperatura_salmuera_c: 18.7,
    drawdown_m: 1.8,
    horas_operacion: 11203,
    ultima_lectura: new Date().toISOString(),
  },
  {
    id: "P-03",
    nombre: "Pozo HMW-03",
    estado: "activo",
    caudal_lps: 25.6,
    concentracion_li_mgl: 845,
    presion_cabezal_bar: 1.5,
    temperatura_salmuera_c: 20.1,
    drawdown_m: 2.8,
    horas_operacion: 13502,
    ultima_lectura: new Date().toISOString(),
  },
  {
    id: "P-04",
    nombre: "Pozo HMW-04",
    estado: "mantenimiento",
    caudal_lps: 0,
    concentracion_li_mgl: 855,
    presion_cabezal_bar: 0,
    temperatura_salmuera_c: 17.3,
    drawdown_m: 0.5,
    horas_operacion: 9876,
    ultima_lectura: new Date().toISOString(),
  },
  {
    id: "P-05",
    nombre: "Pozo HMW-05",
    estado: "activo",
    caudal_lps: 35.2,
    concentracion_li_mgl: 891,
    presion_cabezal_bar: 2.4,
    temperatura_salmuera_c: 18.9,
    drawdown_m: 1.5,
    horas_operacion: 10234,
    ultima_lectura: new Date().toISOString(),
  },
  {
    id: "P-06",
    nombre: "Pozo HMW-06",
    estado: "activo",
    caudal_lps: 22.8,
    concentracion_li_mgl: 837,
    presion_cabezal_bar: 1.6,
    temperatura_salmuera_c: 19.8,
    drawdown_m: 3.2,
    horas_operacion: 8901,
    ultima_lectura: new Date().toISOString(),
  },
  {
    id: "P-07",
    nombre: "Pozo HMW-07",
    estado: "standby",
    caudal_lps: 0,
    concentracion_li_mgl: 869,
    presion_cabezal_bar: 0,
    temperatura_salmuera_c: 18.1,
    drawdown_m: 0.8,
    horas_operacion: 6543,
    ultima_lectura: new Date().toISOString(),
  },
];

// --- Pozas de evaporacion (sylvinite ponds completed - dato real) ---
export const pozas: PozaEvaporacion[] = [
  {
    id: "PE-H1",
    nombre: "Halita Norte",
    etapa: "halita",
    estado: "operativa",
    area_m2: 120000,
    profundidad_cm: 32,
    freeboard_cm: 48,
    densidad_entrada: 1.2,
    densidad_salida: 1.23,
    concentracion_li_mgl: 1050,
    tasa_evaporacion_mm_dia: 5.8,
    dias_residencia: 90,
    dias_transcurridos: 67,
    ultima_lectura: new Date().toISOString(),
  },
  {
    id: "PE-H2",
    nombre: "Halita Sur",
    etapa: "halita",
    estado: "operativa",
    area_m2: 95000,
    profundidad_cm: 28,
    freeboard_cm: 52,
    densidad_entrada: 1.19,
    densidad_salida: 1.22,
    concentracion_li_mgl: 980,
    tasa_evaporacion_mm_dia: 6.1,
    dias_residencia: 90,
    dias_transcurridos: 45,
    ultima_lectura: new Date().toISOString(),
  },
  {
    id: "PE-S1",
    nombre: "Silvinita 1",
    etapa: "silvinita",
    estado: "operativa",
    area_m2: 65000,
    profundidad_cm: 25,
    freeboard_cm: 45,
    densidad_entrada: 1.23,
    densidad_salida: 1.26,
    concentracion_li_mgl: 1850,
    tasa_evaporacion_mm_dia: 4.9,
    dias_residencia: 60,
    dias_transcurridos: 38,
    ultima_lectura: new Date().toISOString(),
  },
  {
    id: "PE-S2",
    nombre: "Silvinita 2",
    etapa: "silvinita",
    estado: "carga",
    area_m2: 58000,
    profundidad_cm: 12,
    freeboard_cm: 68,
    densidad_entrada: 1.22,
    densidad_salida: 1.25,
    concentracion_li_mgl: 1620,
    tasa_evaporacion_mm_dia: 5.2,
    dias_residencia: 60,
    dias_transcurridos: 15,
    ultima_lectura: new Date().toISOString(),
  },
  {
    id: "PE-C1",
    nombre: "Carnalita 1",
    etapa: "carnalita",
    estado: "operativa",
    area_m2: 32000,
    profundidad_cm: 22,
    freeboard_cm: 38,
    densidad_entrada: 1.26,
    densidad_salida: 1.29,
    concentracion_li_mgl: 3200,
    tasa_evaporacion_mm_dia: 4.1,
    dias_residencia: 45,
    dias_transcurridos: 32,
    ultima_lectura: new Date().toISOString(),
  },
  {
    id: "PE-CF1",
    nombre: "Concentracion Final",
    etapa: "concentracion_final",
    estado: "operativa",
    area_m2: 18000,
    profundidad_cm: 18,
    freeboard_cm: 42,
    densidad_entrada: 1.29,
    densidad_salida: 1.31,
    concentracion_li_mgl: 5400,
    tasa_evaporacion_mm_dia: 3.5,
    dias_residencia: 30,
    dias_transcurridos: 22,
    ultima_lectura: new Date().toISOString(),
  },
];

// --- Planta de nanofiltracion (entregada Feb 2026 - dato real) ---
export const plantaNF: PlantaNanofiltracion = {
  estado: "operativa",
  throughput_m3h: 85,
  recuperacion_li_pct: 92.4,
  presion_entrada_bar: 12.5,
  presion_salida_bar: 3.2,
  concentracion_entrada_mgl: 5400,
  concentracion_salida_mgl: 58000, // 5.8% LiCl (~6% target)
  ratio_mg_li: 1.8,
  horas_operacion: 1247,
  ultima_lectura: new Date().toISOString(),
};

// --- Meteorologia (Puna de Atacama, 4000 msnm, clima real) ---
export const meteoActual: DatosMeteo = {
  timestamp: new Date().toISOString(),
  temperatura_c: 12.4,
  humedad_relativa_pct: 18,
  velocidad_viento_kmh: 14.2,
  direccion_viento: "NW",
  radiacion_solar_kwh_m2: 7.2,
  indice_uv: 13,
  precipitacion_mm: 0,
  presion_barometrica_mbar: 621,
  tasa_evaporacion_mm_dia: 5.6,
};

// --- Seguridad ---
export const seguridad: MetricasSeguridad = {
  ltifr: 0.0,
  trifr: 1.2,
  dias_sin_lti: 187,
  near_misses_mes: 8,
  observaciones_seguridad_mes: 142,
  personal_en_sitio: 234,
  incidentes_altitud_mes: 1,
  permisos_trabajo_activos: 12,
  simulacros_completados_mes: 3,
};

// --- Monitoreo ambiental ---
export const ambiental: MonitoreoAmbiental = {
  timestamp: new Date().toISOString(),
  nivel_freatico_m: 2.3,
  tendencia_freatico_cm_mes: -0.4,
  pm10_ug_m3: 42,
  pm25_ug_m3: 12,
  conductividad_agua_us_cm: 1850,
  li_en_arroyos_mgl: 0.8,
  conteo_flamencos: 186,
  conteo_vicunas: 34,
  indice_vegetacion_ndvi: 0.22,
};

// --- Alertas activas ---
export const alertas: Alerta[] = [
  {
    id: "ALT-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
    categoria: "equipamiento",
    severidad: "media",
    titulo: "Vibracion elevada en bomba Pozo HMW-03",
    descripcion:
      "Sensor de vibracion registra 6.2 mm/s RMS, superando umbral de alerta (5.5 mm/s). Pozo continua operativo.",
    recomendacion_ia:
      "Programar inspeccion de rodamientos en proxima ventana de mantenimiento (48h). Monitorear tendencia: si supera 7.0 mm/s, detener bomba para evitar dano al eje. Verificar alineacion del acople motor-bomba.",
    origen: "Sensor vibracion P-03",
    estado: "activa",
  },
  {
    id: "ALT-002",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    categoria: "meteorologia",
    severidad: "baja",
    titulo: "Rafagas de viento pronosticadas >50 km/h",
    descripcion:
      "Pronostico meteorologico indica rafagas de hasta 55 km/h para las proximas 6 horas. Tasa de evaporacion podria verse afectada.",
    recomendacion_ia:
      "Incrementar frecuencia de monitoreo de freeboard en pozas. Asegurar cobertura de equipos sensibles. No se requiere detencion de operaciones (umbral de pausa: 60 km/h). Notificar a equipo de turno noche.",
    origen: "Estacion meteorologica HMW",
    estado: "reconocida",
  },
  {
    id: "ALT-003",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    categoria: "produccion",
    severidad: "alta",
    titulo: "Ratio Mg:Li elevado en salida de carnalita",
    descripcion:
      "Ratio Mg:Li en poza PE-C1 midiendo 2.6, acercandose al limite operativo de 2.8. Puede afectar calidad del concentrado de LiCl.",
    recomendacion_ia:
      "Reducir flujo de entrada a PE-C1 un 15% para permitir mayor tiempo de residencia y precipitacion de sales de Mg. Tomar muestra manual para confirmar lectura del sensor. Si ratio supera 2.8, desviar flujo a poza de emergencia hasta estabilizar. Evaluar ajuste de reactivos en planta NF.",
    origen: "Analizador en linea PE-C1",
    estado: "activa",
  },
  {
    id: "ALT-004",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    categoria: "seguridad",
    severidad: "baja",
    titulo: "Permiso de trabajo #PT-089 proximo a vencer",
    descripcion:
      "Permiso de trabajo en caliente para soldadura en estructura de planta NF vence en 2 horas.",
    recomendacion_ia:
      "Verificar con supervisor de turno si los trabajos fueron completados. Si continuan, renovar permiso con nueva evaluacion de riesgos. Confirmar que extintor y vigía siguen en posicion.",
    origen: "Sistema de permisos de trabajo",
    estado: "activa",
  },
  {
    id: "ALT-005",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    categoria: "ambiental",
    severidad: "baja",
    titulo: "PM10 en tendencia ascendente",
    descripcion:
      "Nivel de PM10 en 42 ug/m3. Tendencia ascendente en ultimas 4 horas, posiblemente por viento del sector norte levantando material seco.",
    recomendacion_ia:
      "Monitorear. Si supera 80 ug/m3, activar riego de caminos. Si supera 150 ug/m3, es alerta regulatoria y se debe notificar a autoridad ambiental de Catamarca.",
    origen: "Estacion calidad de aire HMW",
    estado: "resuelta",
    resuelta_por: "J. Rodriguez",
    resuelta_en: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
];

// --- Reportes de turno ---
export const reportes: ReporteTurno[] = [
  {
    id: "RT-20260402-M",
    turno: "manana",
    fecha: "2026-04-02",
    supervisor: "Ing. Carolina Mendez",
    resumen_ia:
      "Turno manana con operacion estable. Produccion de 3.8 toneladas de concentrado LiCl al 5.9%, ligeramente por debajo del target de 4.2t por reduccion de flujo en PE-C1 debido a ratio Mg:Li elevado (2.6). Planta de nanofiltracion opero al 92% de capacidad con recuperacion de 92.4%. Se registro alerta de vibracion en bomba P-03 (6.2 mm/s) que requiere inspeccion programada. Condiciones meteorologicas favorables: 12°C, viento 14 km/h NW, radiacion solar 7.2 kWh/m2. 234 personas en sitio, 187 dias sin LTI. Se completo simulacro de evacuacion de planta NF con resultado satisfactorio.",
    produccion_ton: 3.8,
    alertas_generadas: 3,
    alertas_resueltas: 1,
    personal_presente: 234,
    novedades: [
      "Reduccion de flujo 15% en PE-C1 por ratio Mg:Li",
      "Inspeccion programada bomba P-03 para manana",
      "Simulacro evacuacion planta NF completado",
      "Pozo P-04 continua en mantenimiento preventivo",
    ],
    estado: "aprobado",
  },
  {
    id: "RT-20260401-N",
    turno: "noche",
    fecha: "2026-04-01",
    supervisor: "Ing. Pablo Fuentes",
    resumen_ia:
      "Turno noche sin novedades criticas. Produccion de 4.1 toneladas LiCl, en linea con target. Temperatura nocturna descendio a -8°C, dentro de parametros normales para la epoca. Tasa de evaporacion reducida a 2.1 mm/dia por baja radiacion. Se realizo cambio de guardia sin novedades. Planta NF opero sin interrupciones.",
    produccion_ton: 4.1,
    alertas_generadas: 0,
    alertas_resueltas: 0,
    personal_presente: 89,
    novedades: [
      "Temperatura minima nocturna: -8°C",
      "Cambio de guardia sin novedades",
    ],
    estado: "aprobado",
  },
];

// --- Datos historicos de produccion (ultimo mes) ---
export const produccionHistorica: ProduccionDiaria[] = Array.from(
  { length: 30 },
  (_, i) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - (29 - i));
    const base = 4.0 + Math.random() * 1.2 - 0.4;
    const acumulado = (i + 1) * 4.1;
    return {
      fecha: fecha.toISOString().split("T")[0],
      licl_producido_ton: Math.round(base * 10) / 10,
      licl_acumulado_mes_ton: Math.round(acumulado * 10) / 10,
      inventario_pozas_lce_ton: 10000 + Math.round(Math.random() * 200 - 100),
      target_anual_tpa: 5200,
      cumplimiento_pct: Math.round((acumulado / (5200 / 12)) * 100) / 100,
    };
  }
);

// --- Dashboard KPIs ---
export const dashboardKPIs: DashboardKPIs = {
  produccion_hoy_ton: 3.8,
  produccion_mes_ton: 48.2,
  target_mes_ton: 433, // 5200/12
  inventario_pozas_lce_ton: 10042,

  pozos_activos: 5,
  pozos_total: 7,
  pozas_operativas: 5,
  pozas_total: 6,
  planta_nf_estado: "Operativa",
  concentracion_promedio_li: 859,

  dias_sin_lti: 187,
  personal_en_sitio: 234,

  consumo_agua_m3_ton: 1.8,

  temperatura_actual_c: 12.4,
  viento_actual_kmh: 14.2,
  tasa_evaporacion_hoy: 5.6,

  alertas_activas: 3,
  alertas_criticas: 0,
};

// --- Datos de tendencia para graficos ---
export const tendenciaProduccion7d = [
  { dia: "27 Mar", produccion: 4.2, target: 4.3 },
  { dia: "28 Mar", produccion: 3.9, target: 4.3 },
  { dia: "29 Mar", produccion: 4.5, target: 4.3 },
  { dia: "30 Mar", produccion: 4.1, target: 4.3 },
  { dia: "31 Mar", produccion: 3.7, target: 4.3 },
  { dia: "1 Abr", produccion: 4.1, target: 4.3 },
  { dia: "2 Abr", produccion: 3.8, target: 4.3 },
];

export const concentracionPorEtapa = [
  { etapa: "Salmuera bruta", li_mgl: 859 },
  { etapa: "Halita", li_mgl: 1015 },
  { etapa: "Silvinita", li_mgl: 1735 },
  { etapa: "Carnalita", li_mgl: 3200 },
  { etapa: "Conc. Final", li_mgl: 5400 },
  { etapa: "Post-NF", li_mgl: 58000 },
];

export const evaporacionSemanal = [
  { dia: "Lun", tasa: 5.2, radiacion: 6.8 },
  { dia: "Mar", tasa: 5.8, radiacion: 7.4 },
  { dia: "Mie", tasa: 4.9, radiacion: 6.5 },
  { dia: "Jue", tasa: 6.1, radiacion: 7.8 },
  { dia: "Vie", tasa: 5.6, radiacion: 7.2 },
  { dia: "Sab", tasa: 5.4, radiacion: 7.0 },
  { dia: "Dom", tasa: 4.7, radiacion: 6.2 },
];
