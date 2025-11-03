// src/views/admin/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
// ⚠️ On n'utilise pas Chart.js ici. Si tu veux garder Chart.js pour d'autres pages :
// import "chart.js/auto";

/* =========================
   Endpoints API
   ========================= */
const API_INTERVENTIONS = "http://localhost:8089/PI/demandes/recuperer/all";
const API_TESTEURS = "http://localhost:8089/PI/PI/testeurs/all";
const API_COMPONENTS = "http://localhost:8089/PI/PI/component/all";

/* =========================
   Helpers Auth (si besoin)
   ========================= */
const getToken = () =>
  localStorage.getItem("sagemcom_token") ||
  localStorage.getItem("token") ||
  "";
const authHeaders = () => ({
  Accept: "*/*",
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

/* =========================
   Outils / maths / date
   ========================= */
const toJsDate = (val) => {
  if (val == null) return null;
  if (Array.isArray(val)) {
    const [y, m = 1, d = 1, hh = 0, mm = 0, ss = 0, ms = 0] = val;
    return new Date(y, m - 1, d, hh, mm, ss, ms);
  }
  const n = Number(val);
  return isNaN(n) ? new Date(val) : new Date(n);
};
const fmt = (d) => (d ? d.toLocaleDateString("fr-FR") : "—");
const diffHours = (a, b) => {
  if (!a || !b) return null;
  return Math.max(0, (b.getTime() - a.getTime()) / 36e5);
};
const isBetweenDays = (d, days) => {
  if (!d) return false;
  const now = new Date();
  const from = new Date(now.getTime() - days * 86400000);
  return d >= from && d <= now;
};
const sum = (arr) => arr.reduce((acc, v) => acc + (Number(v) || 0), 0);
const avg = (arr) => (arr.length ? sum(arr) / arr.length : 0);
const median = (arr) => {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
const percentile = (arr, p = 0.9) => {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const idx = Math.min(a.length - 1, Math.max(0, Math.round(p * (a.length - 1))));
  return a[idx];
};

/* =========================
   Petits composants UI
   ========================= */
function KpiCard({ title, value, suffix, accent = "#003061", sub, icon }) {
  return (
    <div style={styles.kpiCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <div style={{ ...styles.kpiTitle }}>{title}</div>
          <div style={{ ...styles.kpiValue, color: accent }}>
            {value}
            {suffix ? <span style={styles.kpiSuffix}>{suffix}</span> : null}
          </div>
        </div>
        <div style={{ ...styles.kpiIcon, color: accent }}>{icon}</div>
      </div>
      {sub ? <div style={styles.kpiSub}>{sub}</div> : null}
    </div>
  );
}

function ProgressBar({ value, color = "#16a34a" }) {
  return (
    <div style={styles.progressWrap}>
      <div style={{ ...styles.progressFill, width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

function MiniBarChart({ data, height = 80, color = "#2563eb" }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barW = `${100 / data.length}%`;
  return (
    <div style={{ display: "flex", alignItems: "end", gap: 6, height }}>
      {data.map((d, i) => (
        <div key={i} title={`${d.label}: ${d.value}`} style={{ flex: `0 0 ${barW}`, background: "transparent" }}>
          <div
            style={{
              height: `${(d.value / max) * 100}%`,
              background: color,
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,.12)",
            }}
          />
          <div style={{ fontSize: 10, textAlign: "center", marginTop: 6, color: "#64748b" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ points, height = 60, stroke = "#10b981" }) {
  if (!points || points.length === 0) return null;
  const w = 220;
  const h = height;
  const max = Math.max(1, ...points);
  const min = Math.min(0, ...points);
  const span = Math.max(1, max - min);
  const stepX = w / Math.max(1, points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / span) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h}>
      <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" />
    </svg>
  );
}

/* =========================
   Dashboard principal
   ========================= */
export default function KPIDashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [interventions, setInterventions] = useState([]);
  const [testeurs, setTesteurs] = useState([]);
  const [components, setComponents] = useState([]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const [rI, rT, rC] = await Promise.all([
        fetch(API_INTERVENTIONS, { headers: authHeaders() }),
        fetch(API_TESTEURS, { headers: authHeaders() }),
        fetch(API_COMPONENTS, { headers: authHeaders() }),
      ]);
      if (!rI.ok || !rT.ok || !rC.ok) throw new Error("HTTP error");
      const [dI, dT, dC] = await Promise.all([rI.json(), rT.json(), rC.json()]);
      setInterventions(Array.isArray(dI) ? dI : []);
      setTesteurs(Array.isArray(dT) ? dT : []);
      setComponents(Array.isArray(dC) ? dC : []);
    } catch (e) {
      console.error(e);
      setErr("Impossible de charger les données du dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* =========================
     Calculs KPI / Stats (COMPLETS + Fiabilité)
     ========================= */
  const kpi = useMemo(() => {
    // ---------- Interventions ----------
    const totalInterv = interventions.length;
    const byStatut = (s) => interventions.filter((i) => i.statut === s).length;

    const enAttente = byStatut("EN_ATTENTE");
    const enCours = byStatut("EN_COURS");
    const planifiee = byStatut("PLANIFIEE");
    const validee = byStatut("VALIDEE");
    const terminee = byStatut("TERMINEE");
    const refusee = byStatut("REFUSEE");

    const doneCount = terminee + validee;
    const pctDone = totalInterv ? Math.round((doneCount / totalInterv) * 100) : 0;
    const pctRefus = totalInterv ? Math.round((refusee / totalInterv) * 100) : 0;
    const pctPlan = totalInterv ? Math.round((planifiee / totalInterv) * 100) : 0;

    // Backlog = non clôturées
    const backlog = totalInterv - doneCount - refusee; // EN_ATTENTE + EN_COURS + PLANIFIEE (+ autres éventuels)
    const now = new Date();

    // Durées (MTTR) pour TERMINEE/VALIDEE quand dateCloture existe (sinon on prend dateDerniereMaj ou now)
    const durationsH = interventions
      .filter((i) => ["TERMINEE", "VALIDEE"].includes(i.statut))
      .map((i) => {
        const dDem = toJsDate(i.dateDemande);
        const dClo = toJsDate(i.dateCloture) || toJsDate(i.derniereMaj) || now;
        return diffHours(dDem, dClo);
      })
      .filter((v) => v != null && isFinite(v));
    const mttrH = avg(durationsH);
    const mttrMedH = median(durationsH);
    const mttrP90H = percentile(durationsH, 0.9);

    // ➕ MTTA (si dateAffectation ou dateDebut disponible)
    const ackTimesH = interventions
      .map((i) => {
        const start = toJsDate(i.dateDemande);
        const ack = toJsDate(i.dateAffectation) || toJsDate(i.dateDebut); // champs optionnels
        return diffHours(start, ack);
      })
      .filter((v) => v != null && isFinite(v));
    const mttaH = ackTimesH.length ? avg(ackTimesH) : null;

    // ➕ MTTF (inter-arrivées des pannes). On considère CURATIVE si présent, sinon tout.
    const failureEvents = interventions.filter((i) => i.typeDemande ? i.typeDemande === "CURATIVE" : true);
    const failureDates = failureEvents
      .map((i) => toJsDate(i.dateDemande))
      .filter(Boolean)
      .sort((a, b) => a - b);

    const interArrivalsH = [];
    for (let i = 1; i < failureDates.length; i++) {
      const dh = diffHours(failureDates[i - 1], failureDates[i]);
      if (dh != null && isFinite(dh) && dh >= 0 && dh <= 24 * 365) {
        interArrivalsH.push(dh);
      }
    }
    const mttfH = avg(interArrivalsH);
    const mttfMedH = median(interArrivalsH);
    const mttfP90H = percentile(interArrivalsH, 0.9);

    // ➕ MTBF ≈ MTTF + MTTR (approx process)
    const mtbfH = (mttfH || 0) + (mttrH || 0);

    // ➕ Disponibilité approchée
    const availabilityPct = (mttfH + mttrH) > 0 ? Math.round((mttfH / (mttfH + mttrH)) * 100) : 0;

    // Temps d'attente courant pour le backlog (âge moyen / médian des tickets ouverts)
    const openedAgesH = interventions
      .filter((i) => !["TERMINEE", "VALIDEE", "REFUSEE"].includes(i.statut))
      .map((i) => diffHours(toJsDate(i.dateDemande), now))
      .filter((v) => v != null);
    const ageOpenMedH = median(openedAgesH);
    const oldestOpenDays = Math.floor(Math.max(0, ...openedAgesH.map((h) => h / 24), 0));

    // Throughput (terminées/validées) 7 & 30 jours
    const doneLast7 = interventions.filter((i) => {
      const d = toJsDate(i.dateCloture) || toJsDate(i.derniereMaj);
      return ["TERMINEE", "VALIDEE"].includes(i.statut) && isBetweenDays(d, 7);
    }).length;
    const doneLast30 = interventions.filter((i) => {
      const d = toJsDate(i.dateCloture) || toJsDate(i.derniereMaj);
      return ["TERMINEE", "VALIDEE"].includes(i.statut) && isBetweenDays(d, 30);
    }).length;

    // Sparkline : interventions par semaine (8 dernières)
    const byWeek = new Map(); // label => count
    interventions.forEach((i) => {
      const d = toJsDate(i.dateDemande);
      if (!d) return;
      const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNum = tmp.getUTCDay() || 7;
      tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
      const label = `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
      byWeek.set(label, (byWeek.get(label) || 0) + 1);
    });
    const weeks = [...byWeek.entries()].sort().slice(-8);
    const weekSparkValues = weeks.map(([, v]) => v);

    // Histogramme par statut (mini bar chart)
    const barStatus = [
      { label: "Att", value: enAttente },
      { label: "Cours", value: enCours },
      { label: "Plan", value: planifiee },
      { label: "Valid", value: validee },
      { label: "Term", value: terminee },
      { label: "Refus", value: refusee },
    ].filter((d) => d.value > 0 || totalInterv === 0);

    // Interventions récentes (5)
    const recent = [...interventions]
      .sort((a, b) => {
        const da = toJsDate(a.dateDemande)?.getTime() || 0;
        const db = toJsDate(b.dateDemande)?.getTime() || 0;
        return db - da;
      })
      .slice(0, 5);

    // ---------- Composants ----------
    const totalComp = components.length;
    const sumStock = components.reduce((acc, c) => acc + (Number(c.trartQuantite) || 0), 0);
    const lowStock = components.filter((c) => Number(c.trartQuantite) < 10).length;
    const ruptures = components.filter((c) => Number(c.trartQuantite) === 0).length;
    const stockValue = components.reduce(
      (acc, c) => acc + (Number(c.trartQuantite) || 0) * (Number(c.prix) || 0),
      0
    );
    // Top 5 faibles (par quantité croissante)
    const topLow = [...components]
      .sort((a, b) => (Number(a.trartQuantite) || 0) - (Number(b.trartQuantite) || 0))
      .slice(0, 5)
      .map((c) => ({
        label: c.trartArticle || c.trartDesignation || "—",
        qty: Number(c.trartQuantite) || 0,
      }));

    // ---------- Testeurs ----------
    const totalTesteurs = testeurs.length;
    const ateliers = [...new Set(testeurs.map((t) => t.atelier).filter(Boolean))].length;
    const lignes = [...new Set(testeurs.map((t) => t.ligne).filter(Boolean))].length;
    const byAtelierMap = new Map();
    testeurs.forEach((t) => {
      const k = t.atelier || "—";
      byAtelierMap.set(k, (byAtelierMap.get(k) || 0) + 1);
    });
    const topAteliers = [...byAtelierMap.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    const testersPerLine = (() => {
      const m = new Map();
      testeurs.forEach((t) => {
        const k = t.ligne || "—";
        m.set(k, (m.get(k) || 0) + 1);
      });
      return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    })();

    return {
      // Interventions
      totalInterv,
      enAttente,
      enCours,
      planifiee,
      validee,
      terminee,
      refusee,
      doneCount,
      pctDone,
      pctRefus,
      pctPlan,
      backlog,
      mttrH,
      mttrMedH,
      mttrP90H,
      mttaH,                // ➕
      mttfH, mttfMedH, mttfP90H, // ➕
      mtbfH,               // ➕
      availabilityPct,     // ➕
      ageOpenMedH,
      oldestOpenDays,
      doneLast7,
      doneLast30,
      weekSparkValues,
      barStatus,
      recent,

      // Composants
      totalComp,
      sumStock,
      lowStock,
      ruptures,
      stockValue,
      topLow,

      // Testeurs
      totalTesteurs,
      ateliers,
      lignes,
      topAteliers,
      testersPerLine,
    };
  }, [interventions, components, testeurs]);

  /* =========================
     Rendu
     ========================= */
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loaderCard}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: "1.2rem", color: "#003061" }}>Chargement du dashboard…</div>
        </div>
      </div>
    );
  }
  if (err) {
    return (
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: "1.1rem", color: "#dc2626", marginBottom: 12 }}>{err}</div>
          <button onClick={load} style={styles.primaryBtn}>🔄 Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{globalKeyframes}</style>

      <div style={styles.page}>
        <div style={{ maxWidth: 1400, width: "100%" }}>
          {/* Header */}
          <div style={styles.headerCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={styles.headerIcon}>📈</div>
              <div>
                <h1 style={styles.headerTitle}>Tableau de bord</h1>
                <p style={styles.headerSubtitle}>Vue globale — opérations Sagemcom</p>
              </div>
            </div>
          </div>

          {/* KPIs principaux (Interventions / Clôture / Composants / Stock faible) */}
          <div style={styles.grid4}>
            <KpiCard
              title="Interventions"
              value={kpi.totalInterv}
              icon="🧰"
              accent="#0ea5e9"
              sub={`En cours: ${kpi.enCours} · En attente: ${kpi.enAttente}`}
            />
            <KpiCard
              title="Taux de clôture"
              value={`${kpi.pctDone}%`}
              icon="✅"
              accent="#16a34a"
              sub={
                <div>
                  <ProgressBar value={kpi.pctDone} color="#16a34a" />
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                    Terminé + validé: {kpi.doneCount}
                  </div>
                </div>
              }
            />
            <KpiCard
              title="Composants"
              value={kpi.totalComp}
              icon="🔩"
              accent="#7c3aed"
              sub={`Stock total: ${kpi.sumStock.toLocaleString("fr-FR")}`}
            />
            <KpiCard
              title="Stock faible"
              value={kpi.lowStock}
              icon="⚠️"
              accent="#f59e0b"
              sub="Quantité &lt; 10"
            />
          </div>

          {/* KPIs secondaires (Backlog / MTTR / Valeur stock / Throughput) */}
          <div style={styles.grid4}>
            <KpiCard
              title="Backlog actif"
              value={kpi.backlog}
              icon="📌"
              accent="#0284c7"
              sub={`Âge médian: ${Math.round(kpi.ageOpenMedH)} h · Ancienneté max: ${kpi.oldestOpenDays} j`}
            />
            <KpiCard
              title="MTTR moyen"
              value={Math.round(kpi.mttrH)}
              suffix=" h"
              icon="⏱️"
              accent="#10b981"
              sub={`P50: ${Math.round(kpi.mttrMedH)} h · P90: ${Math.round(kpi.mttrP90H)} h`}
            />
            <KpiCard
              title="Valeur de stock"
              value={kpi.stockValue.toLocaleString("fr-FR")}
              suffix=" €"
              icon="💶"
              accent="#9333ea"
              sub={`Ruptures: ${kpi.ruptures}`}
            />
            <KpiCard
              title="Throughput"
              value={kpi.doneLast7}
              suffix=" /7j"
              icon="📦"
              accent="#ef4444"
              sub={`/30j: ${kpi.doneLast30}`}
            />
          </div>

          {/* ➕ KPIs Fiabilité (MTTF / MTBF / Disponibilité / MTTA) */}
          <div style={styles.grid4}>
            <KpiCard
              title="MTTF moyen"
              value={Math.round(kpi.mttfH || 0)}
              suffix=" h"
              icon="🧯"
              accent="#0ea5e9"
              sub={`P50: ${Math.round(kpi.mttfMedH || 0)} h · P90: ${Math.round(kpi.mttfP90H || 0)} h`}
            />
            <KpiCard
              title="MTBF (≈ MTTF + MTTR)"
              value={Math.round(kpi.mtbfH || 0)}
              suffix=" h"
              icon="🛡️"
              accent="#7c3aed"
              sub="Approximation process"
            />
            <KpiCard
              title="Disponibilité (approx.)"
              value={`${kpi.availabilityPct}%`}
              icon="🟢"
              accent="#16a34a"
              sub="≈ MTTF / (MTTF + MTTR)"
            />
            <KpiCard
              title="MTTA (prise en charge)"
              value={kpi.mttaH != null ? Math.round(kpi.mttaH) : "—"}
              suffix={kpi.mttaH != null ? " h" : undefined}
              icon="⏳"
              accent="#f59e0b"
              sub="Demande → première action"
            />
          </div>

          {/* Rangée : répartition statuts & tendance */}
          <div style={styles.grid2}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Répartition des statuts</h3>
                <span style={styles.badgeSoftBlue}>
                  ✔ {kpi.pctDone}% · 📅 {kpi.pctPlan}% · ❌ {kpi.pctRefus}%
                </span>
              </div>
              <MiniBarChart
                data={kpi.barStatus.length ? kpi.barStatus : [{ label: "—", value: 0 }]}
                color="#2563eb"
                height={110}
              />
              <div style={styles.legendRow}>
                <Legend color="#f59e0b" label={`En attente: ${kpi.enAttente}`} />
                <Legend color="#2563eb" label={`En cours: ${kpi.enCours}`} />
                <Legend color="#64748b" label={`Planifiées: ${kpi.planifiee}`} />
                <Legend color="#16a34a" label={`Validées: ${kpi.validee}`} />
                <Legend color="#10b981" label={`Terminées: ${kpi.terminee}`} />
                <Legend color="#dc2626" label={`Refusées: ${kpi.refusee}`} />
              </div>
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Trend interventions (8 semaines)</h3>
              </div>
              <div style={{ padding: "8px 6px" }}>
                <Sparkline points={kpi.weekSparkValues} stroke="#10b981" />
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Total: {kpi.totalInterv} — dernière mise à jour: {fmt(new Date())}
              </div>
            </div>
          </div>

          {/* Rangée : Top ateliers & dernières interventions */}
          <div style={styles.grid2}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Top ateliers (par nb testeurs)</h3>
              </div>
              {kpi.topAteliers.length === 0 ? (
                <div style={styles.emptyNote}>Aucun testeur trouvé.</div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {kpi.topAteliers.map((a, i) => (
                    <li key={i} style={styles.listRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={styles.rankDot}>{i + 1}</span>
                        <strong>{a.label}</strong>
                      </div>
                      <span style={styles.badgeSoftBlue}>{a.value}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
                Lignes couvertes: {kpi.lignes} — Moy. testeurs/atelier: {kpi.ateliers ? (kpi.totalTesteurs / kpi.ateliers).toFixed(1) : "0.0"}
              </div>
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>Dernières interventions</h3>
              </div>
              {kpi.recent.length === 0 ? (
                <div style={styles.emptyNote}>Aucune intervention.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={{ background: "#003061" }}>
                        <th style={styles.th}>Titre</th>
                        <th style={styles.th}>Statut</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Priorité</th>
                        <th style={styles.th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpi.recent.map((i) => (
                        <tr key={i.id} style={{ background: "#fff" }}>
                          <td style={styles.td}>
                            {i.titre && i.titre.trim() ? i.titre : (i.description || "—")}
                          </td>
                          <td style={styles.td}>
                            <span style={pillForStatut(i.statut)}>{i.statut || "—"}</span>
                          </td>
                          <td style={styles.td}>{i.typeDemande || "—"}</td>
                          <td style={styles.td}>{i.priorite || "—"}</td>
                          <td style={styles.td}>{fmt(toJsDate(i.dateDemande))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Rangée : composants (top faibles) & testeurs par ligne */}
          <div style={styles.grid2}>
            <div style={styles.panelSoft}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={styles.panelTitleDark}>Top composants faibles</h3>
                <span style={styles.badgeSoftPurple}>{kpi.lowStock}</span>
              </div>
              {kpi.topLow.length === 0 ? (
                <div style={styles.emptyNote}>Aucun composant.</div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {kpi.topLow.map((c, i) => (
                    <li key={i} style={styles.listRow}>
                      <span>{c.label}</span>
                      <span className="qty" style={styles.badgeSoftPurple}>{c.qty}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={styles.panelSoft}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={styles.panelTitleDark}>Testeurs par ligne</h3>
                <span style={styles.badgeSoftGreen}>{kpi.totalTesteurs}</span>
              </div>
              {kpi.testersPerLine.length === 0 ? (
                <div style={styles.emptyNote}>Aucun testeur.</div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {kpi.testersPerLine.map((l, i) => (
                    <li key={i} style={styles.listRow}>
                      <strong>Ligne {l.label}</strong>
                      <span style={styles.badgeSoftGreen}>{l.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================
   Petites briques
   ========================= */
function Legend({ color, label }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 10, height: 10, background: color, borderRadius: 3 }} />
      <span style={{ fontSize: 12, color: "#475569" }}>{label}</span>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={styles.miniStat}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

function pillForStatut(st) {
  const base = {
    padding: ".25rem .5rem",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  };
  switch (st) {
    case "EN_ATTENTE":
      return { ...base, background: "#fef3c7", color: "#b45309" };
    case "EN_COURS":
      return { ...base, background: "#dbeafe", color: "#1e40af" };
    case "PLANIFIEE":
      return { ...base, background: "#f3f4f6", color: "#111827" };
    case "VALIDEE":
      return { ...base, background: "#dcfce7", color: "#166534" };
    case "TERMINEE":
      return { ...base, background: "#bbf7d0", color: "#166534" };
    case "REFUSEE":
      return { ...base, background: "#fee2e2", color: "#b91c1c" };
    default:
      return { ...base, background: "#e5e7eb", color: "#374151" };
  }
}

/* =========================
   Styles
   ========================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)",
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
  },
  loaderCard: {
    background: "rgba(255,255,255,.96)",
    padding: "2rem 2.5rem",
    borderRadius: 20,
    boxShadow: "0 24px 48px rgba(0,0,0,.12)",
    textAlign: "center",
  },
  errorCard: {
    background: "linear-gradient(135deg, #fee2e2, #fecaca)",
    padding: "2rem",
    borderRadius: 20,
    border: "1px solid #ef4444",
    textAlign: "center",
  },

  headerCard: {
    background: "linear-gradient(135deg, #003061, #0078d4)",
    borderRadius: 24,
    padding: "1.5rem",
    marginBottom: "1.25rem",
    color: "white",
    boxShadow: "0 16px 40px rgba(0,0,0,.18)",
  },
  headerIcon: {
    width: 56, height: 56, borderRadius: 16,
    background: "rgba(255,255,255,.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 26,
    boxShadow: "inset 0 0 0 2px rgba(255,255,255,.25)"
  },
  headerTitle: { margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: -.3 },
  headerSubtitle: { margin: "4px 0 0", opacity: .9 },

  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "1rem",
    marginBottom: "1rem",
  },
  kpiCard: {
    background: "white",
    borderRadius: 16,
    padding: "1rem",
    border: "1px solid rgba(0,48,97,.08)",
    boxShadow: "0 8px 18px rgba(0,0,0,.06)",
  },
  kpiTitle: { fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 },
  kpiValue: { fontSize: 28, fontWeight: 800 },
  kpiSuffix: { fontSize: 16, marginLeft: 6, color: "#475569" },
  kpiIcon: { fontSize: 26, opacity: 0.85 },
  kpiSub: { fontSize: 12, color: "#64748b", marginTop: 8 },

  progressWrap: {
    height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden", marginTop: 6,
  },
  progressFill: { height: "100%", borderRadius: 999 },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
  },
  panel: {
    background: "white",
    borderRadius: 16,
    padding: "1rem",
    border: "1px solid rgba(0,48,97,.08)",
    boxShadow: "0 8px 18px rgba(0,0,0,.06)",
  },
  panelSoft: {
    background: "linear-gradient(145deg,#fff,#f8fafc)",
    borderRadius: 16,
    padding: "1rem",
    border: "1px solid rgba(0,48,97,.08)",
  },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  panelTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" },
  panelTitleDark: { margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" },

  legendRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 },

  listRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: ".5rem .25rem",
    borderBottom: "1px solid #f1f5f9",
  },
  rankDot: {
    width: 24, height: 24, borderRadius: 8, background: "#003061",
    color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, boxShadow: "0 2px 6px rgba(0,0,0,.15)"
  },

  emptyNote: { fontSize: ".9rem", color: "#6b7280" },

  table: {
    width: "100%",
    backgroundColor: "transparent",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  th: {
    background: "transparent",
    color: "white",
    border: "none",
    padding: "0.75rem 0.9rem",
    textAlign: "left",
    fontSize: ".8rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".05em",
    borderBottom: "2px solid rgba(255,255,255,.2)",
    whiteSpace: "nowrap",
  },
  td: {
    border: "none",
    borderBottom: "1px solid #eef2f7",
    padding: "0.75rem 0.9rem",
    fontSize: ".9rem",
    color: "#111827",
    verticalAlign: "top",
  },

  miniStatsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 },
  miniStat: { background: "#fff", border: "1px solid #eef2f7", padding: 12, borderRadius: 12 },

  badgeSoftBlue: {
    display: "inline-block",
    background: "linear-gradient(135deg,#e0f2fe,#f0f9ff)",
    border: "1px solid rgba(3,105,161,.25)",
    color: "#0369a1",
    borderRadius: 10,
    padding: ".25rem .5rem",
    fontSize: ".8rem",
    fontWeight: 700,
  },
  badgeSoftGreen: {
    display: "inline-block",
    background: "linear-gradient(135deg,#ecfdf5,#f0fdf4)",
    border: "1px solid rgba(34,197,94,.25)",
    color: "#16a34a",
    borderRadius: 10,
    padding: ".25rem .6rem",
    fontSize: ".85rem",
    fontWeight: 800,
    fontFamily: "monospace",
  },
  badgeSoftPurple: {
    display: "inline-block",
    background: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    border: "1px solid rgba(124,58,237,.25)",
    color: "#7c3aed",
    borderRadius: 10,
    padding: ".25rem .6rem",
    fontSize: ".85rem",
    fontWeight: 800,
  },

  primaryBtn: {
    padding: ".65rem 1rem",
    background: "linear-gradient(135deg, #003061, #0066cc)",
    color: "white",
    border: 0,
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
};

const globalKeyframes = `
@keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
`;
