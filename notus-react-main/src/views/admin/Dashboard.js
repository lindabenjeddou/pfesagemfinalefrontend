import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

const BASE_URL = "http://localhost:8089/PI";
const apiUrl = (p = "") => {
  const base = BASE_URL.replace(/\/+$/, "");
  let path = String(p || "").replace(/^\/+/, "");
  const ctx = base.split("/").filter(Boolean).pop();
  if (ctx && new RegExp(`^${ctx}/`, "i").test(path)) path = path.replace(new RegExp(`^${ctx}/`, "i"), "");
  return `${base}/${path}`;
};

async function fetchJson(path, opts = {}) {
  const url = apiUrl(path);
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers: { Accept: "application/json", ...(opts.body ? { "Content-Type": "application/json" } : {}), ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error((await res.text().catch(() => "")) || res.statusText);
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

const THEME = {
  radius: 20,
  shadowSm: "0 8px 22px rgba(0, 48, 97, 0.12)",
  shadowMd: "0 16px 40px rgba(0, 48, 97, 0.20)",
  primary: ["#003061", "#0078d4"],
  emerald: ["#10b981", "#059669"],
  rose: ["#ef4444", "#dc2626"],
  indigo: ["#6366F1", "#4F46E5"],
  teal: ["#14B8A6", "#0D9488"],
  grayBg: "linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 50%,#cbd5e1 100%)",
};

const page = {
  wrap: { padding: 16 },
  hero: {
    background: `linear-gradient(135deg, ${THEME.primary[0]}, ${THEME.primary[1]})`,
    color: "#fff",
    borderRadius: THEME.radius,
    padding: 24,
    boxShadow: THEME.shadowMd,
    position: "relative",
    overflow: "hidden",
    marginBottom: 16,
  },
  shimmer: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent)",
    backgroundSize: "200% 100%",
    animation: "shimmer 3s ease-in-out infinite",
  },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12, marginBottom: 16 },
  card: {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(226,232,240,.9)",
    borderRadius: THEME.radius,
    boxShadow: THEME.shadowSm,
    padding: 16,
  },
  badge: (bg, fg) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800, background: bg, color: fg }),
  pillBtn: (tone = THEME.primary) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "10px 14px", borderRadius: 14, color: "#fff",
    background: `linear-gradient(135deg, ${tone[0]}, ${tone[1]})`, textDecoration: "none", fontWeight: 800,
    boxShadow: THEME.shadowSm,
  }),
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "10px 12px", color: "#6b7280", textTransform: "uppercase", fontWeight: 800, borderBottom: "1px solid #E5E7EB", background: "#F9FAFB" },
  td: { padding: "10px 12px", color: "#334155" },
};

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
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-8px) rotate(1deg); }
      66% { transform: translateY(4px) rotate(-1deg); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(0,120,212,0.3); }
      50% { box-shadow: 0 0 30px rgba(0,120,212,0.5); }
    }
  `}</style>
);

export default function Dashboard() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interventions, setInterventions] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchJson("demandes/recuperer/all");
        if (mounted) setInterventions(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) {
          setError("Impossible de charger les données");
          setInterventions([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => {
    const total = interventions.length;
    const enAttente = interventions.filter(i => String(i.statut) === "EN_ATTENTE").length;
    const enCours = interventions.filter(i => String(i.statut) === "EN_COURS").length;
    const terminee = interventions.filter(i => String(i.statut) === "TERMINEE" || String(i.statut) === "TERMINE").length;
    const curatives = interventions.filter(i => String(i.typeDemande) === "CURATIVE").length;
    const preventives = interventions.filter(i => String(i.typeDemande) === "PREVENTIVE").length;
    
    // KPIs avancés
    const tauxResolution = total > 0 ? ((terminee / total) * 100).toFixed(1) : 0;
    const urgentes = interventions.filter(i => i.urgence === true).length;
    const tauxUrgence = curatives > 0 ? ((urgentes / curatives) * 100).toFixed(1) : 0;
    
    // Top 5 pannes
    const panneCount = {};
    interventions.filter(i => i.panne).forEach(i => {
      panneCount[i.panne] = (panneCount[i.panne] || 0) + 1;
    });
    const topPannes = Object.entries(panneCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([panne, count]) => ({ panne, count }));
    
    // Temps moyen de résolution (en jours)
    const tempsMoyen = interventions
      .filter(i => i.dateDemande && i.dateValidation)
      .map(i => {
        const debut = new Date(i.dateDemande);
        const fin = new Date(i.dateValidation);
        return (fin - debut) / (1000 * 60 * 60 * 24);
      })
      .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
    
    return { 
      total, enAttente, enCours, terminee, curatives, preventives,
      tauxResolution, urgentes, tauxUrgence, topPannes,
      tempsMoyen: tempsMoyen > 0 ? tempsMoyen.toFixed(1) : 0
    };
  }, [interventions]);

  const recent = useMemo(() => {
    return [...interventions]
      .sort((a, b) => new Date(b.dateCreation ?? b.dateDemande ?? 0) - new Date(a.dateCreation ?? a.dateDemande ?? 0))
      .slice(0, 8);
  }, [interventions]);

  const trends = useMemo(() => {
    const days = 7;
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = new Date(end);
      d.setDate(end.getDate() - (days - 1 - i));
      return d.getTime();
    });
    const isSameDay = (a, b) => {
      const da = new Date(a);
      const db = new Date(b);
      return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
    };
    const total = buckets.map((ts) =>
      interventions.filter((x) => {
        const d = x.dateCreation || x.dateDemande;
        if (!d) return false;
        return isSameDay(d, ts);
      }).length
    );
    const enCours = buckets.map((ts) =>
      interventions.filter((x) => {
        const d = x.dateCreation || x.dateDemande;
        if (!d) return false;
        return String(x.statut) === 'EN_COURS' && isSameDay(d, ts);
      }).length
    );
    return { buckets, total, enCours };
  }, [interventions]);

  const spark = (values, width = 260, height = 64, color = "#2563eb") => {
    const max = Math.max(1, ...values);
    const step = values.length > 1 ? width / (values.length - 1) : width;
    const pts = values.map((v, i) => {
      const x = i * step;
      const y = height - (v / max) * height;
      return [x, y];
    });
    const d = pts.map((p, i) => (i ? `L${p[0]},${p[1]}` : `M${p[0]},${p[1]}`)).join(" ");
    return (
      <svg width={width} height={height} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        <path d={`${d} L ${width},${height} L 0,${height} Z`} fill="url(#g1)" opacity="0.6" />
      </svg>
    );
  };

  return (
    <>
      <GlobalFx />
      
      {/* Background avec éléments décoratifs flottants */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)',
        zIndex: -2
      }}>
        {/* Éléments décoratifs flottants */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${20 + i * 10}px`,
              height: `${20 + i * 10}px`,
              background: `linear-gradient(45deg, ${i % 2 === 0 ? '#00d4ff, #0078d4' : '#ff006e, #8338ec'})`,
              borderRadius: '50%',
              top: `${10 + i * 15}%`,
              left: `${5 + i * 15}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              filter: 'blur(1px)',
              opacity: 0.6
            }}
          />
        ))}
      </div>

      <div style={{
        minHeight: '100vh',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.6s ease-out'
        }}>

        <div style={{ padding: '2rem', position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,48,97,0.95) 0%, rgba(0,120,212,0.9) 50%, rgba(0,48,97,0.95) 100%)',
            borderRadius: '24px',
            padding: '2.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 40px rgba(0,48,97,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            animation: 'slideInLeft 0.8s ease-out',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,255,255,0.15) 0%, transparent 50%)`,
              zIndex: -1
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ animation: 'fadeInUp 1s ease-out 0.2s both' }}>
                <h1 style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  color: '#ffffff',
                  margin: 0,
                  marginBottom: '0.75rem',
                  fontFamily: 'Inter, sans-serif',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                  🏢 {t("dashboard.title", "Tableau de bord Chef Secteur")}
                </h1>
                <p style={{
                  fontSize: '1.25rem',
                  color: 'rgba(255,255,255,0.95)',
                  margin: 0,
                  fontWeight: '500',
                  textShadow: '0 1px 5px rgba(0,0,0,0.2)'
                }}>
                  {t("dashboard.subtitle", "Vue d'ensemble des interventions et actions rapides")}
                </p>
              </div>
              
              <div style={{ display: "flex", gap: 10, flexWrap: 'wrap' }}>
                <Link to="/admin/assign-intervention" style={{
                  ...page.pillBtn(THEME.indigo),
                  transition: 'all 0.3s ease',
                  animation: 'fadeInUp 1s ease-out 0.4s both'
                }}>📌 Assigner</Link>
                <Link to="/admin/validation-interventions" style={{
                  ...page.pillBtn(THEME.primary),
                  transition: 'all 0.3s ease',
                  animation: 'fadeInUp 1s ease-out 0.5s both'
                }}>✅ Valider</Link>
                <Link to="/admin/listebont" style={{
                  ...page.pillBtn(THEME.teal),
                  transition: 'all 0.3s ease',
                  animation: 'fadeInUp 1s ease-out 0.6s both'
                }}>📋 Bons</Link>
              </div>
            </div>
          </div>

      {loading ? (
        <div style={{ ...page.card, textAlign: "center", padding: 28 }}>Chargement...</div>
      ) : error ? (
        <div style={{ ...page.card, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c" }}>{error}</div>
      ) : (
        <>
          {/* Stats Cards avec design moderne */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {[
              {
                title: 'Total Interventions',
                value: stats.total,
                icon: '📊',
                color: '#0078d4',
                bgGradient: 'linear-gradient(135deg, rgba(0,120,212,0.1) 0%, rgba(0,48,97,0.05) 100%)',
                badge: `${stats.enAttente} en attente`
              },
              {
                title: 'En Cours',
                value: stats.enCours,
                icon: '🔄',
                color: '#3b82f6',
                bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.05) 100%)',
                badge: `En traitement`
              },
              {
                title: 'Terminées',
                value: stats.terminee,
                icon: '✅',
                color: '#10b981',
                bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)',
                badge: `${stats.tauxResolution}% taux`
              },
              {
                title: 'Urgentes',
                value: stats.urgentes,
                icon: '🔥',
                color: '#ef4444',
                bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)',
                badge: `${stats.tauxUrgence}% curatives`
              }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '2rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: `0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 25px 60px rgba(0,48,97,0.25), inset 0 1px 0 rgba(255,255,255,0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`;
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: stat.bgGradient,
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
                      {stat.title}
                    </p>
                    <p style={{
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      color: '#003061',
                      margin: '0 0 0.5rem 0',
                      textShadow: '0 2px 4px rgba(0,48,97,0.2)',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {stat.value}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {stat.badge}
                    </p>
                  </div>
                  <div style={{
                    fontSize: '3rem',
                    opacity: 0.8,
                    animation: 'pulse 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                  }}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* KPIs avancés avec design moderne */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {[
              {
                title: 'Taux de Résolution',
                value: `${stats.tauxResolution}%`,
                icon: '📈',
                color: '#10b981',
                bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)',
                badge: `${stats.terminee} terminées / ${stats.total} total`
              },
              {
                title: 'Interventions Urgentes',
                value: stats.urgentes,
                icon: '⚡',
                color: '#ef4444',
                bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)',
                badge: `${stats.tauxUrgence}% des curatives`
              },
              {
                title: 'Temps Moyen',
                value: stats.tempsMoyen,
                icon: '⏱️',
                color: '#6366f1',
                bgGradient: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(79,70,229,0.05) 100%)',
                badge: 'jours de résolution'
              },
              {
                title: 'Top Panne',
                value: stats.topPannes[0]?.count || 0,
                icon: '🔧',
                color: '#f59e0b',
                bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.05) 100%)',
                badge: stats.topPannes[0]?.panne || "Aucune panne"
              }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '2rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: `0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeInUp 0.8s ease-out ${0.4 + index * 0.1}s both`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 25px 60px rgba(0,48,97,0.25), inset 0 1px 0 rgba(255,255,255,0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`;
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: stat.bgGradient,
                  zIndex: -1
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#374151',
                      margin: '0 0 0.75rem 0',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {stat.title}
                    </p>
                    <p style={{
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      color: '#003061',
                      margin: '0 0 0.5rem 0',
                      textShadow: '0 2px 4px rgba(0,48,97,0.2)',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {stat.value}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {stat.badge}
                    </p>
                  </div>
                  <div style={{
                    fontSize: '3rem',
                    opacity: 0.8,
                    animation: 'pulse 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
                    marginLeft: '1rem'
                  }}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top 5 pannes */}
          {stats.topPannes.length > 0 && (
            <div style={page.card}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>Top 5 des pannes</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {stats.topPannes.map((item, idx) => {
                  const maxCount = stats.topPannes[0].count;
                  const widthPercent = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ minWidth: 24, fontSize: 18, fontWeight: 900, color: "#64748b" }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                          {item.panne}
                        </div>
                        <div style={{ position: "relative", height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            height: "100%",
                            width: `${widthPercent}%`,
                            background: `linear-gradient(90deg, ${THEME.rose[0]}, ${THEME.rose[1]})`,
                            borderRadius: 999,
                            transition: "width 0.3s ease"
                          }} />
                        </div>
                      </div>
                      <div style={{ minWidth: 40, textAlign: "right", fontSize: 16, fontWeight: 900, color: THEME.rose[1] }}>
                        {item.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={page.card}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ fontSize:16, fontWeight:900, color:'#0f172a' }}>Tendances 7 jours</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ ...page.card, padding:12 }}>
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                  <div style={{ fontSize:13, color:'#475569', fontWeight:700 }}>Total interventions</div>
                  <div style={{ fontWeight:900, color:'#0f172a' }}>{trends.total.reduce((a,b)=>a+b,0)}</div>
                </div>
                <div style={{ marginTop:8 }}>{spark(trends.total, 300, 70, '#2563eb')}</div>
              </div>
              <div style={{ ...page.card, padding:12 }}>
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                  <div style={{ fontSize:13, color:'#475569', fontWeight:700 }}>En cours</div>
                  <div style={{ fontWeight:900, color:'#0f172a' }}>{trends.enCours.reduce((a,b)=>a+b,0)}</div>
                </div>
                <div style={{ marginTop:8 }}>{spark(trends.enCours, 300, 70, '#16a34a')}</div>
              </div>
            </div>
          </div>

          <div style={page.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>Dernières interventions</div>
              <Link to="/admin/interventions" style={{ ...page.pillBtn(THEME.primary), padding: "8px 12px", fontSize: 12 }}>Voir tout</Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={page.table}>
                <thead>
                  <tr>
                    <th style={page.th}>#</th>
                    <th style={page.th}>Titre</th>
                    <th style={page.th}>Type</th>
                    <th style={page.th}>Priorité</th>
                    <th style={page.th}>Statut</th>
                    <th style={page.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((it) => {
                    const statut = String(it.statut || "");
                    const type = String(it.typeDemande || "");
                    const d = it.dateCreation || it.dateDemande;
                    return (
                      <tr key={it.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                        <td style={{ ...page.td, fontWeight: 800 }}>#{it.id}</td>
                        <td style={page.td}>{it.description || "—"}</td>
                        <td style={page.td}>
                          <span style={type === "CURATIVE" ? page.badge("#fee2e2", "#b91c1c") : page.badge("#dcfce7", "#166534")}>
                            {type === "CURATIVE" ? "🔧 Curative" : "🛠️ Préventive"}
                          </span>
                        </td>
                        <td style={page.td}>
                          <span style={page.badge("#ede9fe", "#5b21b6")}>{it.priorite || "—"}</span>
                        </td>
                        <td style={page.td}>
                          <span style={
                            statut === "EN_ATTENTE"
                              ? page.badge("#fef3c7", "#a16207")
                              : statut === "EN_COURS"
                              ? page.badge("#dbeafe", "#1d4ed8")
                              : statut === "REFUSEE"
                              ? page.badge("#fee2e2", "#b91c1c")
                              : page.badge("#dcfce7", "#166534")
                          }>
                            {statut === "EN_ATTENTE" ? "⏳ En attente" : statut === "EN_COURS" ? "🔄 En cours" : statut === "REFUSEE" ? "❌ Refusée" : "✅ Terminée"}
                          </span>
                        </td>
                        <td style={{ ...page.td, color: "#64748b" }}>{d ? new Date(d).toLocaleDateString("fr-FR") : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
        </div>
        </div>
      </div>
    </>
  );
}
