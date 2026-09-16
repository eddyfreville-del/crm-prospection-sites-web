"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  BellRing,
  Trophy,
  Settings,
  LogOut,
} from "lucide-react";
import { useIdentity } from "@/lib/identity";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prospects", label: "Prospects", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/relances", label: "Relances", icon: BellRing },
  { href: "/ventes", label: "Ventes", icon: Trophy },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useIdentity();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-panel md:flex">
      <div className="px-5 py-5">
        <p className="text-sm font-semibold text-ink">CRM Prospection</p>
        <p className="mt-0.5 text-xs text-inkDim">Sites web · Suisse</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-panel2 text-ink"
                  : "text-inkDim hover:bg-panel2/60 hover:text-ink"
              )}
            >
              <Icon size={17} strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line px-3 py-4">
        <div className="flex items-center justify-between rounded-lg px-3 py-2">
          <span className="truncate text-xs text-inkDim">{user?.email}</span>
          <button
            onClick={logout}
            aria-label="Se déconnecter"
            className="text-inkDim transition hover:text-ink"
          >
            <LogOut size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  );
}
