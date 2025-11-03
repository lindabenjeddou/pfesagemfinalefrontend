// src/views/admin/ValidationInterventions.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ============================== THEME (partagé) ============================== */
const THEME = {
  radius: 16,
  shadowSm: "0 6px 16px rgba(2, 6, 23, .06)",
  shadowMd: "0 16px 36px rgba(2, 6, 23, .14)",
  card: {
    background: "rgba(255,255,255,0.94)",
    backdrop: "saturate(140%) blur(10px)",
    border: "1px solid rgba(226,232,240,.9)",
  },
  primary: ["#0078d4", "#003061"],
  success: ["#10b981", "#059669"],
  warning: ["#f59e0b", "#d97706"],
  danger: ["#ef4444", "#dc2626"],
};

const pageStyles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)",
    padding: 24,
  },
  hero: {
    background: "linear-gradient(135deg, #003061, #0078d4)",
    borderRadius: 24,
    padding: 32,
    color: "white",
    textAlign: "center",
    boxShadow: THEME.shadowMd,
    margin: "0 auto 24px",
    maxWidth: 1200,
    position: "relative",
    overflow: "hidden",
  },
  heroShimmer: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent)",
    backgroundSize: "200% 100%",
    animation: "shimmer 3s ease-in-out infinite",
  },
  card: {
    background: THEME.card.background,
    backdropFilter: THEME.card.backdrop,
    border: THEME.card.border,
    borderRadius: 24,
    boxShadow: THEME.shadowMd,
    borderWidth: 1,
    overflow: "hidden",
  },
  section: { padding: "1.5rem" },
  h3: {
    fontSize: 20,
    fontWeight: 800,
    color: "#374151",
    margin: 0,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 14,
    background: "white",
    outline: "none",
    transition: "all .2s ease",
    boxShadow: THEME.shadowSm,
  },
  select: {
    padding: "12px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 14,
    background: "white",
    outline: "none",
    transition: "all .2s ease",
    boxShadow: THEME.shadowSm,
  },
  button: (disabled, tone = "blue") => {
    const tones = {
      blue: THEME.primary,
      green: THEME.success,
      gray: ["#e5e7eb", "#d1d5db"],
      red: THEME.danger,
    };
    const t = tones[tone] || tones.blue;
    return {
      padding: "10px 14px",
      background: disabled
        ? "linear-gradient(135deg, #9ca3af, #6b7280)"
        : `linear-gradient(135deg, ${t[0]}, ${t[1]})`,
      color: tone === "gray" ? "#0f172a" : "#fff",
      border: "none",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all .2s ease",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 8px 22px rgba(0, 48, 97, 0.22)",
    };
  },
};

// ---- Global animations ----
const GlobalAnimations = () => (
  <style>{`
    @keyframes shimmer { 0%{background-position:-200px 0} 100%{background-position:calc(200px + 100%) 0} }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
  `}</style>
);

/* ============================== Config API ============================== */
// Mets l’URL de ton backend (avec context-path /PI)
const BASE_URL = "http://localhost:8089/PI";

/** Évite les doublons de /PI dans l’URL finale */
function apiUrl(path = "") {
  const base = BASE_URL.replace(/\/+$/, "");
  let p = String(path || "").replace(/^\/+/, "");
  const ctx = base.split("/").filter(Boolean).pop(); // "PI"
  if (ctx && new RegExp(`^${ctx}/`, "i").test(p)) p = p.replace(new RegExp(`^${ctx}/`, "i"), "");
  return `${base}/${p}`;
}

