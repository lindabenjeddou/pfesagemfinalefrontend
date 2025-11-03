import React, { useState, useEffect } from "react";
import { createPopper } from "@popperjs/core";
import { useSecurity } from "../../contexts/SecurityContext";

const NotificationDropdown = () => {
  const { user } = useSecurity();
  const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();

  // Charger les notifications
  useEffect(() => {
    if (user?.id && dropdownPopoverShow) {
      loadNotifications();
    }
  }, [user?.id, dropdownPopoverShow]);

  // Charger le compteur en continu
  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000); // Actualiser toutes les 30s
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8089/PI/PI/notifications/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`http://localhost:8089/PI/PI/notifications/user/${user.id}/unread/count`);
      if (response.ok) {
        const count = await response.json();
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Erreur compteur notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:8089/PI/PI/notifications/${notificationId}/read`, {
        method: "PUT",
      });
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error("Erreur marquage lu:", error);
    }
  };

  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start",
    });
    setDropdownPopoverShow(true);
  };

  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "INTERVENTION_ASSIGNED": return "🔧";
      case "INTERVENTION_CREATED": return "📋";
      case "BON_TRAVAIL_CREATED": return "🛠️";
      case "COMPONENT_ORDER": return "📦";
      case "SOUS_PROJET_CREATED": return "📁";
      default: return "ℹ️";
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date inconnue";
    
    try {
      if (dateValue instanceof Date && !isNaN(dateValue)) {
        return dateValue.toLocaleString("fr-FR");
      }
      
      if (typeof dateValue === 'number') {
        return new Date(dateValue).toLocaleString("fr-FR");
      }
      
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString("fr-FR");
        }
      }
      
      if (Array.isArray(dateValue) && dateValue.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        const date = new Date(year, month - 1, day, hour, minute, second);
        return date.toLocaleString("fr-FR");
      }
      
      return "Date invalide";
    } catch (error) {
      console.error("Erreur formatage date:", error, dateValue);
      return "Date invalide";
    }
  };

  return (
    <>
      <a
        className="text-blueGray-500 block py-1 px-3"
        href="#pablo"
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: -8,
              right: -8,
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
            }}>
              {unreadCount}
            </span>
          )}
        </div>
      </a>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? "block " : "hidden ") +
          "bg-white text-base z-50 float-left list-none text-left rounded shadow-lg mt-1"
        }
        style={{ minWidth: 320, maxWidth: 400, maxHeight: 500, overflowY: "auto" }}
      >
        <div style={{ 
          padding: "12px 16px", 
          borderBottom: "1px solid #e5e7eb",
          background: "linear-gradient(135deg, #0078d4, #003061)",
          color: "white",
          fontWeight: 700
        }}>
          🔔 Notifications ({unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune'})
        </div>
        
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
            Aucune notification
          </div>
        ) : (
          notifications.slice(0, 10).map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              style={{
                padding: 12,
                borderBottom: "1px solid #e5e7eb",
                cursor: "pointer",
                background: notif.isRead ? "white" : "#eff6ff",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? "white" : "#eff6ff"}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
                <div style={{ fontSize: 20 }}>{getNotificationIcon(notif.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: 13, 
                    color: "#0f172a",
                    marginBottom: 4
                  }}>
                    {notif.title}
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    color: "#475569",
                    lineHeight: 1.4
                  }}>
                    {notif.message}
                  </div>
                  <div style={{ 
                    fontSize: 10, 
                    color: "#94a3b8", 
                    marginTop: 6 
                  }}>
                    {formatDate(notif.createdAt)}
                  </div>
                </div>
                {!notif.isRead && (
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#3b82f6",
                    marginTop: 4
                  }} />
                )}
              </div>
            </div>
          ))
        )}

        {notifications.length > 10 && (
          <div style={{ 
            padding: "8px 16px", 
            textAlign: "center",
            borderTop: "1px solid #e5e7eb",
            fontSize: 12,
            color: "#64748b"
          }}>
            + {notifications.length - 10} autres notifications
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;
