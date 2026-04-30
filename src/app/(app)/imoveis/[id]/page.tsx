"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Archive, Bed, Bath, Car, Maximize, Users, MapPin, Check, Building, Tag, Home } from "lucide-react";
import {
  formatCurrency, formatDate, propertyTypeLabel, propertyStatusLabel
} from "@/lib/utils";

interface PropertyDetail {
  id: string;
  titulo: string;
  tipoImovel: string;
  finalidade: string;
  precoVenda: number;
  valorAluguel: number | null;
  valorCondominio: number | null;
  valorIptu: number | null;
  cidade: string;
  bairro: string | null;
  endereco: string | null;
  numero: string | null;
  quartos: number | null;
  suites: number | null;
  banheiros: number | null;
  vagasGaragem: number | null;
  areaUtil: number | null;
  areaTotal: number | null;
  mobiliado: boolean;
  aceitaFinanciamento: boolean;
  aceitaPermuta: boolean;
  piscina: boolean;
  churrasqueira: boolean;
  varandaGourmet: boolean;
  elevador: boolean;
  portaria24h: boolean;
  academia: boolean;
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
  fotos?: { id: string; url: string; isCapa: boolean }[];
}

const STATUS_COLORS: Record<string, string> = {
  DISPONIVEL: "bg-green-500/10 text-green-500 border-green-500/20",
  RESERVADO: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  VENDIDO: "bg-red-500/10 text-red-500 border-red-500/20",
  LOCADO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  INDISPONIVEL: "bg-gray-500/10 text-gray-400 border-gray-500/20",
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
      <div className="page animate-pulse">
        <div className="h-8 w-32 bg-surface-800 rounded mb-6" />
        <div className="h-[400px] w-full bg-surface-800 rounded-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-12 w-3/4 bg-surface-800 rounded" />
            <div className="h-24 w-full bg-surface-800 rounded" />
          </div>
          <div className="h-64 w-full bg-surface-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!imovel) return null;

  const features = [
    imovel.areaUtil != null && { icon: Maximize, label: `${imovel.areaUtil} m² Útil` },
    imovel.areaTotal != null && { icon: Maximize, label: `${imovel.areaTotal} m² Total` },
    imovel.quartos != null && { icon: Bed, label: `${imovel.quartos} Quartos` },
    imovel.suites != null && { icon: Bed, label: `${imovel.suites} Suítes` },
    imovel.banheiros != null && { icon: Bath, label: `${imovel.banheiros} Banheiros` },
    imovel.vagasGaragem != null && { icon: Car, label: `${imovel.vagasGaragem} Vagas` },
  ].filter(Boolean) as { icon: React.ElementType; label: string }[];

  const attributes = [
    imovel.mobiliado && "Mobiliado",
    imovel.aceitaFinanciamento && "Aceita Financiamento",
    imovel.aceitaPermuta && "Aceita Permuta",
    imovel.piscina && "Piscina",
    imovel.churrasqueira && "Churrasqueira",
    imovel.varandaGourmet && "Varanda Gourmet",
    imovel.elevador && "Elevador",
    imovel.portaria24h && "Portaria 24h",
    imovel.academia && "Academia",
  ].filter(Boolean) as string[];

  const hasPhotos = imovel.fotos && imovel.fotos.length > 0;

  return (
    <div className="page">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/imoveis" className="inline-flex items-center gap-2 text-surface-400 hover:text-surface-50 transition-colors font-medium">
          <ArrowLeft size={18} />
          Voltar para Imóveis
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={archiveProperty} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors">
            <Archive size={16} />
            Arquivar
          </button>
          <Link href={`/imoveis/${id}/editar`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">
            <Edit2 size={16} />
            Editar Imóvel
          </Link>
        </div>
      </div>

      {/* Hero Title (Mobile Only - visible before gallery) */}
      <div className="lg:hidden mb-4">
        <h1 className="text-2xl font-bold text-surface-50 mb-2">{imovel.titulo}</h1>
        <div className="flex items-center gap-2 text-surface-400 text-sm">
          <MapPin size={16} className="text-brand-400" />
          {imovel.bairro ? `${imovel.bairro}, ` : ""}{imovel.cidade}
        </div>
      </div>

      {/* Premium Photo Gallery (Airbnb Style) */}
      <div className="mb-8 rounded-2xl overflow-hidden bg-surface-900 border border-surface-800 shadow-sm relative">
        {hasPhotos ? (
          <div className={`grid gap-2 ${imovel.fotos!.length > 1 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} h-[300px] sm:h-[400px] lg:h-[500px]`}>
            {/* Main Photo */}
            <div className={`relative w-full h-full ${imovel.fotos!.length > 1 ? 'md:col-span-2 lg:col-span-2' : ''} group cursor-pointer`}>
              <img src={imovel.fotos![0].url} alt={imovel.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
            </div>
            
            {/* Additional Photos */}
            {imovel.fotos!.length > 1 && (
              <div className="hidden md:grid grid-rows-2 gap-2 col-span-1 lg:col-span-1">
                {imovel.fotos!.slice(1, 3).map((foto, idx) => (
                  <div key={foto.id} className="relative w-full h-full group cursor-pointer overflow-hidden">
                    <img src={foto.url} alt="Foto" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                ))}
              </div>
            )}
            
            {/* Rightmost column for 4+ photos */}
            {imovel.fotos!.length > 3 && (
              <div className="hidden lg:grid grid-rows-2 gap-2 col-span-1">
                <div className="relative w-full h-full group cursor-pointer overflow-hidden">
                  <img src={imovel.fotos![3].url} alt="Foto" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                {imovel.fotos!.length > 4 ? (
                  <div className="relative w-full h-full group cursor-pointer overflow-hidden">
                    <img src={imovel.fotos![4].url} alt="Foto" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                      <span className="text-white font-medium text-lg">+{imovel.fotos!.length - 5} fotos</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-surface-800" />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-[300px] md:h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-surface-800 to-surface-900">
            <Home size={64} className="text-surface-700 mb-4" />
            <p className="text-surface-400 font-medium">Nenhuma foto cadastrada</p>
          </div>
        )}
        
        {/* Status Badges Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg ${STATUS_COLORS[imovel.status]}`}>
            {propertyStatusLabel(imovel.status)}
          </span>
          {imovel.codigoInterno && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface-900/80 text-surface-200 border border-surface-700 backdrop-blur-md shadow-lg">
              #{imovel.codigoInterno}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (70%) - Property Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Info */}
          <div className="hidden lg:block border-b border-surface-800 pb-6">
            <div className="flex items-center gap-2 text-brand-400 text-sm font-semibold tracking-wider uppercase mb-2">
              <Building size={16} />
              {propertyTypeLabel(imovel.tipoImovel)} para {imovel.finalidade === 'LOCACAO' ? 'Locação' : imovel.finalidade === 'VENDA_LOCACAO' ? 'Venda ou Locação' : 'Venda'}
            </div>
            <h1 className="text-4xl font-extrabold text-surface-50 mb-3 tracking-tight">{imovel.titulo}</h1>
            <div className="flex items-center gap-2 text-surface-400 text-lg">
              <MapPin size={20} className="text-brand-400" />
              {imovel.bairro ? `${imovel.bairro}, ` : ""}{imovel.cidade}
              {imovel.endereco && <span className="text-surface-500 text-base ml-1">· {imovel.endereco} {imovel.numero}</span>}
            </div>
          </div>

          {/* Quick Features Row */}
          {features.length > 0 && (
            <div className="flex flex-wrap gap-4 py-2 border-b border-surface-800 lg:border-none lg:pb-0">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-surface-900 border border-surface-800 px-5 py-3 rounded-xl shadow-sm">
                  <f.icon size={22} className="text-brand-400" />
                  <span className="text-surface-100 font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description Section */}
          {imovel.descricao && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-surface-50">Sobre este imóvel</h2>
              <p className="text-surface-300 leading-relaxed text-lg whitespace-pre-wrap">
                {imovel.descricao}
              </p>
            </div>
          )}

          {/* Highlights & Attributes */}
          {(imovel.destaques || attributes.length > 0) && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-surface-50">Destaques e Comodidades</h2>
              
              {attributes.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {attributes.map(attr => (
                    <div key={attr} className="flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-400 rounded-full border border-brand-500/20 text-sm font-medium">
                      <Check size={14} />
                      {attr}
                    </div>
                  ))}
                </div>
              )}

              {imovel.destaques && (
                <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
                  <p className="text-surface-300 leading-relaxed whitespace-pre-wrap">
                    {imovel.destaques}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (30%) - Sticky Actions & Owner */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            
            {/* Price Card */}
            <div className="bg-surface-900 border border-surface-800 rounded-3xl p-6 shadow-xl">
              <div className="mb-6 pb-6 border-b border-surface-800">
                {imovel.finalidade === 'VENDA' && (
                  <>
                    <span className="text-surface-400 font-medium text-sm block mb-1">Preço de Venda</span>
                    <div className="text-4xl font-extrabold text-surface-50 tracking-tight">
                      {formatCurrency(imovel.precoVenda)}
                    </div>
                  </>
                )}
                {imovel.finalidade === 'LOCACAO' && (
                  <>
                    <span className="text-surface-400 font-medium text-sm block mb-1">Preço de Locação</span>
                    <div className="text-4xl font-extrabold text-surface-50 tracking-tight">
                      {formatCurrency(imovel.valorAluguel || 0)}<span className="text-lg font-normal text-surface-400 ml-1">/mês</span>
                    </div>
                  </>
                )}
                {imovel.finalidade === 'VENDA_LOCACAO' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-surface-400 font-medium text-sm block mb-1">Preço de Venda</span>
                      <div className="text-3xl font-extrabold text-surface-50 tracking-tight">
                        {formatCurrency(imovel.precoVenda)}
                      </div>
                    </div>
                    <div>
                      <span className="text-surface-400 font-medium text-sm block mb-1">Preço de Locação</span>
                      <div className="text-3xl font-extrabold text-surface-50 tracking-tight">
                        {formatCurrency(imovel.valorAluguel || 0)}<span className="text-lg font-normal text-surface-400 ml-1">/mês</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 space-y-2">
                  {imovel.valorCondominio && (
                    <div className="flex justify-between items-center text-surface-300 text-sm">
                      <span>Condomínio</span>
                      <span className="font-semibold text-surface-100">{formatCurrency(imovel.valorCondominio)}</span>
                    </div>
                  )}
                  {imovel.valorIptu && (
                    <div className="flex justify-between items-center text-surface-300 text-sm">
                      <span>IPTU (anual)</span>
                      <span className="font-semibold text-surface-100">{formatCurrency(imovel.valorIptu)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Info */}
              {imovel.proprietario ? (
                <div className="mb-6">
                  <span className="text-surface-400 font-medium text-sm block mb-3">Proprietário</span>
                  <Link href={`/proprietarios/${imovel.proprietario.id}`} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-800/50 hover:bg-surface-800 transition-colors border border-surface-700/50">
                    <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-lg border border-brand-500/30">
                      {imovel.proprietario.nomeCompleto.charAt(0)}
                    </div>
                    <div>
                      <div className="text-surface-50 font-semibold">{imovel.proprietario.nomeCompleto}</div>
                      {imovel.proprietario.telefone && (
                        <div className="text-surface-400 text-sm">{imovel.proprietario.telefone}</div>
                      )}
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-2xl bg-surface-800/50 border border-surface-700/50 text-center">
                  <p className="text-surface-400 text-sm">Nenhum proprietário vinculado.</p>
                </div>
              )}

              <Link href={`/imoveis/${id}/editar`} className="w-full py-3 px-4 rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20">
                <Edit2 size={18} />
                Editar Informações
              </Link>
            </div>

            {/* Interested Clients Card */}
            <div className="bg-surface-900 border border-surface-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-surface-50 flex items-center gap-2">
                  <Users size={18} className="text-brand-400" />
                  Interessados
                </h3>
                <span className="bg-surface-800 text-surface-200 py-1 px-3 rounded-full text-sm font-bold">
                  {imovel.interesses.length}
                </span>
              </div>

              {imovel.interesses.length === 0 ? (
                <div className="text-center py-6 text-surface-400 text-sm">
                  Ainda não há clientes interessados neste imóvel.
                </div>
              ) : (
                <div className="space-y-3">
                  {imovel.interesses.slice(0, 5).map((interesse) => (
                    <Link key={interesse.id} href={`/clientes/${interesse.cliente.id}`} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors border border-surface-700/50">
                      <div>
                        <div className="font-semibold text-surface-100 text-sm">
                          {interesse.cliente.nomeCompleto}
                        </div>
                        <div className="text-xs text-surface-400">
                          {interesse.cliente.telefone}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {interesse.ehFavorito && <span title="Favorito">⭐</span>}
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-700 px-2 py-1 rounded text-surface-300">
                          {interesse.statusInteresse.replace('_', ' ')}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {imovel.interesses.length > 5 && (
                    <div className="text-center pt-2">
                      <span className="text-sm text-brand-400 font-medium">Ver todos os interessados</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
