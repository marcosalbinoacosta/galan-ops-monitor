"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Droplets,
  Wind,
  Thermometer,
  Sun,
  Shield,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Gauge,
  Users,
  Beaker,
  Bot,
  TrendingUp,
  Activity,
  FlaskConical,
  Waves,
} from "lucide-react";

const REFRESH_INTERVAL = 15_000;

interface DashData {
  timestamp: string;
  source: string;
  kpis: Record<string, number | string>;
  pozos: Array<Record<string, unknown>>;
  pozas?: Array<Record<string, unknown>>;
  planta_nf: Record<string, unknown>;
  meteo: Record<string, number | string>;
  seguridad: Record<string, number>;
  alertas: Array<Record<string, unknown>>;
  reportes: Array<Record<string, unknown>>;
}

type NodeId = "pozos" | "halita" | "silvinita" | "carnalita" | "concentracion" | "nanofiltracion" | "producto" | null;

export default function HomePage() {
  const [data, setData] = useState<DashData | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeId>(null);
  const [loading, setLoading] = useState(true);
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
    } catch { /* use cached */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  const k = data?.kpis ?? {};
  const met = data?.meteo ?? {};
  const seg = data?.seguridad ?? {};
  const nf = data?.planta_nf ?? {};
  const pozas = data?.pozas ?? [];
  const alertasActivas = (data?.alertas ?? []).filter((a) => a.estado !== "resuelta");

  // Get dynamic poza data
  const getPozaLi = (etapa: string) => {
    const poza = pozas.find((p) => String(p.etapa) === etapa);
    return poza ? Number(poza.concentracion_li_mgl) : null;
  };

  const processNodes = [
    {
      id: "pozos" as const,
      label: "Extraccion",
      sublabel: "7 Pozos HMW",
      icon: Droplets,
      color: "#2c5f8a",
      value: `${k.concentracion_promedio_li ?? 859}`,
      unit: "mg/L Li",
      status: "active" as const,
      detail: `${k.pozos_activos ?? 5}/${k.pozos_total ?? 7} activos`,
    },
    {
      id: "halita" as const,
      label: "Halita",
      sublabel: "Etapa 1 - NaCl",
      icon: Waves,
      color: "#3a7ab0",
      value: `${(getPozaLi("halita") ?? 1050).toLocaleString()}`,
      unit: "mg/L Li",
      status: "active" as const,
      detail: `${pozas.filter((p) => p.etapa === "halita").length || 2} pozas`,
    },
    {
      id: "silvinita" as const,
      label: "Silvinita",
      sublabel: "Etapa 2 - KCl",
      icon: FlaskConical,
      color: "#3a8c8c",
      value: `${(getPozaLi("silvinita") ?? 1850).toLocaleString()}`,
      unit: "mg/L Li",
      status: "active" as const,
      detail: `${pozas.filter((p) => p.etapa === "silvinita").length || 2} pozas`,
    },
    {
      id: "carnalita" as const,
      label: "Carnalita",
      sublabel: "Etapa 3 - Mg",
      icon: Beaker,
      color: "#4da8a8",
      value: `${(getPozaLi("carnalita") ?? 3200).toLocaleString()}`,
      unit: "mg/L Li",
      status: Number(nf.ratio_mg_li ?? 0) > 2.5 ? "warning" as const : "active" as const,
      detail: `Mg:Li ${nf.ratio_mg_li ?? "-"}`,
    },
    {
      id: "concentracion" as const,
      label: "Conc. Final",
      sublabel: "Etapa 4",
      icon: TrendingUp,
      color: "#5ba555",
      value: `${(getPozaLi("concentracion_final") ?? 5400).toLocaleString()}`,
      unit: "mg/L Li",
      status: "active" as const,
      detail: "Alimenta planta NF",
    },
    {
      id: "nanofiltracion" as const,
      label: "Nanofiltracion",
      sublabel: "Planta NF (Authium)",
      icon: Gauge,
      color: "#4a8e45",
      value: `${Number(nf.recuperacion_li_pct ?? 92.4).toFixed(1)}%`,
      unit: "recuperacion",
      status: "active" as const,
      detail: `${nf.throughput_m3h ?? 85} m\u00B3/h`,
    },
    {
      id: "producto" as const,
      label: "LiCl 6%",
      sublabel: "Producto final",
      icon: Activity,
      color: "#3a8c8c",
      value: `${k.produccion_hoy_ton ?? 4.3}`,
      unit: "ton/dia",
      status: "active" as const,
      detail: `Target: ${k.target_mes_ton ?? 433}t/mes`,
    },
  ];

  // Loading skeleton
  if (loading && !data) {
    return (
      <div>
        <section className="galan-hero">
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
            <div className="h-8 w-96 bg-white/20 rounded animate-pulse" />
            <div className="h-4 w-64 bg-white/10 rounded animate-pulse mt-3" />
          </div>
        </section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
          <div className="grid grid-cols-7 gap-3 mb-10">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="galan-hero">
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-[Montserrat] text-[28px] lg:text-[32px] font-bold text-white tracking-wide">
                Hombre Muerto West — Phase 1
              </h1>
              <p className="text-[13px] text-white/60 mt-1">
                Monitoreo operativo en tiempo real &middot; 5,200 tpa LCE &middot; Salar del Hombre Muerto, Catamarca
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-white/80">
              {data?.source === "generated" && (
                <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full font-mono">
                  MODO DEMO
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        {/* Top bar: safety + weather + alerts + refresh */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Safety */}
          <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-4 py-2">
            <Shield size={15} className="text-[#5ba555]" />
            <span className="font-[Montserrat] text-[12px] font-bold text-[#5ba555]">
              {seg.dias_sin_lti ?? 187} dias sin LTI
            </span>
            <span className="text-[10px] text-[#777] ml-1 hidden sm:inline">
              <Users size={10} className="inline mr-1" />
              {seg.personal_en_sitio ?? 234} en sitio
            </span>
          </div>

          {/* Weather */}
          <div className="flex items-center gap-3 bg-[#f8f9fa] rounded-lg px-4 py-2">
            <div className="flex items-center gap-1">
              <Thermometer size={13} className="text-[#f97316]" />
              <span className="font-mono text-[12px] font-semibold">{met.temperatura_c ?? 12}&deg;C</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind size={13} className="text-[#3b82f6]" />
              <span className="font-mono text-[12px] font-semibold">{met.velocidad_viento_kmh ?? 14} km/h {met.direccion_viento ?? "NW"}</span>
            </div>
            <div className="flex items-center gap-1 hidden sm:flex">
              <Sun size={13} className="text-[#eab308]" />
              <span className="font-mono text-[12px] font-semibold">{met.radiacion_solar_kwh_m2 ?? 7.2} kWh/m&sup2;</span>
            </div>
          </div>

          {/* Alerts badge */}
          {alertasActivas.length > 0 && (
            <a href="/alertas" className="flex items-center gap-2 bg-[#fff7ed] border border-[#fed7aa] rounded-lg px-4 py-2 hover:bg-[#ffedd5] transition-colors">
              <AlertTriangle size={13} className="text-[#f97316]" />
              <span className="text-[11px] font-bold text-[#f97316]">
                {alertasActivas.length} alertas
              </span>
            </a>
          )}

          {/* Refresh */}
          <button
            onClick={fetchData}
            className="ml-auto flex items-center gap-1.5 text-[10px] text-[#aaa] hover:text-[#3a8c8c] transition-colors"
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            {lastUpdate.toLocaleTimeString("es-AR")} &middot; cada {REFRESH_INTERVAL / 1000}s
          </button>
        </div>

        {/* PROCESS DIAGRAM */}
        <div className="mb-6">
          <h2 className="section-title">Flujo del Proceso</h2>
          <p className="text-[12px] text-[#888] -mt-3 mb-6">
            Desde la extraccion de salmuera hasta concentrado de cloruro de litio al 6%. Click en cada etapa para ver detalle.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="flex items-stretch gap-1.5 lg:gap-2 mb-8 process-flow-horizontal overflow-x-auto pb-2">
          {processNodes.map((node, i) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;
            const statusClass = node.status === "active" ? "active" : node.status === "warning" ? "warning" : "idle";

            return (
              <div key={node.id} className="flex items-stretch gap-1.5 lg:gap-2">
                <div
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  className={`process-node flex-shrink-0 w-[130px] lg:w-[155px] flex flex-col ${isSelected ? "active" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${node.color}12` }}
                    >
                      <Icon size={14} style={{ color: node.color }} />
                    </div>
                    <span className={`status-dot ${statusClass}`} />
                  </div>
                  <h4 className="font-[Montserrat] text-[11px] lg:text-[12px] font-bold text-[#1a2332]">
                    {node.label}
                  </h4>
                  <p className="text-[9px] lg:text-[10px] text-[#aaa] mb-2">{node.sublabel}</p>
                  <div className="mt-auto">
                    <span className="font-mono text-[16px] lg:text-[18px] font-bold" style={{ color: node.color }}>
                      {node.value}
                    </span>
                    <span className="text-[9px] text-[#aaa] ml-1">{node.unit}</span>
                  </div>
                  <p className="text-[9px] lg:text-[10px] text-[#aaa] mt-1">{node.detail}</p>
                </div>

                {i < processNodes.length - 1 && (
                  <div className="flow-arrow flex-shrink-0 self-center">
                    <ChevronRight size={18} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Concentration progression bar */}
        <div className="mb-8 bg-[#f8f9fa] rounded-xl p-5">
          <p className="text-[10px] text-[#888] font-[Montserrat] font-semibold uppercase tracking-wider mb-4">
            Concentracion de Litio a lo largo del proceso (escala logaritmica)
          </p>
          <div className="flex items-end gap-2 h-[80px]">
            {[
              { label: "Salmuera bruta", val: Number(k.concentracion_promedio_li) || 859, color: "#2c5f8a" },
              { label: "Halita", val: getPozaLi("halita") ?? 1050, color: "#3a7ab0" },
              { label: "Silvinita", val: getPozaLi("silvinita") ?? 1850, color: "#3a8c8c" },
              { label: "Carnalita", val: getPozaLi("carnalita") ?? 3200, color: "#4da8a8" },
              { label: "Conc. final", val: getPozaLi("concentracion_final") ?? 5400, color: "#5ba555" },
              { label: "Post-NF (LiCl 6%)", val: 58000, color: "#4a8e45" },
            ].map((step) => {
              const heightPct = (Math.log10(step.val) / Math.log10(58000)) * 100;
              return (
                <div key={step.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="font-mono text-[10px] font-bold text-[#333]">
                    {step.val >= 1000 ? `${(step.val / 1000).toFixed(step.val >= 10000 ? 0 : 1)}k` : step.val}
                  </span>
                  <div
                    className="w-full rounded-t-lg transition-all duration-700"
                    style={{
                      height: `${Math.max(6, heightPct * 0.65)}px`,
                      background: step.color,
                      opacity: 0.8,
                    }}
                  />
                  <span className="text-[8px] lg:text-[9px] text-[#999] text-center leading-tight">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected node detail + Alerts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Detail panel */}
          <div className="lg:col-span-2 detail-panel p-6">
            {selectedNode ? (
              <NodeDetail
                nodeId={selectedNode}
                data={data}
                onClose={() => setSelectedNode(null)}
              />
            ) : (
              <div className="text-center py-10">
                <Beaker size={36} className="mx-auto text-[#ddd] mb-3" />
                <p className="text-[13px] text-[#aaa] font-[Montserrat]">
                  Selecciona una etapa del proceso para ver el detalle operativo
                </p>
                <p className="text-[11px] text-[#ccc] mt-1">
                  7 pozos &middot; 6 pozas &middot; Planta NF &middot; Producto LiCl
                </p>
              </div>
            )}
          </div>

          {/* Alerts panel */}
          <div className="detail-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-[Montserrat] text-[13px] font-bold text-[#1a2332] flex items-center gap-2">
                <Bot size={14} className="text-[#3a8c8c]" />
                Alertas con IA
              </h3>
              <a href="/alertas" className="text-[10px] text-[#3a8c8c] hover:underline font-semibold">
                Ver todas &rarr;
              </a>
            </div>
            {alertasActivas.length === 0 ? (
              <div className="text-center py-6">
                <Shield size={24} className="mx-auto text-[#5ba555] mb-2" />
                <p className="text-[12px] text-[#999]">Sin alertas activas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertasActivas.slice(0, 4).map((alerta) => (
                  <div key={String(alerta.id)} className="border-b border-[#f0f0f0] pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`alert-badge ${alerta.severidad}`}>
                        {String(alerta.severidad).toUpperCase()}
                      </span>
                      <span className="text-[9px] text-[#bbb] uppercase tracking-wider">
                        {String(alerta.categoria)}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-[#333] leading-snug">
                      {String(alerta.titulo)}
                    </p>
                    {Boolean(alerta.recomendacion_ia) && (
                      <div className="ia-recommendation mt-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Bot size={9} className="text-[#3a8c8c]" />
                          <span className="text-[8px] font-bold text-[#3a8c8c] uppercase tracking-wider">
                            IA Groq/LLaMA 3.1
                          </span>
                        </div>
                        <p className="text-[10px] text-[#666] leading-relaxed">
                          {String(alerta.recomendacion_ia).slice(0, 120)}...
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: "Produccion hoy", value: `${k.produccion_hoy_ton ?? "-"}`, unit: "t LiCl", icon: Activity, color: "#3a8c8c" },
            { label: "Acum. mes", value: `${Number(k.produccion_mes_ton ?? 0).toFixed(0)}`, unit: `/ ${k.target_mes_ton ?? 433}t`, icon: TrendingUp, color: "#2c5f8a" },
            { label: "Inventario pozas", value: `${Number(k.inventario_pozas_lce_ton ?? 10000).toLocaleString()}`, unit: "t LCE", icon: Waves, color: "#3a7ab0" },
            { label: "Consumo agua", value: `${k.consumo_agua_m3_ton ?? "-"}`, unit: "m\u00B3/t", icon: Droplets, color: "#3b82f6" },
            { label: "Evaporacion", value: `${k.tasa_evaporacion_hoy ?? "-"}`, unit: "mm/dia", icon: Sun, color: "#eab308" },
            { label: "Planta NF Mg:Li", value: `${nf.ratio_mg_li ?? "-"}`, unit: "< 2.8 ok", icon: Gauge, color: Number(nf.ratio_mg_li ?? 0) > 2.5 ? "#f97316" : "#5ba555" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white border border-[#eee] rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} style={{ color: item.color }} />
                  <p className="text-[9px] text-[#999] uppercase tracking-wider font-[Montserrat] font-semibold">
                    {item.label}
                  </p>
                </div>
                <p className="font-mono text-[22px] font-bold text-[#1a2332]">
                  {item.value}
                </p>
                <p className="text-[10px] text-[#aaa]">{item.unit}</p>
              </div>
            );
          })}
        </div>

        {/* Quick links to other sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { href: "/pozas", title: "Pozas de Evaporacion", desc: "6 pozas en 4 etapas + Planta NF", color: "#3a8c8c", icon: Waves },
            { href: "/alertas", title: "Centro de Alertas", desc: `${alertasActivas.length} alertas activas con IA`, color: "#f97316", icon: AlertTriangle },
            { href: "/reportes", title: "Reportes de Turno", desc: "Resumenes automaticos por IA", color: "#2c5f8a", icon: Bot },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                className="detail-panel p-5 flex items-center gap-4 hover:shadow-lg transition-shadow group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${link.color}10` }}
                >
                  <Icon size={18} style={{ color: link.color }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-[Montserrat] text-[13px] font-bold text-[#1a2332] group-hover:text-[#3a8c8c] transition-colors">
                    {link.title}
                  </h4>
                  <p className="text-[11px] text-[#999]">{link.desc}</p>
                </div>
                <ChevronRight size={16} className="text-[#ddd] group-hover:text-[#3a8c8c] transition-colors" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ====== Node Detail Component ======
function NodeDetail({
  nodeId,
  data,
  onClose,
}: {
  nodeId: NonNullable<NodeId>;
  data: DashData | null;
  onClose: () => void;
}) {
  const pozos = (data?.pozos ?? []) as Array<Record<string, unknown>>;
  const pozas = (data?.pozas ?? []) as Array<Record<string, unknown>>;
  const nf = (data?.planta_nf ?? {}) as Record<string, unknown>;

  const getPozasForEtapa = (etapa: string) => pozas.filter((p) => p.etapa === etapa);

  if (nodeId === "pozos") {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[Montserrat] text-[15px] font-bold text-[#1a2332]">
            Pozos de Extraccion — Salmuera Bruta
          </h3>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#333] text-[11px] font-semibold">Cerrar &times;</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pozos.map((p) => {
            const isActive = p.estado === "activo";
            return (
              <div key={String(p.id)} className={`rounded-lg p-3 border ${isActive ? "border-[#e0f0e0] bg-[#fafff9]" : "border-[#eee] bg-[#fafafa]"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[12px] font-bold text-[#1a2332]">{String(p.id)}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isActive ? "bg-[#dcfce7] text-[#16a34a]" :
                    p.estado === "mantenimiento" ? "bg-[#fef3c7] text-[#d97706]" :
                    "bg-[#f3f4f6] text-[#6b7280]"
                  }`}>
                    {String(p.estado)}
                  </span>
                </div>
                {isActive ? (
                  <div className="space-y-1">
                    <div className="node-metric">
                      <span className="node-metric-label">Caudal</span>
                      <span className="node-metric-value">{String(p.caudal_lps)} L/s</span>
                    </div>
                    <div className="node-metric">
                      <span className="node-metric-label">Li</span>
                      <span className="node-metric-value">{String(p.concentracion_li_mgl)} mg/L</span>
                    </div>
                    <div className="node-metric">
                      <span className="node-metric-label">Presion</span>
                      <span className="node-metric-value">{String(p.presion_cabezal_bar)} bar</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#aaa] italic">{String(p.nombre)}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (nodeId === "nanofiltracion") {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[Montserrat] text-[15px] font-bold text-[#1a2332]">
            Planta de Nanofiltracion (Authium)
          </h3>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#333] text-[11px] font-semibold">Cerrar &times;</button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { label: "Estado", value: String(nf.estado ?? "operativa"), highlight: true },
            { label: "Throughput", value: `${nf.throughput_m3h ?? 85} m\u00B3/h` },
            { label: "Recuperacion Li", value: `${nf.recuperacion_li_pct ?? 92.4}%` },
            { label: "Presion E/S", value: `${nf.presion_entrada_bar ?? 12.5} / ${nf.presion_salida_bar ?? 3.2} bar` },
            { label: "Li salida", value: "58,000 mg/L (LiCl 6%)" },
            { label: "Ratio Mg:Li", value: `${nf.ratio_mg_li ?? 1.8}` },
            { label: "Horas operacion", value: `${Number(nf.horas_operacion ?? 1247).toLocaleString()}h` },
          ].map((m) => (
            <div key={m.label} className="node-metric">
              <span className="node-metric-label">{m.label}</span>
              <span className="node-metric-value">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (nodeId === "producto") {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[Montserrat] text-[15px] font-bold text-[#1a2332]">
            Producto Final — LiCl Concentrado al 6%
          </h3>
          <button onClick={onClose} className="text-[#aaa] hover:text-[#333] text-[11px] font-semibold">Cerrar &times;</button>
        </div>
        {[
          { label: "Produccion hoy", value: `${data?.kpis.produccion_hoy_ton ?? 4.3} toneladas` },
          { label: "Acumulado mes", value: `${data?.kpis.produccion_mes_ton ?? 48} toneladas` },
          { label: "Target mensual", value: `${data?.kpis.target_mes_ton ?? 433} toneladas` },
          { label: "Target anual", value: "5,200 tpa LCE (Phase 1)" },
          { label: "Offtake", value: "Authium (45kt/6-12a) + Glencore (US$100M)" },
        ].map((m) => (
          <div key={m.label} className="node-metric">
            <span className="node-metric-label">{m.label}</span>
            <span className="node-metric-value">{m.value}</span>
          </div>
        ))}
      </div>
    );
  }

  // Poza stages
  const etapaMap: Record<string, { title: string; etapa: string }> = {
    halita: { title: "Pozas de Halita — Precipitacion de NaCl (Etapa 1)", etapa: "halita" },
    silvinita: { title: "Pozas de Silvinita — Precipitacion de KCl (Etapa 2)", etapa: "silvinita" },
    carnalita: { title: "Poza de Carnalita — Precipitacion de sales de Mg (Etapa 3)", etapa: "carnalita" },
    concentracion: { title: "Poza de Concentracion Final (Etapa 4)", etapa: "concentracion_final" },
  };

  const em = etapaMap[nodeId];
  if (!em) return null;

  const etapaPozas = getPozasForEtapa(em.etapa);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[Montserrat] text-[15px] font-bold text-[#1a2332]">{em.title}</h3>
        <button onClick={onClose} className="text-[#aaa] hover:text-[#333] text-[11px] font-semibold">Cerrar &times;</button>
      </div>
      {etapaPozas.length > 0 ? (
        <div className="space-y-3">
          {etapaPozas.map((poza) => (
            <div key={String(poza.id)} className="rounded-lg border border-[#eee] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[12px] font-bold">{String(poza.nombre)}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#dcfce7] text-[#16a34a]">
                  {String(poza.estado)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[
                  { label: "Li", value: `${poza.concentracion_li_mgl} mg/L` },
                  { label: "Densidad", value: `${poza.densidad_entrada} \u2192 ${poza.densidad_salida} g/cm\u00B3` },
                  { label: "Freeboard", value: `${poza.freeboard_cm} cm` },
                  { label: "Evaporacion", value: `${poza.tasa_evaporacion_mm_dia} mm/dia` },
                  { label: "Area", value: `${Number(poza.area_m2).toLocaleString()} m\u00B2` },
                  { label: "Profundidad", value: `${poza.profundidad_cm} cm` },
                ].map((m) => (
                  <div key={m.label} className="node-metric">
                    <span className="node-metric-label">{m.label}</span>
                    <span className="node-metric-value">{m.value}</span>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-[9px] text-[#aaa] mb-1">
                  <span>Residencia: {String(poza.dias_transcurridos)}/{String(poza.dias_residencia)} dias</span>
                  <span>{Math.round((Number(poza.dias_transcurridos) / Number(poza.dias_residencia)) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (Number(poza.dias_transcurridos) / Number(poza.dias_residencia)) * 100)}%`,
                      background: "linear-gradient(to right, #3a8c8c, #5ba555)",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-0">
          {[
            { label: "Li salida", value: nodeId === "halita" ? "~1,050 mg/L" : nodeId === "silvinita" ? "~1,850 mg/L" : nodeId === "carnalita" ? "~3,200 mg/L" : "~5,400 mg/L" },
            { label: "Estado", value: "Datos no disponibles" },
          ].map((m) => (
            <div key={m.label} className="node-metric">
              <span className="node-metric-label">{m.label}</span>
              <span className="node-metric-value">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
