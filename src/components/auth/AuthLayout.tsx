import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { Building2, Users, Target, MapPin } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[var(--color-surface-950)] text-[var(--color-surface-50)] selection:bg-indigo-500/30">
      
      {/* Left Area - Institutional (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col w-full max-w-[500px] xl:max-w-[600px] relative overflow-hidden bg-[var(--color-surface-950)] border-r border-[var(--color-surface-800)] z-0">
        
        {/* Background decorations */}
        <div className="absolute top-[-10%] left-[-20%] w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(var(--color-surface-100) 1px, transparent 1px), linear-gradient(90deg, var(--color-surface-100) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        {/* Scrollable Content Wrapper */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full overflow-y-auto overflow-x-hidden p-10 xl:p-14">
          {/* Header */}
          <div className="flex items-center gap-4 shrink-0">
            <Logo size="lg" />
          </div>

          {/* Main Content */}
          <div className="mt-12 flex-1 flex flex-col justify-center">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6 tracking-tight">
              Gestão imobiliária inteligente para consultores de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                alto desempenho
              </span>
            </h1>
            <p className="text-[var(--color-surface-300)] text-lg mb-12 leading-relaxed max-w-md">
              Centralize clientes, imóveis e oportunidades em uma experiência consultiva premium e converta mais.
            </p>

            {/* Floating UI Elements (Abstract representation) */}
            <div className="relative h-[240px] w-full max-w-[400px] shrink-0">
              {/* Card 1: Client */}
              <div className="absolute top-0 left-0 bg-[var(--color-surface-900)] border border-[var(--color-surface-700)] rounded-xl p-4 shadow-xl shadow-black/20 w-64 transform -rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">João Silva</div>
                    <div className="text-xs text-[var(--color-surface-400)]">Buscando Alto Padrão</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--color-surface-300)]">
                  <Target size={14} className="text-indigo-400" /> 
                  <span>Match: 95% com Imóvel A</span>
                </div>
              </div>

              {/* Card 2: Property */}
              <div className="absolute top-20 right-0 bg-[var(--color-surface-900)] border border-[var(--color-surface-700)] rounded-xl p-4 shadow-xl shadow-black/20 w-64 transform rotate-3 hover:rotate-0 transition-transform z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Cobertura Jardins</div>
                    <div className="text-xs text-[var(--color-surface-400)]">R$ 4.500.000</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--color-surface-300)]">
                  <MapPin size={14} className="text-blue-400" /> 
                  <span>Visita agendada amanhã</span>
                </div>
              </div>

              {/* Connection line SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                <path 
                  d="M 120 70 C 180 70, 160 150, 220 150" 
                  fill="none" 
                  stroke="var(--color-surface-600)" 
                  strokeWidth="2" 
                  strokeDasharray="4 4" 
                />
                <circle cx="220" cy="150" r="4" fill="var(--color-surface-400)" />
                <circle cx="120" cy="70" r="4" fill="var(--color-surface-400)" />
              </svg>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-[var(--color-surface-800)] shrink-0">
            <div>
              <div className="text-2xl font-bold text-[var(--color-surface-50)] mb-1">3x</div>
              <div className="text-xs text-[var(--color-surface-400)] font-medium uppercase tracking-wider">Mais Vendas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--color-surface-50)] mb-1">Zero</div>
              <div className="text-xs text-[var(--color-surface-400)] font-medium uppercase tracking-wider">Planilhas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--color-surface-50)] mb-1">100%</div>
              <div className="text-xs text-[var(--color-surface-400)] font-medium uppercase tracking-wider">Foco no Cliente</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Area - Form Container */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 flex items-center justify-between border-b border-[var(--color-surface-800)] bg-[var(--color-surface-950)]/80 backdrop-blur-md sticky top-0 z-20">
          <Logo size="sm" />
          <ThemeToggle />
        </div>

        {/* Desktop Theme Toggle */}
        <div className="hidden lg:block absolute top-8 right-8 z-20">
          <ThemeToggle />
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          {children}
        </div>
      </div>
      
    </div>
  );
}
