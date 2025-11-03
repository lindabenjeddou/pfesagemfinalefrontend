import React, { useEffect, useState, useRef } from "react";
import AdvancedPagination from "components/Pagination/AdvancedPagination.js";

/**
 * Front compatible backend:
 *  - GET  http://localhost:8089/PI/demandes/recuperer/all
 *  - PUT  http://localhost:8089/PI/demandes/confirmer/{id}
 * (aucun header Authorization requis)
 */

const API_HOST = "http://localhost:8089";
const API_CTX = "/PI";
const apiUrl = (path) => `${API_HOST}${API_CTX}${path}`;

const formatDate = (ts) => (ts ? new Date(ts).toLocaleString("fr-FR") : "—");

export default function ValidationInterventions() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const didFetch = useRef(false); // évite double fetch en dev (React.StrictMode)

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(apiUrl("/demandes/recuperer/all"), {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des interventions");
      const data = await res.json();
      setInterventions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Impossible de charger les interventions.");
      setInterventions([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmerIntervention = async (id) => {
    if (!window.confirm("Confirmer cette intervention ?")) return;
    try {
      setMessage("");
      const res = await fetch(apiUrl(`/demandes/confirmer/${id}`), {
        method: "PUT",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Échec de la confirmation");
      const updated = await res.json();

      // maj locale: on remplace l'item par la version renvoyée par l'API
      setInterventions((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...updated } : it))
      );

      setMessage("✅ Intervention confirmée");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setMessage("❌ Erreur lors de la confirmation");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // UI état de chargement
  if (loading) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
        ⏳ Chargement des interventions...
      </div>
    );
  }

  // UI erreur
  if (error) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center" }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>⚠️</div>
        <div style={{ color: "#dc2626", fontWeight: 700, marginBottom: 8 }}>Erreur de chargement</div>
        <div style={{ color: "#6b7280", marginBottom: 16 }}>{error}</div>
        <button
          onClick={fetchInterventions}
          style={{ padding: "10px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f1f5f9,#e2e8f0,#cbd5e1)", padding: "2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#003061,#0078d4)", borderRadius: 24, padding: "2rem", color: "white", textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", margin: 0 }}>🛡️ Validation des Interventions</h1>
          <div style={{ opacity: 0.9, marginTop: 6 }}>
            Confirmez les demandes d’intervention reçues
          </div>
        </div>

        {/* Feedback */}
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

        {/* Liste + pagination */}
        <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 16, padding: "1.5rem", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#374151" }}>
            📋 Liste des interventions ({interventions.length})
          </h3>

          <AdvancedPagination
            data={interventions}
            itemsPerPageOptions={[5, 10, 20, 50]}
            defaultItemsPerPage={10}
            searchFields={["description", "typeDemande", "priorite", "statut"]}
            sortFields={[
              { key: "dateDemande", label: "Date de demande" },
              { key: "description", label: "Description" },
              { key: "priorite", label: "Priorité" },
              { key: "statut", label: "Statut" },
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
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 240 }}>
                    <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 6 }}>
                      📅 Demande : {formatDate(it.dateDemande)}
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
                          fontWeight: 600,
                          background:
                            it.priorite === "HAUTE"
                              ? "#fee2e2"
                              : it.priorite === "MOYENNE"
                              ? "#fef3c7"
                              : "#e0f2fe",
                          color:
                            it.priorite === "HAUTE"
                              ? "#b91c1c"
                              : it.priorite === "MOYENNE"
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
                    </div>
                  </div>

                  <div style={{ textAlign: "right", minWidth: 220 }}>
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
                      Créée : {formatDate(it.dateCreation)}
                      <br />
                      Validée : {formatDate(it.dateValidation)}
                      {it.prochainRDV && (
                        <>
                          <br />
                          Prochain RDV : {formatDate(it.prochainRDV)}
                        </>
                      )}
                    </div>

                    {it.statut === "EN_ATTENTE" && (
                      <div style={{ marginTop: 10 }}>
                        <button
                          onClick={() => confirmerIntervention(it.id)}
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
