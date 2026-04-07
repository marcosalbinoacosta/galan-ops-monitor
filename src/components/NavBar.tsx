"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Proceso", href: "/" },
  { label: "Pozas", href: "/pozas" },
  { label: "Alertas", href: "/alertas" },
  { label: "Reportes", href: "/reportes" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="galan-header">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-[60px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-sm"
            style={{ background: "linear-gradient(135deg, #3a8c8c, #5ba555)" }}
          >
            G
          </div>
          <div>
            <span className="font-[Montserrat] font-bold text-[15px] text-[#1a2332] group-hover:text-[#3a8c8c] transition-colors">
              GALAN LITHIUM
            </span>
            <span className="text-[10px] text-[#aaa] ml-2 font-[Montserrat] tracking-[2px] font-medium">
              OPS MONITOR
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-[Montserrat] text-[11px] font-semibold uppercase tracking-[1px] px-4 py-2 rounded-md transition-all ${
                  isActive
                    ? "bg-[#3a8c8c]/10 text-[#3a8c8c]"
                    : "text-[#666] hover:text-[#3a8c8c] hover:bg-[#f5f5f5]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="status-dot active" />
            <span className="text-[11px] text-[#5ba555] font-semibold font-[Montserrat]">
              OPERATIVO
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
