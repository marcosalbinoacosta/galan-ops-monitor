"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Droplets,
  Beaker,
  Gauge,
  AlertTriangle,
  Thermometer,
  Wind,
  RefreshCw,
  ArrowRight,
  FlaskConical,
  Clock,
  Waves,
} from "lucide-react";

const REFRESH_INTERVAL = 15_000;

interface Poza {
  id: string;
  nombre: string;
  etapa: string;
  estado: string;
  area_m2: number;
  profundidad_cm: number;
  freeboard_cm: number;
  densidad_entrada: number;
  densidad_salida: number;
  concentracion_li_mgl: number;
  tasa_evaporacion_mm_dia: number;
  dias_residencia: number;
  dias_transcurridos: number;
}

interface PlantaNF {
  estado: string;
  throughput_m3h: number;
  recuperacion_li_pct: number;
  presion_entrada_bar: number;
  presion_salida_bar: number;
  concentracion_entrada_mgl: number;
  concentracion_salida_mgl: number;
  ratio_mg_li: number;
  horas_operacion: number;
}

interface Meteo {
  temperatura_c: number;
  velocidad_viento_kmh: number;
  direccion_viento: string;
  radiacion_solar_kwh_m2: number;
  humedad_relativa_pct: number;
  tasa_evaporacion_mm_dia: number;
}

interface DashData {
  timestamp: string;
  pozas: Poza[];
  planta_nf: PlantaNF;
  meteo: Meteo;
}

const ETAPA_CONFIG: Record<
  string,
  {
    label: string;
    sublabel: string;
    order: number;
    gradient: string;
    color: string;
    bgLight: string;
    borderColor: string;
    icon: typeof Beaker;
  }
> = {
  halita: {
    label: "Halita",
    sublabel: "Etapa 1 - Precipitacion NaCl",
    order: 1,
    gradient: "linear-gradient(135deg, #2c5f8a, #3a7ab0)",
    color: "#2c5f8a",
    bgLight: "rgba(44, 95, 138, 0.06)",
    borderColor: "#2c5f8a",
    icon: Droplets,
  },
  silvinita: {
    label: "Silvinita",
    sublabel: "Etapa 2 - Precipitacion KCl",
    order: 2,
    gradient: "linear-gradient(135deg, #3a7ab0, #3a8c8c)",
    color: "#3a8c8c",
    bgLight: "rgba(58, 140, 140, 0.06)",
    borderColor: "#3a8c8c",
    icon: Beaker,
  },
  carnalita: {
    label: "Carnalita",
    sublabel: "Etapa 3 - Precipitacion Mg",
    order: 3,
    gradient: "linear-gradient(135deg, #3a8c8c, #4da8a8)",
    color: "#4da8a8",
    bgLight: "rgba(77, 168, 168, 0.06)",
    borderColor: "#4da8a8",
    icon: FlaskConical,
  },
  concentracion: {
    label: "Concentracion Final",
    sublabel: "Etapa 4 - Alimenta Planta NF",
    order: 4,
    gradient: "linear-gradient(135deg, #4da8a8, #5ba555)",
    color: "#5ba555",
    bgLight: "rgba(91, 165, 85, 0.06)",
    borderColor: "#5ba555",
    icon: Gauge,
  },
};

function getStatusDotClass(estado: string): string {
  switch (estado) {
    case "operativa":
      return "active";
    case "en_carga":
    case "en carga":
      return "warning";
    case "mantenimiento":
      return "error";
    default:
      return "idle";
  }
}

function formatEstado(estado: string): string {
  switch (estado) {
    case "operativa":
      return "Operativa";
    case "en_carga":
    case "en carga":
      return "En carga";
    case "mantenimiento":
      return "Mantenimiento";
    default:
      return estado.charAt(0).toUpperCase() + estado.slice(1);
  }
}

