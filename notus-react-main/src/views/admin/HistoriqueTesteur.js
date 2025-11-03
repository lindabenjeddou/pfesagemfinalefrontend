import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import jsPDF from "jspdf";
import "jspdf-autotable";

const BASE_URL = "http://localhost:8089/PI";

async function fetchJson(path) {
  const res = await fetch(`${BASE_URL}/${path}`);
  if (!res.ok) throw new Error("Erreur API");
  return res.json();
}

const THEME = {
  primary: ["#003061", "#0078d4"],
  success: ["#10b981", "#059669"],
  warning: ["#f59e0b", "#d97706"],
  danger: ["#ef4444", "#dc2626"],
};

export default function HistoriqueTesteur() {
  const { t } = useLanguage();
  const [testeurs, setTesteurs] = useState([]);
  const [selectedTesteur, setSelectedTesteur] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTesteurs();
    loadInterventions();
  }, []);

  const loadTesteurs = async () => {
    try {
      const data = await fetchJson("PI/testeurs/all");
      setTesteurs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadInterventions = async () => {
    try {
      setLoading(true);
      const data = await fetchJson("demandes/recuperer/all");
      setInterventions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const historique = useMemo(() => {
    if (!selectedTesteur) return null;

    const interventionsTesteur = interventions.filter(
      i => i.testeurCodeGMAO === selectedTesteur.codeGMAO
    );

    console.log("📊 Calcul historique pour:", selectedTesteur.codeGMAO);
    console.log("📋 Interventions trouvées:", interventionsTesteur.length);

    const total = interventionsTesteur.length;
    const terminee = interventionsTesteur.filter(i => 
      String(i.statut) === "TERMINEE" || String(i.statut) === "TERMINE"
    ).length;

    // MTBF (Mean Time Between Failures) - en jours
    const pannes = interventionsTesteur
      .filter(i => i.typeDemande === "CURATIVE" && i.dateDemande)
      .sort((a, b) => new Date(a.dateDemande) - new Date(b.dateDemande));
    
    console.log("🔧 Pannes curatives trouvées:", pannes.length);
    
    let mtbf = null;
    let mtbfMessage = "";
    
    if (pannes.length < 2) {
      mtbfMessage = pannes.length === 0 
        ? "Aucune panne enregistrée" 
        : "Minimum 2 pannes requises";
    } else {
      let totalDays = 0;
      for (let i = 1; i < pannes.length; i++) {
        const diff = new Date(pannes[i].dateDemande) - new Date(pannes[i-1].dateDemande);
        const days = diff / (1000 * 60 * 60 * 24);
        console.log(`  Intervalle ${i}: ${days.toFixed(1)} jours`);
        totalDays += days;
      }
      mtbf = (totalDays / (pannes.length - 1)).toFixed(1);
      console.log("✅ MTBF calculé:", mtbf);
    }

    // MTTR (Mean Time To Repair) - en jours ou heures
    const interventionsAvecDates = interventionsTesteur
      .filter(i => i.dateDemande && i.dateValidation);
    
    console.log("📅 Interventions avec dates de validation:", interventionsAvecDates.length);
    
    let mttr = null;
    let mttrMessage = "";
    let mttrUnit = "jours";
    
    if (interventionsAvecDates.length === 0) {
      mttrMessage = "Aucune date de validation";
    } else {
      const tempsMoyen = interventionsAvecDates.map(i => {
        const debut = new Date(i.dateDemande);
        const fin = new Date(i.dateValidation);
        const days = (fin - debut) / (1000 * 60 * 60 * 24);
        console.log(`  Durée intervention #${i.id}: ${days.toFixed(1)} jours`);
        return days;
      });
      
      const moyenneJours = tempsMoyen.reduce((a, b) => a + b, 0) / tempsMoyen.length;
      
      // Si < 1 jour, afficher en heures
      if (moyenneJours < 1) {
        mttr = (moyenneJours * 24).toFixed(1);
        mttrUnit = "heures";
      } else {
        mttr = moyenneJours.toFixed(1);
        mttrUnit = "jours";
      }
      
      console.log("✅ MTTR calculé:", mttr, mttrUnit);
    }

    // Coût estimé (basé sur nombre d'interventions * coût moyen fictif)
    const coutMoyen = 500; // EUR par intervention
    const coutTotal = (total * coutMoyen).toFixed(0);

    // Prédiction prochaine panne (basé sur MTBF)
    let prochainePanne = null;
    if (pannes.length > 0 && mtbf && mtbf > 0) {
      const dernierePanne = new Date(pannes[pannes.length - 1].dateDemande);
      prochainePanne = new Date(dernierePanne.getTime() + parseFloat(mtbf) * 24 * 60 * 60 * 1000);
    }

    // Vérifier si prédiction est proche (< 7 jours)
    const alerteProcheNow = prochainePanne && 
      ((prochainePanne - new Date()) / (1000 * 60 * 60 * 24)) < 7;

    return {
      total,
      terminee,
      mtbf,
      mtbfMessage,
      mttr,
      mttrUnit,
      mttrMessage,
      coutTotal,
      prochainePanne,
      alerteProche: alerteProcheNow,
      pannesCount: pannes.length,
      interventionsTesteur: interventionsTesteur.sort(
        (a, b) => new Date(b.dateDemande || 0) - new Date(a.dateDemande || 0)
      ),
      pannes: pannes // Pour le graphique
    };
  }, [selectedTesteur, interventions]);

  const exportToPDF = () => {
    if (!historique) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // En-tête
    doc.setFillColor(0, 48, 97);
    doc.rect(0, 0, pageWidth, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("HISTORIQUE TESTEUR", 14, 15);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${selectedTesteur.codeGMAO} - ${selectedTesteur.atelier} / ${selectedTesteur.ligne}`, 14, 25);
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 32);

    let yPos = 45;

    // KPIs
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INDICATEURS CLÉS", 14, yPos);
    yPos += 10;

    const kpis = [
      [`Total interventions`, `${historique.total} (${historique.terminee} terminées)`],
      [`MTBF`, historique.mtbf ? `${historique.mtbf} jours entre pannes` : historique.mtbfMessage],
      [`MTTR`, historique.mttr ? `${historique.mttr} ${historique.mttrUnit}` : historique.mttrMessage],
      [`Coût total`, `${historique.coutTotal}€`],
    ];

    doc.autoTable({
      startY: yPos,
      head: [["Indicateur", "Valeur"]],
      body: kpis,
      theme: "striped",
      headStyles: { fillColor: [0, 120, 212], textColor: 255, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Prédiction
    if (historique.prochainePanne) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(146, 64, 14);
      doc.text("⚠ PRÉDICTION PROCHAINE PANNE", 14, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Date estimée: ${historique.prochainePanne.toLocaleDateString("fr-FR")}`, 14, yPos);
      yPos += 15;
    }

    // Historique des interventions
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("HISTORIQUE DES INTERVENTIONS", 14, yPos);
    yPos += 10;

    const interventionsData = historique.interventionsTesteur.map(i => [
      `#${i.id}`,
      new Date(i.dateDemande).toLocaleDateString("fr-FR"),
      i.typeDemande || "—",
      (i.description || i.panne || "—").substring(0, 40),
      i.statut || "—"
    ]);

    doc.autoTable({
      startY: yPos,
      head: [["#", "Date", "Type", "Description", "Statut"]],
      body: interventionsData,
      theme: "grid",
      headStyles: { fillColor: [0, 48, 97], textColor: 255, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 80 },
        4: { cellWidth: 30 },
      },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `Historique Testeur ${selectedTesteur.codeGMAO} - Page ${i}/${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`historique-${selectedTesteur.codeGMAO}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ padding: 24, background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${THEME.primary[0]}, ${THEME.primary[1]})`,
        color: "#fff",
        borderRadius: 20,
        padding: 32,
        marginBottom: 24,
        boxShadow: "0 16px 40px rgba(0,48,97,0.2)"
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Historique Testeur</h1>
        <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
          Analyse MTBF/MTTR et historique complet par équipement
        </p>
      </div>

      {/* Info Box */}
      <div style={{
        background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        border: "2px solid #3b82f6",
        boxShadow: "0 8px 22px rgba(59,130,246,0.2)"
      }}>
        <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
          <div style={{ fontSize: 24 }}>ℹ️</div>
          <div>
            <div style={{ fontWeight: 900, color: "#1e40af", fontSize: 16, marginBottom: 6 }}>
              Comment utiliser cette page
            </div>
            <div style={{ color: "#1e3a8a", fontSize: 13, lineHeight: 1.6 }}>
              <strong>MTBF</strong> : Requiert minimum 2 pannes curatives avec dates • 
              <strong>MTTR</strong> : Requiert interventions avec date de validation • 
              Sélectionnez un testeur pour voir son historique complet
            </div>
          </div>
        </div>
      </div>

      {/* Sélection testeur */}
      <div style={{
        background: "rgba(255,255,255,0.96)",
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        boxShadow: "0 8px 22px rgba(0,48,97,0.12)"
      }}>
        <label style={{ display: "block", fontWeight: 700, marginBottom: 12, color: "#334155" }}>
          Sélectionner un testeur/équipement
        </label>
        <select
          value={selectedTesteur?.codeGMAO || ""}
          onChange={(e) => {
            const testeur = testeurs.find(t => t.codeGMAO === e.target.value);
            setSelectedTesteur(testeur);
          }}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "2px solid #e2e8f0",
            fontSize: 14,
            fontWeight: 600,
            background: "#fff"
          }}
        >
          <option value="">-- Choisir un testeur --</option>
          {testeurs.map(t => (
            <option key={t.codeGMAO} value={t.codeGMAO}>
              {t.codeGMAO} - {t.atelier} / {t.ligne} / {t.bancTest}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
          Chargement des données...
        </div>
      ) : selectedTesteur && historique ? (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div style={{
              background: "rgba(255,255,255,0.96)",
              borderRadius: 16,
              padding: 20,
              borderLeft: `4px solid ${THEME.primary[1]}`,
              boxShadow: "0 8px 22px rgba(0,48,97,0.12)"
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Total interventions</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: THEME.primary[1], marginTop: 8 }}>
                {historique.total}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                {historique.terminee} terminées
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.96)",
              borderRadius: 16,
              padding: 20,
              borderLeft: `4px solid ${THEME.success[0]}`,
              boxShadow: "0 8px 22px rgba(0,48,97,0.12)"
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>
                MTBF (Mean Time Between Failures)
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: historique.mtbf ? THEME.success[1] : "#94a3b8", marginTop: 8 }}>
                {historique.mtbf || "—"}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                {historique.mtbf 
                  ? `jours entre pannes (${historique.pannesCount} pannes)` 
                  : historique.mtbfMessage
                }
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.96)",
              borderRadius: 16,
              padding: 20,
              borderLeft: `4px solid ${THEME.warning[0]}`,
              boxShadow: "0 8px 22px rgba(0,48,97,0.12)"
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>
                MTTR (Mean Time To Repair)
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: historique.mttr ? THEME.warning[1] : "#94a3b8", marginTop: 8 }}>
                {historique.mttr || "—"}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                {historique.mttr 
                  ? `${historique.mttrUnit} de réparation moyenne` 
                  : historique.mttrMessage
                }
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.96)",
              borderRadius: 16,
              padding: 20,
              borderLeft: `4px solid ${THEME.danger[0]}`,
              boxShadow: "0 8px 22px rgba(0,48,97,0.12)"
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Coût total estimé</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: THEME.danger[1], marginTop: 8 }}>
                {historique.coutTotal}€
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                maintenance
              </div>
            </div>
          </div>

          {/* Prédiction */}
          {historique.prochainePanne && (
            <div style={{
              background: historique.alerteProche 
                ? "linear-gradient(135deg, #fee2e2, #fecaca)" 
                : "linear-gradient(135deg, #fef3c7, #fde68a)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              border: historique.alerteProche ? "2px solid #ef4444" : "2px solid #f59e0b",
              boxShadow: historique.alerteProche 
                ? "0 8px 22px rgba(239,68,68,0.3)" 
                : "0 8px 22px rgba(245,158,11,0.2)",
              animation: historique.alerteProche ? "pulse 2s ease-in-out infinite" : "none"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 32 }}>
                  {historique.alerteProche ? "🚨" : "⚠️"}
                </div>
                <div>
                  <div style={{ 
                    fontWeight: 900, 
                    color: historique.alerteProche ? "#991b1b" : "#92400e", 
                    fontSize: 16 
                  }}>
                    {historique.alerteProche ? "⚡ ALERTE : Panne imminente !" : "Prochaine panne estimée"}
                  </div>
                  <div style={{ color: historique.alerteProche ? "#7f1d1d" : "#78350f", marginTop: 4 }}>
                    {historique.prochainePanne.toLocaleDateString("fr-FR")} (basé sur MTBF de {historique.mtbf} jours)
                    {historique.alerteProche && (
                      <span style={{ fontWeight: 700, marginLeft: 8 }}>
                        • Dans {Math.ceil((historique.prochainePanne - new Date()) / (1000 * 60 * 60 * 24))} jour(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <style>{`
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.02); opacity: 0.95; }
                }
              `}</style>
            </div>
          )}

          {/* Graphique d'évolution des pannes */}
          {historique.pannes && historique.pannes.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.96)",
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
              boxShadow: "0 8px 22px rgba(0,48,97,0.12)"
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16, color: "#0f172a" }}>
                📈 Évolution des pannes dans le temps
              </h2>
              <div style={{ position: "relative", height: 200, display: "flex", alignItems: "flex-end", gap: 8 }}>
                {historique.pannes.map((panne, idx) => {
                  const maxHeight = 160;
                  const barHeight = (maxHeight / historique.pannes.length) * (idx + 1) * 0.6 + 40;
                  const date = new Date(panne.dateDemande);
                  
                  return (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div
                        style={{
                          width: "100%",
                          height: barHeight,
                          background: `linear-gradient(135deg, ${THEME.danger[0]}, ${THEME.danger[1]})`,
                          borderRadius: "8px 8px 0 0",
                          position: "relative",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(239,68,68,0.2)"
                        }}
                        title={`Panne ${idx + 1}: ${date.toLocaleDateString("fr-FR")}\n${panne.panne || panne.description}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 8px 20px rgba(239,68,68,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.2)";
                        }}
                      >
                        <div style={{
                          position: "absolute",
                          top: -30,
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: 20,
                          animation: `float 3s ease-in-out infinite ${idx * 0.5}s`
                        }}>
                          🔧
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: 11, 
                        color: "#64748b", 
                        marginTop: 8, 
                        textAlign: "center",
                        fontWeight: 600
                      }}>
                        {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      </div>
                      {idx < historique.pannes.length - 1 && (
                        <div style={{
                          fontSize: 10,
                          color: THEME.success[1],
                          marginTop: 2,
                          fontWeight: 700
                        }}>
                          +{Math.round((new Date(historique.pannes[idx + 1].dateDemande) - date) / (1000 * 60 * 60 * 24))}j
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ 
                marginTop: 16, 
                padding: 12, 
                background: "#f1f5f9", 
                borderRadius: 12,
                fontSize: 12,
                color: "#475569"
              }}>
                <strong>Lecture :</strong> Chaque barre représente une panne. Les intervalles en vert indiquent le nombre de jours entre deux pannes consécutives.
              </div>
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateX(-50%) translateY(0px); }
                  50% { transform: translateX(-50%) translateY(-6px); }
                }
              `}</style>
            </div>
          )}

          {/* Liste interventions */}
          <div style={{
            background: "rgba(255,255,255,0.96)",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 8px 22px rgba(0,48,97,0.12)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: 0 }}>
                Historique des interventions ({historique.interventionsTesteur.length})
              </h2>
              <button
                onClick={exportToPDF}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(16,185,129,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.3)";
                }}
              >
                <span style={{ fontSize: 18 }}>📄</span>
                Exporter en PDF
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: 12, textAlign: "left", fontWeight: 800, color: "#6b7280" }}>#</th>
                    <th style={{ padding: 12, textAlign: "left", fontWeight: 800, color: "#6b7280" }}>Date</th>
                    <th style={{ padding: 12, textAlign: "left", fontWeight: 800, color: "#6b7280" }}>Type</th>
                    <th style={{ padding: 12, textAlign: "left", fontWeight: 800, color: "#6b7280" }}>Description</th>
                    <th style={{ padding: 12, textAlign: "left", fontWeight: 800, color: "#6b7280" }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.interventionsTesteur.map(i => (
                    <tr key={i.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: 12, fontWeight: 700 }}>#{i.id}</td>
                      <td style={{ padding: 12, color: "#64748b" }}>
                        {new Date(i.dateDemande).toLocaleDateString("fr-FR")}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 800,
                          background: i.typeDemande === "CURATIVE" ? "#fee2e2" : "#dcfce7",
                          color: i.typeDemande === "CURATIVE" ? "#b91c1c" : "#166534"
                        }}>
                          {i.typeDemande}
                        </span>
                      </td>
                      <td style={{ padding: 12, color: "#334155" }}>
                        {i.description || i.panne || "—"}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 800,
                          background: i.statut === "TERMINEE" ? "#dcfce7" : "#dbeafe",
                          color: i.statut === "TERMINEE" ? "#166534" : "#1d4ed8"
                        }}>
                          {i.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div style={{
          background: "rgba(255,255,255,0.96)",
          borderRadius: 20,
          padding: 40,
          textAlign: "center",
          color: "#64748b"
        }}>
          Sélectionnez un testeur pour voir son historique
        </div>
      )}
    </div>
  );
}