/* ============================== fetch helper ============================ */
async function fetchJson(path, { method = "GET", body, headers = {} } = {}) {
  const url = apiUrl(path);
  const h = {
    Accept: "application/json",
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };
  const res = await fetch(url, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    const err = new Error(txt || res.statusText);
    err.status = res.status;
    err.url = url;
    throw err;
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/* ============================== Date utils ============================= */
const asDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  const d = Number.isFinite(n) ? new Date(n) : new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
};
const fmtDateTime = (v) => {
  const d = asDate(v);
  return d ? d.toLocaleString("fr-FR") : "—";
};

/* ====================== AdvancedPagination (pro) ======================== */
function AdvancedPagination({
  data = [],
  searchFields = [],
  searchPlaceholder = "Rechercher...",
  sortFields = [],
  filterFields = [],
  itemsPerPageOptions = [5, 10, 20, 50],
  defaultItemsPerPage = 10,
  renderItem,
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(sortFields?.[0]?.key || "");
  const [sortDir, setSortDir] = useState("desc");
  const [filters, setFilters] = useState({});
  const [perPage, setPerPage] = useState(defaultItemsPerPage);
  const [page, setPage] = useState(1);

  const onChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || "" }));
    setPage(1);
  };

  const filtered = useMemo(() => {
    let rows = [...data];

    // Recherche
    if (query.trim() && searchFields.length > 0) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((row) =>
        searchFields.some((f) => String(row?.[f] ?? "").toLowerCase().includes(q))
      );
    }

    // Filtres
    filterFields.forEach((ff) => {
      const val = filters[ff.key];
      if (val && String(val).length > 0) {
        rows = rows.filter((row) => String(row?.[ff.key] ?? "") === String(val));
      }
    });

    // Tri
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a?.[sortKey];
        const bv = b?.[sortKey];
        const toNum = (v) => {
          if (v === null || v === undefined) return Number.NEGATIVE_INFINITY;
          const n = Number(v);
          return Number.isFinite(n) ? n : null;
        };
        const an = toNum(av);
        const bn = toNum(bv);
        let cmp = 0;
        if (an !== null && bn !== null) cmp = an - bn;
        else cmp = String(av ?? "").localeCompare(String(bv ?? ""), "fr", { sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return rows;
  }, [data, query, searchFields, filterFields, filters, sortKey, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.max(1, Math.min(page, totalPages));
  const start = total === 0 ? 0 : (current - 1) * perPage + 1;
  const end = Math.min(start + perPage - 1, total);
  const pageRows = filtered.slice(start - 1, end);

  const goto = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

  const pill = {
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 12,
    fontSize: 14,
    boxShadow: THEME.shadowSm,
  };

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto auto",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          style={pageStyles.input}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {filterFields.map((ff) => (
            <select
              key={ff.key}
              value={filters[ff.key] || ""}
              onChange={(e) => onChangeFilter(ff.key, e.target.value)}
              style={pageStyles.select}
            >
              <option value="">{ff.label}</option>
              {ff.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {sortFields.length > 0 && (
            <>
              <select
                value={sortKey}
                onChange={(e) => {
                  setSortKey(e.target.value);
                  setPage(1);
                }}
                style={pageStyles.select}
              >
                {sortFields.map((sf) => (
                  <option key={sf.key} value={sf.key}>
                    Trier: {sf.label}
                  </option>
                ))}
              </select>

              <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={pageStyles.select}>
                <option value="asc">⬆️ Asc</option>
                <option value="desc">⬇️ Desc</option>
              </select>
            </>
          )}

          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            style={pageStyles.select}
          >
            {itemsPerPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Résultats */}
      <div>
        {pageRows.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              color: "#6b7280",
              border: "2px dashed #e5e7eb",
              borderRadius: 16,
            }}
          >
            Aucun résultat
          </div>
        ) : (
          pageRows.map((row) => renderItem(row))
        )}
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 12,
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <div style={{ color: "#6b7280", fontSize: 13 }}>
          {start}–{end} sur {total}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            onClick={() => goto(current - 1)}
            disabled={current === 1}
            style={{ ...pill, cursor: current === 1 ? "not-allowed" : "pointer", opacity: current === 1 ? 0.6 : 1 }}
          >
            ◀️ Précédent
          </button>
          <div style={{ ...pill, background: "#f8fafc" }}>
            Page {current} / {totalPages}
          </div>
          <button
            onClick={() => goto(current + 1)}
            disabled={current === totalPages}
            style={{
              ...pill,
              cursor: current === totalPages ? "not-allowed" : "pointer",
              opacity: current === totalPages ? 0.6 : 1,
            }}
          >
            Suivant ▶️
          </button>
        </div>

        <div />
      </div>
    </div>
  );
}

