import { BarraLateralWiki } from "@/components/wiki/BarraLateralWiki";
import { CabecalhoWiki } from "@/components/wiki/CabecalhoWiki";

export default function LayoutWiki({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <BarraLateralWiki />
      <div className="flex-1 flex flex-col h-full min-w-0">
        <CabecalhoWiki />
        <main className="flex-1 flex overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
