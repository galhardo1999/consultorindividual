"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

const ConteudoAplicacao = ({ children }: { children: React.ReactNode }) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuRecolhido, setMenuRecolhido] = useState(false);
  const { data: sessao } = useSession();
  const caminho = usePathname();
  const ehRotaMapa = caminho === "/mapa";

  // Função para lidar com o botão do Header (Hamburger)
  const alternarMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMenuAberto(true);
      return;
    }

    setMenuRecolhido((valorAtual) => !valorAtual);
  };

  const fecharMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMenuAberto(false);
      return;
    }

    setMenuRecolhido(true);
  };

  return (
    <div className="flex overflow-x-hidden">
      <Sidebar
        isOpen={menuAberto}
        isCollapsed={menuRecolhido}
        onClose={fecharMenu}
      />
      <div className={`main-content min-w-0 flex-1 ${menuRecolhido ? "collapsed" : ""}`}>
        {!ehRotaMapa && (
          <Header
            onMenuToggle={alternarMenu}
            usuario={sessao?.user}
          />
        )}
        <main className={ehRotaMapa ? "h-screen" : "h-auto"}>{children}</main>
      </div>
    </div>
  );
};

export const ShellAplicacao = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ConteudoAplicacao>{children}</ConteudoAplicacao>
    </SessionProvider>
  );
};
