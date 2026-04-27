"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Archive, Bed, Bath, Car, Maximize, Users, CheckCircle2 } from "lucide-react";
import {
  formatCurrency, formatDate, propertyTypeLabel, propertyStatusLabel
} from "@/lib/utils";

interface PropertyDetail {
  id: string;
  titulo: string;
  tipoImovel: string;
  finalidade: string;
  preco: number;
  valorCondominio: number | null;
  valorIptu: number | null;
  cidade: string;
  bairro: string | null;
  endereco: string | null;
  quartos: number | null;
  suites: number | null;
  banheiros: number | null;
  vagasGaragem: number | null;
  areaUtil: number | null;
  mobiliado: boolean;
  aceitaFinanciamento: boolean;
  aceitaPermuta: boolean;
  status: string;
  destaques: string | null;
  descricao: string | null;
  codigoInterno: string | null;
  criadoEm: string;
  atualizadoEm: string;
  interesses: {
    id: string;
    statusInteresse: string;
    ehFavorito: boolean;
    cliente: { id: string; nomeCompleto: string; telefone: string };
  }[];
  proprietario?: {
    id: string;
    nomeCompleto: string;
    telefone: string | null;
    email: string | null;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  DISPONIVEL: "badge-success",
  RESERVADO: "badge-warning",
  VENDIDO: "badge-danger",
  LOCADO: "badge-info",
};

export default function ImovelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [imovel, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/imoveis/${id}`)
      .then((r) => {
        if (!r.ok) { router.push("/imoveis"); return null; }
        return r.json();
      })
      .then((d) => { if (d) { setProperty(d); setLoading(false); } })
      .catch(() => setLoading(false));
  }, [id]);

  async function archiveProperty() {
    if (!confirm("Deseja arquivar este imóvel?")) return;
    await fetch(`/api/imoveis/${id}`, { method: "DELETE" });
    router.push("/imoveis");
  }

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: "300px", borderRadius: "12px" }} />
      </div>
    );
  }

  if (!imovel) return null;

  const caracteristicas = [
    imovel.quartos != null && { icon: Bed, label: `${imovel.quartos} Quartos` },
    imovel.suites != null && { icon: Bed, label: `${imovel.suites} Suítes` },
    imovel.banheiros != null && { icon: Bath, label: `${imovel.banheiros} Banheiros` },
    imovel.vagasGaragem != null && { icon: Car, label: `${imovel.vagasGaragem} Vagas` },
    imovel.areaUtil != null && { icon: Maximize, label: `${imovel.areaUtil}m²` },
  ].filter(Boolean) as { icon: React.ElementType; label: string }[];

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/imoveis" className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>
              {imovel.titulo}
            </h1>
            <span className={`badge ${STATUS_COLORS[imovel.status] || "badge-secondary"}`}>
              {propertyStatusLabel(imovel.status)}
            </span>
          </div>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.85rem", marginTop: "4px" }}>
            {imovel.codigoInterno && `#${imovel.codigoInterno} · `}
            {propertyTypeLabel(imovel.tipoImovel)} · Cadastrado em {formatDate(imovel.criadoEm)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/imoveis/${id}/editar`} className="btn btn-secondary btn-sm">
            <Edit2 size={14} />
            Editar
          </Link>
          <button className="btn btn-danger btn-sm" onClick={archiveProperty}>
            <Archive size={14} />
            Arquivar
          </button>
        </div>
      </div>

      {/* Main info card */}
      <div className="card mb-5">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", alignItems: "start" }}>
          <div>
            <p style={{ color: "var(--color-surface-400)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              📍 {imovel.cidade}{imovel.bairro && `, ${imovel.bairro}`}
              {imovel.endereco && ` · ${imovel.endereco}`}
            </p>
            <div className="text-3xl font-bold mb-4" style={{ color: "#22c55e" }}>
              {formatCurrency(imovel.preco)}
            </div>

            {caracteristicas.length > 0 && (
              <div className="flex gap-4 flex-wrap">
                {caracteristicas.map((f) => (
                  <div key={f.label} className="flex items-center gap-2" style={{ color: "var(--color-surface-300)", fontSize: "0.875rem" }}>
                    <f.icon size={16} style={{ color: "var(--color-brand-400)" }} />
                    {f.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {[
              imovel.valorCondominio && { label: "Condomínio", value: formatCurrency(imovel.valorCondominio) },
              imovel.valorIptu && { label: "IPTU/ano", value: formatCurrency(imovel.valorIptu) },
              { label: "Finalidade", value: imovel.finalidade },
            ].filter(Boolean).map((item) => item && (
              <div key={item.label} className="flex justify-between gap-4 mb-2" style={{ fontSize: "0.85rem" }}>
                <span style={{ color: "var(--color-surface-400)" }}>{item.label}</span>
                <span style={{ color: "var(--color-surface-100)", fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}

            {imovel.proprietario && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--color-surface-800)" }}>
                <span style={{ color: "var(--color-surface-400)", fontSize: "0.85rem", display: "block", marginBottom: "0.5rem" }}>Proprietário</span>
                <Link href={`/proprietarios/${imovel.proprietario.id}`} style={{ textDecoration: "none" }}>
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--color-surface-900)", transition: "background 0.2s" }}>
                    <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand font-medium">
                      {imovel.proprietario.nomeCompleto.charAt(0)}
                    </div>
                    <div>
                      <div style={{ color: "var(--color-surface-50)", fontSize: "0.9rem", fontWeight: 500 }}>{imovel.proprietario.nomeCompleto}</div>
                      {imovel.proprietario.telefone && (
                        <div style={{ color: "var(--color-surface-400)", fontSize: "0.8rem" }}>{imovel.proprietario.telefone}</div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Attributes */}
        <div className="flex gap-3 flex-wrap mt-4 pt-4" style={{ borderTop: "1px solid var(--color-surface-700)" }}>
          {imovel.mobiliado && <span className="badge badge-info">Mobiliado</span>}
          {imovel.aceitaFinanciamento && <span className="badge badge-success">Aceita Financiamento</span>}
          {imovel.aceitaPermuta && <span className="badge badge-primary">Aceita Permuta</span>}
        </div>
      </div>

      {/* Description */}
      {imovel.descricao && (
        <div className="card mb-5">
          <h2 className="section-titulo mb-3">Descrição</h2>
          <p style={{ color: "var(--color-surface-200)", lineHeight: 1.7, fontSize: "0.9rem" }}>
            {imovel.descricao}
          </p>
        </div>
      )}

      {/* Highlights */}
      {imovel.destaques && (
        <div className="card mb-5">
          <h2 className="section-titulo mb-3">Diferenciais</h2>
          <p style={{ color: "var(--color-surface-200)", lineHeight: 1.7, fontSize: "0.9rem" }}>
            {imovel.destaques}
          </p>
        </div>
      )}

      {/* Interested clientes */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-titulo">
            <Users size={16} style={{ display: "inline", marginRight: "8px", color: "var(--color-brand-400)" }} />
            Clientes Interessados ({imovel.interesses.length})
          </h2>
        </div>

        {imovel.interesses.length === 0 ? (
          <div className="empty-state" style={{ padding: "1.5rem" }}>
            <p>Nenhum cliente vinculado a este imóvel</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {imovel.interesses.map((interesse) => (
              <Link key={interesse.id} href={`/clientes/${interesse.cliente.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem", borderRadius: "8px", background: "var(--color-surface-900)",
                  transition: "background 0.15s",
                }}>
                  <div>
                    <div className="font-medium text-sm" style={{ color: "var(--color-surface-100)" }}>
                      {interesse.cliente.nomeCompleto}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-surface-400)" }}>
                      {interesse.cliente.telefone}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {interesse.ehFavorito && <span style={{ color: "#f59e0b", fontSize: "0.8rem" }}>⭐ Favorito</span>}
                    <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>{interesse.statusInteresse}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
