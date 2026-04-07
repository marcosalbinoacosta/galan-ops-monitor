"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Bot, Filter, Shield, Clock, CheckCircle2, RefreshCw } from "lucide-react";

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Array<Record<string, unknown>>>([]);
  const [filtro, setFiltro] = useState("todas");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alertas");
      if (res.ok) {
        const d = await res.json();
        setAlertas(d.alertas ?? []);
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, [fetchData]);

  const filtered = filtro === "todas"
    ? alertas
    : alertas.filter((a) => a.severidad === filtro);

  const counts = {
    todas: alertas.length,
    critica: alertas.filter((a) => a.severidad === "critica").length,
    alta: alertas.filter((a) => a.severidad === "alta").length,
    media: alertas.filter((a) => a.severidad === "media").length,
    baja: alertas.filter((a) => a.severidad === "baja").length,
  };

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `hace ${min}min`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
  };

  return (
    <div>
      <section className="galan-hero" style={{ height: 140 }}>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 w-full flex items-end justify-between">
          <div>
            <h1 className="font-[Montserrat] text-[28px] font-bold text-white">Centro de Alertas</h1>
            <p className="text-[12px] text-white/60 mt-1">
              Alertas enriquecidas con recomendaciones de IA via n8n + Groq (LLaMA 3.1)
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-white/60 text-[11px]">
            <button onClick={fetchData} className="flex items-center gap-1 hover:text-white transition-colors">
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        {/* Flow explanation */}
        <div className="highlight-box mb-6">
          <div className="flex items-start gap-3">
            <Bot size={18} className="text-[#3a8c8c] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-[Montserrat] text-[13px] font-bold text-[#1a2332]">
                Flujo de alertas inteligentes
              </h3>
              <p className="text-[12px] text-[#666] mt-1 leading-relaxed">
                <span className="font-mono text-[11px] bg-[#f0f0f0] px-1.5 py-0.5 rounded">Sensor</span>
                {" \u2192 "}
                <span className="font-mono text-[11px] bg-[#f0f0f0] px-1.5 py-0.5 rounded">n8n evalua umbral</span>
                {" \u2192 "}
                <span className="font-mono text-[11px] bg-[#f0f0f0] px-1.5 py-0.5 rounded">Groq LLM clasifica</span>
                {" \u2192 "}
                <span className="font-mono text-[11px] bg-[#f0f0f0] px-1.5 py-0.5 rounded">Guarda + Notifica</span>
                <br />
                <span className="text-[11px] text-[#999] mt-1 inline-block">
                  Todo automatizado. El LLM analiza el contexto operativo (4,000 msnm, salmuera, evaporacion) para dar recomendaciones tecnicas especificas.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Filter size={13} className="text-[#bbb]" />
          {(["todas", "critica", "alta", "media", "baja"] as const).map((f) => {
            const colorMap: Record<string, string> = {
              todas: "#3a8c8c",
              critica: "#ef4444",
              alta: "#f97316",
              media: "#eab308",
              baja: "#3b82f6",
            };
            return (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`text-[10px] font-[Montserrat] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                  filtro === f
                    ? "text-white shadow-sm"
                    : "bg-[#f5f5f5] text-[#888] hover:bg-[#eee]"
                }`}
                style={filtro === f ? { background: colorMap[f] } : undefined}
              >
                {f} {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
              </button>
            );
          })}
        </div>

        {/* Alerts list */}
        {loading && alertas.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="detail-panel p-5 animate-pulse">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-16 w-full bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="detail-panel p-10 text-center">
            <Shield size={36} className="mx-auto text-[#5ba555] mb-3" />
            <p className="text-[14px] font-[Montserrat] font-semibold text-[#333]">
              Sin alertas {filtro !== "todas" ? `de severidad ${filtro}` : ""}
            </p>
            <p className="text-[12px] text-[#999] mt-1">Operaciones dentro de parametros normales</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((alerta) => {
              const isResolved = alerta.estado === "resuelta";
              return (
                <div key={String(alerta.id)} className={`detail-panel p-5 ${isResolved ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isResolved ? (
                        <CheckCircle2 size={16} className="text-[#5ba555]" />
                      ) : (
                        <AlertTriangle size={16} className={
                          alerta.severidad === "critica" ? "text-[#ef4444]" :
                          alerta.severidad === "alta" ? "text-[#f97316]" :
                          alerta.severidad === "media" ? "text-[#eab308]" : "text-[#3b82f6]"
                        } />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`alert-badge ${alerta.severidad}`}>
                          {String(alerta.severidad).toUpperCase()}
                        </span>
                        <span className="text-[9px] text-[#bbb] uppercase tracking-wider font-semibold">
                          {String(alerta.categoria)}
                        </span>
                        {isResolved && (
                          <span className="text-[9px] bg-[#f0fdf4] text-[#5ba555] px-2 py-0.5 rounded font-bold">
                            RESUELTA
                          </span>
                        )}
                        {alerta.estado === "reconocida" && (
                          <span className="text-[9px] bg-[#eff6ff] text-[#3b82f6] px-2 py-0.5 rounded font-bold">
                            RECONOCIDA
                          </span>
                        )}
                        <span className="text-[9px] text-[#ccc] flex items-center gap-1 ml-auto">
                          <Clock size={9} />
                          {alerta.timestamp ? formatTime(String(alerta.timestamp)) : ""}
                        </span>
                      </div>

                      <h4 className="text-[13px] font-semibold text-[#1a2332] mb-1">
                        {String(alerta.titulo)}
                      </h4>
                      <p className="text-[11px] text-[#777] leading-relaxed mb-0">
                        {String(alerta.descripcion)}
                      </p>

                      {Boolean(alerta.origen) && (
                        <p className="text-[9px] text-[#bbb] mt-1">
                          Origen: <span className="font-mono">{String(alerta.origen)}</span>
                        </p>
                      )}

                      {Boolean(alerta.recomendacion_ia) && !isResolved && (
                        <div className="ia-recommendation mt-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Bot size={11} className="text-[#3a8c8c]" />
                            <span className="text-[9px] font-bold text-[#3a8c8c] uppercase tracking-wider">
                              Recomendacion IA &middot; Groq / LLaMA 3.1 8B
                            </span>
                          </div>
                          <p className="text-[11px] text-[#555] leading-relaxed">
                            {String(alerta.recomendacion_ia)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
