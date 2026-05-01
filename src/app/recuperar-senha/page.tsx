"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("/api/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? "Erro ao enviar solicitação.");
        return;
      }

      setEnviado(true);
    } catch {
      setErro("Falha na requisição. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <AuthLayout>
        <AuthCard
          title="E-mail enviado!"
          subtitle="Verifique sua caixa de entrada e a pasta de spam."
          footer={
            <Link
              href="/login"
              className="text-sm text-indigo-500 hover:text-indigo-400 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar para o login
            </Link>
          }
        >
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
            <p className="text-center text-sm text-[var(--color-surface-300)] leading-relaxed max-w-sm">
              Se o e-mail{" "}
              <span className="font-semibold text-[var(--color-surface-100)]">
                {email}
              </span>{" "}
              estiver cadastrado, você receberá as instruções para redefinir
              sua senha em instantes.
            </p>
            <p className="text-center text-xs text-[var(--color-surface-500)] mt-1">
              O link expira em <strong className="text-[var(--color-surface-400)]">1 hora</strong>.
            </p>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Recuperar senha"
        subtitle="Informe seu e-mail e enviaremos um link para redefinir sua senha."
        footer={
          <Link
            href="/login"
            className="text-sm text-indigo-500 hover:text-indigo-400 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="email-recuperacao"
            type="email"
            label="E-mail cadastrado"
            placeholder="seu@email.com"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          {erro && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="text-sm text-red-500 font-medium">{erro}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={loading}
          >
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
