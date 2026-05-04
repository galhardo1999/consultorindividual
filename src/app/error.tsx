"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Error Global]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-950)]">
      <div className="text-center max-w-md px-6">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h1 className="text-xl font-semibold text-[var(--color-surface-50)] mb-2">
          Algo deu errado
        </h1>
        <p className="text-sm text-[var(--color-surface-400)] mb-6">
          {error.message || "Ocorreu um erro inesperado. Tente novamente."}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[var(--color-brand-500)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-brand-600)] transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
