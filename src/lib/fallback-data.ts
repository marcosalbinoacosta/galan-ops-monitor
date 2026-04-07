/**
 * Generador de datos fallback dinámicos para cuando Supabase no está disponible.
 * Usa las funciones de simulate.ts para producir datos que varían con el tiempo,
 * simulando una operación minera real.
 */

import {
  variarTemperatura,
  variarRadiacion,
  variarEvaporacion,
  variarViento,
  variarCaudal,
  variarConcentracionLi,
  variarPresion,
  variarHumedad,
  variarPresionAtm,
  variarProduccion,
} from "./simulate";

function rand(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

// Seed para alertas variadas basadas en hora
function generarAlertasVariadas(): Array<Record<string, unknown>> {
  const ahora = Date.now();
  const pool = [
    {
      id: `ALT-${(ahora % 10000).toString().padStart(4, "0")}`,
      timestamp: new Date(ahora - Math.floor(Math.random() * 120) * 60000).toISOString(),
      categoria: "equipamiento",
      severidad: "media",
      titulo: "Vibración elevada en bomba Pozo HMW-03",
      descripcion: "Sensor registra 6.2 mm/s RMS, superando umbral de 5.5 mm/s. Tendencia ascendente en últimas 4 horas.",
      recomendacion_ia: "Programar inspección de rodamientos dentro de las próximas 48 horas. Si la vibración supera 7.0 mm/s, detener la bomba preventivamente y activar el pozo de respaldo P-07. Verificar alineación del acople motor-bomba.",
      origen: "Sensor vibración P-03",
      estado: "activa",
    },
    {
      id: `ALT-${((ahora + 1) % 10000).toString().padStart(4, "0")}`,
      timestamp: new Date(ahora - Math.floor(Math.random() * 180) * 60000).toISOString(),
      categoria: "produccion",
      severidad: "alta",
      titulo: "Ratio Mg:Li elevado en poza carnalita PE-C1",
      descripcion: "Ratio Mg:Li en PE-C1 midiendo 2.6 (límite operativo: 2.8). Muestra manual confirma tendencia.",
      recomendacion_ia: "Reducir flujo de alimentación un 15% a PE-C1. Tomar muestra manual de confirmación. Si supera 2.8, desviar inmediatamente a poza de emergencia PE-E1 para evitar contaminación del concentrado final. Notificar a supervisor de proceso.",
      origen: "Analizador en línea PE-C1",
      estado: "activa",
    },
    {
      id: `ALT-${((ahora + 2) % 10000).toString().padStart(4, "0")}`,
      timestamp: new Date(ahora - Math.floor(Math.random() * 60) * 60000).toISOString(),
      categoria: "meteorologia",
      severidad: "media",
      titulo: "Pronóstico de ráfagas de viento >50 km/h",
      descripcion: "Estación meteorológica pronostica ráfagas de 55 km/h para las próximas 6 horas. Dirección predominante NW.",
      recomendacion_ia: "Monitorear freeboard en todas las pozas cada 2 horas. Si las ráfagas superan 60 km/h, pausar alimentación a pozas de halita (más expuestas). Asegurar coberturas en áreas de acopio. Umbral de evacuación parcial: 80 km/h sostenido.",
      origen: "Estación meteo HMW",
      estado: "reconocida",
    },
    {
      id: `ALT-${((ahora + 3) % 10000).toString().padStart(4, "0")}`,
      timestamp: new Date(ahora - Math.floor(Math.random() * 300) * 60000).toISOString(),
      categoria: "seguridad",
      severidad: "baja",
      titulo: "Permiso de trabajo vencido en zona de pozas",
      descripcion: "Permiso PT-2026-0412 para trabajos en caliente venció hace 2 horas. Personal aún reportado en zona.",
      recomendacion_ia: "Contactar al supervisor de turno para renovar el permiso o confirmar que el trabajo finalizó. Si el personal sigue en zona sin permiso vigente, evacuar hasta regularizar. Registrar en bitácora de seguridad.",
      origen: "Sistema de permisos HMW",
      estado: "activa",
    },
    {
      id: `ALT-${((ahora + 4) % 10000).toString().padStart(4, "0")}`,
      timestamp: new Date(ahora - Math.floor(Math.random() * 240) * 60000).toISOString(),
      categoria: "ambiental",
      severidad: "baja",
      titulo: "PM10 elevado en estación de monitoreo norte",
      descripcion: "Concentración de PM10: 95 µg/m³ (umbral de alerta: 100 µg/m³). Correlaciona con vientos del NW.",
      recomendacion_ia: "Activar riego de caminos en sector norte. Si supera 100 µg/m³ sostenido por 1 hora, reducir tránsito vehicular pesado. Verificar que el sistema de supresión de polvo esté operativo en la trituradora.",
      origen: "Estación calidad aire norte",
      estado: "reconocida",
    },
    {
      id: `ALT-${((ahora + 5) % 10000).toString().padStart(4, "0")}`,
      timestamp: new Date(ahora - Math.floor(Math.random() * 90) * 60000).toISOString(),
      categoria: "equipamiento",
      severidad: "alta",
      titulo: "Presión diferencial alta en planta NF",
      descripcion: "Diferencial de presión entre entrada y salida: 9.8 bar (umbral: 10.0 bar). Posible obstrucción parcial de membranas.",
      recomendacion_ia: "Iniciar protocolo de retrolavado CIP (Clean-In-Place) en las próximas 4 horas. Si la presión diferencial alcanza 10.5 bar, detener la planta para mantenimiento preventivo. Verificar última fecha de cambio de membranas en registro de mantenimiento.",
      origen: "PLC Planta NF",
      estado: "activa",
    },
    {
      id: `ALT-${((ahora + 6) % 10000).toString().padStart(4, "0")}`,
      timestamp: new Date(ahora - Math.floor(Math.random() * 400) * 60000).toISOString(),
      categoria: "calidad",
      severidad: "media",
      titulo: "Desviación en concentración Li etapa silvinita",
      descripcion: "Concentración Li en PE-S2: 1720 mg/L (esperado: 1800-2000 mg/L). Posible dilución por precipitación reciente.",
      recomendacion_ia: "Extender el tiempo de residencia en PE-S2 en 48 horas adicionales antes de transferir a carnalita. Tomar muestras cada 8 horas para seguimiento. Si no mejora en 72h, considerar bypass de PE-S2 y alimentar directamente desde PE-S1.",
      origen: "Laboratorio HMW",
      estado: "activa",
    },
    {
      id: `ALT-${((ahora + 7) % 10000).toString().padStart(4, "0")}`,
      timestamp: new Date(ahora - Math.floor(Math.random() * 500) * 60000).toISOString(),
      categoria: "produccion",
      severidad: "baja",
      titulo: "Caudal bajo en Pozo HMW-06",
      descripcion: "Caudal actual: 17.8 L/s (mínimo operativo: 18 L/s). Reducción gradual en últimas 12 horas.",
      recomendacion_ia: "Verificar estado del filtro de fondo y nivel de abatimiento del pozo. Si continúa descendiendo, reducir RPM de bomba al 80% para evitar cavitación. Programar prueba de aforo si caudal cae por debajo de 15 L/s.",
      origen: "Caudalímetro P-06",
      estado: "reconocida",
    },
  ];

  // Seleccionar entre 3 y 6 alertas aleatorias del pool
  const count = 3 + Math.floor(Math.random() * 4);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generarReportes(): Array<Record<string, unknown>> {
  const hoy = new Date();
  const ayer = new Date(hoy.getTime() - 86400000);
  const anteayer = new Date(hoy.getTime() - 2 * 86400000);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  return [
    {
      id: `RT-${fmt(hoy).replace(/-/g, "")}-M`,
      turno: "manana",
      fecha: fmt(hoy),
      supervisor: "Ing. Carolina Méndez",
      resumen_ia: `Turno mañana estable. Producción de ${rand(3.5, 4.5)} toneladas de LiCl al 6%. ${5} pozos operativos con caudal promedio de ${rand(25, 33)} L/s. Concentración Li promedio ${Math.round(rand(845, 870))} mg/L. Planta NF operativa con recuperación ${rand(91, 94)}%. Se generaron ${Math.floor(Math.random() * 3) + 1} alertas, ${Math.floor(Math.random() * 2) + 1} resueltas durante el turno. ${187} días sin LTI. Condiciones meteorológicas favorables para evaporación.`,
      produccion_ton: rand(3.5, 4.5),
      alertas_generadas: Math.floor(Math.random() * 3) + 1,
      alertas_resueltas: Math.floor(Math.random() * 2) + 1,
      personal_presente: Math.round(rand(225, 245)),
      novedades: [
        "Inspección programada de rodamientos en P-03 completada",
        "Muestra manual PE-C1 confirmó ratio Mg:Li en 2.5 (dentro de parámetros)",
        "Riego de caminos activado por pronóstico de viento",
      ],
      estado: "aprobado",
    },
    {
      id: `RT-${fmt(ayer).replace(/-/g, "")}-N`,
      turno: "noche",
      fecha: fmt(ayer),
      supervisor: "Ing. Roberto Guzmán",
      resumen_ia: `Turno nocturno sin incidentes significativos. Producción de ${rand(3.0, 4.0)} toneladas LiCl. Temperatura descendió a ${rand(-5, 3)}°C. Evaporación nocturna mínima como es esperado. Se realizó mantenimiento preventivo en válvula de P-05. P-04 continúa en mantenimiento programado. Personal reducido a turno mínimo (${Math.round(rand(120, 145))} personas). Sin alertas críticas.`,
      produccion_ton: rand(3.0, 4.0),
      alertas_generadas: Math.floor(Math.random() * 2),
      alertas_resueltas: Math.floor(Math.random() * 2),
      personal_presente: Math.round(rand(120, 145)),
      novedades: [
        "Mantenimiento preventivo válvula P-05 completado",
        "Temperatura mínima registrada: -4.2°C",
      ],
      estado: "aprobado",
    },
    {
      id: `RT-${fmt(ayer).replace(/-/g, "")}-T`,
      turno: "tarde",
      fecha: fmt(ayer),
      supervisor: "Ing. María Soledad Ríos",
      resumen_ia: `Turno tarde con producción normal. ${rand(3.8, 4.8)} toneladas LiCl producidas. Pico de radiación solar registrado a las 13:00 (${rand(7.5, 8.5)} kWh/m²), maximizando tasa de evaporación a ${rand(6, 8)} mm/día. Alerta de PM10 gestionada con riego de caminos. Transfer de salmuera de PE-H2 a PE-S1 completado exitosamente.`,
      produccion_ton: rand(3.8, 4.8),
      alertas_generadas: Math.floor(Math.random() * 3) + 1,
      alertas_resueltas: Math.floor(Math.random() * 3) + 1,
      personal_presente: Math.round(rand(220, 240)),
      novedades: [
        "Transfer PE-H2 → PE-S1 completado (8,500 m³)",
        "PM10 controlado con riego de caminos sector norte",
        "Calibración de analizador en línea PE-C1",
      ],
      estado: "aprobado",
    },
    {
      id: `RT-${fmt(anteayer).replace(/-/g, "")}-M`,
      turno: "manana",
      fecha: fmt(anteayer),
      supervisor: "Ing. Carolina Méndez",
      resumen_ia: `Turno mañana con evento meteorológico. Ráfaga de viento de ${Math.round(rand(52, 65))} km/h registrada a las 09:00. Se pausó alimentación a PE-H1 por 3 horas como medida preventiva. Producción parcialmente afectada: ${rand(2.8, 3.5)} toneladas. Sin incidentes de seguridad. Pozo P-07 pasó a standby por optimización de caudal total.`,
      produccion_ton: rand(2.8, 3.5),
      alertas_generadas: 3,
      alertas_resueltas: 2,
      personal_presente: Math.round(rand(230, 245)),
      novedades: [
        "Pausa de alimentación a PE-H1 por viento (09:00-12:00)",
        "P-07 pasó a modo standby",
        "Protocolo meteorológico activado y desactivado sin incidentes",
      ],
      estado: "aprobado",
    },
    {
      id: `RT-${fmt(anteayer).replace(/-/g, "")}-N`,
      turno: "noche",
      fecha: fmt(anteayer),
      supervisor: "Ing. Roberto Guzmán",
      resumen_ia: `Turno nocturno estándar. Producción ${rand(2.8, 3.8)} toneladas LiCl. Condiciones de frío extremo: temperatura mínima ${rand(-12, -5)}°C. Se verificó sistema anticongelante en tuberías expuestas. Todos los pozos activos operando dentro de parámetros normales.`,
      produccion_ton: rand(2.8, 3.8),
      alertas_generadas: 1,
      alertas_resueltas: 1,
      personal_presente: Math.round(rand(115, 140)),
      novedades: [
        "Verificación anticongelante en tuberías completada",
        "Sin novedades adicionales",
      ],
      estado: "aprobado",
    },
  ];
}

export function generateFallbackData() {
  const viento = variarViento();
  const radiacion = variarRadiacion();
  const temp = variarTemperatura();
  const evaporacion = variarEvaporacion(radiacion, viento.velocidad);
  const produccionHoy = variarProduccion(4.2);

  const pozos = [
    { id: "P-01", nombre: "Pozo HMW-01", estado: "activo" },
    { id: "P-02", nombre: "Pozo HMW-02", estado: "activo" },
    { id: "P-03", nombre: "Pozo HMW-03", estado: "activo" },
    { id: "P-04", nombre: "Pozo HMW-04", estado: "mantenimiento" },
    { id: "P-05", nombre: "Pozo HMW-05", estado: "activo" },
    { id: "P-06", nombre: "Pozo HMW-06", estado: "activo" },
    { id: "P-07", nombre: "Pozo HMW-07", estado: "standby" },
  ].map((p) => ({
    ...p,
    caudal_lps: p.estado === "activo" ? variarCaudal(28) : 0,
    concentracion_li_mgl: variarConcentracionLi(859),
    presion_cabezal_bar: p.estado === "activo" ? variarPresion(1.8) : 0,
    temperatura_salmuera_c: rand(17, 21),
    drawdown_m: p.estado === "activo" ? rand(1.0, 3.5) : rand(0.3, 0.8),
    horas_operacion: 10000 + parseInt(p.id.replace("P-0", "")) * 1200,
  }));

  const pozosActivos = pozos.filter((p) => p.estado === "activo");
  const liPromedio = Math.round(
    pozosActivos.reduce((s, p) => s + p.concentracion_li_mgl, 0) / pozosActivos.length
  );

  const alertas = generarAlertasVariadas();
  const alertasActivas = alertas.filter((a) => a.estado !== "resuelta");

  const pozas = [
    { id: "PE-H1", nombre: "Poza Halita 1", etapa: "halita", estado: "operativa", area_m2: 40000, profundidad_cm: 28, freeboard_cm: 42, densidad_entrada: 1.21, densidad_salida: 1.23, concentracion_li_mgl: 1050, tasa_evaporacion_mm_dia: evaporacion, dias_residencia: 30, dias_transcurridos: 18 },
    { id: "PE-H2", nombre: "Poza Halita 2", etapa: "halita", estado: "operativa", area_m2: 35000, profundidad_cm: 32, freeboard_cm: 38, densidad_entrada: 1.21, densidad_salida: 1.23, concentracion_li_mgl: 1080, tasa_evaporacion_mm_dia: evaporacion * 0.95, dias_residencia: 30, dias_transcurridos: 25 },
    { id: "PE-S1", nombre: "Poza Silvinita 1", etapa: "silvinita", estado: "operativa", area_m2: 25000, profundidad_cm: 22, freeboard_cm: 48, densidad_entrada: 1.23, densidad_salida: 1.26, concentracion_li_mgl: 1850, tasa_evaporacion_mm_dia: evaporacion * 0.85, dias_residencia: 45, dias_transcurridos: 30 },
    { id: "PE-S2", nombre: "Poza Silvinita 2", etapa: "silvinita", estado: "carga", area_m2: 22000, profundidad_cm: 15, freeboard_cm: 55, densidad_entrada: 1.23, densidad_salida: 1.25, concentracion_li_mgl: 1720, tasa_evaporacion_mm_dia: evaporacion * 0.80, dias_residencia: 45, dias_transcurridos: 12 },
    { id: "PE-C1", nombre: "Poza Carnalita 1", etapa: "carnalita", estado: "operativa", area_m2: 18000, profundidad_cm: 18, freeboard_cm: 52, densidad_entrada: 1.26, densidad_salida: 1.30, concentracion_li_mgl: 3200, tasa_evaporacion_mm_dia: evaporacion * 0.70, dias_residencia: 60, dias_transcurridos: 42 },
    { id: "PE-CF1", nombre: "Poza Concentración Final", etapa: "concentracion_final", estado: "operativa", area_m2: 12000, profundidad_cm: 12, freeboard_cm: 58, densidad_entrada: 1.30, densidad_salida: 1.35, concentracion_li_mgl: 5400, tasa_evaporacion_mm_dia: evaporacion * 0.60, dias_residencia: 90, dias_transcurridos: 67 },
  ];

  return {
    timestamp: new Date().toISOString(),
    source: "generated",
    kpis: {
      produccion_hoy_ton: produccionHoy,
      produccion_mes_ton: Math.round(produccionHoy * rand(25, 32) * 10) / 10,
      target_mes_ton: 433,
      inventario_pozas_lce_ton: Math.round(10000 + (Math.random() - 0.5) * 200),
      pozos_activos: pozosActivos.length,
      pozos_total: 7,
      pozas_operativas: pozas.filter((p) => p.estado === "operativa").length,
      pozas_total: 6,
      planta_nf_estado: "Operativa",
      concentracion_promedio_li: liPromedio,
      dias_sin_lti: 187,
      personal_en_sitio: Math.round(rand(225, 245)),
      consumo_agua_m3_ton: rand(1.5, 2.1),
      temperatura_actual_c: temp,
      viento_actual_kmh: viento.velocidad,
      tasa_evaporacion_hoy: evaporacion,
      alertas_activas: alertasActivas.length,
      alertas_criticas: alertasActivas.filter((a) => a.severidad === "critica").length,
    },
    pozos,
    pozas,
    planta_nf: {
      estado: "operativa",
      throughput_m3h: rand(82, 90),
      recuperacion_li_pct: rand(91, 94),
      presion_entrada_bar: rand(11, 14),
      presion_salida_bar: rand(2.5, 4),
      concentracion_entrada_mgl: 5400,
      concentracion_salida_mgl: 58000,
      ratio_mg_li: rand(1.5, 2.2),
      horas_operacion: 1247,
    },
    meteo: {
      temperatura_c: temp,
      humedad_relativa_pct: variarHumedad(),
      velocidad_viento_kmh: viento.velocidad,
      direccion_viento: viento.direccion,
      radiacion_solar_kwh_m2: radiacion,
      tasa_evaporacion_mm_dia: evaporacion,
      presion_barometrica_mbar: variarPresionAtm(),
    },
    seguridad: {
      dias_sin_lti: 187,
      ltifr: 0,
      trifr: 1.2,
      personal_en_sitio: Math.round(rand(225, 245)),
      near_misses_mes: Math.round(rand(5, 12)),
      observaciones_seguridad_mes: Math.round(rand(120, 165)),
    },
    alertas,
    reportes: generarReportes(),
  };
}
