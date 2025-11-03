import React, { useEffect, useState } from "react";
import { useSecurity } from "../../contexts/SecurityContext";

/* ============================== MOBILE STYLES ============================== */
const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    paddingBottom: 20,
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
    position: "relative",
  },
  unreadIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "#ef4444",
    border: "2px solid white",
  },
  priorityBadge: (priority) => {
    const colors = {
      HIGH: { bg: "#fee2e2", color: "#b91c1c" },
      NORMAL: { bg: "#dbeafe", color: "#1e40af" },
      LOW: { bg: "#f3f4f6", color: "#6b7280" },
    };
    const c = colors[priority] || colors.NORMAL;
    return {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 700,
      background: c.bg,
      color: c.color,
      marginRight: 6,
    };
  },
  button: (bg, disabled = false) => ({
    width: "100%",
    padding: "12px 16px",
    background: disabled ? "#9ca3af" : bg,
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    marginTop: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  }),
  filterTab: (active) => ({
    flex: 1,
    padding: "10px 16px",
    background: active ? "white" : "transparent",
    color: active ? "#1e3a8a" : "white",
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  }),
};

/* ============================== API HELPERS ============================== */
const BASE_URL = "http://localhost:8089/PI";
const apiUrl = (path) => {
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
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
};

/* ============================== DATE HELPERS ============================== */
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR");
};

/* ============================== MAIN COMPONENT ============================== */
export default function NotificationsMobile() {
  const { user } = useSecurity();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL | UNREAD | READ
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const userId = user?.userId || user?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchJson(`notifications/user/${userId}`);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
      showMessage("❌ Erreur de chargement", "error");
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await fetchJson(`notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
      );
      showMessage("✅ Notification marquée comme lue", "success");
    } catch (error) {
      console.error("Erreur:", error);
      showMessage("❌ Erreur lors de la mise à jour", "error");
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Supprimer cette notification ?")) return;
    try {
      await fetchJson(`notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showMessage("✅ Notification supprimée", "success");
    } catch (error) {
      console.error("Erreur:", error);
      showMessage("❌ Erreur lors de la suppression", "error");
    }
  };

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(""), 3000);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return n.status === "UNREAD";
    if (filter === "READ") return n.status === "READ";
    return true;
  });

  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

  /* --------------------- RENDER --------------------- */
  if (loading) {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={{ fontSize: 20, fontWeight: 800, textAlign: "center" }}>
            ⚙️ Chargement...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          🔔 Notifications
        </div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>
          {unreadCount > 0 ? `${unreadCount} non lue(s)` : "Aucune nouvelle notification"}
        </div>
      </div>

      {/* Refresh Button */}
      <div style={{ padding: "12px 16px" }}>
        <button
          onClick={refreshData}
          disabled={refreshing}
          style={{
            ...styles.button("linear-gradient(135deg, #3b82f6, #2563eb)", refreshing),
            width: "auto",
            padding: "8px 16px",
            fontSize: 13,
          }}
        >
          {refreshing ? "⏳ Actualisation..." : "🔄 Actualiser"}
        </button>
      </div>

      {/* Filters */}
      <div style={{ padding: "0 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.2)", borderRadius: 16, padding: 4 }}>
          <button onClick={() => setFilter("ALL")} style={styles.filterTab(filter === "ALL")}>
            📋 Toutes ({notifications.length})
          </button>
          <button onClick={() => setFilter("UNREAD")} style={styles.filterTab(filter === "UNREAD")}>
            🔴 Non lues ({unreadCount})
          </button>
          <button onClick={() => setFilter("READ")} style={styles.filterTab(filter === "READ")}>
            ✅ Lues ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            ...styles.card,
            background:
              message.type === "success"
                ? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
                : "linear-gradient(135deg, #fee2e2, #fecaca)",
            color: message.type === "success" ? "#065f46" : "#b91c1c",
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Notifications List */}
      <div>
        {filteredNotifications.length === 0 ? (
          <div style={{ ...styles.card, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, color: "#6b7280", fontWeight: 600 }}>
              Aucune notification
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div key={notif.id} style={styles.card}>
              {notif.status === "UNREAD" && <div style={styles.unreadIndicator} />}

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 15 }}>
                  {notif.titre || "Notification"}
                </div>
                <span style={styles.priorityBadge(notif.priority || "NORMAL")}>
                  {notif.priority === "HIGH" ? "🔥" : notif.priority === "LOW" ? "📌" : "⚡"}
                </span>
              </div>

              {/* Message */}
              <div
                style={{
                  color: "#374151",
                  fontSize: 14,
                  marginBottom: 10,
                  lineHeight: 1.5,
                }}
              >
                {notif.message || "Aucun message"}
              </div>

              {/* Time */}
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>
                🕐 {formatRelativeTime(notif.dateCreation)}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                {notif.status === "UNREAD" && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    style={{
                      ...styles.button("linear-gradient(135deg, #10b981, #059669)"),
                      flex: 1,
                    }}
                  >
                    ✅ Marquer lue
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  style={{
                    ...styles.button("linear-gradient(135deg, #ef4444, #dc2626)"),
                    flex: 1,
                  }}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
