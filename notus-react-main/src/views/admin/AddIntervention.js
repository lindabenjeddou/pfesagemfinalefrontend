// src/views/admin/AddIntervention.js
import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSecurity } from "../../contexts/SecurityContext";
import api from "../../utils/api";

// ---- Design system (mêmes tokens que AssignIntervention) ----
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
    maxWidth: 1000,
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
  section: { padding: "2.5rem 2rem" },
  h3: {
    fontSize: 24,
    fontWeight: 700,
    color: "#003061",
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  label: {
    display: "block",
    fontSize: 16,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 14,
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
    padding: 14,
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
    padding: 14,
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
      padding: "14px 28px",
      background: disabled
        ? "linear-gradient(135deg, #9ca3af, #6b7280)"
        : `linear-gradient(135deg, ${t[0]}, ${t[1]})`,
      color: tone === "gray" ? "#0f172a" : "#fff",
      border: "none",
      borderRadius: 16,
      fontSize: 16,
      fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all .2s ease",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 8px 25px rgba(0, 48, 97, 0.25)",
    };
  },
  pill: (active, colorOn = THEME.primary[0]) => ({
    padding: "14px",
    borderRadius: 16,
    border: `2px solid ${active ? colorOn : "#e5e7eb"}`,
    background: active ? "linear-gradient(135deg, #dbeafe, #bfdbfe)" : "#fff",
    cursor: "pointer",
    transition: "all .2s ease",
    textAlign: "center",
    boxShadow: active ? "0 8px 25px rgba(59, 130, 246, .15)" : THEME.shadowSm,
  }),
};

// ---- Global animations (injected) ----
const GlobalAnimations = () => (
  <style>{`
    @keyframes shimmer { 0%{background-position:-200px 0} 100%{background-position:calc(200px + 100%) 0} }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
    @keyframes bounceIn {
      0%{opacity:0; transform:scale(.3)}
      50%{opacity:1; transform:scale(1.05)}
      70%{transform:scale(.95)}
      100%{opacity:1; transform:scale(1)}
    }
  `}</style>
);

