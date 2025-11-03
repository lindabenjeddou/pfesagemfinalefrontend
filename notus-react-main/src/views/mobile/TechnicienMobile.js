import React, { useEffect, useState, useMemo } from "react";
import { useSecurity } from "../../contexts/SecurityContext";
import { useLanguage } from "../../contexts/LanguageContext";

/* ============================== MOBILE OPTIMIZED STYLES ============================== */
const mobileStyles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    paddingBottom: 70, // Space for bottom nav
  },
  header: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    padding: "20px 16px",
    color: "white",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  card: {
    background: "white",
    borderRadius: 16,
    margin: "12px 16px",
    padding: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  badge: (bg, color) => ({
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 700,
    background: bg,
    color: color,
    marginRight: 6,
    marginBottom: 6,
  }),
  button: (bg, disabled = false) => ({
    width: "100%",
    padding: "12px 16px",
    background: disabled ? "#9ca3af" : bg,
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    marginTop: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  }),
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "white",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-around",
    padding: "12px 0",
    boxShadow: "0 -4px 12px rgba(0,0,0,0.08)",
    zIndex: 100,
  },
  navItem: (active) => ({
    flex: 1,
    textAlign: "center",
    padding: "8px 0",
    cursor: "pointer",
    color: active ? "#3b82f6" : "#6b7280",
    fontWeight: active ? 700 : 400,
    fontSize: 12,
    transition: "all 0.2s",
  }),
  filterChip: (active) => ({
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    background: active ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#f3f4f6",
    color: active ? "white" : "#374151",
    border: `2px solid ${active ? "#3b82f6" : "#e5e7eb"}`,
    marginRight: 8,
    marginBottom: 8,
    cursor: "pointer",
    transition: "all 0.2s",
  }),
};

/* ============================== API HELPERS ============================== */
const BASE_URL = "http://localhost:8089/PI";
const apiUrl = (path = "") => {
  const base = BASE_URL.replace(/\/+$/, "");
  let p = String(path || "").replace(/^\/+/, "");
  const ctx = base.split("/").filter(Boolean).pop();
  if (ctx && new RegExp(`^${ctx}/`, "i").test(p)) 
    p = p.replace(new RegExp(`^${ctx}/`, "i"), "");
  return `${base}/${p}`;
};

const fetchJson = async (path, options = {}) => {
  const url = apiUrl(path);
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };
  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
};

/* ============================== DATE HELPERS ============================== */
const asDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const fmtDate = (val) => {
  const d = asDate(val);
  return d ? d.toLocaleDateString("fr-FR") : "—";
};

const fmtTime = (val) => {
  const d = asDate(val);
  return d ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—";
};

const isToday = (val) => {
  const d = asDate(val);
  if (!d) return false;
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

const isThisWeek = (val) => {
  const d = asDate(val);
  if (!d) return false;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return d >= weekStart && d < weekEnd;
};

/* ============================== BADGE HELPERS ============================== */
const getStatusBadge = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "EN_ATTENTE") return { bg: "#fef3c7", color: "#92400e", text: "⏳ EN ATTENTE" };
  if (s === "EN_COURS") return { bg: "#dbeafe", color: "#1e40af", text: "🔄 EN COURS" };
  if (s === "TERMINEE" || s === "TERMINE") return { bg: "#dcfce7", color: "#166534", text: "✅ TERMINÉE" };
  if (s === "REFUSEE") return { bg: "#fee2e2", color: "#b91c1c", text: "❌ REFUSÉE" };
  return { bg: "#f3f4f6", color: "#374151", text: s || "—" };
};

const getPriorityBadge = (priority) => {
  const p = String(priority || "NORMALE").toUpperCase();
  if (p === "URGENTE" || p === "CRITIQUE") return { bg: "#fee2e2", color: "#b91c1c", text: "🔥 URGENT" };
  if (p === "HAUTE") return { bg: "#fed7aa", color: "#c2410c", text: "⚡ HAUTE" };
  if (p === "MOYENNE") return { bg: "#fef3c7", color: "#a16207", text: "⚠️ MOYENNE" };
  return { bg: "#e0f2fe", color: "#0369a1", text: "📌 NORMALE" };
};

