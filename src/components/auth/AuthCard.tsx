import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-3xl font-bold mb-2 text-[var(--color-surface-50)] tracking-tight">
          {title}
        </h2>
        <p className="text-[var(--color-surface-400)] text-sm md:text-base">
          {subtitle}
        </p>
      </div>

      <div className="bg-[var(--color-surface-950)] lg:bg-[var(--color-surface-900)] lg:border border-[var(--color-surface-800)] lg:rounded-2xl lg:p-8 lg:shadow-xl lg:shadow-black/10">
        {children}
      </div>

      {footer && (
        <div className="mt-8 text-center">
          {footer}
        </div>
      )}
    </div>
  );
}
