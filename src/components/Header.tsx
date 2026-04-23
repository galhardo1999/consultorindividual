"use cliente";

import { useState, useEffect } from "react";
import { Menu, Plus, Search, Moon, Sun } from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuToggle: () => void;
  usuario?: { nome?: string | null; email?: string | null; image?: string | null };
}

export function Header({ onMenuToggle, usuario }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const router = useRouter();

  useEffect(() => {
    // Read current theme from DOM
    const current = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
    if (current) {
      setTheme(current);
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const q = e.currentTarget.value;
      if (q) {
        router.push(`/clientes?search=${encodeURIComponent(q)}`);
        setShowSearch(false);
      }
    }
  }

  return (
    <header className="header">
      <div className="flex items-center gap-3">
        <button
          className="btn btn-ghost btn-icon"
          onClick={onMenuToggle}
          id="menu-toggle"
          titulo="Alternar menu"
        >
          <Menu size={20} />
        </button>

        {showSearch ? (
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: "2.5rem", width: "280px" }}
              placeholder="Buscar clientes... (Enter para buscar)"
              autoFocus
              onBlur={() => setShowSearch(false)}
              onKeyDown={handleSearch}
            />
          </div>
        ) : (
          <button
            className="btn btn-ghost btn-sm hidden sm:flex"
            onClick={() => setShowSearch(true)}
            style={{ gap: "0.5rem", color: "var(--color-surface-400)" }}
          >
            <Search size={16} />
            <span style={{ fontSize: "0.8rem" }}>Buscar...</span>
            <kbd
              style={{
                padding: "0.1rem 0.4rem",
                borderRadius: "4px",
                background: "var(--color-surface-700)",
                fontSize: "0.7rem",
                color: "var(--color-surface-400)",
              }}
            >
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button 
          className="btn btn-ghost btn-icon" 
          onClick={toggleTheme} 
          titulo="Alternar tema"
          aria-label="Alternar tema"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Quick add */}
        <div className="flex gap-1 ml-2">
          <Link href="/clientes/novo" className="btn btn-primary btn-sm" id="add-cliente-btn">
            <Plus size={14} />
            <span className="hidden sm:inline">Cliente</span>
          </Link>
          <Link href="/imoveis/novo" className="btn btn-secondary btn-sm" id="add-imovel-btn">
            <Plus size={14} />
            <span className="hidden sm:inline">Imóvel</span>
          </Link>
        </div>

        {/* Avatar */}
        {usuario && (
          <Link href="/perfil" className="ml-2">
            <div
              className="avatar cursor-pointer"
              style={{
                width: "36px",
                height: "36px",
                fontSize: "0.8rem",
                transition: "opacity 0.15s",
              }}
              titulo={usuario.nome || "Perfil"}
            >
              {usuario.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={usuario.image}
                  alt={usuario.nome || ""}
                  style={{ width: "100%", height: "100%", borderRadius: "999px", objectFit: "cover" }}
                />
              ) : (
                getInitials(usuario.nome || usuario.email || "U")
              )}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
