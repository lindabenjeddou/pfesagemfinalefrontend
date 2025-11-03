// src/views/technician/TechnicianWorkOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSecurity } from "../../contexts/SecurityContext";

/* ============================== Config & Helpers ============================== */
const BASE_URL = "http://localhost:8089/PI";
const toApiUrl = (p) =>
  `${BASE_URL.replace(/\/+$/, "")}/${String(p || "").replace(/^\/+/, "")}`;

async function fetchJson(path, { method = "GET", body, headers = {} } = {}) {
  const token = localStorage.getItem("token");
  const isAbsolute = /^https?:\/\//i.test(path);
  const url = isAbsolute ? path : toApiUrl(path);

  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

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

const fmtDate = (d) =>
  d instanceof Date
    ? d.toISOString().slice(0, 10)
    : typeof d === "string"
    ? d.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

const getDisplayName = (u) => {
  const f =
    u?.firstName ?? u?.firstname ?? u?.first_name ?? u?.given_name ?? "";
  const l =
    u?.lastName ?? u?.lastname ?? u?.last_name ?? u?.family_name ?? "";
  const full = `${f} ${l}`.trim();
  return full || u?.username || u?.email || "Technicien";
};

/* ============================== Design system (aligné avec AddIntervention) ============================== */
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
    position: "relative",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)",
    padding: 24,
    overflow: "hidden",
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
    borderRadius: 32,
    boxShadow: THEME.shadowMd,
    borderWidth: 1,
    overflow: "hidden",
  },
  section: { padding: "2rem" },
  h3: {
    fontSize: 22,
    fontWeight: 800,
    color: "#003061",
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: 12,
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 15,
    background: "white",
    outline: "none",
    transition: "all .2s ease",
    boxShadow: THEME.shadowSm,
  },
  textarea: {
    width: "100%",
    padding: 12,
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 15,
    background: "white",
    outline: "none",
    transition: "all .2s ease",
    resize: "vertical",
    boxShadow: THEME.shadowSm,
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: 12,
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 15,
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
      padding: "12px 20px",
      background: disabled
        ? "linear-gradient(135deg, #9ca3af, #6b7280)"
        : `linear-gradient(135deg, ${t[0]}, ${t[1]})`,
      color: tone === "gray" ? "#0f172a" : "#fff",
      border: "none",
      borderRadius: 14,
      fontSize: 15,
      fontWeight: 800,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all .2s ease",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 8px 25px rgba(0, 48, 97, 0.25)",
    };
  },
};

const GlobalAnimations = () => (
  <style>{`
    @keyframes shimmer { 0%{background-position:-200px 0} 100%{background-position:calc(200px + 100%) 0} }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  `}</style>
);

/* ============================== UI bits ============================== */
const StatusChip = ({ value }) => {
  const map = {
    EN_ATTENTE: { bg: "#fef3c7", text: "#92400e", label: "⏳ En attente" },
    EN_COURS: { bg: "#dbeafe", text: "#1e40af", label: "🔄 En cours" },
    TERMINE: { bg: "#dcfce7", text: "#166534", label: "✅ Terminé" },
    ANNULE: { bg: "#fee2e2", text: "#b91c1c", label: "❌ Annulé" },
    PLANIFIE: { bg: "#e0f2fe", text: "#075985", label: "🗂️ Planifié" },
    TERMINEE: { bg: "#dcfce7", text: "#166534", label: "✅ Terminée" },
  };
  const s = map[value] || { bg: "#e5e7eb", text: "#374151", label: value || "—" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        borderRadius: 999,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {s.label}
    </span>
  );
};

const STATUT_BT = ["EN_ATTENTE", "EN_COURS", "TERMINE", "ANNULE"];

