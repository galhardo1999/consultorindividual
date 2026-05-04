"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { BotaoGoogleLogin } from "@/components/auth/BotaoGoogleLogin";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <AuthLayout>
      <AuthCard
        title="Bem-vindo de volta"
        subtitle="Acesse sua conta para continuar sua jornada no mercado imobiliário."
        footer={
          <p className="text-[var(--color-surface-400)] text-sm">
            Ainda não tem conta?{" "}
            <Link
              href="/cadastro"
              className="text-indigo-500 hover:text-indigo-400 font-semibold transition-colors"
            >
              Criar conta gratuita
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="email"
            type="email"
            label="E-mail"
            placeholder="seu@email.com"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div>
            <PasswordInput
              id="password"
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div className="flex justify-end mt-1">
              <Link
                href="/recuperar-senha"
                className="text-sm text-indigo-500 hover:text-indigo-400 transition-colors"
                tabIndex={-1}
              >
                Esqueci minha senha
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
              <span className="text-sm text-red-500 font-medium">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {/* Separador */}
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
