"use cliente";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Mail, Lock, Usuario, Phone, Eye, EyeOff, Loader2 } from "lucide-react";

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    password: "",
    confirmPassword: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: form.nome, email: form.email, telefone: form.telefone, password: form.password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erro ao criar conta.");
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(100,112,243,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, #6470f3, #5158e8)",
              boxShadow: "0 4px 24px rgba(100,112,243,0.4)",
            }}
          >
            <Building2 size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-surface-50)" }}>
            Criar conta
          </h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.9rem" }}>
            Comece a usar o Prime Realty CRM gratuitamente
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="nome">Nome completo</label>
              <div className="search-bar">
                <Usuario size={16} />
                <input
                  id="nome"
                  type="text"
                  className="input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="Seu nome"
                  value={form.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="email">E-mail</label>
              <div className="search-bar">
                <Mail size={16} />
                <input
                  id="email"
                  type="email"
                  className="input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="telefone">Telefone</label>
              <div className="search-bar">
                <Phone size={16} />
                <input
                  id="telefone"
                  type="tel"
                  className="input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={(e) => update("telefone", e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="password">Senha</label>
              <div className="search-bar" style={{ position: "relative" }}>
                <Lock size={16} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "0.875rem", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", color: "var(--color-surface-400)", padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="confirmPassword">Confirmar senha</label>
              <div className="search-bar">
                <Lock size={16} />
                <input
                  id="confirmPassword"
                  type="password"
                  className="input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="Repita a senha"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="toast toast-error" style={{ position: "static", marginBottom: "1rem", minWidth: "unset", animation: "none" }}>
                <span style={{ color: "#f87171" }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="text-center mt-5" style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "var(--color-brand-400)", textDecoration: "none", fontWeight: 500 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
