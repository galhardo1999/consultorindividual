"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Building2,
  LayoutDashboard,
  Users,
  Home,
  Map,
  LogOut,
  Menu,
  Settings,
  Contact,
  Handshake,
  Wallet,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type NavItem = {
  href: string;
  icon: any;
  label: string;
  disabled?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Geral",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    title: "CRM",
    items: [
      { href: "/clientes", icon: Users, label: "Clientes" },
      { href: "/proprietarios", icon: Contact, label: "Proprietários" },
      { href: "/imoveis", icon: Home, label: "Imóveis" },
      { href: "/parceiros", icon: Handshake, label: "Parceiros" },
      { href: "/mapa", icon: Map, label: "Mapa" },
    ],
  },
  {
    title: "Gestão",
    items: [
      { href: "#", icon: Wallet, label: "Financeiro (EM DESENVOLVIMENTO)", disabled: true },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleDesktop?: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onClose, onToggleDesktop }: SidebarProps) {
  const pathname = usePathname();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

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
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCollapsed ? "cursor-pointer" : ""}`}
            style={{
              background: "linear-gradient(135deg, #6470f3, #5158e8)",
              boxShadow: "0 4px 12px rgba(100,112,243,0.35)",
            }}
            onClick={() => {
              if (isCollapsed && onToggleDesktop) {
                onToggleDesktop();
              }
            }}
            title={isCollapsed ? "Expandir menu" : ""}
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
            title="Recolher menu"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {/* Section Header */}
              {!isCollapsed && (
                <div
                  className="px-3 text-xs font-semibold uppercase tracking-wider mb-2 mt-2 sidebar-text flex items-center justify-between cursor-pointer transition-colors"
                  style={{ color: "var(--color-surface-400)" }}
                  onClick={() => toggleSection(section.title)}
                  title={collapsedSections[section.title] ? "Expandir seção" : "Minimizar seção"}
                >
                  <span className="whitespace-nowrap overflow-hidden">{section.title}</span>
                  {collapsedSections[section.title] ? (
                    <ChevronRight size={14} className="flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown size={14} className="flex-shrink-0 ml-2" />
                  )}
                </div>
              )}

              {/* Items */}
              {(!collapsedSections[section.title] || isCollapsed) && section.items.map((item) => {
                const isActive = item.href !== "#" && (pathname === item.href || pathname.startsWith(item.href + "/"));

                if (item.disabled) {
                  return (
                    <div
                      key={item.label}
                      className="sidebar-nav-item opacity-50 cursor-not-allowed"
                      title="Em desenvolvimento"
                    >
                      <item.icon size={18} className="flex-shrink-0" />
                      <span className="sidebar-text whitespace-nowrap overflow-hidden">{item.label}</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-nav-item ${isActive ? "active" : ""}`}
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
          ))}
        </nav>

        {/* Configurações Fixas */}
        <div className="px-3 pb-3">
          <Link
            href="/configuracoes"
            className={`sidebar-nav-item ${pathname === "/configuracoes" || pathname.startsWith("/configuracoes/") ? "active" : ""}`}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 768) {
                onClose?.();
              }
            }}
          >
            <Settings size={18} className="flex-shrink-0" />
            <span className="sidebar-text whitespace-nowrap overflow-hidden">Configurações</span>
          </Link>
        </div>

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
