import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useSecurity } from "../contexts/SecurityContext";

/* ============================== THEME / STYLES ============================== */
const THEME = {
  radius: 16,
  shadowSm: "0 6px 16px rgba(2, 6, 23, .06)",
  shadowMd: "0 16px 36px rgba(2, 6, 23, .14)",
  primary: ["#0078d4", "#003061"],
  success: ["#10b981", "#059669"],
  warning: ["#f59e0b", "#d97706"],
  danger: ["#ef4444", "#dc2626"],
};

const page = {
  wrap: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 50%,#cbd5e1 100%)",
    padding: 24,
  },
  hero: {
    background: "linear-gradient(135deg,#003061,#0078d4)",
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
    background: "rgba(255,255,255,0.94)",
    backdropFilter: "saturate(140%) blur(10px)",
    border: "1px solid rgba(226,232,240,.9)",
    borderRadius: 24,
    boxShadow: THEME.shadowMd,
    overflow: "hidden",
  },
  section: { padding: "1.5rem" },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 14,
    background: "white",
    outline: "none",
    transition: "all .2s ease",
    boxShadow: THEME.shadowSm,
  },
  select: {
    padding: "10px 12px",
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
        ? "linear-gradient(135deg,#9ca3af,#6b7280)"
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

const GlobalAnimations = () => (
  <style>{`
    @keyframes shimmer { 0%{background-position:-200px 0} 100%{background-position:calc(200px + 100%) 0} }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    @keyframes spin { from {transform:rotate(0)} to {transform:rotate(360deg)} }
  `}</style>
);

/* ============================== HELPERS ============================== */
const BASE_URL = "http://localhost:8089/PI";
const apiUrl = (p = "") => {
  const base = BASE_URL.replace(/\/+$/, "");
  let path = String(p || "").replace(/^\/+/, "");
  const ctx = base.split("/").filter(Boolean).pop(); // "PI"
  if (ctx && new RegExp(`^${ctx}/`, "i").test(path)) path = path.replace(new RegExp(`^${ctx}/`, "i"), "");
  return `${base}/${path}`;
};

async function fetchJson(path, { method = "GET", body, headers = {} } = {}) {
  const url = apiUrl(path);
  const h = {
    Accept: "application/json",
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };
  const res = await fetch(url, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    const err = new Error(msg || res.statusText);
    err.status = res.status;
    err.url = url;
    throw err;
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

const asDate = (val) => {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  const d = Number.isFinite(n) ? new Date(n) : new Date(String(val));
  return isNaN(d.getTime()) ? null : d;
};
const fmtDate = (v) => {
  const d = asDate(v);
  return d ? d.toLocaleDateString("fr-FR") : "—";
};
const fmtDateTime = (v) => {
  const d = asDate(v);
  return d ? d.toLocaleString("fr-FR") : "—";
};

// Lundi de la semaine d’une date
const mondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // 0..6 (0 Dimanche)
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

/* ============================== UI Badges ============================== */
const chip = (txt, bg, color) => ({
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: bg,
  color,
});

const getPriorityChip = (p) => {
  const v = String(p || "NORMALE").toUpperCase();
  if (v === "URGENTE" || v === "CRITIQUE") return chip(`📊 ${v}`, "#fde68a", "#92400e");
  if (v === "HAUTE") return chip("📊 HAUTE", "#fee2e2", "#b91c1c");
  if (v === "MOYENNE") return chip("📊 MOYENNE", "#fef3c7", "#a16207");
  return chip("📊 NORMALE", "#e0f2fe", "#1d4ed8");
};

const getTypeChip = (type) =>
  String(type) === "CURATIVE"
    ? chip("🔧 Curative", "#fee2e2", "#b91c1c")
    : chip("🛠️ Préventive", "#dcfce7", "#166534");

const getStatusChip = (s) => {
  const v = String(s || "").toUpperCase();
  if (v === "EN_ATTENTE") return chip("⏳ EN ATTENTE", "#fef3c7", "#a16207");
  if (v === "EN_COURS") return chip("🔄 EN COURS", "#dbeafe", "#1d4ed8");
  if (v === "REFUSEE") return chip("❌ REFUSÉE", "#fee2e2", "#b91c1c");
  if (v === "TERMINEE" || v === "TERMINE") return chip("✅ TERMINÉE", "#dcfce7", "#166534");
  return chip(v || "—", "#e5e7eb", "#374151");
};

/* ============================== MAIN COMPONENT ============================== */
export default function TechnicianSchedule() {
  const { t } = useLanguage();
  const { user } = useSecurity();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [all, setAll] = useState([]);
  const [users, setUsers] = useState([]);
  const [weekStart, setWeekStart] = useState(() => mondayOfWeek(new Date()));
  const [activeTab, setActiveTab] = useState("assigned"); // 'assigned' | 'requested'
  const [message, setMessage] = useState("");

  const userId = user?.userId || user?.id;

  /* --------------------- LOAD DATA --------------------- */
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setErr("Utilisateur non connecté");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const [demandes, usersApi] = await Promise.all([
        fetchJson("demandes/recuperer/all"),
        fetchJson("user/all").catch(() => []),
      ]);
      setAll(Array.isArray(demandes) ? demandes : []);
      setUsers(Array.isArray(usersApi) ? usersApi : []);
    } catch (e) {
      console.error(e);
      setErr("Impossible de charger les données.");
      setAll([]);
    } finally {
      setLoading(false);
    }
  }

  /* --------------------- DERIVED SETS --------------------- */
  const assigned = useMemo(
    () => all.filter((d) => Number(d?.technicienAssigneId) === Number(userId)),
    [all, userId]
  );

  const requested = useMemo(
    () => all.filter((d) => Number(d?.demandeurId) === Number(userId)),
    [all, userId]
  );

  // Evénements pour l’emploi du temps (basé sur assigned)
  // Date prioritaire: prochainRDV (préventive) > dateDemande > dateCreation
  const assignedEvents = useMemo(() => {
    return assigned.map((d) => {
      const date =
        asDate(d?.prochainRDV) ||
        asDate(d?.dateDemande) ||
        asDate(d?.dateCreation) ||
        null;
      return {
        id: d.id,
        date,
        raw: d,
      };
    });
  }, [assigned]);

  // Semaine courante (7 jours)
  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      d.setHours(0, 0, 0, 0);
      arr.push(d);
    }
    return arr;
  }, [weekStart]);

  // Evénements par jour
  const eventsByDay = useMemo(() => {
    const map = {};
    days.forEach((d) => {
      const key = d.toDateString();
      map[key] = [];
    });
    assignedEvents.forEach((ev) => {
      if (!ev.date) return;
      const k = new Date(ev.date);
      k.setHours(0, 0, 0, 0);
      const key = k.toDateString();
      if (map[key]) map[key].push(ev);
    });
    // tri par heure si disponible (ici tout en journée → tri par date brute)
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (a.date || 0) - (b.date || 0))
    );
    return map;
  }, [days, assignedEvents]);

  /* --------------------- ACTIONS --------------------- */
  async function markDone(id) {
    if (!id) return;
    try {
      setMessage("");
      await fetchJson(`demandes/update/${id}`, {
        method: "PUT",
        body: { statut: "TERMINEE" },
      });
      await load();
      setMessage("✅ Intervention marquée comme terminée.");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setMessage("❌ Erreur lors de la mise à jour.");
      setTimeout(() => setMessage(""), 4000);
    }
  }

  /* --------------------- UTILS UI --------------------- */
  const nameById = (id) => {
    const u = users.find((x) => Number(x?.id) === Number(id));
    if (!u) return "—";
    const f = u.firstName || u.firstname || "";
    const l = u.lastName || u.lastname || "";
    return `${f} ${l}`.trim() || u.email || "—";
  };

  /* --------------------- RENDER --------------------- */
  if (loading) {
    return (
      <div style={page.wrap}>
        <GlobalAnimations />
        <div style={{ ...page.card, maxWidth: 560, margin: "80px auto", padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 10, animation: "pulse 2s ease-in-out infinite" }}>⚙️</div>
          <div style={{ fontSize: 18, color: "#003061", fontWeight: 800 }}>Chargement de votre emploi du temps...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={page.wrap}>
      <GlobalAnimations />

      {/* HERO */}
      <div style={page.hero}>
        <div style={page.heroShimmer} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 48, marginBottom: 10, animation: "pulse 2s ease-in-out infinite" }}>🔧</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>
            {t("techSchedule.title", "Mon Emploi du Temps")}
          </h1>
          <div style={{ opacity: 0.9, marginTop: 6 }}>
            {t("techSchedule.subtitle", "Interventions assignées & demandes associées")}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ ...page.card, maxWidth: 1200, margin: "0 auto" }}>
        {/* Toolbar haut */}
        <div style={{ ...page.section, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("assigned")}
              style={{
                ...page.button(false, activeTab === "assigned" ? "blue" : "gray"),
              }}
            >
              📅 Emploi du temps (assigné) — {assigned.length}
            </button>
            <button
              onClick={() => setActiveTab("requested")}
              style={{
                ...page.button(false, activeTab === "requested" ? "blue" : "gray"),
              }}
            >
              📨 Mes demandes (créées) — {requested.length}
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              style={page.button(false, "gray")}
            >
              ⬅️ Semaine précédente
            </button>
            <button
              onClick={() => setWeekStart(mondayOfWeek(new Date()))}
              style={page.button(false, "gray")}
            >
              📆 Cette semaine
            </button>
            <button
              onClick={() => setWeekStart(addDays(weekStart, +7))}
              style={page.button(false, "gray")}
            >
              Semaine suivante ➡️
            </button>
            <button
              onClick={load}
              style={page.button(false, "blue")}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              🔄 Rafraîchir
            </button>
          </div>
        </div>

        {message && (
          <div
            style={{
              margin: "0 24px 12px",
              padding: "10px 14px",
              borderRadius: 16,
              background: message.includes("✅")
                ? "linear-gradient(135deg,#d1fae5,#a7f3d0)"
                : "linear-gradient(135deg,#fee2e2,#fecaca)",
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

        {/* PANELS */}
        {activeTab === "assigned" ? (
          <div style={{ ...page.section, paddingTop: 0 }}>
            {/* Bandeau infos semaine */}
            <div
              style={{
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 800, color: "#374151" }}>
                Semaine du {fmtDate(weekStart)} au {fmtDate(addDays(weekStart, 6))}
              </div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                {assignedEvents.filter((e) => e.date).length} événement(s) planifié(s)
              </div>
            </div>

            {/* GRILLE 7 jours */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(160px, 1fr))",
                gap: 12,
                overflowX: "auto",
              }}
            >
              {days.map((d) => {
                const key = d.toDateString();
                const evts = eventsByDay[key] || [];
                const isToday =
                  new Date().toDateString() === d.toDateString();
                return (
                  <div
                    key={key}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: 12,
                      minHeight: 160,
                      boxShadow: THEME.shadowSm,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#374151" }}>
                        {d.toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </div>
                      {isToday ? (
                        <span style={{ ...chip("Aujourd’hui", "#dbeafe", "#1d4ed8") }} />
                      ) : (
                        <span style={{ ...chip(`${evts.length} evt.`, "#f3f4f6", "#374151") }} />
                      )}
                    </div>

                    {evts.length === 0 ? (
                      <div
                        style={{
                          color: "#9ca3af",
                          fontSize: 13,
                          textAlign: "center",
                          border: "2px dashed #e5e7eb",
                          borderRadius: 12,
                          padding: 12,
                        }}
                      >
                        Aucun évènement
                      </div>
                    ) : (
                      evts.map((ev) => {
                        const d = ev.raw;
                        return (
                          <div
                            key={ev.id}
                            style={{
                              border: "1px solid #e5e7eb",
                              borderRadius: 12,
                              padding: 10,
                              marginBottom: 8,
                              background: "linear-gradient(180deg,#ffffff,#f8fafc)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                              <div style={{ fontWeight: 700, color: "#003061" }}>
                                {d.titre || d.taskDescription || "Intervention"}
                              </div>
                              <div style={{ whiteSpace: "nowrap", color: "#6b7280", fontSize: 12 }}>
                                {fmtDateTime(d.prochainRDV || d.dateDemande || d.dateCreation)}
                              </div>
                            </div>
                            <div style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 8px" }}>
                              {d.description || "—"}
                            </div>

                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                              <span style={getTypeChip(d.typeDemande)} />
                              <span style={getPriorityChip(d.priorite)} />
                              <span style={getStatusChip(d.statut)} />
                            </div>

                            {(String(d.statut).toUpperCase() !== "TERMINEE" &&
                              String(d.statut).toUpperCase() !== "TERMINE") && (
                              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <button
                                  onClick={() => markDone(d.id)}
                                  style={page.button(false, "green")}
                                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                                >
                                  ✅ Marquer terminé
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ ...page.section, paddingTop: 0 }}>
            {/* Liste des demandes créées par l'utilisateur (associées) */}
            <h3 style={{ marginTop: 0, color: "#374151" }}>
              📨 Mes demandes créées ({requested.length})
            </h3>

            {requested.length === 0 ? (
              <div
                style={{
                  color: "#6b7280",
                  textAlign: "center",
                  padding: "2rem",
                  border: "2px dashed #e5e7eb",
                  borderRadius: 16,
                }}
              >
                Aucune demande créée.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px,1fr))", gap: 12 }}>
                {requested.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: 16,
                      boxShadow: THEME.shadowSm,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 800, color: "#003061" }}>
                        {d.titre || d.taskDescription || "Demande d’intervention"}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: 12 }}>
                        Créée : {fmtDateTime(d.dateCreation || d.dateDemande)}
                      </div>
                    </div>

                    <div style={{ color: "#6b7280", fontSize: 13, margin: "6px 0 10px" }}>
                      {d.description || "—"}
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={getTypeChip(d.typeDemande)} />
                      <span style={getPriorityChip(d.priorite)} />
                      <span style={getStatusChip(d.statut)} />
                      <span style={chip("👤 Assigné à : " + (d.technicienAssigneId ? nameById(d.technicienAssigneId) : "—"), "#f3f4f6", "#374151")} />
                    </div>

                    {(String(d.statut).toUpperCase() !== "TERMINEE" &&
                      String(d.statut).toUpperCase() !== "TERMINE") && Number(d.technicienAssigneId) === Number(userId) && (
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => markDone(d.id)}
                          style={page.button(false, "green")}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                        >
                          ✅ Marquer terminé
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ERREUR BAS DE PAGE (si besoin) */}
      {err && (
        <div style={{ ...page.card, maxWidth: 560, margin: "16px auto 0", padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
          <div style={{ color: "#dc2626", fontWeight: 800, marginBottom: 6 }}>Erreur</div>
          <div style={{ color: "#6b7280" }}>{err}</div>
        </div>
      )}
    </div>
  );
}