/* ============================== Page =================================== */
export default function ValidationInterventions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchJson("demandes/recuperer/all");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(
        e?.status === 404
          ? "Ressource introuvable (404). Vérifie l’URL /PI/demandes/recuperer/all."
          : "Impossible de charger les interventions."
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function confirmer(id) {
    if (!window.confirm("Confirmer cette intervention ?")) return;
    try {
      setMessage("");
      const updated = await fetchJson(`demandes/confirmer/${id}`, { method: "PUT" });
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, ...updated, confirmation: 1, statut: "EN_COURS" } : it
        )
      );
      setMessage("✅ Intervention confirmée");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setMessage("❌ Erreur lors de la confirmation.");
      setTimeout(() => setMessage(""), 4000);
    }
  }

  if (loading) {
    return (
      <div style={pageStyles.container}>
        <GlobalAnimations />
        <div style={{ ...pageStyles.card, maxWidth: 560, margin: "80px auto", padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 10, animation: "pulse 2s ease-in-out infinite" }}>⚙️</div>
          <div style={{ fontSize: 18, color: "#003061", fontWeight: 800 }}>Chargement des interventions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyles.container}>
        <GlobalAnimations />
        <div style={{ ...pageStyles.card, maxWidth: 560, margin: "80px auto", padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>⚠️</div>
          <div style={{ color: "#dc2626", fontWeight: 800, marginBottom: 6 }}>Erreur de chargement</div>
          <div style={{ color: "#6b7280", marginBottom: 16 }}>{error}</div>
          <button
            onClick={load}
            style={pageStyles.button(false, "blue")}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles.container}>
      <GlobalAnimations />

      {/* HERO */}
      <div style={pageStyles.hero}>
        <div style={pageStyles.heroShimmer} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 48, marginBottom: 10, animation: "pulse 2s ease-in-out infinite" }}>🛡️</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>Validation des Interventions</h1>
          <div style={{ opacity: 0.9, marginTop: 6 }}>Confirmez les demandes d’intervention</div>
        </div>
      </div>

      {/* LIST CARD */}
      <div style={{ ...pageStyles.card, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ ...pageStyles.section, paddingBottom: 0 }}>
          {message && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                borderRadius: 16,
                background: message.includes("✅")
                  ? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
                  : "linear-gradient(135deg, #fee2e2, #fecaca)",
                border: `1px solid ${message.includes("✅") ? "#10b981" : "#ef4444"}`,
                color: message.includes("✅") ? "#065f46" : "#dc2626",
                fontSize: 14,
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {message}
            </div>
          )}

          <h3 style={pageStyles.h3}>📋 Liste des interventions ({items.length})</h3>
        </div>

        <div style={pageStyles.section}>
          <AdvancedPagination
            data={items}
            itemsPerPageOptions={[5, 10, 20, 50]}
            defaultItemsPerPage={10}
            searchPlaceholder="Rechercher description / type / priorité / statut..."
            searchFields={["description", "typeDemande", "priorite", "statut"]}
            sortFields={[
              { key: "dateDemande", label: "Date de demande" },
              { key: "dateCreation", label: "Date de création" },
              { key: "dateValidation", label: "Date de validation" },
              { key: "description", label: "Description" },
            ]}
            filterFields={[
              {
                key: "statut",
                label: "Statut",
                type: "select",
                options: [
                  { value: "EN_ATTENTE", label: "⏳ En attente" },
                  { value: "EN_COURS", label: "🔄 En cours" },
                  { value: "REFUSEE", label: "❌ Refusée" },
                  { value: "TERMINEE", label: "✅ Terminée" },
                ],
              },
              {
                key: "typeDemande",
                label: "Type",
                type: "select",
                options: [
                  { value: "CURATIVE", label: "🔧 Curative" },
                  { value: "PREVENTIVE", label: "🛠️ Préventive" },
                ],
              },
              {
                key: "priorite",
                label: "Priorité",
                type: "select",
                options: [
                  { value: "NORMALE", label: "Normale" },
                  { value: "MOYENNE", label: "Moyenne" },
                  { value: "HAUTE", label: "Haute" },
                  { value: "URGENTE", label: "Urgente" },
                ],
              },
              {
                key: "confirmation",
                label: "Confirmation",
                type: "select",
                options: [
                  { value: "1", label: "Confirmée" },
                  { value: "0", label: "Non confirmée" },
                ],
              },
            ]}
            renderItem={(it) => (
              <div
                key={it.id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "1rem",
                  marginBottom: "0.85rem",
                  border: "1px solid #e5e7eb",
                  boxShadow: THEME.shadowSm,
                  transition: "all .2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = THEME.shadowSm;
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  {/* Col gauche */}
                  <div style={{ minWidth: 260 }}>
                    <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 6 }}>
                      📅 Demande : {fmtDateTime(it.dateDemande)}
                    </div>
                    <div style={{ fontWeight: 700, color: "#374151", marginBottom: 10 }}>
                      {it.description || "—"}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: it.typeDemande === "CURATIVE" ? "#fee2e2" : "#dcfce7",
                          color: it.typeDemande === "CURATIVE" ? "#b91c1c" : "#166534",
                        }}
                      >
                        {it.typeDemande === "CURATIVE" ? "🔧 Curative" : "🛠️ Préventive"}
                      </span>

                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background:
                            it.priorite === "HAUTE"
                              ? "#fee2e2"
                              : it.priorite === "MOYENNE"
                              ? "#fef3c7"
                              : it.priorite === "URGENTE"
                              ? "#fde68a"
                              : "#e0f2fe",
                          color:
                            it.priorite === "HAUTE"
                              ? "#b91c1c"
                              : it.priorite === "MOYENNE" || it.priorite === "URGENTE"
                              ? "#92400e"
                              : "#1d4ed8",
                        }}
                      >
                        📊 {it.priorite || "NORMALE"}
                      </span>

                      {typeof it.urgence === "boolean" && (
                        <span
                          style={{
                            padding: "2px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background: it.urgence ? "#fde68a" : "#e5e7eb",
                            color: it.urgence ? "#92400e" : "#374151",
                          }}
                        >
                          {it.urgence ? "⚡ Urgent" : "⏱️ Non urgent"}
                        </span>
                      )}

                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: it.confirmation === 1 ? "#dcfce7" : "#e5e7eb",
                          color: it.confirmation === 1 ? "#166534" : "#374151",
                        }}
                      >
                        {it.confirmation === 1 ? "🔒 Confirmée" : "🔓 Non confirmée"}
                      </span>
                    </div>
                  </div>

                  {/* Col droite */}
                  <div style={{ textAlign: "right", minWidth: 260 }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 800,
                        background:
                          it.statut === "EN_ATTENTE"
                            ? "#fef3c7"
                            : it.statut === "EN_COURS"
                            ? "#dbeafe"
                            : it.statut === "REFUSEE"
                            ? "#fee2e2"
                            : "#dcfce7",
                        color:
                          it.statut === "EN_ATTENTE"
                            ? "#a16207"
                            : it.statut === "EN_COURS"
                            ? "#1d4ed8"
                            : it.statut === "REFUSEE"
                            ? "#b91c1c"
                            : "#166534",
                        marginBottom: 8,
                      }}
                    >
                      {it.statut === "EN_ATTENTE"
                        ? "⏳ EN ATTENTE"
                        : it.statut === "EN_COURS"
                        ? "🔄 EN COURS"
                        : it.statut === "REFUSEE"
                        ? "❌ REFUSÉE"
                        : "✅ TERMINÉE"}
                    </div>

                    <div style={{ color: "#6b7280", fontSize: 12 }}>
                      Créée : {fmtDateTime(it.dateCreation)}
                      <br />
                      Validée : {fmtDateTime(it.dateValidation)}
                      {it.prochainRDV ? (
                        <>
                          <br />
                          Prochain RDV : {fmtDateTime(it.prochainRDV)}
                        </>
                      ) : null}
                    </div>

                    {it.statut === "EN_ATTENTE" && (
                      <div style={{ marginTop: 10 }}>
                        <button
                          onClick={() => confirmer(it.id)}
                          style={pageStyles.button(false, "green")}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                        >
                          ✅ Confirmer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
