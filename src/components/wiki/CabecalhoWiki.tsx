import { Search, Moon, CirclePlay, ChevronDown, Command } from "lucide-react";

export function CabecalhoWiki() {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center flex-1">
        <button className="flex items-center justify-between w-64 px-3 py-1.5 text-sm bg-muted/30 border border-border rounded-md text-muted-foreground hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Pesquisar</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-background border border-border px-1.5 py-0.5 rounded shadow-sm">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors font-medium">Documentação</a>
        <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1 font-medium">
          API
          <ChevronDown className="h-3 w-3 opacity-50" />
        </a>
        <button className="hover:text-foreground transition-colors flex items-center gap-1 font-medium">
          Centrais de Ajuda
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 border border-border hover:bg-accent text-foreground transition-colors">
            <Moon className="h-4 w-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <CirclePlay className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
