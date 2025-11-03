import React, { useState, useEffect } from "react";

/* ============================== INSTALL PWA BUTTON ============================== */
export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Vérifier si l'app est déjà installée
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallButton(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("✅ Utilisateur a accepté l'installation");
      setShowInstallButton(false);
    } else {
      console.log("❌ Utilisateur a refusé l'installation");
    }

    setDeferredPrompt(null);
  };

  if (!showInstallButton) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        animation: "slideInUp 0.3s ease-out",
      }}
    >
      <style>
        {`
          @keyframes slideInUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @media (max-width: 640px) {
            .install-pwa-container {
              left: 16px !important;
              right: 16px !important;
              bottom: 16px !important;
            }
          }
        `}
      </style>
      <div
        className="install-pwa-container"
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
          padding: "16px 20px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          maxWidth: 350,
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
          <div style={{ fontSize: 32 }}>📱</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              Installer l'application
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>
              Accédez rapidement à vos interventions depuis votre écran d'accueil
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleInstallClick}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "white",
                  color: "#1e3a8a",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                ✅ Installer
              </button>
              <button
                onClick={() => setShowInstallButton(false)}
                style={{
                  padding: "10px 16px",
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
