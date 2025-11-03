// src/views/admin/Testeurs.jsx
import React, { useEffect, useMemo, useState } from "react";

/* =========================
   Endpoints API
   ========================= */
const API_BASE = "http://localhost:8089/PI/PI/testeurs";
const API_ALL = `${API_BASE}/all`;
const API_CREATE = `${API_BASE}/create`;
const API_UPDATE = (atelier, ligne) =>
  `${API_BASE}/update/${encodeURIComponent(atelier)}/${encodeURIComponent(ligne)}`;
const API_DELETE = (atelier, ligne) =>
  `${API_BASE}/delete/${encodeURIComponent(atelier)}/${encodeURIComponent(ligne)}`;
// ➕ Endpoint interventions (pour calculer MTTR par codeGMAO)
const API_INTERVENTIONS = "http://localhost:8089/PI/demandes/recuperer/all";

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
   Helpers date / stats (pour MTTR)
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
const diffHours = (a, b) => (a && b ? Math.max(0, (b.getTime() - a.getTime()) / 36e5) : null);
const avg = (arr) => (arr.length ? arr.reduce((s, x) => s + (Number(x) || 0), 0) / arr.length : 0);


/* =========================
   Icônes mini
   ========================= */
const PreviousIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "1.25rem", width: "1.25rem" }} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);
const NextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "1.25rem", width: "1.25rem" }} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "1.1rem", width: "1.1rem" }} viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "1.1rem", width: "1.1rem" }} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "1.1rem", width: "1.1rem" }} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-2.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
  </svg>
);

/* =========================
   Modal générique
   ========================= */
const Modal = ({ isOpen, onClose, width = 560, children }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{ ...styles.modalCard, width }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={styles.modalClose}>×</button>
        {children}
      </div>
    </div>
  );
};

/* =========================
   Composant principal
   ========================= */
