"use client";

import React, { useEffect, useState, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Archive, Mail, Phone, MapPin, Building2, User, Home, FileText, Plus, BedDouble, Bath, Car, Maximize, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { formatDate, maskTelefone, maskCPF, formatCurrency } from "@/lib/utils";

interface Imovel {
  id: string;
  titulo: string;
  tipoImovel: string;
  finalidade: string;
  precoVenda: number;
  valorCondominio: number | null;
  valorIptu: number | null;
  cidade: string;
  bairro: string | null;
  quartos: number | null;
  suites?: number | null;
  banheiros: number | null;
  vagasGaragem: number | null;
  areaUtil: number | null;
  status: string;
  criadoEm: string;
  atualizadoEm: string;
  imagens?: string[];
}

interface ProprietarioDetail {
  id: string;
  nomeCompleto: string;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  documento: string | null;
  tipoPessoa: string;
  cidade: string | null;
  estado: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cep: string | null;
  observacoes: string | null;
  status: string;
  criadoEm: string;
  imoveis: Imovel[];
}

const STATUS_COLORS: Record<string, string> = {
  ATIVO: "badge-success",
  INATIVO: "badge-warning",
  ARQUIVADO: "badge-secondary",
};

function ImovelCardHorizontal({ imovel }: { imovel: Imovel }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatValue = (val: number | null | undefined, suffix = "") => {
    if (!val) return null;
    return val >= 5 ? `5+${suffix}` : `${val}${suffix}`;
  };

  const quartos = formatValue(imovel.quartos);
  const banheiros = formatValue(imovel.banheiros);
  const vagas = formatValue(imovel.vagasGaragem);
  const area = imovel.areaUtil ? `${imovel.areaUtil}m²` : null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const imagens = imovel.imagens || [];

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (imagens.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % imagens.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (imagens.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + imagens.length) % imagens.length);
    }
  };

  // Title generation
  const formatEnum = (str: string) => {
    if (!str) return "";
    return str.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  const tipo = imovel.tipoImovel ? formatEnum(imovel.tipoImovel) : "Imóvel";
  const finalidadeText = imovel.finalidade ? formatEnum(imovel.finalidade).toLowerCase() : "venda";

  const titleParts = [];
  if (quartos) titleParts.push(`${quartos} dormitório${imovel.quartos && imovel.quartos > 1 ? "s" : ""}`);
  if (imovel.areaUtil) titleParts.push(`${imovel.areaUtil} m²`);

  const titleCenter = titleParts.length > 0 ? ` com ${titleParts.join(", ")}` : "";
  const title = `${tipo}${titleCenter} - ${finalidadeText} por ${formatCurrency(imovel.precoVenda)}`;

  const features = [
    { icon: BedDouble, value: quartos },
    { icon: Maximize, value: area },
    { icon: Car, value: vagas },
    { icon: Bath, value: banheiros },
  ].filter(f => f.value);

  const localizacao = imovel.bairro ? `${imovel.cidade}, ${imovel.bairro}` : imovel.cidade;

  return (
    <Link href={`/imoveis/${imovel.id}`} style={{ textDecoration: "none" }} className="block mb-4">
      <div className="flex flex-col md:flex-row gap-5 p-4 bg-surface-800 border border-surface-700/50 rounded-2xl transition-all duration-200 hover:bg-surface-700/50 cursor-pointer shadow-sm">

        {/* Image Area */}
        <div className="relative w-full md:w-[340px] h-[240px] flex-shrink-0 rounded-xl overflow-hidden bg-surface-900/50 flex items-center justify-center group border border-surface-700/50">
          {imagens.length > 0 ? (
            <img src={imagens[currentImageIndex]} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex flex-col items-center justify-center text-surface-600">
              <Home size={48} strokeWidth={1.5} />
              <span className="text-sm mt-2 font-medium">Sem imagem</span>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-8 h-8 bg-surface-900/80 hover:bg-surface-900 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 z-10"
          >
            <Heart size={16} className={isFavorited ? "fill-red-500 text-red-500" : "text-surface-400"} />
          </button>

          {/* Navigation Arrows */}
          {imagens.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-surface-900/80 hover:bg-surface-900 rounded-full flex items-center justify-center shadow-sm text-surface-200 transition-colors z-10"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-surface-900/80 hover:bg-surface-900 rounded-full flex items-center justify-center shadow-sm text-surface-200 transition-colors z-10"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {imagens.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {imagens.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${idx === currentImageIndex ? "bg-white scale-110" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="flex-1 flex flex-col pt-1 md:pt-2 pb-1">
          {/* Title */}
          <h3 className="text-[1.35rem] font-semibold text-surface-50 leading-tight mb-3 line-clamp-2">
            {title}
          </h3>

          {/* Features */}
          <div className="flex items-center gap-3 text-surface-400 mb-5 text-sm">
            {features.map((feature, idx) => (
              <Fragment key={idx}>
                {idx > 0 && <div className="w-[1px] h-3.5 bg-surface-700"></div>}
                <div className="flex items-center gap-1.5">
                  <feature.icon size={16} strokeWidth={1.5} className="text-surface-400" />
                  <span>{feature.value}</span>
                </div>
              </Fragment>
            ))}
          </div>

          <div className="mt-auto">
            {/* Main Price */}
            <div className="text-[1.65rem] font-bold text-surface-50 mb-1">
              {formatCurrency(imovel.precoVenda)}
            </div>

            {/* Additional Costs */}
            {(imovel.valorIptu || imovel.valorCondominio) && (
              <div className="text-[0.85rem] text-surface-400 mb-4 font-medium flex items-center gap-2">
                {imovel.valorIptu ? <span>IPTU {formatCurrency(imovel.valorIptu)}</span> : null}
                {imovel.valorIptu && imovel.valorCondominio && <span className="text-surface-600">|</span>}
                {imovel.valorCondominio ? <span>Condomínio {formatCurrency(imovel.valorCondominio)}</span> : null}
              </div>
            )}

            {/* Location and Date */}
            <div className="flex items-center justify-between text-xs text-surface-400 pt-4 mt-2 border-t border-surface-700/50">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-surface-500" />
                <span className="truncate max-w-[200px]">{localizacao}</span>
              </div>
              <div className="whitespace-nowrap font-medium text-surface-500">
                {formatDate(imovel.atualizadoEm || imovel.criadoEm)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}

export default function ProprietarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [proprietario, setProprietario] = useState<ProprietarioDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/proprietarios/${id}`)
      .then((r) => {
        if (!r.ok) { router.push("/proprietarios"); return null; }
        return r.json();
      })
      .then((d) => { if (d) { setProprietario(d); setLoading(false); } })
      .catch(() => setLoading(false));
  }, [id]);

  async function archiveProprietario() {
    if (!confirm("Deseja excluir/arquivar este proprietário? Os imóveis vinculados não serão excluídos.")) return;
    await fetch(`/api/proprietarios/${id}`, { method: "DELETE" });
    router.push("/proprietarios");
  }

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: "300px", borderRadius: "12px" }} />
      </div>
    );
  }

  if (!proprietario) return null;

  return (
    <div className="page">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/proprietarios" className="flex items-center gap-2 text-surface-400 hover:text-surface-100 transition-colors" style={{ textDecoration: "none" }}>
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Voltar para proprietários</span>
        </Link>
        <div className="flex gap-2">
          <Link href={`/proprietarios/${id}/editar`} className="btn btn-secondary btn-sm">
            <Edit2 size={14} />
            Editar
          </Link>
          <button className="btn btn-danger btn-sm" onClick={archiveProprietario}>
            <Archive size={14} />
            Excluir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Profile Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Profile Card */}
          <div className="bg-surface-800/40 border border-surface-700/50 rounded-2xl p-6 flex flex-col items-start text-left">
            <div className="w-16 h-16 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">
              {proprietario.nomeCompleto.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-xl font-bold text-surface-50 mb-2">{proprietario.nomeCompleto}</h1>
            <span className={`badge mb-4 ${STATUS_COLORS[proprietario.status] || "badge-secondary"}`}>
              {proprietario.status}
            </span>
            <p className="text-xs text-surface-400 font-medium">
              Cadastrado em {formatDate(proprietario.criadoEm)}
            </p>
          </div>

          {/* Contact Details */}
          <div className="bg-surface-800/40 border border-surface-700/50 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-surface-300 mb-5 flex items-center gap-2 uppercase tracking-wider">
              <User size={14} className="text-brand-400" />
              Contato e Documentos
            </h2>
            <div className="space-y-4">
              {proprietario.telefone && (
                <div>
                  <div className="text-[11px] font-medium uppercase text-surface-500 mb-1">Telefone</div>
                  <div className="flex items-center gap-2 text-sm text-surface-100 font-medium">
                    <Phone size={14} className="text-surface-400" />
                    {maskTelefone(proprietario.telefone)}
                  </div>
                </div>
              )}
              {proprietario.email && (
                <div>
                  <div className="text-[11px] font-medium uppercase text-surface-500 mb-1">E-mail</div>
                  <div className="flex items-center gap-2 text-sm text-surface-100 font-medium">
                    <Mail size={14} className="text-surface-400" />
                    {proprietario.email}
                  </div>
                </div>
              )}
              {proprietario.documento && (
                <div>
                  <div className="text-[11px] font-medium uppercase text-surface-500 mb-1">CPF / CNPJ</div>
                  <div className="flex items-center gap-2 text-sm text-surface-100 font-medium">
                    <FileText size={14} className="text-surface-400" />
                    {proprietario.tipoPessoa === "PESSOA_FISICA" ? maskCPF(proprietario.documento) : proprietario.documento}
                  </div>
                </div>
              )}
              {(!proprietario.telefone && !proprietario.email && !proprietario.documento) && (
                <span className="text-sm text-surface-500">Nenhum dado cadastrado.</span>
              )}
            </div>
          </div>

          {/* Address Details */}
          {(proprietario.endereco || proprietario.cidade || proprietario.cep) && (
            <div className="bg-surface-800/40 border border-surface-700/50 rounded-2xl p-6">
              <h2 className="text-xs font-bold text-surface-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <MapPin size={14} className="text-brand-400" />
                Endereço
              </h2>
              <div className="text-sm text-surface-200 leading-relaxed space-y-1">
                {proprietario.endereco && <div>{proprietario.endereco}{proprietario.numero ? `, ${proprietario.numero}` : ""}</div>}
                {proprietario.bairro && <div>Bairro: {proprietario.bairro}</div>}
                {(proprietario.cidade || proprietario.estado) && <div>{proprietario.cidade}{proprietario.estado ? ` - ${proprietario.estado}` : ""}</div>}
                {proprietario.cep && <div>CEP: {proprietario.cep}</div>}
              </div>
            </div>
          )}

          {/* Observations */}
          {proprietario.observacoes && (
            <div className="bg-surface-800/40 border border-surface-700/50 rounded-2xl p-6">
              <h2 className="text-xs font-bold text-surface-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} className="text-brand-400" />
                Observações
              </h2>
              <p className="text-sm text-surface-200 leading-relaxed whitespace-pre-line">
                {proprietario.observacoes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Linked Properties */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-surface-50 flex items-center gap-2">
                <Home size={20} className="text-brand-400" />
                Imóveis Cadastrados
                <span className="bg-surface-800 border border-surface-700 text-surface-200 text-xs py-0.5 px-2.5 rounded-full ml-2 font-medium">
                  {proprietario.imoveis.length}
                </span>
              </h2>
            </div>
            <Link href="/imoveis/novo" className="btn btn-primary btn-sm shadow-brand-500/20">
              <Plus size={14} />
              Cadastrar Imóvel
            </Link>
          </div>

          {proprietario.imoveis.length === 0 ? (
            <div className="border border-dashed border-surface-700 rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-surface-800/20">
              <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mb-4">
                <Building2 size={32} className="text-surface-500" />
              </div>
              <h3 className="text-lg text-surface-50 font-semibold mb-2">Nenhum imóvel vinculado</h3>
              <p className="text-surface-400 text-sm max-w-sm mb-6">
                Este proprietário ainda não possui imóveis associados. Adicione o primeiro imóvel para vê-lo listado aqui.
              </p>
              <Link href="/imoveis/novo" className="btn btn-secondary">
                <Plus size={16} />
                Cadastrar Imóvel
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {proprietario.imoveis.map((imovel) => (
                <ImovelCardHorizontal key={imovel.id} imovel={imovel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
