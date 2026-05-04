"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface BotaoGoogleLoginProps {
  callbackUrl?: string;
}

export function BotaoGoogleLogin({ callbackUrl = "/dashboard" }: BotaoGoogleLoginProps) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin() {
    setErro("");
    setCarregando(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setErro("Não foi possível conectar com o Google. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleLogin}
        disabled={carregando}
        className="
          w-full h-12 flex items-center justify-center gap-3
          rounded-lg border border-[var(--color-surface-700)]
          bg-[var(--color-surface-900)] hover:bg-[var(--color-surface-800)]
          text-[var(--color-surface-100)] text-sm font-medium
          transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
        "
      >
        {carregando ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        {carregando ? "Conectando..." : "Continuar com Google"}
      </button>

      {erro && (
        <p className="text-xs text-red-500 text-center">{erro}</p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