const getTypeBadge = (type) => {
  return String(type) === "CURATIVE"
    ? { bg: "#fee2e2", color: "#b91c1c", text: "🔧 Curative" }
    : { bg: "#dcfce7", color: "#166534", text: "🛠️ Préventive" };
};

/* ============================== MAIN COMPONENT ============================== */
export default function TechnicienMobile() {
  const { user } = useSecurity();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState("assigned"); // assigned | requested | today
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.userId || user?.id;

  /* --------------------- LOAD DATA --------------------- */
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchJson("demandes/recuperer/all");
      setInterventions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement:", error);
      showMessage("❌ Erreur de chargement", "error");
      setInterventions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
  };

  /* --------------------- FILTERED DATA --------------------- */
  const assigned = useMemo(
    () => interventions.filter((i) => Number(i?.technicienAssigneId) === Number(userId)),
    [interventions, userId]
  );

  const requested = useMemo(
    () => interventions.filter((i) => Number(i?.demandeurId) === Number(userId)),
    [interventions, userId]
  );

  const todayItems = useMemo(
    () =>
      assigned.filter((i) => {
        const date = i?.prochainRDV || i?.dateDemande || i?.dateCreation;
        return isToday(date);
      }),
    [assigned]
  );

  const currentList = useMemo(() => {
    let list = [];
    if (activeTab === "assigned") list = assigned;
    else if (activeTab === "requested") list = requested;
    else if (activeTab === "today") list = todayItems;

    if (filterStatus === "ALL") return list;
    return list.filter((i) => String(i?.statut).toUpperCase() === filterStatus);
  }, [activeTab, filterStatus, assigned, requested, todayItems]);

  /* --------------------- ACTIONS --------------------- */
  const markDone = async (id) => {
    try {
      showMessage("⏳ Mise à jour en cours...", "info");
      await fetchJson(`demandes/update/${id}`, {
        method: "PUT",
        body: { statut: "TERMINEE" },
      });
      await loadData();
      showMessage("✅ Intervention terminée !", "success");
    } catch (error) {
      console.error("Erreur:", error);
      showMessage("❌ Erreur lors de la mise à jour", "error");
    }
  };

  const showMessage = (msg, type = "info") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(""), 3000);
  };

  /* --------------------- RENDER HELPERS --------------------- */
  const renderIntervention = (item) => {
    const status = getStatusBadge(item.statut);
    const priority = getPriorityBadge(item.priorite);
    const type = getTypeBadge(item.typeDemande);
    const date = item.prochainRDV || item.dateDemande || item.dateCreation;
    const canComplete =
      String(item.statut).toUpperCase() !== "TERMINEE" &&
      String(item.statut).toUpperCase() !== "TERMINE";

    return (
      <div key={item.id} style={mobileStyles.card}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 16 }}>
            {item.titre || item.taskDescription || "Intervention"}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>#{item.id}</div>
        </div>

        {/* Description */}
        <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 10, lineHeight: 1.5 }}>
          {item.description || "Aucune description"}
        </div>

        {/* Badges */}
        <div style={{ marginBottom: 10 }}>
          <span style={mobileStyles.badge(type.bg, type.color)}>{type.text}</span>
          <span style={mobileStyles.badge(priority.bg, priority.color)}>{priority.text}</span>
          <span style={mobileStyles.badge(status.bg, status.color)}>{status.text}</span>
        </div>

        {/* Date & Time */}
        <div style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 13, color: "#6b7280" }}>
          <div>📅 {fmtDate(date)}</div>
          <div>🕐 {fmtTime(date)}</div>
        </div>

        {/* Actions */}
        {canComplete && activeTab === "assigned" && (
          <button
            onClick={() => markDone(item.id)}
            style={mobileStyles.button("linear-gradient(135deg, #10b981, #059669)")}
          >
            ✅ Marquer comme terminée
          </button>
        )}
      </div>
    );
  };

  /* --------------------- MAIN RENDER --------------------- */
  if (loading) {
    return (
      <div style={mobileStyles.app}>
        <div style={mobileStyles.header}>
          <div style={{ fontSize: 20, fontWeight: 800, textAlign: "center" }}>
            ⚙️ Chargement...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={mobileStyles.app}>
      {/* Header */}
      <div style={mobileStyles.header}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          🔧 {user?.firstName || "Technicien"}
        </div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>
          {activeTab === "assigned" && `${assigned.length} intervention(s) assignée(s)`}
          {activeTab === "requested" && `${requested.length} demande(s) créée(s)`}
          {activeTab === "today" && `${todayItems.length} intervention(s) aujourd'hui`}
        </div>
      </div>

      {/* Refresh Button */}
      <div style={{ padding: "12px 16px" }}>
        <button
          onClick={refreshData}
          disabled={refreshing}
          style={{
            ...mobileStyles.button("linear-gradient(135deg, #3b82f6, #2563eb)", refreshing),
            width: "auto",
            padding: "8px 16px",
            fontSize: 13,
          }}
        >
          {refreshing ? "⏳ Actualisation..." : "🔄 Actualiser"}
        </button>
      </div>

      {/* Filters */}
      <div style={{ padding: "0 16px", marginBottom: 12, overflowX: "auto", whiteSpace: "nowrap" }}>
        {["ALL", "EN_ATTENTE", "EN_COURS", "TERMINEE"].map((status) => (
          <span
            key={status}
            onClick={() => setFilterStatus(status)}
            style={mobileStyles.filterChip(filterStatus === status)}
          >
            {status === "ALL" && "📋 Tous"}
            {status === "EN_ATTENTE" && "⏳ En attente"}
            {status === "EN_COURS" && "🔄 En cours"}
            {status === "TERMINEE" && "✅ Terminées"}
          </span>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            ...mobileStyles.card,
            background:
              message.type === "success"
                ? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
                : message.type === "error"
                ? "linear-gradient(135deg, #fee2e2, #fecaca)"
                : "linear-gradient(135deg, #dbeafe, #bfdbfe)",
            color:
              message.type === "success"
                ? "#065f46"
                : message.type === "error"
                ? "#b91c1c"
                : "#1e40af",
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Content */}
      <div style={{ paddingBottom: 80 }}>
        {currentList.length === 0 ? (
          <div style={{ ...mobileStyles.card, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, color: "#6b7280", fontWeight: 600 }}>
              Aucune intervention
            </div>
          </div>
        ) : (
          currentList.map(renderIntervention)
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={mobileStyles.bottomNav}>
        <div
          onClick={() => setActiveTab("assigned")}
          style={mobileStyles.navItem(activeTab === "assigned")}
        >
          <div style={{ fontSize: 24, marginBottom: 4 }}>📋</div>
          <div>Assignées</div>
          <div style={{ fontSize: 10, fontWeight: 600 }}>({assigned.length})</div>
        </div>

        <div
          onClick={() => setActiveTab("today")}
          style={mobileStyles.navItem(activeTab === "today")}
        >
          <div style={{ fontSize: 24, marginBottom: 4 }}>📅</div>
          <div>Aujourd'hui</div>
          <div style={{ fontSize: 10, fontWeight: 600 }}>({todayItems.length})</div>
        </div>

        <div
          onClick={() => setActiveTab("requested")}
          style={mobileStyles.navItem(activeTab === "requested")}
        >
          <div style={{ fontSize: 24, marginBottom: 4 }}>📨</div>
          <div>Mes demandes</div>
          <div style={{ fontSize: 10, fontWeight: 600 }}>({requested.length})</div>
        </div>
      </div>
    </div>
  );
}
