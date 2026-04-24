import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, rightElement, id, ...props }, ref) => {
    return (
      <div className="w-full mb-4">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-[var(--color-surface-300)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-[var(--color-surface-400)] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full h-12 bg-[var(--color-surface-900)] border border-[var(--color-surface-700)] rounded-lg text-[var(--color-surface-50)] text-sm transition-all outline-none",
              "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
              "placeholder:text-[var(--color-surface-500)]",
              error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "",
              icon ? "pl-11" : "pl-4",
              rightElement ? "pr-12" : "pr-4",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
