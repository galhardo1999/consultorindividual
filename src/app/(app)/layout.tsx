"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SessionProvider, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const isMapRoute = pathname === "/mapa";

  // Função para lidar com o botão do Header (Hamburger)
  const handleMenuToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(true);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div style={{ display: "flex", overflowX: "hidden" }}>
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => {
          if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setSidebarOpen(false);
          } else {
            setSidebarCollapsed(true);
          }
        }}
      />
      <div className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`} style={{ flex: 1, minWidth: 0 }}>
        {!isMapRoute && (
          <Header
            usuario={session?.user}
          />
        )}
        <main style={{ height: isMapRoute ? "100vh" : "auto" }}>{children}</main>
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AppLayout>{children}</AppLayout>
    </SessionProvider>
  );
}