export default function AddIntervention() {
  const { t } = useLanguage();
  const { user, hasPermission, PERMISSIONS } = useSecurity();

  // Permissions
  const canAccess = hasPermission(PERMISSIONS.CREATE_INTERVENTION);

  // State
  const [type, setType] = useState("CURATIVE");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("EN_ATTENTE");
  const [priorite, setPriorite] = useState("MOYENNE");

  const [userDetails, setUserDetails] = useState(null);

  // Testeurs
  const [testeurs, setTesteurs] = useState([]);
  const [testeurCodeGmao, setTesteurCodeGmao] = useState("");

  // Curative
  const [panne, setPanne] = useState("");
  const [urgence, setUrgence] = useState(false);

  // Préventive
  const [frequence, setFrequence] = useState("");
  const [prochainRDV, setProchainRDV] = useState("");

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch infos user (fallback + /user/all)
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const defaultFallbackData = {
        firstName: user?.firstName || "Prénom",
        lastName: user?.lastName || "Nom",
        email: user?.email || "email@exemple.com",
        role: user?.role || "UTILISATEUR",
        phoneNumber: user?.phoneNumber || "+216 XX XXX XXX",
        adress: user?.adress || "Adresse",
      };
      setUserDetails(defaultFallbackData);

      const res = await fetch("http://localhost:8089/PI/user/all", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const users = await res.json();
        const currentUser = users.find((u) => u.id === (user?.userId || user?.id));
        if (currentUser) setUserDetails(currentUser);
      }
    } catch (e) {
      // on garde le fallback
      // console.error(e);
    }
  };
  useEffect(() => {
    fetchUserDetails();
    fetchTesteurs();
  }, [user]);

  // Fetch testeurs (même approche qu'AssignIntervention)
  const fetchTesteurs = async () => {
    try {
      console.log("🔍 Chargement des testeurs...");
      
      // Appel sans authentification (comme AssignIntervention)
      const res = await fetch("http://localhost:8089/PI/PI/testeurs/all", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      console.log("📡 Réponse API testeurs - Status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("✅ Testeurs récupérés:", data);
        console.log("📊 Nombre de testeurs:", data?.length || 0);
        
        if (Array.isArray(data)) {
          setTesteurs(data);
          console.log("✅ State testeurs mis à jour avec", data.length, "testeurs");
        } else {
          console.warn("⚠️ Format de réponse invalide:", data);
          setTesteurs([]);
        }
      } else {
        console.error("❌ Erreur API testeurs - Status:", res.status);
        const errorText = await res.text();
        console.error("Détails erreur:", errorText);
      }
    } catch (e) {
      console.error("❌ Erreur lors du chargement des testeurs:", e);
      console.error("Stack:", e.stack);
    }
  };

  // Guard: not allowed
  if (!canAccess) {
    return (
      <div style={pageStyles.container}>
        <GlobalAnimations />
        <div style={{ ...pageStyles.card, maxWidth: 560, margin: "60px auto", padding: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
            Accès non autorisé
          </h3>
          <p style={{ color: "#6b7280" }}>
            Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  // Guard: not logged
  if (!user) {
    return (
      <div style={pageStyles.container}>
        <GlobalAnimations />
        <div style={{ ...pageStyles.card, maxWidth: 560, margin: "60px auto", padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
            Connexion requise
          </h3>
          <p style={{ color: "#6b7280" }}>
            Vous devez être connecté pour créer une intervention.
          </p>
        </div>
      </div>
    );
  }

  // Validation
  const validateForm = () => {
    if (!description) {
      setMessage(t("intervention.error.enter_description", "⚠️ Veuillez entrer une description."));
      return false;
    }
    if (!testeurCodeGmao) {
      setMessage(t("intervention.error.select_testeur", "⚠️ Veuillez sélectionner un testeur (Code GMAO)."));
      return false;
    }
    if (type === "CURATIVE" && !panne) {
      setMessage(
        t(
          "intervention.error.enter_failure",
          "⚠️ Veuillez entrer une panne pour l'intervention curative."
        )
      );
      return false;
    }
    if (type === "PREVENTIVE" && (!frequence || !prochainRDV)) {
      setMessage(
        t(
          "intervention.error.missing_preventive",
          "⚠️ Veuillez entrer la fréquence et le prochain RDV pour l'intervention préventive."
        )
      );
      return false;
    }
    return true;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage("");

    const demandeurId = user?.userId || user?.id;

    // ⚠️ On garde la structure que tu utilises déjà (type_demande)
    const interventionData = {
      type_demande: type,
      demandeurId,
      description,
      priorite,
      statut,
      testeurCodeGmao: testeurCodeGmao || null,
      ...(type === "CURATIVE"
        ? { panne, urgence }
        : { frequence, prochainRDV }),
    };

    try {
      const response = await api.post("/demandes/create", interventionData);
      if (response?.data) {
        setShowSuccess(true);
        setMessage("✅ Intervention créée avec succès !");
        
        // Envoyer notification au chef de secteur
        try {
          const interventionDesc = description || panne || "Nouvelle intervention";
          await fetch(`http://localhost:8089/PI/PI/notifications/nouvelle-intervention?interventionId=${response.data.id}&interventionDescription=${encodeURIComponent(interventionDesc)}`, {
            method: "POST",
          });
          console.log("✅ Notification envoyée au chef de secteur");
        } catch (notifError) {
          console.warn("⚠️ Erreur notification chef secteur (non bloquant):", notifError);
        }
        
        resetForm();
        setTimeout(() => setShowSuccess(false), 2500);
      }
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de la création de l'intervention";
      if (error.response) {
        const { status, data } = error.response;
        if (status === 403) errorMessage = "Accès refusé. Vous n'avez pas les permissions nécessaires.";
        else if (status === 401) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
          window.location.href = "/auth/login";
          return;
        } else if (data && data.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        errorMessage = "Pas de réponse du serveur. Vérifiez votre connexion internet.";
      }
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDescription("");
    setStatut("EN_ATTENTE");
    setPanne("");
    setUrgence(false);
    setFrequence("");
    setProchainRDV("");
    setPriorite("MOYENNE");
    setType("CURATIVE");
    setTesteurCodeGmao("");
  };

  // ---- UI ----
  return (
    <div style={pageStyles.container}>
      <GlobalAnimations />

      {/* HERO */}
      <div style={pageStyles.hero}>
        <div style={pageStyles.heroShimmer} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 48, marginBottom: 10, animation: "pulse 2s ease-in-out infinite" }}>
            📋
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>
            {t("intervention.add_title", "Nouvelle Intervention")}
          </h1>
          <p style={{ marginTop: 8, opacity: 0.9 }}>
            {t("intervention.add_subtitle", "Créez une nouvelle demande d'intervention Sagemcom")}
          </p>
        </div>
      </div>

      {/* CARD */}
      <div style={{ ...pageStyles.card, maxWidth: 1000, margin: "0 auto" }}>
        {/* Notifications */}
        <div style={pageStyles.section}>
          {message && (
            <div
              style={{
                marginBottom: 24,
                padding: "12px 16px",
                borderRadius: 16,
                background: message.includes("✅")
                  ? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
                  : "linear-gradient(135deg, #fee2e2, #fecaca)",
                border: `1px solid ${message.includes("✅") ? "#10b981" : "#ef4444"}`,
                color: message.includes("✅") ? "#065f46" : "#dc2626",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>{message.includes("✅") ? "✅" : "⚠️"}</span>
              {message}
            </div>
          )}

          {/* Modal succès */}
          {showSuccess && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  padding: 32,
                  textAlign: "center",
                  animation: "bounceIn .6s ease-out",
                  boxShadow: "0 25px 50px rgba(0,0,0,.25)",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 10, animation: "pulse 1s ease-in-out infinite" }}>
                  🎉
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: THEME.success[1], marginBottom: 6 }}>
                  Intervention Créée !
                </h2>
                <p style={{ color: "#6b7280" }}>Votre demande a été enregistrée avec succès</p>
              </div>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            {/* Type d’intervention */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={pageStyles.h3}>🔧 {t("intervention.type_title", "Type d'Intervention")}</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {["CURATIVE", "PREVENTIVE"].map((opt) => (
                  <div
                    key={opt}
                    role="button"
                    onClick={() => setType(opt)}
                    style={{
                      ...pageStyles.pill(type === opt, THEME.primary[0]),
                      padding: 24,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                  >
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{opt === "CURATIVE" ? "🔧" : "⚙️"}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: type === opt ? "#1e40af" : "#374151" }}>
                      {opt === "CURATIVE"
                        ? t("intervention.type_curative", "Curative")
                        : t("intervention.type_preventive", "Préventive")}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
                      {opt === "CURATIVE"
                        ? t("intervention.type_curative_desc", "Réparation suite à une panne")
                        : t("intervention.type_preventive_desc", "Maintenance programmée")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations générales */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={pageStyles.h3}>📋 {t("intervention.general_info", "Informations Générales")}</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                  marginBottom: 24,
                }}
              >
                {/* Demandeur */}
                <div>
                  <label style={pageStyles.label}>👤 {t("intervention.requester", "Demandeur")}</label>
                  <div
                    style={{
                      padding: 16,
                      border: "2px solid rgba(0,48,97,.2)",
                      borderRadius: 12,
                      background: "rgba(248,250,252,.9)",
                      color: "#374151",
                      boxShadow: THEME.shadowSm,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>🏢</span>
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        {userDetails
                          ? `${userDetails.firstName || userDetails.firstname || ""} ${
                              userDetails.lastName || userDetails.lastname || ""
                            }`.trim() || "Nom complet indisponible"
                          : "Chargement..."}
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {userDetails?.email || "Email indisponible"} — {userDetails?.role || "Rôle indisponible"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priorité */}
                <div>
                  <label style={pageStyles.label}>🚨 {t("interventions.priority_field", "Priorité")}</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {[
                      { value: "BASSE", label: t("interventions.priority_low", "Basse"), color: "#10b981", emoji: "🟢" },
                      { value: "MOYENNE", label: t("interventions.priority_normal", "Moyenne"), color: "#f59e0b", emoji: "🟡" },
                      { value: "HAUTE", label: t("interventions.priority_high", "Haute"), color: "#ef4444", emoji: "🔴" },
                    ].map((p) => (
                      <div
                        key={p.value}
                        onClick={() => setPriorite(p.value)}
                        role="button"
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          border: `2px solid ${priorite === p.value ? p.color : "#e5e7eb"}`,
                          background: priorite === p.value ? `${p.color}20` : "#fff",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all .2s ease",
                          boxShadow: THEME.shadowSm,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                      >
                        <div style={{ fontSize: 18, marginBottom: 4 }}>{p.emoji}</div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: priorite === p.value ? p.color : "#374151",
                          }}
                        >
                          {p.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 24 }}>
                <label style={pageStyles.label}>
                  📄 {t("interventions.description_field", "Description")} *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t(
                    "interventions.description_placeholder",
                    "Décrivez en détail l'intervention nécessaire..."
                  )}
                  rows={4}
                  style={pageStyles.textarea}
                  required
                />
              </div>

              {/* Testeur (Code GMAO) */}
              <div style={{ marginBottom: 24 }}>
                <label style={pageStyles.label}>
                  🔬 {t("intervention.testeur", "Testeur (Code GMAO)")} *
                  <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>
                    ({testeurs.length} testeur{testeurs.length > 1 ? 's' : ''} disponible{testeurs.length > 1 ? 's' : ''})
                  </span>
                </label>
                <select
                  value={testeurCodeGmao}
                  onChange={(e) => {
                    console.log("🔬 Testeur sélectionné:", e.target.value);
                    setTesteurCodeGmao(e.target.value);
                  }}
                  style={pageStyles.select}
                  required
                >
                  <option value="">
                    {t("intervention.testeur.select", "-- Sélectionner un testeur --")}
                  </option>
                  {testeurs.map((testeur) => {
                    console.log("📋 Rendering testeur:", testeur);
                    return (
                      <option key={testeur.codeGMAO} value={testeur.codeGMAO}>
                        {testeur.codeGMAO} - {testeur.atelier} / {testeur.ligne} / {testeur.bancTest}
                      </option>
                    );
                  })}
                </select>
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>💡</span>
                  <span>
                    {t(
                      "intervention.testeur.hint",
                      "Sélectionnez l'équipement/testeur concerné par cette intervention (obligatoire)"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Détails spécifiques */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={pageStyles.h3}>
                {type === "CURATIVE"
                  ? `⚠️ ${t("intervention.failure_details", "Détails de la Panne")}`
                  : `🔄 ${t("intervention.maintenance_details", "Détails de la Maintenance")}`}
              </h3>

              {type === "CURATIVE" ? (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={pageStyles.label}>
                      ⚠️ {t("intervention.failure", "Description de la Panne")} *
                    </label>
                    <textarea
                      value={panne}
                      onChange={(e) => setPanne(e.target.value)}
                      placeholder={t("intervention.failure.placeholder", "Décrivez la panne observée...")}
                      rows={3}
                      style={pageStyles.textarea}
                      required
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                      borderRadius: 12,
                      border: "1px solid #f59e0b",
                      boxShadow: THEME.shadowSm,
                    }}
                  >
                    <input
                      type="checkbox"
                      id="urgence"
                      checked={urgence}
                      onChange={(e) => setUrgence(e.target.checked)}
                      style={{ width: 20, height: 20, accentColor: "#f59e0b" }}
                    />
                    <label htmlFor="urgence" style={{ fontSize: 16, fontWeight: 700, color: "#92400e", cursor: "pointer" }}>
                      🚨 {t("intervention.urgent", "Intervention urgente")}
                    </label>
                  </div>
                </>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={pageStyles.label}>🔄 {t("intervention.frequency", "Fréquence")} *</label>
                    <select
                      value={frequence}
                      onChange={(e) => setFrequence(e.target.value)}
                      style={pageStyles.select}
                      required
                    >
                      <option value="">{t("intervention.frequency.select", "Sélectionner")}</option>
                      <option value="Hebdomadaire">{t("intervention.frequency.weekly", "Hebdomadaire")}</option>
                      <option value="Mensuelle">{t("intervention.frequency.monthly", "Mensuelle")}</option>
                      <option value="Trimestrielle">{t("intervention.frequency.quarterly", "Trimestrielle")}</option>
                      <option value="Semestrielle">{t("intervention.frequency.biannual", "Semestrielle")}</option>
                      <option value="Annuelle">{t("intervention.frequency.annual", "Annuelle")}</option>
                    </select>
                  </div>
                  <div>
                    <label style={pageStyles.label}>📅 {t("intervention.next_appointment", "Prochain RDV")} *</label>
                    <input
                      type="date"
                      value={prochainRDV}
                      onChange={(e) => setProchainRDV(e.target.value)}
                      style={pageStyles.input}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer submit */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={pageStyles.button(isSubmitting, "blue")}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.transform = "none";
                }}
              >
                {isSubmitting ? (
                  <>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        border: "2px solid rgba(255,255,255,.35)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    {t("intervention.creating", "Création en cours...")}
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 18 }}>📋</span>
                    {t("intervention.create_button", "Créer l'Intervention")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
