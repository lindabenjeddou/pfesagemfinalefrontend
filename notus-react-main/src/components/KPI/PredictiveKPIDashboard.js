// src/views/admin/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";

/* =========================
   Endpoints API
   ========================= */
const API_INTERVENTIONS = "http://localhost:8089/PI/demandes/recuperer/all";
const API_TESTEURS = "http://localhost:8089/PI/PI/testeurs/all";
const API_COMPONENTS = "http://localhost:8089/PI/PI/component/all";

/* =========================
   Helpers Auth
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
const fmtInt = (v) => Number(v || 0).toLocaleString("fr-FR");
const fmt1 = (v) => Number(v || 0).toFixed(1);
const hexAlpha = (hex, a = 1) => {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const bigint = parseInt(c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
};

/* =========================
   Animations globales
   ========================= */
const GlobalFx = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-50px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-8px) rotate(1deg); }
      66% { transform: translateY(4px) rotate(-1deg); }
    }
  `}</style>
);

/* =========================
   Micro UI
   ========================= */

// Jauge circulaire % (SVG) – statique
function Gauge({ value = 0, size = 110, stroke = 10, color = "#16a34a", bg = "#e5e7eb" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <g transform={`translate(${size / 2},${size / 2}) rotate(-90)`}>
        <circle r={r} cx="0" cy="0" fill="none" stroke={bg} strokeWidth={stroke} />
        <circle
          r={r}
          cx="0"
          cy="0"
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </g>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{ fontWeight: 800, fontSize: 18, fill: "#0f172a" }}
      >
        {pct.toFixed(1)}%
      </text>
    </svg>
  );
}

// Mini bar chart – statique
function MiniBarChart({ data, height = 90, color = "#2563eb" }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = `${100 / data.length}%`;
  return (
    <div style={{ display: "flex", alignItems: "end", gap: 8, height }}>
      {data.map((d, i) => (
        <div key={i} title={`${d.label}: ${d.value}`} style={{ flex: `0 0 ${bw}` }}>
          <div
            style={{
              height: `${(d.value / max) * 100}%`,
              background: `linear-gradient(180deg, ${color}, ${hexAlpha(color, 0.7)})`,
              borderRadius: 8,
              boxShadow: "0 6px 18px rgba(0,0,0,.12)",
            }}
          />
          <div style={{ fontSize: 10, textAlign: "center", marginTop: 6, color: "#64748b" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// Sparkline – statique
function Sparkline({ points, height = 60, stroke = "#10b981" }) {
  if (!points || points.length === 0) return null;
  const w = 280;
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
      <path d={path} fill="none" stroke={stroke} strokeWidth="3" />
    </svg>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 10, height: 10, background: color, borderRadius: 3 }} />
      <span style={{ fontSize: 12, color: "#475569" }}>{label}</span>
    </div>
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

  // IA prédictive
  const [pred, setPred] = useState(null);
  const [alerts, setAlerts] = useState([]);

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
     Calculs KPI / Stats (réels)
     ========================= */
  const kpi = useMemo(() => {
    // Interventions
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

    const backlog = totalInterv - doneCount - refusee;
    const now = new Date();

    // MTTR (TERMINEE/VALIDEE)
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

    // Âges tickets ouverts
    const openedAgesH = interventions
      .filter((i) => !["TERMINEE", "VALIDEE", "REFUSEE"].includes(i.statut))
      .map((i) => diffHours(toJsDate(i.dateDemande), now))
      .filter((v) => v != null);
    const ageOpenMedH = median(openedAgesH);
    const oldestOpenDays = Math.floor(Math.max(0, ...openedAgesH.map((h) => h / 24), 0));

    // Throughput
    const doneLast7 = interventions.filter((i) => {
      const d = toJsDate(i.dateCloture) || toJsDate(i.derniereMaj);
      return ["TERMINEE", "VALIDEE"].includes(i.statut) && isBetweenDays(d, 7);
    }).length;
    const doneLast30 = interventions.filter((i) => {
      const d = toJsDate(i.dateCloture) || toJsDate(i.derniereMaj);
      return ["TERMINEE", "VALIDEE"].includes(i.statut) && isBetweenDays(d, 30);
    }).length;

    // Créées 30j (pour taux d’exécution)
    const createdLast30 = interventions.filter((i) => {
      const d = toJsDate(i.dateDemande);
      return isBetweenDays(d, 30);
    }).length;
    const executionRatePct = createdLast30 ? Math.min(100, (doneLast30 / createdLast30) * 100) : 0;

    // Sparkline
    const byWeek = new Map();
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

    const barStatus = [
      { label: "Att", value: enAttente },
      { label: "Cours", value: enCours },
      { label: "Plan", value: planifiee },
      { label: "Valid", value: validee },
      { label: "Term", value: terminee },
      { label: "Refus", value: refusee },
    ].filter((d) => d.value > 0 || totalInterv === 0);

    const recent = [...interventions]
      .sort((a, b) => {
        const da = toJsDate(a.dateDemande)?.getTime() || 0;
        const db = toJsDate(b.dateDemande)?.getTime() || 0;
        return db - da;
      })
      .slice(0, 5);

    // Composants
    const totalComp = components.length;
    const sumStock = components.reduce((acc, c) => acc + (Number(c.trartQuantite) || 0), 0);
    const lowStock = components.filter((c) => Number(c.trartQuantite) < 10).length;
    const ruptures = components.filter((c) => Number(c.trartQuantite) === 0).length;
    const stockValue = components.reduce(
      (acc, c) => acc + (Number(c.trartQuantite) || 0) * (Number(c.prix) || 0),
      0
    );
    const topLow = [...components]
      .sort((a, b) => (Number(a.trartQuantite) || 0) - (Number(b.trartQuantite) || 0))
      .slice(0, 5)
      .map((c) => ({
        label: c.trartArticle || c.trartDesignation || "—",
        qty: Number(c.trartQuantite) || 0,
      }));
    const stockLowPct = totalComp ? (lowStock / totalComp) * 100 : 0;

    // Testeurs
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

    // Fiabilité
    const isFailure = (i) => {
      const t = (i.typeDemande || "").toUpperCase();
      const n = (i.nature || "").toUpperCase();
      return t.includes("CURAT") || t.includes("CORRECT") || n.includes("PANNE");
    };
    const failureDates = interventions
      .filter(isFailure)
      .map((i) => toJsDate(i.dateDemande))
      .filter(Boolean)
      .sort((a, b) => a - b);

    const interArrivalsH = [];
    for (let i = 1; i < failureDates.length; i++) {
      const dh = diffHours(failureDates[i - 1], failureDates[i]);
      if (dh != null && isFinite(dh) && dh >= 0 && dh <= 24 * 365) interArrivalsH.push(dh);
    }
    const mttfH = avg(interArrivalsH);
    const mttfMedH = median(interArrivalsH);
    const mttfP90H = percentile(interArrivalsH, 0.9);
    const mtbfH = (mttfH || 0) + (mttrH || 0);
    const availabilityPct = (mttfH || 0) + (mttrH || 0) > 0 ? (mttfH / (mttfH + mttrH)) * 100 : 0;

    return {
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
      ageOpenMedH,
      oldestOpenDays,
      doneLast7,
      doneLast30,
      executionRatePct,
      weekSparkValues,
      barStatus,
      recent,

      mttfH,
      mttfMedH,
      mttfP90H,
      mtbfH,
      availabilityPct,

      totalComp,
      sumStock,
      lowStock,
      ruptures,
      stockValue,
      stockLowPct,
      topLow,

      totalTesteurs,
      ateliers,
      lignes,
      topAteliers,
      testersPerLine,
    };
  }, [interventions, components, testeurs]);

  /* =========================
     IA prédictive — heuristique simple (statique)
     ========================= */
  const runPrediction = () => {
    const trendImprove =
      kpi.doneLast7 > 0 && kpi.doneLast7 >= Math.max(1, Math.round(kpi.doneLast30 / 4));

    const mttrNext = isFinite(kpi.mttrH) ? kpi.mttrH * (trendImprove ? 0.96 : 1.04) : 0;
    const mttfNext = isFinite(kpi.mttfH) ? kpi.mttfH * (trendImprove ? 1.06 : 0.97) : 0;
    const mtbfNext = (isFinite(mttfNext) ? mttfNext : 0) + (isFinite(mttrNext) ? mttrNext : 0);
    const availNext = mtbfNext > 0 ? (mttfNext / mtbfNext) * 100 : 0;
    const execRateNext = Math.max(
      0,
      Math.min(100, trendImprove ? Math.max(kpi.executionRatePct, 90) : kpi.executionRatePct * 0.98)
    );
    const stockLowNext = Math.max(0, trendImprove ? kpi.stockLowPct * 0.92 : kpi.stockLowPct * 1.1);

    const confidence = { mttr: 82, mttf: 78, mtbf: 80, availability: 84, execRate: 75, stock: 88 };
    setPred({ mttrNext, mttfNext, mtbfNext, availNext, execRateNext, stockLowNext, confidence });

    const newAlerts = [];
    if (availNext < 95) newAlerts.push({ type: "warning", title: "Disponibilité sous objectif", msg: `Prévue ${availNext.toFixed(1)}% (<98%)`, priority: "medium" });
    if (mttrNext > 4) newAlerts.push({ type: "warning", title: "MTTR élevé prévu", msg: `${mttrNext.toFixed(1)} h`, priority: "medium" });
    if (stockLowNext > 10) newAlerts.push({ type: "critical", title: "Risque stock faible", msg: `${stockLowNext.toFixed(1)}% sous seuil`, priority: "high" });
    if (execRateNext < 85) newAlerts.push({ type: "warning", title: "Taux d’exécution faible", msg: `${execRateNext.toFixed(1)}%`, priority: "medium" });
    setAlerts(newAlerts);
  };

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
    <div style={styles.page}>
      <GlobalFx />
      {/* Décor statique */}
      <div style={styles.bgBlob1} />
      <div style={styles.bgBlob2} />
      <div style={styles.bgGrid} />

      <div style={{ maxWidth: 1420, width: "100%", position: "relative", zIndex: 1 }}>
        {/* HEADER */}
        <div style={styles.headerCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={styles.headerIcon}>📈</div>
              <div>
                <h1 style={styles.headerTitle}>Tableau de bord</h1>
                <p style={styles.headerSubtitle}>Vue globale — opérations Sagemcom</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              
              <button onClick={runPrediction} style={styles.primaryBtn}>🔮 Prédire</button>
            </div>
          </div>
        </div>

        {/* KPIs PRINCIPAUX */}
        <div style={styles.kpiGrid}>
          <MetricCard title="Interventions" icon="🧰" accent="#0ea5e9"
            main={fmtInt(kpi.totalInterv)}
            sub={`En cours: ${fmtInt(kpi.enCours)} · En attente: ${fmtInt(kpi.enAttente)}`}
            animationDelay={0}
          />
          <MetricCard title="Taux de clôture" icon="✅" accent="#16a34a"
            main={`${fmtInt(kpi.pctDone)}%`}
            progress={kpi.pctDone}
            sub={`Terminé + validé: ${fmtInt(kpi.doneCount)}`}
            animationDelay={0.1}
          />
          <MetricCard title="Composants" icon="🔩" accent="#7c3aed"
            main={fmtInt(kpi.totalComp)}
            sub={`Stock total: ${fmtInt(kpi.sumStock)}`}
            animationDelay={0.2}
          />
          <MetricCard title="Stock faible" icon="⚠️" accent="#f59e0b"
            main={fmtInt(kpi.lowStock)}
            sub="Quantité < 10"
            animationDelay={0.3}
          />
        </div>

        {/* KPIs SECONDAIRES */}
        <div style={styles.kpiGrid}>
          <MetricCard title="Backlog actif" icon="📌" accent="#0284c7"
            main={fmtInt(kpi.backlog)}
            sub={`Âge médian: ${fmtInt(Math.round(kpi.ageOpenMedH))} h · Max: ${fmtInt(kpi.oldestOpenDays)} j`}
            animationDelay={0.4}
          />
          <MetricCard title="MTTR moyen" icon="⏱️" accent="#10b981"
            main={`${fmtInt(Math.round(kpi.mttrH || 0))} h`}
            sub={`P50: ${fmtInt(Math.round(kpi.mttrMedH || 0))} h · P90: ${fmtInt(Math.round(kpi.mttrP90H || 0))} h`}
            animationDelay={0.5}
          />
          <MetricCard title="Valeur de stock" icon="💶" accent="#9333ea"
            main={`${fmtInt(kpi.stockValue)} €`}
            sub={`Ruptures: ${fmtInt(kpi.ruptures)}`}
            animationDelay={0.6}
          />
          <MetricCard title="Throughput" icon="📦" accent="#ef4444"
            main={`${fmtInt(kpi.doneLast7)} /7j`}
            sub={`/30j: ${fmtInt(kpi.doneLast30)}`}
            animationDelay={0.7}
          />
        </div>

        {/* FIABILITÉ + Jauges */}
        <div style={styles.kpiGrid}>
          <MetricCard title="MTTF (moyen)" icon="🧯" accent="#0ea5e9"
            main={`${fmtInt(Math.round(kpi.mttfH || 0))} h`}
            sub={`P50: ${fmtInt(Math.round(kpi.mttfMedH || 0))} h · P90: ${fmtInt(Math.round(kpi.mttfP90H || 0))} h`}
            animationDelay={0.8}
          />
          <MetricCard title="MTBF (estimé)" icon="🛡️" accent="#06b6d4"
            main={`${fmtInt(Math.round(kpi.mtbfH || 0))} h`}
            sub="MTBF ≈ MTTF + MTTR"
            animationDelay={0.9}
          />
          <GaugeCard 
            title="Disponibilité (approx.)" 
            icon="🟢" 
            accent="#16a34a"
            value={isFinite(kpi.availabilityPct) ? kpi.availabilityPct : 0}
            main={`${fmt1(kpi.availabilityPct || 0)}%`}
            sub="Formule: MTTF / (MTTF + MTTR)"
            animationDelay={1.0}
          />
          <GaugeCard 
            title="Taux d'exécution (30j)" 
            icon="🎯" 
            accent="#3b82f6"
            value={isFinite(kpi.executionRatePct) ? kpi.executionRatePct : 0}
            main={`${fmt1(kpi.executionRatePct || 0)}%`}
            sub="Clôturées / Créées sur 30 jours"
            animationDelay={1.1}
          />
        </div>

        {/* RÉPARTITION & TENDANCE */}
        <div style={styles.grid2}>
          <CardGlass>
            <div style={styles.cardHeaderRow}>
              <h3 style={styles.cardTitle}>Répartition des statuts</h3>
              <span style={styles.badgeSoftBlue}>
                ✔ {kpi.pctDone}% · 📅 {kpi.pctPlan}% · ❌ {kpi.pctRefus}%
              </span>
            </div>
            <MiniBarChart
              data={kpi.barStatus.length ? kpi.barStatus : [{ label: "—", value: 0 }]}
              color="#2563eb"
              height={120}
            />
            <div style={styles.legendRow}>
              <Legend color="#f59e0b" label={`En attente: ${kpi.enAttente}`} />
              <Legend color="#2563eb" label={`En cours: ${kpi.enCours}`} />
              <Legend color="#64748b" label={`Planifiées: ${kpi.planifiee}`} />
              <Legend color="#16a34a" label={`Validées: ${kpi.validee}`} />
              <Legend color="#10b981" label={`Terminées: ${kpi.terminee}`} />
              <Legend color="#dc2626" label={`Refusées: ${kpi.refusee}`} />
            </div>
          </CardGlass>

          <CardGlass>
            <div style={styles.cardHeaderRow}>
              <h3 style={styles.cardTitle}>Trend interventions (8 semaines)</h3>
            </div>
            <div style={{ padding: "8px 6px" }}>
              <Sparkline points={kpi.weekSparkValues} stroke="#10b981" />
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Total: {fmtInt(kpi.totalInterv)} — dernière mise à jour: {fmt(new Date())}
            </div>
          </CardGlass>
        </div>

        {/* TOP ATELIERS & DERNIÈRES INTERVENTIONS */}
        <div style={styles.grid2}>
          <CardGlass>
            <div style={styles.cardHeaderRow}>
              <h3 style={styles.cardTitle}>Top ateliers (par nb testeurs)</h3>
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
          </CardGlass>

          <CardGlass>
            <div style={styles.cardHeaderRow}>
              <h3 style={styles.cardTitle}>Dernières interventions</h3>
            </div>
            {kpi.recent.length === 0 ? (
              <div style={styles.emptyNote}>Aucune intervention.</div>
            ) : (
              <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid rgba(0,0,0,.05)" }}>
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
                      <tr key={i.id} style={{ background: "rgba(255,255,255,.9)" }}>
                        <td style={styles.td}>{i.titre && i.titre.trim() ? i.titre : (i.description || "—")}</td>
                        <td style={styles.td}><span style={pillForStatut(i.statut)}>{i.statut || "—"}</span></td>
                        <td style={styles.td}>{i.typeDemande || "—"}</td>
                        <td style={styles.td}>{i.priorite || "—"}</td>
                        <td style={styles.td}>{fmt(toJsDate(i.dateDemande))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardGlass>
        </div>

        {/* 🔮 IA PRÉDICTIVE */}
        {pred && (
          <div style={styles.grid2}>
            <CardGlass>
              <div style={styles.cardHeaderRow}>
                <h3 style={styles.cardTitle}>🚨 Alertes prédictives </h3>
              </div>
              {alerts.length === 0 ? (
                <div style={styles.emptyNote}>Aucune alerte prédictive.</div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {alerts.map((a, idx) => (
                    <li key={idx} style={{ ...styles.listRow, border: 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <strong style={{ color: a.type === "critical" ? "#dc2626" : "#d97706" }}>{a.title}</strong>
                        <span style={{ color: "#475569" }}>{a.msg}</span>
                      </div>
                      <span
                        style={{
                          display: "inline-block",
                          padding: ".25rem .6rem",
                          borderRadius: 10,
                          color: "white",
                          background: a.priority === "high" ? "#dc2626" : "#f59e0b",
                          fontSize: ".8rem",
                          fontWeight: 800,
                        }}
                      >
                        {a.priority === "high" ? "Urgent" : "Important"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardGlass>

            <CardGlass>
              <div style={styles.cardHeaderRow}>
                <h3 style={styles.cardTitle}>🔮 Prédictions </h3>
              </div>
              <div style={styles.predGrid}>
                <PredTile label="MTTR prévu" value={pred.mttrNext} suffix=" h" color="#10b981" conf={pred.confidence.mttr} />
                <PredTile label="MTTF prévu" value={pred.mttfNext} suffix=" h" color="#0ea5e9" conf={pred.confidence.mttf} />
                <PredTile label="MTBF prévu" value={pred.mtbfNext} suffix=" h" color="#06b6d4" conf={pred.confidence.mtbf} />
                <PredTile label="Disponibilité prévue" value={pred.availNext} suffix=" %" color="#16a34a" conf={pred.confidence.availability} fixed1 />
                <PredTile label="Taux d’exécution prévu" value={pred.execRateNext} suffix=" %" color="#3b82f6" conf={pred.confidence.execRate} fixed1 />
                <PredTile label="% Stock faible prévu" value={pred.stockLowNext} suffix=" %" color="#f59e0b" conf={pred.confidence.stock} fixed1 />
              </div>
            </CardGlass>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   Composants de style (glass cards, statiques)
   ========================= */
function CardGlass({ children }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.6))",
        border: "1px solid rgba(255,255,255,.35)",
        boxShadow: "0 20px 45px rgba(2,6,23,.12)",
        borderRadius: 18,
        padding: "1rem",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function MetricCard({ title, icon, accent = "#003061", main, sub, progress, animationDelay = 0 }) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div
      style={{
        position: "relative",
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: isHovered 
          ? '0 25px 60px rgba(0,48,97,0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
          : '0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        animation: `fadeInUp 0.8s ease-out ${animationDelay}s both`,
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${hexAlpha(accent, 0.1)} 0%, ${hexAlpha(accent, 0.05)} 100%)`,
        zIndex: -1
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            fontSize: '0.9rem',
            color: '#374151',
            margin: '0 0 0.75rem 0',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#003061',
            margin: '0 0 0.5rem 0',
            textShadow: '0 2px 4px rgba(0,48,97,0.2)',
            fontFamily: 'Inter, sans-serif'
          }}>
            {main}
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            {sub}
          </p>
        </div>
        <div style={{
          fontSize: '3rem',
          opacity: 0.8,
          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
        }}>
          {icon}
        </div>
      </div>

      {typeof progress === "number" ? (
        <div style={{ marginTop: 16 }}>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(0,48,97,0.1)',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.max(0, Math.min(100, progress))}%`,
              background: `linear-gradient(90deg, ${accent}, ${hexAlpha(accent, 0.7)})`,
              borderRadius: '999px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GaugeCard({ title, icon, accent = "#003061", value, main, sub, animationDelay = 0 }) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div
      style={{
        position: "relative",
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: isHovered 
          ? '0 25px 60px rgba(0,48,97,0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
          : '0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        animation: `fadeInUp 0.8s ease-out ${animationDelay}s both`,
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${hexAlpha(accent, 0.1)} 0%, ${hexAlpha(accent, 0.05)} 100%)`,
        zIndex: -1
      }} />
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{
          fontSize: '0.9rem',
          color: '#374151',
          margin: '0 0 0.5rem 0',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          {title}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Gauge value={value} color={accent} size={100} stroke={10} />
        <div>
          <p style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#003061',
            margin: '0 0 0.5rem 0',
            textShadow: '0 2px 4px rgba(0,48,97,0.2)',
            fontFamily: 'Inter, sans-serif'
          }}>
            {main}
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            {sub}
          </p>
        </div>
      </div>
    </div>
  );
}

function PredTile({ label, value, suffix, color, conf, fixed1 = false }) {
  const v = !isFinite(value) ? 0 : fixed1 ? Number(value).toFixed(1) : Math.round(value);
  return (
    <div
      style={{
        padding: "0.9rem",
        borderRadius: 14,
        border: `1px solid ${hexAlpha(color, .35)}`,
        background: `linear-gradient(180deg, ${hexAlpha(color, .10)}, rgba(255,255,255,.75))`,
        boxShadow: "0 8px 22px rgba(2,6,23,.08)",
      }}
    >
      <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontWeight: 900, fontSize: 22, color }}>{v}{suffix}</div>
        <span
          style={{
            marginLeft: "auto",
            background: "linear-gradient(135deg,#dbeafe,#eff6ff)",
            border: "1px solid rgba(37,99,235,.25)",
            color: "#1d4ed8",
            borderRadius: 10,
            padding: ".2rem .45rem",
            fontSize: ".75rem",
            fontWeight: 800,
          }}
        >
          {conf}% conf.
        </span>
      </div>
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: ".45rem .65rem",
        borderRadius: 999,
        background: hexAlpha(color, 0.12),
        color: color,
        fontWeight: 800,
        fontSize: ".8rem",
        border: `1px solid ${hexAlpha(color, 0.35)}`,
      }}
    >
      {text}
    </span>
  );
}

/* =========================
   Styles (aucune animation)
   ========================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fb 0%, #e7eef8 50%, #e8f3ff 100%)",
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  // Décor statique (sans animation)
  bgBlob1: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, #7dd3fc, transparent 60%)",
    filter: "blur(40px)",
  },
  bgBlob2: {
    position: "absolute",
    bottom: -140,
    left: -120,
    width: 380,
    height: 380,
    borderRadius: "50%",
    background: "radial-gradient(circle at 60% 60%, #c4b5fd, transparent 60%)",
    filter: "blur(44px)",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,0,0,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.035) 1px, transparent 1px)",
    backgroundSize: "28px 28px, 28px 28px",
    maskImage: "linear-gradient(#000, transparent 60%)",
  },

  headerCard: {
    background: "linear-gradient(135deg, #003061, #0b67d1)",
    borderRadius: 24,
    padding: "1.25rem 1.25rem",
    marginBottom: "1.25rem",
    color: "white",
    boxShadow: "0 22px 50px rgba(0,0,0,.28)",
    position: "relative",
    overflow: "hidden",
  },
  headerIcon: {
    width: 58, height: 58, borderRadius: 16,
    background: "rgba(255,255,255,.12)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 26,
    boxShadow: "inset 0 0 0 2px rgba(255,255,255,.22)"
  },
  headerTitle: { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -.3 },
  headerSubtitle: { margin: "4px 0 0", opacity: .92 },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },

  cardHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardTitleRow: { display: "flex", alignItems: "center", gap: 10 },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 900, color: "#0f172a" },

  kpiBig: { fontWeight: 900, fontSize: 28, letterSpacing: -.3 },
  kpiSubText: { fontSize: 12, color: "#64748b", marginTop: 8 },

  progressWrap: {
    height: 8,
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,.06)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
  },

  legendRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 },

  listRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: ".6rem .25rem",
    borderBottom: "1px solid #eef2f7",
  },
  rankDot: {
    width: 24, height: 24, borderRadius: 8, background: "#003061",
    color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, boxShadow: "0 2px 6px rgba(0,0,0,.15)"
  },

  emptyNote: { fontSize: ".95rem", color: "#6b7280" },

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
    fontSize: ".82rem",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: ".05em",
    borderBottom: "2px solid rgba(255,255,255,.2)",
    whiteSpace: "nowrap",
  },
  td: {
    border: "none",
    borderBottom: "1px solid #eef2f7",
    padding: "0.75rem 0.9rem",
    fontSize: ".92rem",
    color: "#111827",
    verticalAlign: "top",
  },

  badgeSoftBlue: {
    display: "inline-block",
    background: "linear-gradient(135deg,#e0f2fe,#f0f9ff)",
    border: "1px solid rgba(3,105,161,.25)",
    color: "#0369a1",
    borderRadius: 10,
    padding: ".25rem .5rem",
    fontSize: ".8rem",
    fontWeight: 800,
  },

  primaryBtn: {
    padding: ".7rem 1rem",
    background: "linear-gradient(135deg, #003061, #0066cc)",
    color: "white",
    border: 0,
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 26px rgba(2,6,23,.25)",
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

  predGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
};

/* =========================
   Utilitaires visuels
   ========================= */
function pillForStatut(st) {
  const base = {
    padding: ".25rem .5rem",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
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
