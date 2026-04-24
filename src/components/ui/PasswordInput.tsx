import { forwardRef, useState } from "react";
import { Input, type InputProps } from "./Input";
import { Eye, EyeOff, Lock } from "lucide-react";

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "icon" | "rightElement" | "type">>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        icon={<Lock size={18} />}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[var(--color-surface-400)] hover:text-[var(--color-surface-200)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-0.5"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
        {...props}
      />
    );
  }
);
PasswordInput.displayName = "PasswordInput";
