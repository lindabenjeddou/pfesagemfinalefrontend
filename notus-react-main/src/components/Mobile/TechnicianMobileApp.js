// ValidationInterventions.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

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

/* ====================== Composant AdvancedPagination ==================== */
function AdvancedPagination({
  data = [],
  searchFields = [],
  searchPlaceholder = "Rechercher...",
  sortFields = [],
  filterFields = [],
  itemsPerPageOptions = [10, 20, 50],
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

    // Recherche plein-texte
    if (query.trim() && searchFields.length > 0) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((row) =>
        searchFields.some((f) => String(row?.[f] ?? "").toLowerCase().includes(q))
      );
    }

    // Filtres exacts
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
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * perPage, (current - 1) * perPage + perPage);

  const goto = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

  const btn = (disabled) => ({
    padding: "8px 10px",
    border: "1px solid #e5e7eb",
    background: "white",
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14,
    opacity: disabled ? 0.5 : 1,
  });

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
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            fontSize: 14,
            background: "white",
          }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {filterFields.map((ff) => (
            <select
              key={ff.key}
              value={filters[ff.key] || ""}
              onChange={(e) => onChangeFilter(ff.key, e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                fontSize: 14,
                background: "white",
              }}
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
                style={{
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 14,
                  background: "white",
                }}
              >
                {sortFields.map((sf) => (
                  <option key={sf.key} value={sf.key}>
                    Trier: {sf.label}
                  </option>
                ))}
              </select>

              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value)}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 14,
                  background: "white",
                }}
              >
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
            style={{
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              fontSize: 14,
              background: "white",
            }}
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
          <div style={{ color: "#6b7280", textAlign: "center", padding: "1rem" }}>
            Aucun résultat
          </div>
        ) : (
          pageRows.map((row) => renderItem(row))
        )}
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => goto(1)} style={btn(current === 1)} disabled={current === 1}>
          ⏮️
        </button>
        <button onClick={() => goto(current - 1)} style={btn(current === 1)} disabled={current === 1}>
          ◀️
        </button>
        <span style={{ fontSize: 14, color: "#374151" }}>
          Page {current} / {totalPages} — {filtered.length} résultat(s)
        </span>
        <button
          onClick={() => goto(current + 1)}
          style={btn(current === totalPages)}
          disabled={current === totalPages}
        >
          ▶️
        </button>
        <button
          onClick={() => goto(totalPages)}
          style={btn(current === totalPages)}
          disabled={current === totalPages}
        >
          ⏭️
        </button>
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
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updated } : it)));
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
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        ⏳ Chargement des interventions...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 42, marginBottom: 10 }}>⚠️</div>
        <div style={{ color: "#dc2626", fontWeight: 700, marginBottom: 8 }}>
          Erreur de chargement
        </div>
        <div style={{ color: "#6b7280", marginBottom: 16 }}>{error}</div>
        <button
          onClick={load}
          style={{
            padding: "10px 16px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#f1f5f9,#e2e8f0,#cbd5e1)",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg,#003061,#0078d4)",
            borderRadius: 24,
            padding: "2rem",
            color: "white",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          <h1 style={{ fontSize: "2rem", margin: 0 }}>🛡️ Validation des Interventions</h1>
          <div style={{ opacity: 0.9, marginTop: 6 }}>
            Confirmez les demandes d’intervention (API Swagger OK)
          </div>
        </div>

        {message && (
          <div
            style={{
              background: message.includes("✅")
                ? "linear-gradient(135deg,#d1fae5,#a7f3d0)"
                : "linear-gradient(135deg,#fee2e2,#fecaca)",
              color: message.includes("✅") ? "#065f46" : "#dc2626",
              padding: "0.75rem 1rem",
              borderRadius: 12,
              marginBottom: "1rem",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 16,
            padding: "1.5rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#374151" }}>
            📋 Liste des interventions ({items.length})
          </h3>

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
                  background: "white",
                  borderRadius: 12,
                  padding: "1rem",
                  marginBottom: "0.75rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 260 }}>
                    <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 6 }}>
                      📅 Demande : {fmtDateTime(it.dateDemande)}
                    </div>
                    <div style={{ fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                      {it.description || "—"}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          background:
                            it.typeDemande === "CURATIVE" ? "#fee2e2" : "#dcfce7",
                          color:
                            it.typeDemande === "CURATIVE" ? "#b91c1c" : "#166534",
                        }}
                      >
                        {it.typeDemande === "CURATIVE"
                          ? "🔧 Curative"
                          : "🛠️ Préventive"}
                      </span>

                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
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
                              : it.priorite === "MOYENNE"
                              ? "#92400e"
                              : it.priorite === "URGENTE"
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
                            fontWeight: 600,
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
                          fontWeight: 600,
                          background: it.confirmation === 1 ? "#dcfce7" : "#e5e7eb",
                          color: it.confirmation === 1 ? "#166534" : "#374151",
                        }}
                      >
                        {it.confirmation === 1 ? "🔒 Confirmée" : "🔓 Non confirmée"}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", minWidth: 260 }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 700,
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
                          style={{
                            padding: "8px 12px",
                            background: "linear-gradient(135deg,#10b981,#059669)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
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
