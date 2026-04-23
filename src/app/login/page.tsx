"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, Sun, Moon } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
    if (current) setTheme(current);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha incorretos.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] p-10 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1e1f4c 0%, #22222f 50%, #0a0a0f 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "-40%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(100,112,243,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="flex items-center gap-3 z-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6470f3, #5158e8)",
              boxShadow: "0 4px 16px rgba(100,112,243,0.4)",
            }}
          >
            <Building2 size={22} color="white" />
          </div>
          <span className="text-xl font-bold text-white">Prime Realty CRM</span>
        </div>

        <div className="z-10">
          <p
            className="text-4xl font-bold mb-4 leading-tight"
            style={{
              background: "linear-gradient(135deg, #a5b8fc, #6470f3, #8193f9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Consultoria imobiliária de alto padrão
          </p>
          <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Centralize clientes, imóveis e oportunidades. Atenda com contexto e
            converta mais.
          </p>
        </div>

        <div className="flex gap-6 z-10">
          {[
            { num: "100%", label: "Foco no consultor" },
            { num: "∞", label: "Clientes e imóveis" },
            { num: "Prime", label: "Experiência" },
          ].map((item) => (
            <div key={item.label}>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--color-brand-300)" }}
              >
                {item.num}
              </div>
              <div
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-icon absolute top-6 right-6"
          title="Alternar tema"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #6470f3, #5158e8)",
                }}
              >
                <Building2 size={22} color="white" />
              </div>
              <span className="text-xl font-bold">Prime Realty CRM</span>
            </div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: "var(--color-surface-50)" }}
            >
              Bem-vindo de volta
            </h1>
            <p style={{ color: "var(--color-surface-400)", fontSize: "0.9rem" }}>
              Entre com sua conta para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="email">
                E-mail
              </label>
              <div className="search-bar">
                <Mail size={16} />
                <input
                  id="email"
                  type="email"
                  className="input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="password">
                Senha
              </label>
              <div className="search-bar">
                <Lock size={16} />
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="input"
                    style={{ paddingLeft: 0, paddingRight: "2rem", width: "100%" }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.5rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-surface-400)",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div
                className="toast toast-error"
                style={{
                  position: "static",
                  marginBottom: "1rem",
                  minWidth: "unset",
                  animation: "none",
                }}
              >
                <span style={{ color: "#f87171" }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p
            className="text-center mt-6"
            style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}
          >
            Ainda não tem conta?{" "}
            <Link
              href="/cadastro"
              style={{
                color: "var(--color-brand-400)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
