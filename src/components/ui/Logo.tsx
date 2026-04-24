import { Building2 } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizeMap = {
    sm: { container: "w-8 h-8 rounded-lg", icon: 16, text: "text-lg" },
    md: { container: "w-10 h-10 rounded-xl", icon: 22, text: "text-xl" },
    lg: { container: "w-14 h-14 rounded-2xl", icon: 28, text: "text-2xl" },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${current.container} flex items-center justify-center`}
        style={{
          background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))",
          boxShadow: "0 4px 16px rgba(79, 70, 229, 0.25)",
        }}
      >
        <Building2 size={current.icon} color="white" />
      </div>
      <span className={`${current.text} font-bold tracking-tight text-[var(--color-surface-50)]`}>
        Prime Realty
      </span>
    </div>
  );
}
