"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
    if (current) {
      setTheme(current);
    } else {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      if (stored) setTheme(stored);
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  }

  if (!mounted) {
    return (
      <div className={cn("w-10 h-10 rounded-full bg-[var(--color-surface-800)] opacity-50 animate-pulse", className)} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-all outline-none",
        "bg-[var(--color-surface-800)] hover:bg-[var(--color-surface-700)] text-[var(--color-surface-300)] hover:text-[var(--color-surface-100)]",
        "border border-[var(--color-surface-700)] hover:border-[var(--color-surface-600)]",
        "focus-visible:ring-2 focus-visible:ring-indigo-500",
        className
      )}
      title="Alternar tema"
      aria-label="Alternar tema"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
