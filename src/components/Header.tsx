"use client";

import { useState, useEffect } from "react";
import { Menu, Plus, Search, Moon, Sun } from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuToggle: () => void;
  usuario?: { nome?: string | null; email?: string | null; image?: string | null };
}

export function Header({ usuario }: HeaderProps) {
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
      }
    }
  }

  return (
    <header className="header">
      <div className="flex items-center gap-3" style={{ flex: 1 }}>
        {/* Botão hambúrguer — visível apenas em mobile */}
        <button
          className="btn btn-ghost btn-icon lg:hidden flex-shrink-0"
          onClick={onMenuToggle}
          aria-label="Abrir menu"
          title="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <div className="search-bar" style={{ width: "100%", maxWidth: "800px" }}>
          <Search size={16} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: "2.5rem", width: "100%" }}
            placeholder="Buscar clientes, imóveis, interações..."
            onKeyDown={handleSearch}
            id="global-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          title="Alternar tema"
          aria-label="Alternar tema"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

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
              title={usuario.nome || "Perfil"}
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