export default function PozasPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setLastUpdate(new Date());
      }
    } catch {
      /* use cached */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  const pozas = (data?.pozas ?? []) as Poza[];
  const nf = (data?.planta_nf ?? {}) as Partial<PlantaNF>;
  const met = (data?.meteo ?? {}) as Partial<Meteo>;

  // Group pozas by etapa
  const pozasByEtapa: Record<string, Poza[]> = {};
  for (const p of pozas) {
    if (!pozasByEtapa[p.etapa]) pozasByEtapa[p.etapa] = [];
    pozasByEtapa[p.etapa].push(p);
  }

  // Sort etapas by order
  const sortedEtapas = Object.keys(pozasByEtapa).sort(
    (a, b) => (ETAPA_CONFIG[a]?.order ?? 99) - (ETAPA_CONFIG[b]?.order ?? 99)
  );

  return (
    <div>
      {/* Hero */}
      <section className="galan-hero" style={{ height: 140 }}>
        <div className="relative z-10 max-w-[1200px] mx-auto px-10 w-full">
          <h1 className="font-[Montserrat] text-[28px] font-bold text-white tracking-wide">
            Pozas de Evaporacion
          </h1>
          <p className="text-[13px] text-white/60 mt-1">
            Monitoreo detallado de 6 pozas en 4 etapas de concentracion &middot;
            Hombre Muerto West
          </p>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-10 py-10">
        {/* Top bar: weather + evaporation + refresh */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Evaporation rate */}
          <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-4 py-2.5">
            <Waves size={16} className="text-[#3a8c8c]" />
            <span className="font-[Montserrat] text-[13px] font-bold text-[#3a8c8c]">
              Evaporacion: {met.tasa_evaporacion_mm_dia ?? 5.8} mm/dia
            </span>
          </div>

          {/* Weather */}
          <div className="flex items-center gap-3 bg-[#f8f9fa] rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Thermometer size={14} className="text-[#f97316]" />
              <span className="font-mono text-[13px] font-semibold">
                {met.temperatura_c ?? 12}&deg;C
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind size={14} className="text-[#3b82f6]" />
              <span className="font-mono text-[13px] font-semibold">
                {met.velocidad_viento_kmh ?? 14} km/h{" "}
                {met.direccion_viento ?? "NW"}
              </span>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchData}
            className="ml-auto flex items-center gap-1.5 text-[11px] text-[#999] hover:text-[#3a8c8c] transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            {lastUpdate.toLocaleTimeString("es-AR")} &middot; auto{" "}
            {REFRESH_INTERVAL / 1000}s
          </button>
        </div>

        {/* Visual Pipeline Header */}
        <div className="mb-10">
          <h2 className="section-title">Pipeline de Concentracion</h2>
          <p className="text-[13px] text-[#777] -mt-3 mb-6">
            Flujo de salmuera a traves de las 4 etapas de evaporacion solar
            hasta la planta de nanofiltracion.
          </p>

          {/* Pipeline visualization */}
          <div className="flex items-center gap-0 mb-2 overflow-x-auto pb-2">
            {sortedEtapas.map((etapa, i) => {
              const cfg = ETAPA_CONFIG[etapa];
              if (!cfg) return null;
              const etapaPozas = pozasByEtapa[etapa] ?? [];
              const avgLi =
                etapaPozas.length > 0
                  ? Math.round(
                      etapaPozas.reduce(
                        (s, p) => s + p.concentracion_li_mgl,
                        0
                      ) / etapaPozas.length
                    )
                  : 0;

              return (
                <div key={etapa} className="flex items-center">
                  <div
                    className="relative px-6 py-4 rounded-xl min-w-[200px]"
                    style={{ background: cfg.bgLight, border: `2px solid ${cfg.borderColor}22` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: cfg.gradient }}
                      >
                        <cfg.icon size={12} className="text-white" />
                      </div>
                      <span className="font-[Montserrat] text-[13px] font-bold text-[#1a2332]">
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#999] mb-2">{cfg.sublabel}</p>
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-mono text-[22px] font-bold"
                        style={{ color: cfg.color }}
                      >
                        {avgLi > 0
                          ? avgLi >= 1000
                            ? `${(avgLi / 1000).toFixed(1)}k`
                            : avgLi
                          : "--"}
                      </span>
                      <span className="text-[10px] text-[#999]">mg/L Li</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-[#777]">
                        {etapaPozas.length} poza{etapaPozas.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-[10px] text-[#ccc]">|</span>
                      <span className="text-[10px] text-[#777]">
                        {etapaPozas.filter((p) => p.estado === "operativa").length} operativa
                        {etapaPozas.filter((p) => p.estado === "operativa").length !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                  </div>
                  {i < sortedEtapas.length - 1 && (
                    <div className="flex-shrink-0 px-2">
                      <ArrowRight size={20} className="text-[#3a8c8c]" />
                    </div>
                  )}
                </div>
              );
            })}
            {/* NF plant at end */}
            <div className="flex items-center">
              <div className="flex-shrink-0 px-2">
                <ArrowRight size={20} className="text-[#5ba555]" />
              </div>
              <div
                className="relative px-6 py-4 rounded-xl min-w-[200px]"
                style={{
                  background: "rgba(74, 142, 69, 0.06)",
                  border: "2px solid rgba(74, 142, 69, 0.15)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #5ba555, #4a8e45)",
                    }}
                  >
                    <Gauge size={12} className="text-white" />
                  </div>
                  <span className="font-[Montserrat] text-[13px] font-bold text-[#1a2332]">
                    Planta NF
                  </span>
                </div>
                <p className="text-[10px] text-[#999] mb-2">Nanofiltracion</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-[22px] font-bold text-[#4a8e45]">
                    {nf.concentracion_salida_mgl
                      ? `${(nf.concentracion_salida_mgl / 1000).toFixed(0)}k`
                      : "58k"}
                  </span>
                  <span className="text-[10px] text-[#999]">mg/L Li</span>
                </div>
                <span className="text-[10px] text-[#777]">
                  {nf.recuperacion_li_pct ?? 92.4}% recuperacion
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pozas by Etapa */}
        {sortedEtapas.map((etapa) => {
          const cfg = ETAPA_CONFIG[etapa];
          if (!cfg) return null;
          const etapaPozas = pozasByEtapa[etapa] ?? [];

          return (
            <div key={etapa} className="mb-10">
              {/* Etapa header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: cfg.gradient }}
                >
                  <cfg.icon size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-[Montserrat] text-[18px] font-bold text-[#1a2332]">
                    {cfg.label}
                  </h3>
                  <p className="text-[12px] text-[#999]">{cfg.sublabel}</p>
                </div>
                <div
                  className="ml-auto h-1 flex-1 max-w-[200px] rounded-full"
                  style={{ background: cfg.gradient, opacity: 0.2 }}
                />
              </div>

              {/* Poza cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {etapaPozas.map((poza) => (
                  <PozaCard key={poza.id} poza={poza} config={cfg} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Nanofiltration Plant Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #5ba555, #4a8e45)",
              }}
            >
              <Gauge size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-[Montserrat] text-[18px] font-bold text-[#1a2332]">
                Planta de Nanofiltracion
              </h3>
              <p className="text-[12px] text-[#999]">
                Authium NF Technology — Concentracion final de LiCl
              </p>
            </div>
            <div
              className="ml-auto h-1 flex-1 max-w-[200px] rounded-full"
              style={{
                background: "linear-gradient(135deg, #5ba555, #4a8e45)",
                opacity: 0.2,
              }}
            />
          </div>

          <div className="detail-panel p-6">
            {/* Status header */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`status-dot ${getStatusDotClass(
                  String(nf.estado ?? "operativa")
                )}`}
              />
              <span className="font-[Montserrat] text-[14px] font-bold text-[#1a2332]">
                {formatEstado(String(nf.estado ?? "operativa"))}
              </span>
              <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[#999]">
                <Clock size={12} />
                <span className="font-mono font-semibold">
                  {Number(nf.horas_operacion ?? 1247).toLocaleString()}h
                </span>{" "}
                operacion acumulada
              </div>
            </div>

            {/* NF metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <NfMetricCard
                label="Throughput"
                value={`${nf.throughput_m3h ?? 85}`}
                unit="m3/h"
                color="#4a8e45"
              />
              <NfMetricCard
                label="Recuperacion Li"
                value={`${nf.recuperacion_li_pct ?? 92.4}`}
                unit="%"
                color="#5ba555"
                highlight
              />
              <NfMetricCard
                label="Presion Entrada"
                value={`${nf.presion_entrada_bar ?? 12.5}`}
                unit="bar"
                color="#3a8c8c"
              />
              <NfMetricCard
                label="Presion Salida"
                value={`${nf.presion_salida_bar ?? 3.2}`}
                unit="bar"
                color="#3a8c8c"
              />
            </div>

            {/* Concentration flow */}
            <div className="mt-6 p-5 rounded-xl bg-[#f8f9fa]">
              <p className="text-[10px] text-[#777] uppercase tracking-wider font-[Montserrat] font-semibold mb-4">
                Flujo de Concentracion
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-[#999] mb-1">Entrada</p>
                  <p className="font-mono text-[28px] font-bold text-[#2c5f8a]">
                    {(
                      nf.concentracion_entrada_mgl ?? 5400
                    ).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#999]">mg/L Li</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ArrowRight size={28} className="text-[#5ba555]" />
                  <span className="text-[10px] text-[#5ba555] font-mono font-bold">
                    x
                    {(
                      (nf.concentracion_salida_mgl ?? 58000) /
                      (nf.concentracion_entrada_mgl ?? 5400)
                    ).toFixed(1)}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[#999] mb-1">Salida</p>
                  <p className="font-mono text-[28px] font-bold text-[#5ba555]">
                    {(
                      nf.concentracion_salida_mgl ?? 58000
                    ).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#999]">mg/L Li</p>
                </div>
              </div>
            </div>

            {/* Ratio Mg:Li */}
            <div className="mt-4 flex items-center gap-4">
              <div className="highlight-box flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#777] uppercase tracking-wider font-[Montserrat] font-semibold">
                      Ratio Mg:Li
                    </p>
                    <p className="font-mono text-[24px] font-bold text-[#1a2332] mt-1">
                      {nf.ratio_mg_li ?? 1.8}
                    </p>
                    <p className="text-[10px] text-[#999]">
                      Limite operativo: 2.8
                    </p>
                  </div>
                  <div className="w-[120px]">
                    <div className="h-2 bg-[#e8e8e8] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((nf.ratio_mg_li ?? 1.8) / 2.8) * 100
                          )}%`,
                          background:
                            (nf.ratio_mg_li ?? 1.8) > 2.5
                              ? "#ef4444"
                              : (nf.ratio_mg_li ?? 1.8) > 2.0
                              ? "#eab308"
                              : "#5ba555",
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-[#999]">0</span>
                      <span className="text-[9px] text-[#999]">2.8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== Poza Card Component ======
function PozaCard({
  poza,
  config,
}: {
  poza: Poza;
  config: (typeof ETAPA_CONFIG)[string];
}) {
  const progressPct = Math.min(
    100,
    (poza.dias_transcurridos / poza.dias_residencia) * 100
  );
  const freeboardWarning = poza.freeboard_cm < 35;

  return (
    <div
      className="detail-panel p-5 relative overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{ borderTop: `3px solid ${config.color}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-[Montserrat] text-[14px] font-bold text-[#1a2332]">
              {poza.id}
            </span>
            <span className={`status-dot ${getStatusDotClass(poza.estado)}`} />
          </div>
          <p className="text-[11px] text-[#999] mt-0.5">{poza.nombre}</p>
        </div>
        <span
          className="data-pill"
          style={{
            background: `${config.color}10`,
            color: config.color,
          }}
        >
          {formatEstado(poza.estado)}
        </span>
      </div>

      {/* Freeboard warning */}
      {freeboardWarning && (
        <div className="flex items-center gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3 py-2 mb-3">
          <AlertTriangle size={14} className="text-[#ef4444] flex-shrink-0" />
          <span className="text-[11px] text-[#ef4444] font-semibold">
            Freeboard bajo: {poza.freeboard_cm} cm (&lt; 35 cm)
          </span>
        </div>
      )}

      {/* Key metric - Li concentration */}
      <div className="bg-[#f8f9fa] rounded-lg p-3 mb-3 text-center">
        <p className="text-[10px] text-[#777] uppercase tracking-wider font-[Montserrat] font-semibold mb-1">
          Concentracion Li
        </p>
        <span
          className="font-mono text-[26px] font-bold"
          style={{ color: config.color }}
        >
          {poza.concentracion_li_mgl.toLocaleString()}
        </span>
        <span className="text-[11px] text-[#999] ml-1">mg/L</span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
        <MetricRow label="Area" value={`${poza.area_m2.toLocaleString()} m2`} />
        <MetricRow label="Profundidad" value={`${poza.profundidad_cm} cm`} />
        <MetricRow
          label="Freeboard"
          value={`${poza.freeboard_cm} cm`}
          warning={freeboardWarning}
        />
        <MetricRow
          label="Evaporacion"
          value={`${poza.tasa_evaporacion_mm_dia} mm/d`}
        />
        <MetricRow
          label="Densidad E"
          value={`${poza.densidad_entrada} g/cm3`}
        />
        <MetricRow
          label="Densidad S"
          value={`${poza.densidad_salida} g/cm3`}
        />
      </div>

      {/* Residence progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <Clock size={11} className="text-[#999]" />
            <span className="text-[10px] text-[#777] font-[Montserrat] font-semibold uppercase tracking-wider">
              Residencia
            </span>
          </div>
          <span className="font-mono text-[12px] font-bold text-[#1a2332]">
            {poza.dias_transcurridos}/{poza.dias_residencia} dias
          </span>
        </div>
        <div className="h-2.5 bg-[#e8e8e8] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPct}%`,
              background:
                progressPct >= 90
                  ? "#5ba555"
                  : progressPct >= 70
                  ? config.gradient
                  : config.color,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-[#999]">0 dias</span>
          <span className="text-[9px] text-[#999] font-semibold">
            {Math.round(progressPct)}%
          </span>
          <span className="text-[9px] text-[#999]">
            {poza.dias_residencia} dias
          </span>
        </div>
      </div>
    </div>
  );
}

// ====== Metric Row ======
function MetricRow({
  label,
  value,
  warning,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline py-1 border-b border-[#f0f0f0]">
      <span className="text-[10px] text-[#777]">{label}</span>
      <span
        className={`font-mono text-[11px] font-semibold ${
          warning ? "text-[#ef4444]" : "text-[#1a2332]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ====== NF Metric Card ======
function NfMetricCard({
  label,
  value,
  unit,
  color,
  highlight,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 text-center ${
        highlight
          ? "bg-[#f0fdf4] border border-[#bbf7d0]"
          : "bg-[#f8f9fa]"
      }`}
    >
      <p className="text-[10px] text-[#777] uppercase tracking-wider font-[Montserrat] font-semibold mb-2">
        {label}
      </p>
      <span className="font-mono text-[24px] font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-[11px] text-[#999] ml-1">{unit}</span>
    </div>
  );
}
