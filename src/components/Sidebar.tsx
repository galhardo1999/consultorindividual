"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Building2,
  LayoutDashboard,
  Users,
  Home,
  GitBranch,
  MessageSquare,
  LogOut,
  X,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clientes", icon: Users, label: "Clientes" },
  { href: "/imoveis", icon: Home, label: "Imóveis" },
  { href: "/interacoes", icon: MessageSquare, label: "Interações" },
  { href: "/perfil", icon: Settings, label: "Perfil" },
];

interface SidebarProps {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}
        style={{ zIndex: 40 }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-5 border-b sidebar-logo-container"
          style={{ borderColor: "var(--color-surface-800)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #6470f3, #5158e8)",
              boxShadow: "0 4px 12px rgba(100,112,243,0.35)",
            }}
          >
            <Building2 size={18} color="white" />
          </div>
          <div className="sidebar-text whitespace-nowrap overflow-hidden">
            <div className="font-bold text-sm" style={{ color: "var(--color-surface-50)" }}>
              Prime Realty
            </div>
            <div className="text-xs" style={{ color: "var(--color-surface-400)" }}>
              CRM
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon ml-auto sidebar-close-btn"
            onClick={onClose}
            titulo="Recolher menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-nav-item ${isActive ? "ativo" : ""}`}
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth <= 768) {
                      onClose?.();
                    }
                  }}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  <span className="sidebar-text whitespace-nowrap overflow-hidden">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t" style={{ borderColor: "var(--color-surface-800)" }}>
          <button
            className="sidebar-nav-item w-full"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className="sidebar-text whitespace-nowrap overflow-hidden">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
