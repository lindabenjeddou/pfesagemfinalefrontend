// src/views/admin/AssignIntervention.js
import React, { useEffect, useMemo, useState } from "react";
import {
  FiUserPlus,
  FiUserCheck,
  FiClock,
  FiAlertCircle,
  FiTool,
  FiInfo,
  FiRefreshCw,
  FiList,
  FiSearch,
  FiX,
} from "react-icons/fi";

// ---- Animations (inject once) ----
const animations = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02);} 100% { transform: scale(1);} }
@keyframes shimmer { 0% { background-position: -500px 0; } 100% { background-position: 500px 0; } }
`;

function useInjectAnimations() {
  useEffect(() => {
    const el = document.createElement("style");
    el.setAttribute("data-assign-intervention-anim", "true");
    el.textContent = animations;
    document.head.appendChild(el);
    return () => {
      document.head.removeChild(el);
    };
  }, []);
}

// ---- Theme helpers (aligné avec ValidationInterventions) ----
const THEME = {
  radius: 24,
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
  grayBg: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)",
};

// ---- Small UI bits ----
const Badge = ({ children, color = "gray", style = {} }) => {
  const palette = {
    blue: { bg: "#e0f2fe", fg: "#1e40af" },
    green: { bg: "#dcfce7", fg: "#166534" },
    yellow: { bg: "#fef9c3", fg: "#92400e" },
    red: { bg: "#fee2e2", fg: "#991b1b" },
    purple: { bg: "#ede9fe", fg: "#5b21b6" },
    gray: { bg: "#f3f4f6", fg: "#374151" },
  };
  const { bg, fg } = palette[color] || palette.gray;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.25rem 0.6rem",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        backgroundColor: bg,
        color: fg,
        letterSpacing: 0.2,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

const Avatar = ({ name }) => {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  const hue = Math.abs(
    (name || " ")
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  ) % 360;
  const bg = `hsl(${hue} 85% 90%)`;
  const fg = `hsl(${hue} 45% 30%)`;
  return (
    <div
      aria-hidden
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        background: bg,
        color: fg,
        fontWeight: 800,
        border: "1px solid rgba(0,0,0,.05)",
      }}
    >
      {initials}
    </div>
  );
};

const CustomSelect = ({
  id,
  name,
  value,
  onChange,
  options,
  label,
  icon: Icon,
  disabled = false,
  placeholder = "Sélectionner une option",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#334155",
          }}
        >
          {Icon && <Icon size={18} style={{ marginRight: 8, color: THEME.primary[0] }} />}
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: "100%",
            padding: "12px 36px 12px 12px",
            fontSize: 14,
            color: "#0f172a",
            backgroundColor: disabled ? "#F3F4F6" : "#FFFFFF",
            border: `1px solid ${isFocused ? THEME.primary[0] : "#E2E8F0"}`,
            borderRadius: THEME.radius,
            boxShadow: isFocused ? "0 0 0 4px rgba(59,130,246,.15)" : THEME.shadowSm,
            transition: "all .2s ease",
            appearance: "none",
          }}
        >
          <option value="">{placeholder}</option>
          {(options || []).map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "#94a3b8",
          }}
        >
          ▼
        </div>
      </div>
      {/* fin wrapper centré */}
    </div>
  );
};

// ---- API helper ----
const BASE_URL = "http://localhost:8089/PI";
async function fetchJson(path, options = {}) {
  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = { "Content-Type": "application/json", ...options.headers };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = new Error("Network response was not ok");
    err.status = res.status;
    try { err.data = await res.json(); } catch { err.data = await res.text(); }
    throw err;
  }
  try { return await res.json(); } catch { return null; }
}

// ---- Page styles ----
const pageStyles = {
  container: {
    minHeight: "100vh",
    padding: 24,
    background: THEME.grayBg,
  },
  hero: {
    background: "linear-gradient(135deg, #003061, #0078d4)",
    borderRadius: 24,
    padding: 40,
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
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent)",
    backgroundSize: "200% 100%",
    animation: "shimmer 3s ease-in-out infinite",
  },
  card: {
    background: THEME.card.background,
    backdropFilter: THEME.card.backdrop,
    border: THEME.card.border,
    borderRadius: THEME.radius,
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
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid rgba(0,0,0,.05)",
      color: tone === "gray" ? "#0f172a" : "#fff",
      background: disabled ? (tone === "gray" ? "#eef2ff" : "#93c5fd") : `linear-gradient(135deg, ${t[0]}, ${t[1]})`,
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: 700,
      letterSpacing: 0.2,
      boxShadow: disabled ? THEME.shadowSm : THEME.shadowMd,
      transform: disabled ? "none" : "translateZ(0)",
      transition: "transform .12s ease, box-shadow .12s ease, filter .12s ease",
    };
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 800,
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: 0,
  },
  pill: (active) => ({
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 600,
    border: `1px solid ${active ? THEME.primary[0] : "#e2e8f0"}`,
    color: active ? THEME.primary[1] : "#475569",
    background: active ? "#eff6ff" : "#ffffff",
    cursor: "pointer",
  }),
  inputWrap: {
    position: "relative",
    marginBottom: 12,
  },
  input: {
    width: "100%",
    padding: "10px 36px 10px 36px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#fff",
    boxShadow: THEME.shadowSm,
    fontSize: 14,
    color: "#0f172a",
  },
  inputIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
  },
  inputClear: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    cursor: "pointer",
  },
  skeleton: {
    background: `linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%)`,
    backgroundSize: "400% 100%",
    animation: "shimmer 1.2s infinite",
    borderRadius: 10,
  },
  switch: (on) => ({
    width: 44,
    height: 26,
    borderRadius: 999,
    background: on ? `linear-gradient(135deg, ${THEME.primary[0]}, ${THEME.primary[1]})` : "#e5e7eb",
    position: "relative",
    boxShadow: THEME.shadowSm,
    transition: "background .15s ease",
  }),
  knob: (on) => ({
    width: 20,
    height: 20,
    borderRadius: 999,
    background: "#fff",
    position: "absolute",
    top: 3,
    left: on ? 21 : 3,
    boxShadow: THEME.shadowMd,
    transition: "left .15s ease",
  }),
};

// ---- Component ----
const AssignIntervention = () => {
  useInjectAnimations();

  // State
  const [loading, setLoading] = useState(false);
  const [interventions, setInterventions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL | CURATIVE | PREVENTIVE
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  const [formData, setFormData] = useState({
    interventionId: "",
    technicienId: "",
    testeurCodeGMAO: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("assigner");

  // Testeurs & Techniciens
  const [testeurs, setTesteurs] = useState([]);
  const [loadingTesteurs, setLoadingTesteurs] = useState(false);

  const [techniciens, setTechniciens] = useState([]);
  const [loadingTechniciens, setLoadingTechniciens] = useState(false);
  const [usersById, setUsersById] = useState({});
  
  // Date pour filtrer les techniciens disponibles
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format yyyy-MM-dd
  });

  // Submit flags
  const [submittingTester, setSubmittingTester] = useState(false);
  const [submittingTechnicien, setSubmittingTechnicien] = useState(false);

  // Auto refresh controls
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Reusable loader for interventions
  const loadInterventions = async () => {
    try {
      setLoading(true);
      const data = await fetchJson("/demandes/all");
      const list = Array.isArray(data) ? data : [];
      setInterventions(list);
      return list;
    } catch (e) {
      console.error(e);
      setError(
        e?.data?.message ||
          `Impossible de charger les interventions${e.status ? ` (HTTP ${e.status})` : ''}.`
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInterventions(); }, []);

  // ---- SAGE Assistant integration: listen to quick actions ----
  useEffect(() => {
    const onSageAction = (e) => {
      const { type } = e.detail || {};
      if (!type) return;
      if (type === 'assign:view-assign') {
        setActiveTab('assigner');
      } else if (type === 'assign:view-list') {
        setActiveTab('liste');
      } else if (type === 'assign:refresh') {
        loadInterventions();
        loadTesteurs();
        loadTechniciens();
      } else if (type === 'assign:clear-filters') {
        setSearchTerm("");
        setFilterType('ALL');
      }
    };
    window.addEventListener('sage-action', onSageAction);
    return () => window.removeEventListener('sage-action', onSageAction);
  }, []);

  // When coming back to the tab, refresh once
  useEffect(() => {
    const onShow = () => { if (document.visibilityState === 'visible') loadInterventions(); };
    document.addEventListener('visibilitychange', onShow);
    return () => document.removeEventListener('visibilitychange', onShow);
  }, []);

  // Optional auto-refresh every 30s
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(loadInterventions, 30000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  // Load testeurs
  const loadTesteurs = async () => {
    setLoadingTesteurs(true);
    try {
      const data = await fetchJson("/PI/testeurs/all"); // -> /PI/PI/testeurs/all
      setTesteurs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || `Erreur lors du chargement des testeurs${e.status ? ` (HTTP ${e.status})` : ''}.`);
    } finally {
      setLoadingTesteurs(false);
    }
  };
  useEffect(() => { loadTesteurs(); }, []);

  // Load techniciens + map (filtrés par disponibilité)
  const loadTechniciens = async (date = null) => {
    try {
      setLoadingTechniciens(true);
      const dateToUse = date || selectedDate;
      
      // Essayer de récupérer les techniciens disponibles via le planning
      try {
        const response = await fetchJson(`/PI/planningHoraire/techniciens-disponibles?date=${dateToUse}`);
        if (response && response.techniciens) {
          console.log(`✅ ${response.nombreDisponibles} technicien(s) disponible(s) le ${dateToUse}`);
          setTechniciens(response.techniciens);
          
          // Aussi charger tous les users pour la map
          const allUsers = await fetchJson("/user/all");
          const arr = Array.isArray(allUsers) ? allUsers : [];
          setUsersById(Object.fromEntries(arr.map((u) => [u.id, u])));
          return;
        }
      } catch (planningError) {
        console.warn("⚠️ Impossible de charger les techniciens par planning, fallback sur tous les techniciens:", planningError);
      }
      
      // Fallback: charger tous les techniciens si le planning n'est pas disponible
      const users = await fetchJson("/user/all");
      const arr = Array.isArray(users) ? users : [];
      setUsersById(Object.fromEntries(arr.map((u) => [u.id, u])));
      setTechniciens(arr.filter((u) => u.role === "TECHNICIEN_CURATIF" || u.role === "TECHNICIEN_PREVENTIF"));
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || `Erreur lors du chargement des utilisateurs${e.status ? ` (HTTP ${e.status})` : ''}.`);
    } finally {
      setLoadingTechniciens(false);
    }
  };
  useEffect(() => { loadTechniciens(); }, [selectedDate]);

  // ---- Derived helpers ----
  const computeTitle = (d) => {
    if (!d) return "—";
    if (d.typeDemande === "CURATIVE") return d.panne || d.description || `Demande #${d.id}`;
    if (d.typeDemande === "PREVENTIVE") return d.frequence ? `Maintenance ${d.frequence}` : d.description || `Demande #${d.id}`;
    return d.description || `Demande #${d.id}`;
  };

  // ---- Filtered list ----
  const filteredInterventions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return interventions.filter((i) => {
      if (filterType !== "ALL" && i.typeDemande !== filterType) return false;
      const title = computeTitle(i).toLowerCase();
      const matches =
        String(i.id).includes(q) ||
        title.includes(q) ||
        (i.description || "").toLowerCase().includes(q) ||
        (i.panne || "").toLowerCase().includes(q) ||
        (i.typeDemande || "").toLowerCase().includes(q);
      return q ? matches : true;
    });
  }, [searchTerm, interventions, filterType]);

  // ---- UI helpers ----
  const handleInterventionClick = (id) => {
    const picked = interventions.find((i) => i.id === id) || null;
    setSelectedIntervention(picked);
    setFormData((p) => ({ ...p, interventionId: id.toString() }));
    setSuccess("");
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setSuccess("");
  };

  const handleAssignTester = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!formData.interventionId || !formData.testeurCodeGMAO) return;
    try {
      setSubmittingTester(true);
      await fetchJson(`/demandes/assign/${encodeURIComponent(formData.interventionId)}/testeur/${encodeURIComponent(formData.testeurCodeGMAO)}`, { method: "PUT" });
      const list = await loadInterventions();
      const id = Number(formData.interventionId);
      setSelectedIntervention(list.find((d) => d.id === id) || null);
      setSuccess("Testeur assigné avec succès ✅");
    } catch (e2) {
      console.error(e2);
      setError(e2?.data?.message || `Échec de l'assignation du testeur${e2.status ? ` (HTTP ${e2.status})` : ''}.`);
    } finally { setSubmittingTester(false); }
  };

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!formData.interventionId || !formData.technicienId) return;
    try {
      setSubmittingTechnicien(true);
      
      // Assigner le technicien
      await fetchJson(`/demandes/assign/${encodeURIComponent(formData.interventionId)}/technicien/${encodeURIComponent(formData.technicienId)}`, { method: "PUT" });
      
      // Recharger les interventions
      const list = await loadInterventions();
      const id = Number(formData.interventionId);
      const updatedIntervention = list.find((d) => d.id === id) || null;
      setSelectedIntervention(updatedIntervention);
      
      // Envoyer notification au technicien
      try {
        const interventionDescription = updatedIntervention?.description || updatedIntervention?.panne || "Nouvelle intervention";
        await fetch(`http://localhost:8089/PI/PI/notifications/assignation-technicien?technicienId=${formData.technicienId}&interventionId=${formData.interventionId}&interventionDescription=${encodeURIComponent(interventionDescription)}`, {
          method: "POST",
        });
        console.log("✅ Notification envoyée au technicien");
      } catch (notifError) {
        console.warn("⚠️ Erreur notification (non bloquant):", notifError);
      }
      
      setSuccess("Technicien assigné avec succès ✅ Notification envoyée !");
    } catch (e2) {
      console.error(e2);
      setError(e2?.data?.message || `Échec de l'assignation du technicien${e2.status ? ` (HTTP ${e2.status})` : ''}.`);
    } finally { setSubmittingTechnicien(false); }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "EN_ATTENTE": return <Badge color="yellow">En attente</Badge>;
      case "EN_COURS": return <Badge color="blue">En cours</Badge>;
      case "TERMINE":
      case "TERMINEE": return <Badge color="green">Terminée</Badge>;
      default: return <Badge>—</Badge>;
    }
  };

  const countByStatus = (status) => interventions.filter((i) => i.statut === status).length;

  const renderInterventionList = () => {
    if (loading) {
      return (
        <div style={{ padding: 12 }}>
          <div style={{ height: 10, width: "65%", ...pageStyles.skeleton, marginBottom: 12 }} />
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 72, ...pageStyles.card, marginBottom: 12 }} />
          ))}
        </div>
      );
    }

    if (filteredInterventions.length === 0) {
      return (
        <div style={{
          ...pageStyles.card,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 24,
          borderStyle: "dashed",
          animation: "fadeIn .2s ease-out",
        }}>
          <FiAlertCircle size={40} style={{ color: THEME.primary[0], marginBottom: 10 }} />
          <div style={{ fontWeight: 800, marginBottom: 6, color: "#0f172a" }}>Aucune intervention</div>
          <div style={{ color: "#6b7280", marginBottom: 12, textAlign: "center" }}>Essayez d’élargir la recherche ou changez le filtre.</div>
          <button onClick={() => { setSearchTerm(""); setFilterType("ALL"); }} style={pageStyles.button(false, "blue")}>
            <FiRefreshCw /> Réinitialiser
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: 10, maxHeight: "65vh", overflowY: "auto" }}>
        {filteredInterventions.map((inter) => {
          const isSelected = formData.interventionId === inter.id.toString();
          const typeColor = inter.typeDemande === 'CURATIVE' ? THEME.danger[0] : inter.typeDemande === 'PREVENTIVE' ? THEME.success[0] : '#94a3b8';
          return (
            <div
              key={inter.id}
              onClick={() => handleInterventionClick(inter.id)}
              style={{
                ...pageStyles.card,
                background: isSelected ? "linear-gradient(180deg,#f0f9ff,#ffffff)" : pageStyles.card.background,
                border: isSelected ? `1px solid ${THEME.primary[0]}` : pageStyles.card.border,
                padding: 14,
                cursor: "pointer",
                transition: "transform .12s ease, box-shadow .12s ease, border .12s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = THEME.shadowMd; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = THEME.shadowSm; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 800, color: "#0f172a" }}>{computeTitle(inter)}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>#{inter.id}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: typeColor }} />
                <span style={{ fontSize: 12, color: '#475569' }}>{inter.typeDemande || '—'}</span>
              </div>
              {inter.description && (
                <div style={{ color: "#64748b", marginTop: 6, fontSize: 13 }}>{inter.description}</div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: 'center' }}>
                {renderStatusBadge(inter.statut)}
                <span style={{ fontSize: 12, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FiClock size={14} />
                  {new Date(inter.dateCreation ?? inter.dateDemande).toLocaleDateString("fr-FR", {
                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderInterventionDetails = () => {
    if (!selectedIntervention) return null;
    const it = selectedIntervention;
    const dateBase = it.dateCreation ?? it.dateDemande;
    const prochain = it.prochainRDV ? new Date(it.prochainRDV).toLocaleString("fr-FR") : "—";
    const urgenceTxt = typeof it.urgence === "boolean" ? (it.urgence ? "Oui" : "Non") : "—";
    const technicien = it.technicienAssigneId != null ? usersById[it.technicienAssigneId] : null;
    const techName = technicien ? `${technicien.firstName} ${technicien.lastName}` : "—";

    return (
      <div style={{ ...pageStyles.card, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, marginBottom: 10, color: "#0f172a" }}>
          <FiInfo /> Détails de l’intervention
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ color: "#64748b", fontSize: 12 }}>Titre</div>
            <div style={{ fontWeight: 700 }}>{computeTitle(it)}</div>
          </div>
          <div>
            <div style={{ color: "#64748b", fontSize: 12 }}>Statut</div>
            <div style={{ marginTop: 4 }}>{renderStatusBadge(it.statut)}</div>
          </div>
          <div>
            <div style={{ color: "#64748b", fontSize: 12 }}>Type de demande</div>
            <Badge color="blue" style={{ marginTop: 4 }}>{it.typeDemande || "—"}</Badge>
          </div>
          <div>
            <div style={{ color: "#64748b", fontSize: 12 }}>Priorité</div>
            <Badge color="purple" style={{ marginTop: 4 }}>{it.priorite || "—"}</Badge>
          </div>
          <div>
            <div style={{ color: "#64748b", fontSize: 12 }}>Date de création</div>
            <div>{dateBase ? new Date(dateBase).toLocaleString("fr-FR") : "—"}</div>
          </div>
          <div>
            <div style={{ color: "#64748b", fontSize: 12 }}>Urgence</div>
            <Badge color={it.urgence ? "red" : "gray"} style={{ marginTop: 4 }}>{urgenceTxt}</Badge>
          </div>
          {it.typeDemande === "CURATIVE" && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ color: "#64748b", fontSize: 12 }}>Panne</div>
              <div>{it.panne || "—"}</div>
            </div>
          )}
          {it.typeDemande === "PREVENTIVE" && (
            <>
              <div>
                <div style={{ color: "#64748b", fontSize: 12 }}>Fréquence</div>
                <div>{it.frequence || "—"}</div>
              </div>
              <div>
                <div style={{ color: "#64748b", fontSize: 12 }}>Prochain RDV</div>
                <div>{prochain}</div>
              </div>
            </>
          )}
          <div>
            <div style={{ color: "#64748b", fontSize: 12 }}>Testeur</div>
            <div>{it.testeurCodeGMAO || "—"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ color: "#64748b", fontSize: 12 }}>Technicien</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={techName} />
              <div style={{ fontWeight: 700 }}>{techName}</div>
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ color: "#64748b", fontSize: 12 }}>Description</div>
            <div>{it.description || "—"}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderAssignmentForm = () => (
    <>
      {/* Assigner testeur */}
      <div style={{ ...pageStyles.card, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
            <FiUserCheck /> Assigner un testeur
          </div>
          <button type="button" onClick={loadTesteurs} style={pageStyles.button(false, "gray")} title="Actualiser la liste des testeurs">
            <FiRefreshCw /> Actualiser
          </button>
        </div>
        <form onSubmit={handleAssignTester}>
          <CustomSelect
            id="testeur"
            name="testeurCodeGMAO"
            value={formData.testeurCodeGMAO}
            onChange={handleChange}
            label="Sélectionner un testeur"
            icon={FiUserCheck}
            disabled={!formData.interventionId || loadingTesteurs}
            placeholder={loadingTesteurs ? "Chargement..." : "Sélectionner un testeur"}
            options={testeurs.map((t) => ({
              value: t.codeGMAO,
              label: `${t.codeGMAO} - ${t.bancTest} (${t.atelier} ${t.ligne})${
                typeof t.nombreInterventions === "number" ? ` · ${t.nombreInterventions} inter.` : ""
              }`,
            }))}
          />
          <button
            type="submit"
            disabled={!formData.interventionId || !formData.testeurCodeGMAO || submittingTester}
            style={pageStyles.button(!formData.interventionId || !formData.testeurCodeGMAO || submittingTester, "blue")}
            onMouseDown={(e) => { e.currentTarget.style.filter = 'brightness(.95)'; }}
            onMouseUp={(e) => { e.currentTarget.style.filter = 'none'; }}
          >
            <FiUserCheck /> {submittingTester ? "Assignation..." : "Assigner le testeur"}
          </button>
        </form>
      </div>

      {/* Assigner technicien */}
      <div style={{ ...pageStyles.card, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
            <FiTool /> Assigner un technicien
          </div>
          <button type="button" onClick={loadTechniciens} style={pageStyles.button(false, "gray")} title="Actualiser la liste des techniciens">
            <FiRefreshCw /> Actualiser
          </button>
        </div>
        <form onSubmit={handleAssignTechnician}>
          {/* Sélection de date pour filtrer les techniciens disponibles */}
          <div style={{ marginBottom: 16 }}>
            <label 
              htmlFor="dateSelection"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              <FiClock size={18} style={{ marginRight: 8, color: THEME.primary[0] }} />
              Date d'intervention
            </label>
            <input
              type="date"
              id="dateSelection"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                loadTechniciens(e.target.value);
              }}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: 14,
                color: "#0f172a",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: THEME.radius,
                boxShadow: THEME.shadowSm,
              }}
            />
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
              {techniciens.length > 0 
                ? `✅ ${techniciens.length} technicien(s) disponible(s) ce jour`
                : "⚠️ Aucun technicien disponible à cette date"
              }
            </div>
          </div>
          <CustomSelect
            id="technicien"
            name="technicienId"
            value={formData.technicienId}
            onChange={handleChange}
            label="Sélectionner un technicien"
            icon={FiTool}
            disabled={!formData.interventionId || loadingTechniciens}
            placeholder={loadingTechniciens ? "Chargement..." : "Sélectionner un technicien"}
            options={techniciens.map((t) => ({
              value: t.id,
              label: `${t.firstName} ${t.lastName} – ${
                t.role === "TECHNICIEN_CURATIF" ? "Curatif" :
                t.role === "TECHNICIEN_PREVENTIF" ? "Préventif" : t.role
              }`,
            }))}
          />
          <button
            type="submit"
            disabled={!formData.interventionId || !formData.technicienId || submittingTechnicien}
            style={pageStyles.button(!formData.interventionId || !formData.technicienId || submittingTechnicien, "green")}
            onMouseDown={(e) => { e.currentTarget.style.filter = 'brightness(.95)'; }}
            onMouseUp={(e) => { e.currentTarget.style.filter = 'none'; }}
          >
            <FiTool /> {submittingTechnicien ? "Assignation..." : "Assigner le technicien"}
          </button>
        </form>
      </div>
    </>
  );

  const renderInterventionsTable = () => (
    <div style={{ ...pageStyles.card, padding: 18 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>Liste des interventions</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["ID", "Titre", "Statut", "Priorité", "Création"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {interventions.slice(0, 5).map((i) => (
              <tr
                key={i.id}
                onClick={() => { handleInterventionClick(i.id); setActiveTab("assigner"); }}
                style={{ borderBottom: "1px solid #E5E7EB", cursor: "pointer" }}
              >
                <td style={{ padding: 12, fontWeight: 700 }}>#{i.id}</td>
                <td style={{ padding: 12, color: "#6B7280" }}>{computeTitle(i)}</td>
                <td style={{ padding: 12 }}>{renderStatusBadge(i.statut)}</td>
                <td style={{ padding: 12 }}><Badge color="purple">{i.priorite || "—"}</Badge></td>
                <td style={{ padding: 12, color: "#6B7280" }}>{new Date(i.dateCreation ?? i.dateDemande).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, textAlign: "center", color: "#6B7280" }}>
        {interventions.length > 5 ? (
          <span>Affichage des 5 premières interventions sur {interventions.length}</span>
        ) : (
          <span>{interventions.length} intervention{interventions.length !== 1 ? "s" : ""} au total</span>
        )}
      </div>
    </div>
  );

  return (
    <div style={pageStyles.container}>
      {/* Hero header (aligné avec ValidationInterventions) */}
      <div style={pageStyles.hero}>
        <div style={pageStyles.heroShimmer} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 48, marginBottom: 10, animation: 'pulse 2s ease-in-out infinite' }}>🛠️</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>Assigner des Interventions</h1>
          <div style={{ opacity: 0.9, marginTop: 6 }}>Sélectionnez une intervention et assignez un testeur ou un technicien</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', marginTop: 14 }}>
            <button onClick={() => setActiveTab('assigner')} style={pageStyles.pill(activeTab === 'assigner')}>
              <FiUserPlus style={{ marginRight: 6, verticalAlign: 'middle' }} /> Assigner
            </button>
            <button onClick={() => setActiveTab('liste')} style={pageStyles.pill(activeTab === 'liste')}>
              <FiList style={{ marginRight: 6, verticalAlign: 'middle' }} /> Liste
            </button>
            <button onClick={() => { loadInterventions(); loadTesteurs(); loadTechniciens(); }} style={pageStyles.button(false, 'gray')} title="Recharger les données">
              <FiRefreshCw /> Actualiser
            </button>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <div role="switch" aria-checked={autoRefresh} onClick={() => setAutoRefresh((v) => !v)} style={pageStyles.switch(autoRefresh)}>
                <div style={pageStyles.knob(autoRefresh)} />
              </div>
              <span style={{ fontSize: 12, color: '#e2e8f0' }}>Auto 30s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu centré sur la même largeur que le hero */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Toolbar filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
        <div style={pageStyles.inputWrap}>
          <FiSearch size={16} style={pageStyles.inputIcon} />
          <input
            type="text"
            placeholder="Rechercher par #, titre, type, panne..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={pageStyles.input}
          />
          {searchTerm && (
            <FiX size={16} style={pageStyles.inputClear} onClick={() => setSearchTerm("")} />
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL','CURATIVE','PREVENTIVE'].map((t) => (
            <button key={t} onClick={() => setFilterType(t)} style={pageStyles.pill(filterType === t)}>
              {t === 'ALL' ? 'Tout' : t === 'CURATIVE' ? 'Curative' : 'Préventive'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, marginBottom: 16 }}>
        <div style={{ ...pageStyles.card, padding: 16, borderLeft: `4px solid ${THEME.primary[0]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Total des interventions</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{interventions.length}</div>
            </div>
            <div style={{ background: "#e0f2fe", width: 46, height: 46, borderRadius: 12, display: "grid", placeItems: "center" }}>
              <FiList size={22} color={THEME.primary[1]} />
            </div>
          </div>
        </div>
        <div style={{ ...pageStyles.card, padding: 16, borderLeft: `4px solid ${THEME.warning[0]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>En attente</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{countByStatus("EN_ATTENTE")}</div>
            </div>
            <div style={{ background: "#fef3c7", width: 46, height: 46, borderRadius: 12, display: "grid", placeItems: "center" }}>
              <FiClock size={22} color={THEME.warning[1]} />
            </div>
          </div>
        </div>
        <div style={{ ...pageStyles.card, padding: 16, borderLeft: `4px solid ${THEME.success[0]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>En cours</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{countByStatus("EN_COURS")}</div>
            </div>
            <div style={{ background: "#d1fae5", width: 46, height: 46, borderRadius: 12, display: "grid", placeItems: "center" }}>
              <FiRefreshCw size={22} color={THEME.success[1]} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ ...pageStyles.card, padding: 18 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12, borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
          <button
            onClick={() => setActiveTab("assigner")}
            style={{ ...pageStyles.pill(activeTab === "assigner"), display: 'inline-flex', alignItems: 'center' }}
          >
            <FiUserPlus style={{ marginRight: 6, verticalAlign: "middle" }} /> Assigner une intervention
          </button>
          <button
            onClick={() => setActiveTab("liste")}
            style={{ ...pageStyles.pill(activeTab === "liste"), display: 'inline-flex', alignItems: 'center' }}
          >
            <FiList style={{ marginRight: 6, verticalAlign: "middle" }} /> Voir toutes les interventions
          </button>
        </div>

        {activeTab === "assigner" ? (
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, color: "#0f172a" }}>Sélectionner une intervention</h3>
              {renderInterventionList()}
            </div>
            <div>
              {selectedIntervention ? (
                <div style={{ animation: "slideUp .2s ease-out" }}>
                  {renderInterventionDetails()}
                  {renderAssignmentForm()}
                  {success && (
                    <div style={{ marginTop: 10 }}>
                      <Badge color="green">{success}</Badge>
                    </div>
                  )}
                  {error && (
                    <div style={{ marginTop: 10 }}>
                      <Badge color="red">{error}</Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  ...pageStyles.card,
                  display: "grid",
                  placeItems: "center",
                  padding: 28,
                  color: "#6b7280",
                  textAlign: "center",
                }}>
                  <div>
                    <FiInfo size={40} style={{ color: "#9ca3af", marginBottom: 8 }} />
                    <div style={{ fontWeight: 700, color: "#111827" }}>Aucune intervention sélectionnée</div>
                    <div>Sélectionnez une intervention à gauche pour continuer.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          renderInterventionsTable()
        )}
      </div>
      </div>
    </div>
  );
};

export default AssignIntervention;