/* ============================== Formulaire Bon de Travail ============================== */
/* ⚠️ Changement : plus de colonne à droite. Les composants sont maintenant EN BAS du formulaire. */
function WorkOrderForm({ intervention, technicien, technicienId, onCreated }) {
  const [description, setDescription] = useState("");
  const [dateCreation, setDateCreation] = useState(fmtDate(new Date()));
  const [dateDebut, setDateDebut] = useState(fmtDate(new Date()));
  const [dateFin, setDateFin] = useState(fmtDate(new Date()));
  const [statut, setStatut] = useState("EN_ATTENTE");

  // testeur GMAO depuis l'intervention (lecture seule)
  const derivedTesteur = useMemo(
    () =>
      intervention?.testeurCodeGMAO ||
      intervention?.testeur?.codeGMAO ||
      intervention?.equipement?.codeGMAO ||
      "",
    [intervention]
  );
  const [testeurCodeGMAO, setTesteurCodeGMAO] = useState(derivedTesteur);
  useEffect(() => setTesteurCodeGMAO(derivedTesteur), [derivedTesteur]);

  // composants (stock)
  const [componentsLoading, setComponentsLoading] = useState(false);
  const [components, setComponents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedComps, setSelectedComps] = useState([]); // { _key, id, designation, quantite, quantiteUtilisee, raw }

  // clôture auto
  const [autoClose, setAutoClose] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setComponentsLoading(true);
      try {
        const tries = [
          "component/all",
          "pi/component/all",
          "http://localhost:8089/PI/PI/component/all",
        ];
        let data = [];
        for (const p of tries) {
          try {
            const res = await fetchJson(p);
            if (Array.isArray(res)) {
              data = res;
              break;
            }
          } catch {
            /* try next */
          }
        }
        if (!cancel) setComponents(Array.isArray(data) ? data : []);
      } finally {
        if (!cancel) setComponentsLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return components.slice(0, 30);
    return components
      .filter((c) => {
        const a = String(c?.trartArticle || c?.code || c?.id || "").toLowerCase();
        const d = String(
          c?.trartDesignation || c?.designation || c?.name || ""
        ).toLowerCase();
        return a.includes(q) || d.includes(q);
      })
      .slice(0, 30);
  }, [components, search]);

  const addComp = (c) => {
    const id =
      c?.trartArticle ??
      c?.id ??
      c?.code ??
      c?.trCode ??
      c?.trartDesignation ??
      c?.designation ??
      c?.name ??
      Math.random().toString(36).slice(2);
    const key = String(id);
    if (selectedComps.some((x) => String(x._key) === key)) return;
    setSelectedComps((cur) => [
      ...cur,
      {
        _key: key,
        id: key, // fallback si component.trartArticle absent
        designation:
          c?.trartDesignation || c?.designation || c?.name || c?.trartArticle || key,
        quantite: 1,
        quantiteUtilisee: 1,
        raw: c,
      },
    ]);
  };

  const updateQty = (key, field, value) => {
    const v = Math.max(0, Number(value || 0));
    setSelectedComps((cur) =>
      cur.map((x) => (String(x._key) === String(key) ? { ...x, [field]: v } : x))
    );
  };

  const removeComp = (key) =>
    setSelectedComps((cur) => cur.filter((x) => String(x._key) !== String(key)));

  const resetForm = () => {
    setDescription("");
    setDateCreation(fmtDate(new Date()));
    setDateDebut(fmtDate(new Date()));
    setDateFin(fmtDate(new Date()));
    setStatut("EN_ATTENTE");
    setSelectedComps([]);
    setSearch("");
    setTesteurCodeGMAO(derivedTesteur); // conserve la valeur issue de l'intervention
  };

  const canSubmit =
    description.trim().length > 0 &&
    Number.isFinite(Number(technicienId)) &&
    Number.isFinite(Number(intervention?.id));

  async function closeIntervention(interventionId) {
    const tries = [
      { method: "PUT", path: `demandes/${interventionId}/statut`, body: { statut: "TERMINEE" } },
      { method: "PATCH", path: `demandes/${interventionId}/statut`, body: { statut: "TERMINEE" } },
      { method: "POST", path: `demandes/cloturer/${interventionId}` },
      { method: "POST", path: `demande/cloturer/${interventionId}` },
    ];
    for (const t of tries) {
      try {
        await fetchJson(t.path, { method: t.method, body: t.body });
        return true;
      } catch {
        /* try next */
      }
    }
    throw new Error("Aucun endpoint de clôture n'a répondu");
  }

  // 🔔 Fonction pour notifier les magasiniers (comme dans le code fonctionnel Projet.js)
  async function notifyMagasiniers(bonTravail, composants) {
    console.log("🔍 [DEBUG] notifyMagasiniers appelée avec:", { bonTravail, composants });
    
    try {
      // Préparer les données de notification
      const componentsList = composants.map(c => ({
        designation: c.designation,
        quantite: c.quantite || c.quantiteUtilisee,
        id: c.id
      }));

      const notificationData = {
        type: 'BON_TRAVAIL_CREATED',
        title: '🛠️ Nouveau Bon de Travail',
        message: `Un nouveau bon de travail #${bonTravail?.id || '?'} a été créé avec ${composants.length} composant(s) commandé(s). Veuillez préparer ces composants pour le technicien.`,
        priority: composants.length > 0 ? 'HIGH' : 'NORMAL',
        bonTravailId: bonTravail?.id,
        interventionId: bonTravail?.interventionId,
        componentCount: composants.length,
        components: componentsList
      };

      console.log("🔍 [DEBUG] Envoi notification avec payload:", notificationData);
      console.log("🔍 [DEBUG] URL:", "http://localhost:8089/PI/PI/notifications/bon-travail-created");

      // Envoyer la notification (le backend se charge de trouver les magasiniers)
      const response = await fetch('http://localhost:8089/PI/PI/notifications/bon-travail-created', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      console.log("🔍 [DEBUG] Réponse API:", response.status, response.statusText);

      if (response.ok) {
        console.log('✅ Notifications envoyées aux magasiniers avec succès');
        alert('📬 Magasiniers notifiés du nouveau bon de travail');
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Erreur lors de l\'envoi des notifications aux magasiniers:', response.status);
        console.warn('⚠️ Détails erreur:', errorText);
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi des notifications aux magasiniers:", error);
      console.error("❌ Stack:", error.stack);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      description: description.trim(),
      dateCreation,
      dateDebut,
      dateFin,
      statut: autoClose ? "TERMINE" : statut,
      interventionId: Number(intervention?.id),
      technicien: Number(technicienId),
      ...(testeurCodeGMAO?.trim() ? { testeurCodeGMAO: testeurCodeGMAO.trim() } : {}),
      composants: selectedComps.map((sc) => {
        const trartArticle = sc?.raw?.trartArticle || sc?.id || String(sc?.id || "");
        return {
          id: String(sc.id),
          designation: sc.designation,
          quantite: Number(sc.quantite) || 0,
          quantiteUtilisee: Number(sc.quantiteUtilisee) || Number(sc.quantite) || 0,
          component: {
            trartArticle: String(trartArticle),
            trartDesignation: sc.designation || "",
            trartQuantite: String(sc.quantite || "1"),
          },
        };
      }),
    };

    try {
      const created = await fetchJson("pi/bons", { method: "POST", body: payload });

      // 🔔 Notifier les magasiniers des composants commandés
      if (selectedComps.length > 0) {
        console.log("📢 Envoi des notifications aux magasiniers...");
        await notifyMagasiniers(created, selectedComps);
      }

      if (autoClose) {
        try {
          await closeIntervention(intervention.id);
        } catch (e) {
          console.warn("Clôture auto échouée:", e?.message);
        }
      }

      resetForm(); // 👉 le formulaire redevient vide
      onCreated?.(created);
      alert(`✅ Bon de travail créé${autoClose ? " et intervention clôturée" : ""} !\n${selectedComps.length > 0 ? `📦 ${selectedComps.length} composant(s) commandé(s) - Magasinier(s) notifié(s)` : ""}`);
    } catch (err) {
      console.error(err);
      alert(`Erreur lors de la création du bon de travail\n${err?.message || ""}`);
    }
  };

  const techName = getDisplayName(technicien);

  return (
    <form onSubmit={handleSubmit}>
      {/* Bloc principal (tout en pile) */}
      {/* En-tête intervention & technicien */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <label style={pageStyles.label}>🔎 Intervention</label>
          <div
            style={{
              padding: 12,
              border: "2px solid rgba(0,48,97,.2)",
              borderRadius: 12,
              background: "rgba(248,250,252,.9)",
              color: "#374151",
              boxShadow: THEME.shadowSm,
              fontWeight: 800,
            }}
          >
            #{intervention?.id}
          </div>
        </div>
        <div>
          <label style={pageStyles.label}>👨‍🔧 Technicien</label>
          <div
            style={{
              padding: 12,
              border: "2px solid rgba(0,48,97,.2)",
              borderRadius: 12,
              background: "rgba(248,250,252,.9)",
              color: "#374151",
              boxShadow: THEME.shadowSm,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            title={technicien?.email || ""}
          >
            <span style={{ fontSize: 18 }}>🧑‍🔧</span>
            <span>{techName}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <label style={pageStyles.label}>📄 Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Décrivez les tâches à réaliser…"
          style={pageStyles.textarea}
          required
        />
      </div>

      {/* Dates + Statut */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={pageStyles.label}>🗓️ Création</label>
          <input
            type="date"
            value={dateCreation}
            onChange={(e) => setDateCreation(e.target.value)}
            style={pageStyles.input}
          />
        </div>
        <div>
          <label style={pageStyles.label}>⏱️ Début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            style={pageStyles.input}
          />
        </div>
        <div>
          <label style={pageStyles.label}>🏁 Fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            style={pageStyles.input}
          />
        </div>
        <div>
          <label style={pageStyles.label}>📌 Statut</label>
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            style={pageStyles.select}
            disabled={autoClose}
            title={autoClose ? "Clôture auto activée : le BT sera marqué TERMINE" : ""}
          >
            {STATUT_BT.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Testeur GMAO (lecture seule) */}
      <div style={{ marginBottom: 18 }}>
        <label style={pageStyles.label}>🔬 Code GMAO du testeur (issu de l’intervention)</label>
        <input
          value={testeurCodeGMAO}
          readOnly
          placeholder="—"
          style={{ ...pageStyles.input, background: "#f8fafc" }}
        />
      </div>

      {/* Clôture auto */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: 12,
          marginBottom: 22,
          background: "linear-gradient(135deg, #ecfeff, #dbeafe)",
          border: "1px solid #93c5fd",
          borderRadius: 12,
          boxShadow: THEME.shadowSm,
        }}
      >
        <input
          type="checkbox"
          id="autoclose"
          checked={autoClose}
          onChange={(e) => setAutoClose(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: THEME.primary[0] }}
        />
        <label htmlFor="autoclose" style={{ fontWeight: 700, cursor: "pointer", color: "#1e3a8a" }}>
          ✅ Clôturer automatiquement l’intervention une fois le bon créé
        </label>
      </div>

      {/* ===================== SECTION COMPOSANTS — EN BAS ===================== */}
      <div style={{ marginTop: 6 }}>
        <h3 style={pageStyles.h3}>🧩 Composants</h3>

        {/* Barre de recherche */}
        <div style={{ marginBottom: 10, position: "relative" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par article ou désignation…"
            style={pageStyles.input}
          />
          <div style={{ position: "absolute", right: 12, top: 10, fontSize: 18, opacity: 0.5 }}>🔎</div>
        </div>

        {/* Résultats */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            background: "#fff",
            maxHeight: 220,
            overflow: "auto",
            boxShadow: THEME.shadowSm,
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b", padding: "8px 12px", borderBottom: "1px solid #f1f5f9" }}>
            {componentsLoading ? "Chargement…" : `${components.length} en stock`}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: 12, color: "#6b7280", fontSize: 14 }}>Aucun résultat</div>
          ) : (
            filtered.map((c, idx) => {
              const art = c?.trartArticle || c?.code || c?.id || "—";
              const des = c?.trartDesignation || c?.designation || c?.name || "—";
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addComp(c)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    width: "100%",
                    textAlign: "left",
                    background: "white",
                    padding: "10px 12px",
                    border: "none",
                    borderBottom: "1px solid #f1f5f9",
                    cursor: "pointer",
                  }}
                  title="Ajouter"
                >
                  <div style={{ color: "#0f172a" }}>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>{des}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>[{art}]</div>
                  </div>
                  <div style={{ fontSize: 13, color: THEME.primary[0], fontWeight: 800 }}>+ Ajouter</div>
                </button>
              );
            })
          )}
        </div>

        {/* Sélection */}
        {selectedComps.length > 0 && (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              background: "#fff",
              boxShadow: THEME.shadowSm,
              overflow: "hidden",
              marginBottom: 18,
            }}
          >
            <div style={{ padding: 10, background: "#f8fafc", borderBottom: "1px solid #e5e7eb", fontWeight: 800 }}>
              Sélection ({selectedComps.length})
            </div>
            <div style={{ maxHeight: 260, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#eef2ff" }}>
                    <th style={thCell}>Désignation</th>
                    <th style={thCell}>Qté prévue</th>
                    <th style={thCell}>Qté utilisée</th>
                    <th style={thCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedComps.map((sc) => (
                    <tr key={sc._key} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={tdCell}>{sc.designation}</td>
                      <td style={tdCell}>
                        <input
                          type="number"
                          min={0}
                          value={sc.quantite}
                          onChange={(e) => updateQty(sc._key, "quantite", e.target.value)}
                          style={qtyInput}
                        />
                      </td>
                      <td style={tdCell}>
                        <input
                          type="number"
                          min={0}
                          value={sc.quantiteUtilisee}
                          onChange={(e) => updateQty(sc._key, "quantiteUtilisee", e.target.value)}
                          style={qtyInput}
                        />
                      </td>
                      <td style={tdCell}>
                        <button type="button" onClick={() => removeComp(sc._key)} style={pageStyles.button(false, "gray")}>
                          Retirer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
        <button
          type="button"
          style={pageStyles.button(false, "gray")}
          onClick={resetForm}
          title="Vider le formulaire"
        >
          🧹 Réinitialiser
        </button>
        <button type="submit" disabled={!canSubmit} style={pageStyles.button(!canSubmit, "blue")}>
          ✅ Créer le bon de travail
        </button>
      </div>
    </form>
  );
}

/* ============================== Styles table ============================== */
const thCell = {
  textAlign: "left",
  fontSize: 12,
  color: "#111827",
  padding: "8px 10px",
  whiteSpace: "nowrap",
};
const tdCell = { fontSize: 13, color: "#374151", padding: "8px 10px" };
const qtyInput = {
  width: 90,
  border: "2px solid #e5e7eb",
  borderRadius: 10,
  padding: "6px 8px",
  fontSize: 14,
};

/* ============================== Page principale ============================== */
export default function TechnicianWorkOrders() {
  const { t } = useLanguage();
  const { user } = useSecurity();

  const uid = useMemo(() => Number(user?.userId ?? user?.id), [user]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [interventions, setInterventions] = useState([]);
  const [selectedInterventionId, setSelectedInterventionId] = useState(null);
  const [showAllIfEmpty, setShowAllIfEmpty] = useState(false);

  // détails du technicien (pour afficher nom/prénom)
  const [techDetails, setTechDetails] = useState(null);
  useEffect(() => {
    setTechDetails({
      firstName: user?.firstName ?? user?.firstname ?? "",
      lastName: user?.lastName ?? user?.lastname ?? "",
      email: user?.email ?? "",
      username: user?.username ?? user?.email ?? "",
    });
  }, [user]);

  useEffect(() => {
    async function load() {
      if (!Number.isFinite(uid)) return;
      setLoading(true);
      setListError("");
      try {
        const assigned = await fetchJson(`demandes/technicien/${uid}`);
        let arr = Array.isArray(assigned) ? assigned : [];
        if (arr.length === 0 && showAllIfEmpty) {
          const all = await fetchJson("demandes/recuperer/all");
          arr = Array.isArray(all) ? all : [];
        }
        setInterventions(arr);
        if (arr.length && selectedInterventionId == null) {
          setSelectedInterventionId(arr[0].id);
        }
      } catch (e) {
        console.error(e);
        setListError(
          e?.status === 401
            ? "Non autorisé. Connectez-vous à nouveau."
            : "Impossible de charger les interventions."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, showAllIfEmpty]);

  const selectedIntervention =
    interventions.find((i) => Number(i?.id) === Number(selectedInterventionId)) || null;

  const displayIntervention = (it) => {
    const titre = it?.titre || it?.taskDescription || "Intervention";
    const desc = it?.description || "";
    const prio = it?.priorite || it?.priority || "NORMALE";
    const statut = it?.statut || it?.status || "EN_ATTENTE";
    const date =
      it?.dateDemande || it?.startDate || it?.dateAssignation || it?.createdAt || null;
    const dateTxt = date ? new Date(date).toLocaleString("fr-FR") : "—";

    return (
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 800, color: "#0f172a" }}>{titre}</div>
        <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.35 }}>{desc || "—"}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
              background:
                prio === "HAUTE" ? "#fee2e2" : prio === "URGENTE" ? "#fde68a" : "#e0f2fe",
              color:
                prio === "HAUTE" ? "#b91c1c" : prio === "URGENTE" ? "#92400e" : "#1d4ed8",
            }}
          >
            📊 {prio}
          </span>
          <StatusChip value={statut} />
          <span style={{ color: "#6b7280", fontSize: 12 }}>📅 {dateTxt}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={pageStyles.container}>
      <GlobalAnimations />

      {/* HERO */}
      <div style={pageStyles.hero}>
        <div style={pageStyles.heroShimmer} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 48, marginBottom: 10, animation: "pulse 2s ease-in-out infinite" }}>🛠️</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>
            {t("workorders.title", "Espace Technicien — Bons de Travail")}
          </h1>
          <p style={{ marginTop: 8, opacity: 0.9 }}>
            {t("workorders.subtitle", "Créez un bon de travail pour une intervention assignée")}
          </p>
        </div>
      </div>

      {/* LAYOUT global : liste à gauche / fiche à droite */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, maxWidth: 1200, margin: "0 auto" }}>
        {/* Liste des interventions */}
        <div style={pageStyles.card}>
          <div style={{ ...pageStyles.section, paddingBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h3 style={pageStyles.h3}>📬 Mes interventions</h3>
              <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={showAllIfEmpty}
                  onChange={(e) => setShowAllIfEmpty(e.target.checked)}
                />
                <span>Voir tout si vide</span>
              </label>
            </div>
            {loading ? (
              <div style={{ color: "#6b7280" }}>Chargement…</div>
            ) : listError ? (
              <div style={{ color: "#b91c1c" }}>{listError}</div>
            ) : interventions.length === 0 ? (
              <div style={{ color: "#6b7280" }}>Aucune intervention à afficher.</div>
            ) : (
              <div style={{ marginTop: 8, display: "grid", gap: 10, maxHeight: 540, overflow: "auto" }}>
                {interventions.map((it) => {
                  const active = Number(it.id) === Number(selectedInterventionId);
                  return (
                    <button
                      key={it.id}
                      onClick={() => setSelectedInterventionId(it.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: active ? "linear-gradient(135deg,#eff6ff,#dbeafe)" : "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: 16,
                        padding: 14,
                        cursor: "pointer",
                        boxShadow: THEME.shadowSm,
                      }}
                    >
                      {displayIntervention(it)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Détails + Formulaire (avec composants en BAS) */}
        <div style={pageStyles.card}>
          <div style={pageStyles.section}>
            {!selectedIntervention ? (
              <div
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: 16,
                  padding: "2rem",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🧭</div>
                <div style={{ fontWeight: 800, color: "#111827", marginBottom: 6 }}>
                  Sélectionnez une intervention
                </div>
                <div>Choisissez une intervention à gauche pour ouvrir le formulaire.</div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontWeight: 900, color: "#0f172a", fontSize: 18 }}>
                    Intervention #{selectedIntervention.id}
                  </div>
                  <StatusChip value={selectedIntervention?.statut || "EN_ATTENTE"} />
                </div>
                <div style={{ color: "#374151", marginBottom: 18 }}>
                  {selectedIntervention?.description || "—"}
                </div>

                <WorkOrderForm
                  intervention={selectedIntervention}
                  technicien={techDetails}
                  technicienId={uid}
                  onCreated={() => {
                    // Optionnel : rafraîchir la liste si besoin
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
