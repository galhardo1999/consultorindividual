"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, User, Phone, Check } from "lucide-react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { BotaoGoogleLogin } from "@/components/auth/BotaoGoogleLogin";

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    password: "",
    confirmPassword: "",
  });

  const hasMinLength = form.password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  
  // Calculate strength percentage
  const strengthPoints = [hasMinLength, hasLetter, hasNumber].filter(Boolean).length;
  const strengthPercentage = (strengthPoints / 3) * 100;
  
  let strengthColor = "bg-red-500";
  if (strengthPoints === 2) strengthColor = "bg-yellow-500";
  if (strengthPoints === 3) strengthColor = "bg-green-500";

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!termsAccepted) {
      setError("Você precisa aceitar os termos de uso para continuar.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setError("A senha não atende aos requisitos mínimos.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        nome: form.nome, 
        email: form.email, 
        telefone: form.telefone, 
        password: form.password 
      }),
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
    <AuthLayout>
      <AuthCard
        title="Crie sua conta"
        subtitle="Junte-se a centenas de consultores e eleve o seu padrão de atendimento."
        footer={
          <p className="text-[var(--color-surface-400)] text-sm">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="text-indigo-500 hover:text-indigo-400 font-semibold transition-colors"
            >
              Entrar agora
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="nome"
            type="text"
            label="Nome completo"
            placeholder="João Silva"
            icon={<User size={18} />}
            value={form.nome}
            onChange={(e) => update("nome", e.target.value)}
            required
          />

          <Input
            id="email"
            type="email"
            label="E-mail"
            placeholder="joao@exemplo.com"
            icon={<Mail size={18} />}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />

          <Input
            id="telefone"
            type="tel"
            label="Telefone"
            placeholder="(11) 99999-9999"
            icon={<Phone size={18} />}
            value={form.telefone}
            onChange={(e) => update("telefone", e.target.value)}
          />

          <div>
            <PasswordInput
              id="password"
              label="Senha"
              placeholder="Sua senha segura"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
            
            {/* Password requirements checker */}
            {form.password.length > 0 && (
              <div className="mt-2 space-y-2 p-3 bg-[var(--color-surface-950)] border border-[var(--color-surface-800)] rounded-lg text-xs">
                {/* Strength bar */}
                <div className="w-full h-1.5 bg-[var(--color-surface-800)] rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full transition-all duration-300 ${strengthColor}`} 
                    style={{ width: `${strengthPercentage}%` }}
                  />
                </div>
                
                <div className="space-y-1.5 text-[var(--color-surface-300)]">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${hasMinLength ? 'bg-green-500 border-green-500 text-white' : 'border-[var(--color-surface-600)] text-transparent'}`}>
                      <Check size={10} />
                    </div>
                    <span>Mínimo de 6 caracteres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${hasLetter ? 'bg-green-500 border-green-500 text-white' : 'border-[var(--color-surface-600)] text-transparent'}`}>
                      <Check size={10} />
                    </div>
                    <span>Pelo menos 1 letra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${hasNumber ? 'bg-green-500 border-green-500 text-white' : 'border-[var(--color-surface-600)] text-transparent'}`}>
                      <Check size={10} />
                    </div>
                    <span>Pelo menos 1 número</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <PasswordInput
            id="confirmPassword"
            label="Confirmar senha"
            placeholder="Repita a senha"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            required
            error={form.confirmPassword && form.password !== form.confirmPassword ? "As senhas não coincidem" : undefined}
          />

          <div className="pt-2 flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[var(--color-surface-600)] text-indigo-600 focus:ring-indigo-500 bg-[var(--color-surface-900)]"
            />
            <label htmlFor="terms" className="text-sm text-[var(--color-surface-300)] leading-tight">
              Aceito os <Link href="/termos" className="text-indigo-500 hover:text-indigo-400">Termos de Uso</Link> e a <Link href="/privacidade" className="text-indigo-500 hover:text-indigo-400">Política de Privacidade</Link>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
              <span className="text-sm text-red-500 font-medium">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-4"
            size="lg"
            isLoading={loading}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[var(--color-surface-800)]" />
          <span className="text-xs text-[var(--color-surface-500)] font-medium uppercase tracking-wider">
            ou
          </span>
          <div className="flex-1 h-px bg-[var(--color-surface-800)]" />
        </div>

        <BotaoGoogleLogin />
      </AuthCard>
    </AuthLayout>
  );
}
