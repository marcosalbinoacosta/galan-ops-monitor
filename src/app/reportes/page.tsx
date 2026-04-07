"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, CheckCircle, Clock, Users, Bot, Activity, AlertTriangle, RefreshCw } from "lucide-react";

const turnoConfig: Record<string, { label: string; horario: string; color: string; bg: string }> = {
  manana: { label: "Mañana", horario: "06:00 - 14:00", color: "#f59e0b", bg: "#fefce8" },
  tarde: { label: "Tarde", horario: "14:00 - 22:00", color: "#f97316", bg: "#fff7ed" },
  noche: { label: "Noche", horario: "22:00 - 06:00", color: "#3b82f6", bg: "#eff6ff" },
};

export default function ReportesPage() {
  const [reportes, setReportes] = useState<Array<Record<string, unknown>>>([]);
  const [filtroTurno, setFiltroTurno] = useState("todos");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reportes");
      if (res.ok) {
        const d = await res.json();
        setReportes(d.reportes ?? []);
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filtroTurno === "todos"
    ? reportes
    : reportes.filter((r) => r.turno === filtroTurno);

  return (
    <div>
      <section className="galan-hero" style={{ height: 140 }}>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 w-full flex items-end justify-between">
          <div>
            <h1 className="font-[Montserrat] text-[28px] font-bold text-white">Reportes de Turno</h1>
            <p className="text-[12px] text-white/60 mt-1">
              Resumenes ejecutivos generados automaticamente por IA al cierre de cada turno
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
        {/* How it works */}
        <div className="highlight-box mb-6">
          <div className="flex items-start gap-3">
            <Bot size={18} className="text-[#3a8c8c] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-[Montserrat] text-[13px] font-bold text-[#1a2332]">
                Generacion automatica con IA
              </h3>
              <p className="text-[12px] text-[#666] mt-1 leading-relaxed">
                Al cierre de cada turno, un workflow n8n recopila datos de produccion, alertas, personal y meteorologia.
                Groq (LLaMA 3.1) genera un resumen ejecutivo que el supervisor revisa y aprueba.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#999]">Tiempo anterior:</span>
                  <span className="font-mono text-[11px] font-bold text-[#ef4444] line-through">45 min</span>
                </div>
                <span className="text-[#ccc]">&rarr;</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#999]">Con IA:</span>
                  <span className="font-mono text-[11px] font-bold text-[#5ba555]">5 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Turno filter */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <FileText size={13} className="text-[#bbb]" />
          <button
            onClick={() => setFiltroTurno("todos")}
            className={`text-[10px] font-[Montserrat] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
              filtroTurno === "todos" ? "bg-[#3a8c8c] text-white shadow-sm" : "bg-[#f5f5f5] text-[#888] hover:bg-[#eee]"
            }`}
          >
            Todos
          </button>
          {Object.entries(turnoConfig).map(([key, tc]) => (
            <button
              key={key}
              onClick={() => setFiltroTurno(key)}
              className={`text-[10px] font-[Montserrat] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                filtroTurno === key ? "text-white shadow-sm" : "bg-[#f5f5f5] text-[#888] hover:bg-[#eee]"
              }`}
              style={filtroTurno === key ? { background: tc.color } : undefined}
            >
              {tc.label}
            </button>
          ))}
        </div>

        {/* Reports list */}
        {loading && reportes.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="detail-panel p-6 animate-pulse">
                <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-16 bg-gray-100 rounded-lg" />
                  ))}
                </div>
                <div className="h-20 w-full bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="detail-panel p-10 text-center">
            <FileText size={36} className="mx-auto text-[#ddd] mb-3" />
            <p className="text-[14px] font-[Montserrat] font-semibold text-[#333]">
              Sin reportes {filtroTurno !== "todos" ? `del turno ${filtroTurno}` : ""}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => {
              const tc = turnoConfig[String(r.turno)] ?? turnoConfig.manana;
              const novedades = (r.novedades ?? []) as string[];

              return (
                <div key={String(r.id)} className="detail-panel overflow-hidden">
                  {/* Header with turno color accent */}
                  <div className="h-1" style={{ background: tc.color }} />
                  <div className="p-5 lg:p-6">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: tc.bg }}
                        >
                          <FileText size={18} style={{ color: tc.color }} />
                        </div>
                        <div>
                          <h3 className="font-[Montserrat] text-[14px] font-bold text-[#1a2332]">
                            {String(r.fecha)} — Turno{" "}
                            <span style={{ color: tc.color }}>
                              {tc.label}
                            </span>
                          </h3>
                          <p className="text-[10px] text-[#aaa]">
                            {tc.horario} | Supervisor: {String(r.supervisor)}
                          </p>
                        </div>
                      </div>
                      {r.estado === "aprobado" ? (
                        <span className="flex items-center gap-1.5 bg-[#f0fdf4] text-[#16a34a] text-[10px] font-bold px-3 py-1.5 rounded-lg">
                          <CheckCircle size={12} /> Aprobado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 bg-[#fefce8] text-[#ca8a04] text-[10px] font-bold px-3 py-1.5 rounded-lg">
                          <Clock size={12} /> Borrador
                        </span>
                      )}
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      {[
                        { label: "Produccion LiCl", value: `${r.produccion_ton}t`, icon: Activity, color: "#3a8c8c" },
                        { label: "Personal en sitio", value: String(r.personal_presente), icon: Users, color: "#2c5f8a" },
                        { label: "Alertas generadas", value: String(r.alertas_generadas), icon: AlertTriangle, color: "#f97316" },
                        { label: "Alertas resueltas", value: String(r.alertas_resueltas), icon: CheckCircle, color: "#5ba555" },
                      ].map((m) => {
                        const Icon = m.icon;
                        return (
                          <div key={m.label} className="bg-[#f8f9fa] rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Icon size={11} style={{ color: m.color }} />
                              <p className="text-[9px] text-[#999] uppercase tracking-wider font-semibold">{m.label}</p>
                            </div>
                            <p className="font-mono text-[20px] font-bold text-[#1a2332]">
                              {m.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* AI Summary */}
                    <div className="ia-recommendation">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Bot size={12} className="text-[#3a8c8c]" />
                        <span className="text-[9px] font-bold text-[#3a8c8c] uppercase tracking-wider">
                          Resumen generado por IA &middot; Groq / LLaMA 3.1
                        </span>
                      </div>
                      <p className="text-[12px] text-[#444] leading-relaxed">
                        {String(r.resumen_ia)}
                      </p>
                    </div>

                    {/* Novedades */}
                    {novedades.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
                        <p className="text-[10px] font-[Montserrat] font-semibold text-[#999] uppercase tracking-wider mb-2">
                          Novedades del turno
                        </p>
                        <ul className="space-y-1.5">
                          {novedades.map((n, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11px] text-[#666]">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tc.color }} />
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
