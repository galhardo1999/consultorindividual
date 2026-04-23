"use cliente";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Phone, Mail, Calendar, Clock, CheckCircle2, Home, Filter, X } from "lucide-react";
import Link from "next/link";
import { formatDateTime, formatDate, interactionTypeLabel } from "@/lib/utils";

interface Interacao {
  id: string;
  tipoInteracao: string;
  titulo: string;
  descricao: string | null;
  dataInteracao: string;
  proximoFollowUp: string | null;
  cliente: { id: string; nomeCompleto: string };
  imovel: { id: string; titulo: string } | null;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  LIGACAO: Phone,
  MENSAGEM: MessageSquare,
  REUNIAO: Calendar,
  VISITA_AGENDADA: Calendar,
  VISITA_REALIZADA: CheckCircle2,
  FOLLOW_UP: Clock,
  ENVIO_PROPOSTA: Mail,
  DEFAULT: MessageSquare,
};

const TYPE_COLORS: Record<string, string> = {
  LIGACAO: "#6470f3",
  MENSAGEM: "#22c55e",
  REUNIAO: "#3b82f6",
  VISITA_AGENDADA: "#f59e0b",
  VISITA_REALIZADA: "#22c55e",
  FOLLOW_UP: "#f59e0b",
  ENVIO_PROPOSTA: "#8b5cf6",
  DEFAULT: "#9494ae",
};

export default function InteracoesPage() {
  const [interacoes, setInteractions] = useState<Interacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInteractions = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/interacoes");
    const data = await res.json();
    setInteractions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchInteractions(); }, [fetchInteractions]);

  if (loading) {
    return (
      <div className="page">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card mb-3">
            <div className="skeleton" style={{ height: "16px", width: "40%", marginBottom: "8px" }} />
            <div className="skeleton" style={{ height: "14px", width: "60%" }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-header mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>Interações</h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.9rem", marginTop: "4px" }}>
            Histórico de todas as interações registradas
          </p>
        </div>
      </div>

      {interacoes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <MessageSquare size={48} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-surface-200)" }}>
              Nenhuma interação registrada
            </h3>
            <p>Acesse um cliente e registre a primeira interação</p>
            <Link href="/clientes" className="btn btn-primary mt-3">
              Ver Clientes
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {interacoes.map((interacao) => {
            const Icon = TYPE_ICONS[interacao.tipoInteracao] || TYPE_ICONS.DEFAULT;
            const color = TYPE_COLORS[interacao.tipoInteracao] || TYPE_COLORS.DEFAULT;

            return (
              <div key={interacao.id} className="card card-sm" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}20` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <span className="badge badge-secondary" style={{ fontSize: "0.7rem", marginBottom: "4px" }}>
                        {interactionTypeLabel(interacao.tipoInteracao)}
                      </span>
                      <div className="font-medium" style={{ color: "var(--color-surface-100)" }}>
                        {interacao.titulo}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)", flexShrink: 0 }}>
                      {formatDateTime(interacao.dataInteracao)}
                    </div>
                  </div>

                  {interacao.descricao && (
                    <p style={{ color: "var(--color-surface-300)", fontSize: "0.85rem", lineHeight: 1.5, marginTop: "0.375rem" }}>
                      {interacao.descricao}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 flex-wrap" style={{ fontSize: "0.8rem" }}>
                    <Link href={`/clientes/${interacao.cliente.id}`} style={{ color: "var(--color-brand-400)", textDecoration: "none" }}>
                      👤 {interacao.cliente.nomeCompleto}
                    </Link>
                    {interacao.imovel && (
                      <Link href={`/imoveis/${interacao.imovel.id}`} style={{ color: "var(--color-surface-400)", textDecoration: "none" }}>
                        🏠 {interacao.imovel.titulo}
                      </Link>
                    )}
                    {interacao.proximoFollowUp && (
                      <span style={{ color: "#f59e0b" }}>
                        <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
                        Follow-up: {formatDate(interacao.proximoFollowUp)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