export default function Testeurs() {
  // data & ui
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // table state
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const [openRows, setOpenRows] = useState(() => new Set());

  // CRUD modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null); // {codeGMAO, atelier, ligne, bancTest}
  const [showDelete, setShowDelete] = useState(false);
  const [toDelete, setToDelete] = useState(null); // {atelier, ligne}

  // ➕ Interventions pour calcul MTTR
  const [interventions, setInterventions] = useState([]);

  // Fetch
  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const [resT, resI] = await Promise.all([
        fetch(API_ALL, { headers: authHeaders() }),
        fetch(API_INTERVENTIONS, { headers: authHeaders() }),
      ]);
      if (!resT.ok || !resI.ok) throw new Error("HTTP error");
      const [dataT, dataI] = await Promise.all([resT.json(), resI.json()]);
      setRows(Array.isArray(dataT) ? dataT : []);
      setInterventions(Array.isArray(dataI) ? dataI : []);
    } catch (e) {
      console.error(e);
      setErr("Impossible de charger les testeurs.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  // filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((t) =>
      [t.codeGMAO, t.atelier, t.ligne, t.bancTest]
        .map((v) => (v ?? "").toString().toLowerCase())
        .some((s) => s.includes(q))
    );
  }, [rows, search]);

  // ➕ MTTR (heures) et nombre d'interventions par codeGMAO basé sur testeurCodeGMAO
  const statsParTesteur = useMemo(() => {
    if (!interventions?.length) return new Map();
    
    const statsMap = new Map();
    
    rows.forEach((testeur) => {
      // Filtrer les interventions par testeurCodeGMAO (comme dans HistoriqueTesteur)
      const interventionsTesteur = interventions.filter(
        i => i.testeurCodeGMAO === testeur.codeGMAO
      );
      
      // Nombre total d'interventions
      const nombreInterventions = interventionsTesteur.length;
      
      // Calcul MTTR uniquement pour les interventions avec dates
      const interventionsAvecDates = interventionsTesteur.filter(
        i => i.dateDemande && (i.dateValidation || i.dateCloture || i.derniereMaj)
      );
      
      let mttr = null;
      if (interventionsAvecDates.length > 0) {
        const durations = interventionsAvecDates.map((i) => {
          const start = toJsDate(i.dateDemande);
          const end = toJsDate(i.dateValidation) || toJsDate(i.dateCloture) || toJsDate(i.derniereMaj);
          return diffHours(start, end);
        }).filter((v) => v != null && isFinite(v));
        
        if (durations.length > 0) {
          mttr = avg(durations);
        }
      }
      
      statsMap.set(testeur.codeGMAO, {
        nombreInterventions,
        mttr,
        interventionsIds: interventionsTesteur.map(i => i.id)
      });
    });
    
    return statsMap;
  }, [rows, interventions]);

  // pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const handlePageChange = (p) => {
    if (p > 0 && p <= totalPages) setCurrentPage(p);
  };
  const toggleOpen = (key) => {
    setOpenRows((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  // export CSV (➕ mttr_h)
  const exportCsv = () => {
    const rowsCsv = [
      ["codeGMAO", "atelier", "ligne", "bancTest", "mttr_h", "nombreInterventions", "interventionIds"],
      ...filtered.map((t) => {
        const stats = statsParTesteur.get(t.codeGMAO) || { nombreInterventions: 0, mttr: null, interventionsIds: [] };
        return [
          t.codeGMAO ?? "",
          t.atelier ?? "",
          t.ligne ?? "",
          t.bancTest ?? "",
          stats.mttr != null ? Math.round(stats.mttr) : "",
          stats.nombreInterventions,
          stats.interventionsIds.join("|"),
        ];
      }),
    ];
    const csv = rowsCsv
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "testeurs.csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  // ======== CRUD ========
  const buildPayload = (form) => ({
    codeGMAO: form.codeGMAO?.trim() || "",
    atelier: form.atelier?.trim() || "",
    ligne: form.ligne?.toString().trim() || "",
    bancTest: form.bancTest?.trim() || "",
  });

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = buildPayload(Object.fromEntries(fd.entries()));

    if (!payload.atelier || !payload.ligne) {
      alert("Atelier et Ligne sont obligatoires.");
      return;
    }
    try {
      const res = await fetch(API_CREATE, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowCreate(false);
      await load();
    } catch (err) {
      console.error(err);
      alert("Création impossible.");
    }
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = buildPayload(Object.fromEntries(fd.entries()));

    try {
      const res = await fetch(API_UPDATE(editing.atelier, editing.ligne), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowEdit(false);
      await load();
    } catch (err) {
      console.error(err);
      alert("Mise à jour impossible.");
    }
  };

  const onDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await fetch(API_DELETE(toDelete.atelier, toDelete.ligne), {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowDelete(false);
      await load();
    } catch (err) {
      console.error(err);
      alert("Suppression impossible.");
    }
  };

  // ======== Rendu ========
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loaderCard}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🧪</div>
          <div style={{ fontSize: "1.2rem", color: "#003061" }}>Chargement des testeurs…</div>
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
        <div style={{ maxWidth: 1200, width: "100%" }}>
          {/* Header */}
          <div style={styles.headerCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={styles.headerIcon}>🧰</div>
              <div>
                <h1 style={styles.headerTitle}>Testeurs</h1>
                <p style={styles.headerSubtitle}>Gestion des bancs de test — Sagemcom</p>
              </div>
            </div>
          </div>

          {/* Top bar */}
          <div style={styles.toolbar}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Rechercher par code, atelier, ligne, banc…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                style={styles.searchInput}
              />
              <button onClick={() => setShowCreate(true)} style={styles.primaryBtn}>➕ Ajouter</button>
              <button onClick={exportCsv} style={styles.secondaryBtn}>⬇️ Export CSV</button>
            </div>
            <div>
              <label style={{ fontSize: 12, marginRight: 8, color: "#334155" }}>Cartes / page</label>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={styles.select}>
                {[6, 9, 12, 18].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Grille de cartes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {filtered.slice(indexOfFirst, indexOfLast).map((t, idx) => {
              const key = `${t.atelier}|${t.ligne}`;
              const isOpen = openRows.has(key);
              
              // Récupérer les stats réelles basées sur testeurCodeGMAO
              const stats = statsParTesteur.get(t.codeGMAO) || { nombreInterventions: 0, mttr: null, interventionsIds: [] };
              const displayMttr = stats.mttr != null ? Math.round(stats.mttr) : null;
              const displayInterventions = stats.nombreInterventions;
              const interventionsList = stats.interventionsIds || [];
              
              return (
                <div
                  key={key}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s both`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 25px 60px rgba(0,48,97,0.25), inset 0 1px 0 rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)';
                  }}
                >
                  {/* Header de la carte */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #003061, #0078d4)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '800',
                        marginBottom: '0.75rem',
                        boxShadow: '0 4px 12px rgba(0, 48, 97, 0.3)'
                      }}>
                        👤 {t.codeGMAO || "Sans Code"}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        style={styles.iconBtnPrimary} 
                        title="Détails" 
                        onClick={() => toggleOpen(key)}
                      >
                        <EyeIcon />
                      </button>
                      <button 
                        style={styles.iconBtnDark} 
                        title="Modifier" 
                        onClick={() => { setEditing({ ...t }); setShowEdit(true); }}
                      >
                        <EditIcon />
                      </button>
                      <button 
                        style={styles.iconBtnDanger} 
                        title="Supprimer" 
                        onClick={() => { setToDelete({ atelier: t.atelier, ligne: t.ligne }); setShowDelete(true); }}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>

                  {/* Informations principales */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          marginBottom: '0.25rem'
                        }}>🏭 Atelier</div>
                        <div style={{
                          fontSize: '1rem',
                          color: '#111827',
                          fontWeight: '700'
                        }}>{t.atelier || "—"}</div>
                      </div>
                      
                      <div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          marginBottom: '0.25rem'
                        }}>📏 Ligne</div>
                        <div style={{
                          display: 'inline-block',
                          background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)',
                          border: '1px solid rgba(3,105,161,.25)',
                          color: '#0369a1',
                          borderRadius: '10px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.9rem',
                          fontWeight: '700'
                        }}>{t.ligne || "—"}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginBottom: '0.25rem'
                      }}>🧪 Banc de test</div>
                      <div style={{
                        fontSize: '0.95rem',
                        color: '#374151',
                        fontWeight: '500',
                        lineHeight: '1.4'
                      }}>{t.bancTest || "Non spécifié"}</div>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: 'rgba(0, 48, 97, 0.03)',
                    borderRadius: '12px',
                    marginBottom: isOpen ? '1rem' : '0'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#6b7280',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginBottom: '0.25rem'
                      }}>⏱️ MTTR</div>
                      <div style={{
                        display: 'inline-block',
                        background: displayMttr != null ? 'linear-gradient(135deg, #ecfdf5, #f0fdf4)' : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                        border: displayMttr != null ? '1px solid rgba(34,197,94,.25)' : '1px solid rgba(156,163,175,.25)',
                        color: displayMttr != null ? '#16a34a' : '#9ca3af',
                        borderRadius: '10px',
                        padding: '0.4rem 0.75rem',
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        fontFamily: 'monospace'
                      }}>
                        {displayMttr != null ? `${displayMttr} h` : '—'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#6b7280',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginBottom: '0.25rem'
                      }}>📎 Interventions</div>
                      <div style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
                        border: '1px solid rgba(34,197,94,.25)',
                        color: '#16a34a',
                        borderRadius: '10px',
                        padding: '0.4rem 0.75rem',
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        fontFamily: 'monospace'
                      }}>
                        {displayInterventions}
                      </div>
                    </div>
                  </div>

                  {/* Détails interventions (si ouvert) */}
                  {isOpen && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'rgba(0, 48, 97, 0.03)',
                      borderRadius: '12px',
                      animation: 'fadeInUp 0.3s ease-out'
                    }}>
                      <h4 style={{
                        margin: '0 0 0.75rem 0',
                        fontSize: '0.9rem',
                        color: '#374151',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>🔍 Interventions liées ({interventionsList.length})</h4>
                      
                      {interventionsList.length > 0 ? (
                        <div style={{
                          maxHeight: '200px',
                          overflowY: 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          {interventionsList.map((id, i) => (
                            <div
                              key={`${key}-${id}-${i}`}
                              style={{
                                background: 'white',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              <div style={{
                                background: 'linear-gradient(135deg, #003061, #0078d4)',
                                color: 'white',
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                fontWeight: '700'
                              }}>{i + 1}</div>
                              <div style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#111827',
                                fontFamily: 'monospace'
                              }}>Intervention #{id}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          padding: '1rem',
                          color: '#9ca3af',
                          fontSize: '0.9rem'
                        }}>
                          Aucune intervention liée à ce testeur
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Message si aucun résultat */}
          {filtered.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              boxShadow: '0 15px 40px rgba(0,48,97,0.15)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.2rem', color: '#374151', marginBottom: '0.5rem' }}>
                Aucun testeur trouvé
              </h3>
              <p style={{ color: '#6b7280' }}>
                Aucun testeur ne correspond à votre recherche.
              </p>
            </div>
          )}

          {/* Pagination moderne */}
          {filtered.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              {/* Info pagination */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                color: '#374151',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                <span>
                  📊 Affichage {indexOfFirst + 1} à {Math.min(indexOfLast, filtered.length)} sur {filtered.length} testeurs
                </span>
              </div>

              {/* Boutons navigation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: currentPage === 1 ? 'linear-gradient(135deg, #e5e7eb, #d1d5db)' : 'linear-gradient(135deg, #003061, #0078d4)',
                    color: 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: currentPage === 1 ? 'none' : '0 4px 12px rgba(0, 48, 97, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 48, 97, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 48, 97, 0.3)';
                    }
                  }}
                >
                  <PreviousIcon />
                  <span>Précédent</span>
                </button>

                {/* Indicateur de page */}
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  border: '2px solid #f59e0b',
                  borderRadius: '12px',
                  padding: '0.6rem 1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '800',
                  color: '#92400e'
                }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Page</span>
                  <span style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>{currentPage}</span>
                  <span>/</span>
                  <span style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>{totalPages}</span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: currentPage === totalPages ? 'linear-gradient(135deg, #e5e7eb, #d1d5db)' : 'linear-gradient(135deg, #003061, #0078d4)',
                    color: 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: currentPage === totalPages ? 'none' : '0 4px 12px rgba(0, 48, 97, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 48, 97, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 48, 97, 0.3)';
                    }
                  }}
                >
                  <span>Suivant</span>
                  <NextIcon />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} width={560}>
        <h3 style={styles.modalTitle}>➕ Ajouter un testeur</h3>
        <form onSubmit={onCreateSubmit}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Code GMAO</label>
              <input name="codeGMAO" placeholder="Ex. TST-001" style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Atelier</label>
              <input name="atelier" placeholder="Ex. ATL-1" style={styles.input} required />
            </div>
            <div>
              <label style={styles.label}>Ligne</label>
              <input name="ligne" placeholder="Ex. 12" style={styles.input} required />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={styles.label}>Banc de test</label>
              <input name="bancTest" placeholder="Nom / modèle" style={styles.input} />
            </div>
          </div>
          <div style={{ textAlign: "right", marginTop: 10 }}>
            <button type="button" onClick={() => setShowCreate(false)} style={styles.secondaryBtn}>Annuler</button>
            <button type="submit" style={{ ...styles.primaryBtn, marginLeft: 8 }}>Enregistrer</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} width={560}>
        <h3 style={styles.modalTitle}>✏️ Modifier le testeur</h3>
        {editing && (
          <form onSubmit={onEditSubmit}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Code GMAO</label>
                <input name="codeGMAO" defaultValue={editing.codeGMAO || ""} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Atelier</label>
                <input name="atelier" defaultValue={editing.atelier || ""} style={styles.input} required />
              </div>
              <div>
                <label style={styles.label}>Ligne</label>
                <input name="ligne" defaultValue={editing.ligne || ""} style={styles.input} required />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label}>Banc de test</label>
                <input name="bancTest" defaultValue={editing.bancTest || ""} style={styles.input} />
              </div>
            </div>
            <div style={{ textAlign: "right", marginTop: 10 }}>
              <button type="button" onClick={() => setShowEdit(false)} style={styles.secondaryBtn}>Annuler</button>
              <button type="submit" style={{ ...styles.primaryBtn, marginLeft: 8 }}>Mettre à jour</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} width={420}>
        <h3 style={styles.modalTitle}>🗑️ Supprimer</h3>
        <p style={{ color: "#334155", marginBottom: 16 }}>
          Confirmer la suppression du testeur <strong>{toDelete?.atelier}</strong> / <strong>{toDelete?.ligne}</strong> ?
        </p>
        <div style={{ textAlign: "right" }}>
          <button type="button" onClick={() => setShowDelete(false)} style={styles.secondaryBtn}>Annuler</button>
          <button onClick={onDelete} style={{ ...styles.dangerBtn, marginLeft: 8 }}>Supprimer</button>
        </div>
      </Modal>
    </>
  );
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

  toolbar: {
    background: "white",
    borderRadius: 16,
    padding: "0.75rem",
    border: "1px solid rgba(0,48,97,.08)",
    boxShadow: "0 8px 18px rgba(0,0,0,.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    gap: 10,
    flexWrap: "wrap",
  },
  searchInput: {
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: ".55rem .75rem",
    minWidth: 260,
    outline: "none",
  },
  select: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: ".35rem .5rem",
  },

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
  tdStrong: {
    border: "none",
    borderBottom: "1px solid #eef2f7",
    padding: "0.75rem 0.9rem",
    fontSize: ".9rem",
    fontWeight: 700,
    color: "#111827",
  },
  ellipsis: {
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },

  subRowCell: {
    background: "linear-gradient(145deg,#fff,#f8fafc)",
    border: "1px solid #eef2f7",
    padding: "1rem",
  },
  subTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  subTh: {
    textAlign: "left",
    padding: ".5rem .6rem",
    fontSize: 12,
    color: "#475569",
    borderBottom: "1px solid #e5e7eb",
  },
  subTd: {
    padding: ".5rem .6rem",
    fontSize: 13,
    borderBottom: "1px solid #f1f5f9",
  },

  paginationCard: {
    marginTop: "1rem",
    background: "linear-gradient(145deg, #ffffff, #f8fafc)",
    borderRadius: "1rem",
    padding: "1rem",
    boxShadow: "0 10px 25px rgba(0, 48, 97, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
    border: "1px solid rgba(0, 48, 97, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paginationLeft: {},
  paginationRight: {},
  pageBtn: {
    background: "#003061",
    color: "white",
    border: "none",
    borderRadius: ".75rem",
    padding: ".6rem .9rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0, 48, 97, 0.3)",
  },
  pageBtnDisabled: {
    background: "linear-gradient(135deg,#9ca3af,#6b7280)",
    color: "white",
    border: "none",
    borderRadius: ".75rem",
    padding: ".6rem .9rem",
    cursor: "not-allowed",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(156,163,175,.3)",
  },
  pageIndicator: {
    background: "linear-gradient(135deg,#fef3c7,#fef9e7)",
    border: "2px solid #f59e0b",
    borderRadius: ".75rem",
    padding: ".55rem .9rem",
    display: "inline-flex",
    alignItems: "center",
    gap: ".4rem",
  },

  badgePrimary: {
    display: "inline-block",
    background: "linear-gradient(135deg,#003061,#0066cc)",
    color: "#fff",
    borderRadius: 10,
    padding: ".25rem .6rem",
    fontSize: ".85rem",
    fontWeight: 800,
    boxShadow: "0 2px 6px rgba(0,0,0,.12)",
  },
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

  primaryBtn: {
    padding: ".65rem 1rem",
    background: "linear-gradient(135deg, #003061, #0066cc)",
    color: "white",
    border: 0,
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: ".55rem .9rem",
    background: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  iconBtnPrimary: {
    background: "#003061",
    color: "white",
    border: 0,
    borderRadius: 10,
    padding: ".45rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0, 48, 97, 0.3)",
  },
  iconBtnDark: {
    background: "#111827",
    color: "white",
    border: 0,
    borderRadius: 10,
    padding: ".45rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  },
  iconBtnDanger: {
    background: "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "white",
    border: 0,
    borderRadius: 10,
    padding: ".45rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(239,68,68,.3)",
  },

  modalCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "1rem",
    border: "1px solid rgba(0,48,97,.08)",
    boxShadow: "0 18px 36px rgba(0,0,0,.12)",
    position: "relative",
  },
  modalClose: {
    position: "absolute",
    top: 8, right: 12,
    background: "transparent",
    border: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#334155",
    cursor: "pointer",
  },
  modalTitle: { margin: 0, marginBottom: 12, fontSize: 18, fontWeight: 800, color: "#0f172a" },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  label: { fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 },
  input: {
    width: "100%",
    padding: ".6rem .75rem",
    borderRadius: 12,
    border: "2px solid #e5e7eb",
    outline: "none",
  },
  dangerBtn: {
    padding: ".6rem .9rem",
    background: "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "#fff",
    border: 0,
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
};

const globalKeyframes = `
@keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
