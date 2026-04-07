import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Ops Monitor | Galan Lithium - HMW Phase 1",
  description:
    "Dashboard de monitoreo operativo - Hombre Muerto West, Galan Lithium (ASX: GLN)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {/* Galan Top Bar */}
        <div className="galan-topbar">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex justify-between items-center">
            <span className="text-[11px] tracking-wide opacity-70">
              Galan Lithium Limited &middot; ASX: GLN
            </span>
            <div className="flex items-center gap-5 text-[11px]">
              <span className="opacity-50 hidden sm:inline">Salar del Hombre Muerto, Catamarca, Argentina &middot; 4,000 msnm</span>
              <span className="opacity-30 hidden sm:inline">|</span>
              <span className="text-[#4da8a8] font-semibold">Ops Monitor v1.0</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <NavBar />

        {/* Content */}
        <main className="min-h-[calc(100vh-200px)]">
          {children}
        </main>

        {/* Footer */}
        <footer className="galan-footer">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] opacity-50">
                  Prueba de concepto desarrollada por <a href="https://www.loomia.ar" className="text-[#4da8a8] hover:underline font-semibold">LOOM.IA</a> &middot; Marcos Acosta
                </p>
                <p className="text-[10px] opacity-30 mt-1">
                  Datos simulados basados en informacion publica de Galan Lithium. No representa datos operativos reales.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[11px] opacity-50">Construido con Next.js, n8n, Groq &amp; Claude Code</p>
                <p className="text-[10px] opacity-30 mt-1">&copy; 2026 LOOM.IA</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
