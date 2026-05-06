"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, Check, Share2, Home, Moon, Sun, ChevronDown, MoveRight } from "lucide-react";
import { formatCurrency, propertyTypeLabel } from "@/lib/utils";

interface FotoPublica {
  url: string;
}

interface ImovelPublico {
  id: string;
  titulo: string;
  descricao: string | null;
  tipoImovel: string;
  finalidade: string;
  precoVenda: number | null;
  valorAluguel: number | null;
  valorCondominio: number | null;
  valorIptu: number | null;
  cidade: string;
  bairro: string | null;
  estado: string | null;
  endereco: string | null;
  numero: string | null;
  areaTotal: number | null;
  quartos: number | null;
  suites: number | null;
  vagasGaragem: number | null;
  mobiliado: boolean;
  aceitaFinanciamento: boolean;
  aceitaPermuta: boolean;
  piscina: boolean;
  churrasqueira: boolean;
  varandaGourmet: boolean;
  elevador: boolean;
  portaria24h: boolean;
  academia: boolean;
  destaques: string | null;
  fotos: FotoPublica[];
}

interface CorretorPublico {
  nome: string;
  telefone: string | null;
  email: string | null;
  avatarUrl: string | null;
}

export default function PublicImovelClient({ imovel, corretor }: { imovel: ImovelPublico, corretor: CorretorPublico }) {
  const [viewerIndex, setViewerIndex] = useState<number>(0);
  const [scrollY, setScrollY] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const mensagem = `Olá ${corretor.nome?.split(" ")[0]}, solicito atendimento exclusivo referente ao imóvel "${imovel.titulo}".`;

  const scrolled = scrollY > 50;

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(currentTheme as "dark" | "light");

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    }
  };

  const hasPhotos = imovel.fotos && imovel.fotos.length > 0;

  const handlePrevImage = () => {
    if (!hasPhotos) return;
    setViewerIndex((prev) => (prev === 0 ? imovel.fotos.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!hasPhotos) return;
    setViewerIndex((prev) => (prev === imovel.fotos.length - 1 ? 0 : prev + 1));
  };

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

  const formatWhatsApp = (phone: string) => {
    const limpo = phone.replace(/\D/g, '');
    return `55${limpo}`;
  };

  const handleWhatsApp = () => {
    if (!corretor.telefone) {
      alert("Consultor não possui telefone cadastrado.");
      return;
    }
    const url = `https://wa.me/${formatWhatsApp(corretor.telefone)}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const [linkCopiado, setLinkCopiado] = useState(false);
  const handleShare = async () => {
    const publicUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: imovel.titulo,
          url: publicUrl,
        });
      } else {
        await navigator.clipboard.writeText(publicUrl);
        setLinkCopiado(true);
        setTimeout(() => setLinkCopiado(false), 2000);
      }
    } catch (err) {
      console.error("Erro ao compartilhar", err);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 font-sans text-surface-50 selection:bg-brand-500/30 overflow-x-hidden">

      {/* Ultra Premium Floating Header */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${scrolled ? "bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/30 py-4 shadow-2xl" : "bg-gradient-to-b from-black/80 to-transparent py-8"}`}>
        <div className="w-full px-8 md:px-16 lg:px-24 flex items-center justify-between">
          <div className={`text-sm font-light tracking-[0.3em] uppercase flex items-center gap-4 ${scrolled ? 'text-surface-50' : 'text-white'}`}>
            <div className="w-8 h-8 flex items-center justify-center">
              <Home size={18} className="text-brand-400" />
            </div>
            <span>Prime Realty</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full backdrop-blur-md transition-all duration-500 ${scrolled ? 'hover:bg-surface-800 text-surface-400 hover:text-surface-50' : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'}`}
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={handleShare} className={`flex items-center gap-3 transition-all duration-500 text-[10px] uppercase tracking-[0.2em] px-6 py-3 rounded-full border ${scrolled ? 'bg-surface-800/30 hover:bg-surface-800 border-surface-700/30 text-surface-300 hover:text-surface-50' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'}`}>
              {linkCopiado ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
              {linkCopiado ? <span className="text-green-400">Copiado</span> : "Compartilhar"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Parallax */}
      <section className="relative w-full h-screen bg-black flex flex-col justify-end overflow-hidden pb-32">
        {hasPhotos ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <img
              key={imovel.fotos[viewerIndex].url}
              src={imovel.fotos[viewerIndex].url}
              alt={imovel.titulo}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 opacity-80"
              style={{
                transform: `translateY(${scrollY * 0.4}px) scale(1.05)`,
                willChange: 'transform'
              }}
            />
            {/* Cinematic dark vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-surface-900" />
        )}

        {/* Hero Content (Bottom Left Layout) */}
        <div className="relative z-10 w-full px-8 md:px-16 lg:px-24 flex flex-col justify-end" style={{ transform: `translateY(${scrollY * -0.2}px)` }}>

          <div className="text-left max-w-4xl">
            <div className="inline-flex items-center gap-4 mb-6">
              <span className="text-[10px] text-brand-300 font-semibold uppercase tracking-[0.3em]">
                {propertyTypeLabel(imovel.tipoImovel)} · {imovel.finalidade === 'LOCACAO' ? 'Locação' : imovel.finalidade === 'VENDA' ? 'Venda' : 'Venda ou Locação'}
              </span>
              <div className="h-[1px] w-12 bg-brand-400/50" />
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
              {imovel.titulo}
            </h1>

            <div className="flex items-center gap-3 text-white/70 text-base md:text-lg font-light tracking-wide mb-12">
              <MapPin size={20} className="text-brand-400 shrink-0" />
              <span>
                {imovel.endereco ? `${imovel.endereco}${imovel.numero ? `, ${imovel.numero}` : ''} - ` : ''}
                {imovel.bairro ? `${imovel.bairro}, ` : ""}{imovel.cidade}{imovel.estado ? ` - ${imovel.estado}` : ""}
              </span>
            </div>

            <div>
              <div className="text-[10px] text-surface-300 font-semibold uppercase tracking-[0.3em] mb-3">Valor</div>
              
              {imovel.finalidade !== 'LOCACAO' && (
                <div className="text-4xl md:text-5xl lg:text-6xl font-light text-white/90 drop-shadow-xl tracking-wide">
                  {imovel.precoVenda ? formatCurrency(imovel.precoVenda) : 'Sob consulta'}
                </div>
              )}

              {imovel.finalidade === 'VENDA_LOCACAO' && (
                <div className="flex items-center gap-4 my-4 opacity-70">
                  <div className="h-px w-8 bg-surface-500/50" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-surface-300">Ou Aluguel</span>
                  <div className="h-px w-8 bg-surface-500/50" />
                </div>
              )}

              {imovel.finalidade !== 'VENDA' && (
                <div className="text-4xl md:text-5xl lg:text-6xl font-light text-white/90 drop-shadow-xl tracking-wide">
                  {imovel.valorAluguel ? formatCurrency(imovel.valorAluguel) : 'Sob consulta'}
                  {imovel.valorAluguel && <span className="text-2xl text-white/60 ml-3 font-light">/mês</span>}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Gallery Controls within Hero */}
        {hasPhotos && imovel.fotos.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 md:px-12 z-20 pointer-events-none">
            <button onClick={handlePrevImage} className="pointer-events-auto p-5 backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full transition-all group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform opacity-70 group-hover:opacity-100" />
            </button>
            <button onClick={handleNextImage} className="pointer-events-auto p-5 backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full transition-all group">
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform opacity-70 group-hover:opacity-100" />
            </button>
          </div>
        )}

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-bounce text-white/50">
          <span className="text-[9px] uppercase tracking-[0.3em] font-medium mb-3 opacity-70">Descubra</span>
          <ChevronDown size={18} className="opacity-70" />
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <main className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 xl:grid-cols-12 gap-20 relative z-20 bg-surface-950">

        {/* Left Column */}
        <div className="xl:col-span-7 space-y-32">

          {/* Extremely Elegant Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-surface-800/30">
            {imovel.areaTotal != null && (
              <div className="text-center group">
                <span className="block text-4xl md:text-5xl font-light text-surface-50 mb-3">{imovel.areaTotal}</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-surface-400 group-hover:text-brand-400 transition-colors">M² Total</span>
              </div>
            )}
            {imovel.quartos != null && (
              <div className="text-center border-l border-surface-800/30 group">
                <span className="block text-4xl md:text-5xl font-light text-surface-50 mb-3">{imovel.quartos}</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-surface-400 group-hover:text-brand-400 transition-colors">Quartos</span>
              </div>
            )}
            {imovel.suites != null && (
              <div className="text-center border-l border-surface-800/30 group">
                <span className="block text-4xl md:text-5xl font-light text-surface-50 mb-3">{imovel.suites}</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-surface-400 group-hover:text-brand-400 transition-colors">Suítes</span>
              </div>
            )}
            {imovel.vagasGaragem != null && (
              <div className="text-center border-l border-surface-800/30 group">
                <span className="block text-4xl md:text-5xl font-light text-surface-50 mb-3">{imovel.vagasGaragem}</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-surface-400 group-hover:text-brand-400 transition-colors">Vagas</span>
              </div>
            )}
          </div>

          {/* About */}
          {imovel.descricao && (
            <div className="relative max-w-4xl">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400 mb-8 flex items-center gap-4">
                <div className="w-12 h-px bg-brand-400/50" />
                A Experiência
              </h2>
              <div className="text-surface-200 text-xl md:text-2xl font-light leading-loose whitespace-pre-wrap">
                {imovel.descricao}
              </div>
            </div>
          )}

          {/* Amenities */}
          {(attributes.length > 0 || imovel.destaques) && (
            <div className="relative">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400 mb-12 flex items-center gap-4">
                <div className="w-12 h-px bg-brand-400/50" />
                Exclusividades
              </h2>
              {attributes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-16 mb-16">
                  {attributes.map(attr => (
                    <div key={attr} className="flex items-center gap-6 group">
                      <div className="w-px h-8 bg-brand-500/30 group-hover:bg-brand-400 transition-colors" />
                      <span className="font-light tracking-wide text-lg text-surface-100">{attr}</span>
                    </div>
                  ))}
                </div>
              )}
              {imovel.destaques && (
                <div className="p-12 border-l border-surface-800/50 relative group">
                  <div className="absolute top-0 -left-[1px] w-px h-0 bg-brand-400 transition-all duration-1000 group-hover:h-full" />
                  <p className="text-surface-300 font-light leading-relaxed whitespace-pre-wrap text-xl italic">
                    &quot;{imovel.destaques}&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (Private Broker Card) */}
        <div className="xl:col-span-5 relative">
          <div className="sticky top-32">

            <div className="bg-surface-900/40 backdrop-blur-3xl rounded-none px-8 py-10 relative border border-surface-800/50">

              <div className="relative z-10">
                <div className="text-center mb-14 px-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-surface-400 mb-6">Valor</div>
                  {imovel.finalidade !== 'LOCACAO' && (
                    <div className="text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-light text-surface-50 tracking-tight whitespace-nowrap">
                      {imovel.precoVenda ? formatCurrency(imovel.precoVenda) : 'Sob consulta'}
                    </div>
                  )}
                  {imovel.finalidade === 'VENDA_LOCACAO' && (
                    <>
                      <div className="flex items-center justify-center gap-4 my-8 opacity-70">
                        <div className="h-px w-8 bg-surface-800/80" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-surface-400">Ou</span>
                        <div className="h-px w-8 bg-surface-800/80" />
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-surface-400 mb-4">Aluguel</div>
                    </>
                  )}
                  {imovel.finalidade !== 'VENDA' && (
                    <div className="text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-light text-surface-50 tracking-tight whitespace-nowrap">
                      {imovel.valorAluguel ? formatCurrency(imovel.valorAluguel) : 'Sob consulta'}
                      {imovel.valorAluguel && <span className="text-sm md:text-base font-normal text-surface-400 ml-2 uppercase tracking-widest inline-block">/mês</span>}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center py-8 border-y border-surface-800/50 mb-12">
                  <div className="text-center w-1/2 border-r border-surface-800/50">
                    <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-surface-400 mb-3">Condomínio</div>
                    <div className="font-light text-surface-50 text-xl">{imovel.valorCondominio ? formatCurrency(imovel.valorCondominio) : '--'}</div>
                  </div>
                  <div className="text-center w-1/2">
                    <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-surface-400 mb-3">IPTU Anual</div>
                    <div className="font-light text-surface-50 text-xl">{imovel.valorIptu ? formatCurrency(imovel.valorIptu) : '--'}</div>
                  </div>
                </div>

                {/* Broker Profile */}
                <div className="flex flex-col items-center mb-12">
                  {corretor.avatarUrl ? (
                    <img src={corretor.avatarUrl} alt={corretor.nome} className="w-28 h-28 rounded-full mb-6 object-cover bg-surface-800 filter grayscale hover:grayscale-0 transition-all duration-700" />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-surface-800 flex items-center justify-center text-surface-300 font-light text-4xl mb-6">
                      {corretor.nome.charAt(0)}
                    </div>
                  )}
                  <div className="text-[9px] text-brand-400 font-semibold uppercase tracking-[0.3em] mb-3">Private Broker</div>
                  <h3 className="text-3xl font-light text-surface-50">{corretor.nome}</h3>
                </div>

                <div className="space-y-6">


                  <button
                    onClick={handleWhatsApp}
                    className="w-full py-6 px-8 bg-surface-50 hover:bg-surface-200 text-surface-950 transition-all duration-500 flex items-center justify-center gap-4 group"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">Agendar Reunião</span>
                    <MoveRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </button>

                  {corretor.email && (
                    <button
                      onClick={() => window.location.href = `mailto:${corretor.email}?subject=Consultoria Imóvel: ${imovel.titulo}`}
                      className="w-full py-6 px-8 bg-transparent text-surface-300 hover:text-surface-50 transition-all duration-500 flex items-center justify-center gap-4 group"
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.2em]">Contato via E-mail</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-surface-800/30 py-16 px-6 bg-surface-950 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 flex items-center justify-center border border-surface-800 rounded-full mb-6">
          <Home size={16} className="text-surface-500" />
        </div>
        <div className="text-surface-300 text-[10px] uppercase tracking-[0.4em] font-light mb-2">Prime Realty</div>
        <span className="text-surface-600 font-light text-xs tracking-widest">© {new Date().getFullYear()} — Atendimento de Excelência</span>
      </footer>

    </div>
  );
}
