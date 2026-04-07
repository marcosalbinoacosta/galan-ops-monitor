/**
 * Funciones de variacion temporal para simular datos de sensores en tiempo real.
 * Los valores base provienen de mock-data.ts y se les aplica variacion
 * gaussiana + ciclos diurnos realistas para el Salar del Hombre Muerto.
 */

// Variacion gaussiana
function gauss(media: number, desviacion: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return media + z * desviacion;
}

// Clamp entre min y max
function clamp(valor: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, valor));
}

// Hora local en el salar (UTC-3)
function horaLocal(): number {
  const ahora = new Date();
  return (ahora.getUTCHours() - 3 + 24) % 24;
}

/** Temperatura con ciclo diurno: min ~06:00, max ~14:00 */
export function variarTemperatura(): number {
  const hora = horaLocal();
  const fase = ((hora - 6) / 24) * 2 * Math.PI;
  const amplitud = 22.5; // (25 - (-20)) / 2
  const media = 2.5;     // (25 + (-20)) / 2
  const temp = media + amplitud * Math.sin(fase);
  return Math.round((temp + gauss(0, 1.5)) * 10) / 10;
}

/** Radiacion solar: gaussiana centrada en 13:00 local */
export function variarRadiacion(): number {
  const hora = horaLocal();
  if (hora < 6 || hora > 20) return 0;
  const pico = 8.5;
  const radiacion = pico * Math.exp(-0.5 * ((hora - 13) / 3) ** 2);
  return Math.round(Math.max(0, radiacion + gauss(0, 0.3)) * 10) / 10;
}

/** Tasa de evaporacion correlacionada con radiacion y viento */
export function variarEvaporacion(radiacion: number, viento: number): number {
  const base = 3;
  const rango = 5; // 8 - 3
  const evap = base + rango * (radiacion / 8.5) * 0.7 + viento * 0.02;
  return Math.round(clamp(evap + gauss(0, 0.3), 2, 9) * 10) / 10;
}

/** Viento con posibilidad de rafagas */
export function variarViento(): { velocidad: number; direccion: string } {
  let velocidad = Math.max(0, 15 + gauss(0, 8));
  // 5% chance de rafaga fuerte
  if (Math.random() < 0.05) {
    velocidad = 50 + Math.random() * 30;
  }
  const direcciones = ["N", "NE", "NW", "W", "SW", "S"];
  const pesos = [0.1, 0.1, 0.35, 0.2, 0.15, 0.1];
  const r = Math.random();
  let acum = 0;
  let direccion = "NW";
  for (let i = 0; i < pesos.length; i++) {
    acum += pesos[i];
    if (r < acum) { direccion = direcciones[i]; break; }
  }
  return { velocidad: Math.round(velocidad * 10) / 10, direccion };
}

/** Variar caudal de pozo activo (15-40 L/s) */
export function variarCaudal(base: number): number {
  return Math.round(clamp(base + gauss(0, 1.5), 15, 40) * 10) / 10;
}

/** Variar concentracion Li (820-900 mg/L para HMW) */
export function variarConcentracionLi(base: number): number {
  return Math.round(clamp(base + gauss(0, 8), 820, 900));
}

/** Variar presion de pozo */
export function variarPresion(base: number): number {
  return Math.round(clamp(base + gauss(0, 0.15), 0.5, 3.0) * 10) / 10;
}

/** Variar profundidad de poza (cambia lento) */
export function variarProfundidad(base: number): number {
  return Math.round(clamp(base + gauss(0, 0.5), 5, 50) * 10) / 10;
}

/** Variar PM10 ambiental */
export function variarPM10(): number {
  return Math.round(clamp(35 + gauss(0, 15), 10, 120));
}

/** Variar nivel freatico */
export function variarNivelFreatico(base: number): number {
  return Math.round(clamp(base + gauss(0, 0.05), 1.5, 4.0) * 100) / 100;
}

/** Produccion diaria con variacion */
export function variarProduccion(target: number): number {
  return Math.round(clamp(target + gauss(0, 0.3), 2.5, 5.5) * 10) / 10;
}

/** Humedad relativa (10-45% en Puna) */
export function variarHumedad(): number {
  return Math.round(clamp(18 + gauss(0, 5), 10, 45));
}

/** Presion barometrica a 4000 msnm (~620 mbar) */
export function variarPresionAtm(): number {
  return Math.round(clamp(620 + gauss(0, 3), 610, 635));
}
