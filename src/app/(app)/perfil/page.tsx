"use cliente";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2, Usuario, Mail, Phone } from "lucide-react";

export default function PerfilPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="page" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>Perfil</h1>
        <p style={{ color: "var(--color-surface-400)", fontSize: "0.9rem" }}>
          Suas informações de consultor
        </p>
      </div>

      {/* Avatar */}
      <div className="card mb-5">
        <div className="flex items-center gap-4">
          <div
            className="avatar"
            style={{ width: "72px", height: "72px", fontSize: "1.5rem" }}
          >
            {session?.usuario?.nome?.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "U"}
          </div>
          <div>
            <div className="font-bold text-lg" style={{ color: "var(--color-surface-50)" }}>
              {session?.usuario?.nome}
            </div>
            <div style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>
              {session?.usuario?.email}
            </div>
            <div className="badge badge-success mt-1" style={{ fontSize: "0.75rem" }}>Consultor Ativo</div>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="card">
        <h2 className="section-titulo mb-4">Informações da Conta</h2>

        <div className="form-group">
          <label className="label">Nome</label>
          <div className="search-bar">
            <Usuario size={16} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: "2.5rem" }}
              defaultValue={session?.usuario?.nome || ""}
              readOnly
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">E-mail</label>
          <div className="search-bar">
            <Mail size={16} />
            <input
              type="email"
              className="input"
              style={{ paddingLeft: "2.5rem" }}
              defaultValue={session?.usuario?.email || ""}
              readOnly
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">ID da Conta</label>
          <input
            type="text"
            className="input"
            value={session?.usuario?.id || ""}
            readOnly
            style={{ opacity: 0.6 }}
          />
        </div>

        <hr className="divider" />

        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            background: "rgba(100,112,243,0.08)",
            border: "1px solid rgba(100,112,243,0.2)",
            fontSize: "0.875rem",
            color: "var(--color-surface-300)",
          }}
        >
          <strong style={{ color: "var(--color-brand-300)" }}>Prime Realty CRM</strong>
          <p style={{ marginTop: "4px" }}>
            Sistema de gestão consultiva para consultores imobiliários individuais.
            Seus dados são privados e acessíveis apenas por você.
          </p>
        </div>
      </div>
    </div>
  );
}
