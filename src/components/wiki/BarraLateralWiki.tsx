"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type ItemMenu = {
  titulo: string;
  href?: string;
  ativo?: boolean;
};

type SecaoMenuProps = {
  titulo: string;
  itens: ItemMenu[];
  abertoPadrao?: boolean;
};

function SecaoMenu({ titulo, itens, abertoPadrao = false }: SecaoMenuProps) {
  const [aberto, setAberto] = useState(abertoPadrao);

  return (
    <div className="mb-2">
      <button
        onClick={() => setAberto(!aberto)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
      >
        {titulo}
        {aberto ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      
      {aberto && (
        <div className="mt-1 flex flex-col space-y-1 border-l border-border ml-3 pl-3">
          {itens.map((item, index) => (
            <Link
              key={index}
              href={item.href || "#"}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                item.ativo
                  ? "text-primary font-medium bg-primary/10 border-l-2 border-primary -ml-[13px] pl-[13px]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {item.titulo}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function BarraLateralWiki() {
  return (
    <aside className="w-72 h-full border-r border-border bg-card/30 flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <div className="bg-primary text-primary-foreground p-1 rounded">
            <LayoutTemplate className="h-5 w-5" />
          </div>
          Central de Ajuda
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <SecaoMenu
          titulo="Central de Ajuda"
          abertoPadrao={true}
          itens={[
            { titulo: "Visão geral" },
            { titulo: "Dúvidas Frequentes" },
            { titulo: "Glossário do Sistema" },
            { titulo: "Guia Prático de Suporte" },
            { titulo: "Notas de versão" },
            { titulo: "Projetos" },
          ]}
        />

        <SecaoMenu
          titulo="Artigos"
          abertoPadrao={true}
          itens={[
            { titulo: "Conceitos" },
            { titulo: "Dashboards" },
            { titulo: "Dicas de usabilidade" },
            { titulo: "Guias de Erros" },
            { titulo: "IXC Assina" },
            { titulo: "IXC Franquia" },
            { titulo: "Menu Configurações" },
            { titulo: "Menu Ferramentas" },
            { titulo: "Menu Relatórios" },
            { titulo: "Menu Sistema" },
            { titulo: "Segurança" },
            { titulo: "Tutoriais" },
          ]}
        />
        
         <SecaoMenu
          titulo="Clientes Beta"
          abertoPadrao={true}
          itens={[
            { titulo: "Clientes Beta IXC Soft", ativo: true, href: "/wiki" },
          ]}
        />
      </div>
    </aside>
  );
}
