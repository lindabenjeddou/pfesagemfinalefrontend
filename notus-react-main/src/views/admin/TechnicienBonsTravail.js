import React, { useState, useEffect } from "react";
import { useSecurity } from "../../contexts/SecurityContext";

export default function TechnicienBonsTravail() {
  const { user } = useSecurity();
  const [bons, setBons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedBon, setSelectedBon] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchMesBons = async () => {
    if (!user?.userId && !user?.id) return;
    
    try {
      const technicienId = user.userId || user.id;
      const url = filter === "ALL" 
        ? `http://localhost:8089/PI/pi/bons/mes?technicienId=${technicienId}`
        : `http://localhost:8089/PI/pi/bons/mes?technicienId=${technicienId}&statut=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBons(data);
      } else {
        setError("Erreur lors du chargement des bons de travail");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesBons();
  }, [user, filter]);

  const demarrerBon = async (bonId) => {
    try {
      const response = await fetch(`http://localhost:8089/PI/pi/bons/${bonId}/debut-reel?technicienId=${user.userId || user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateDebutReel: new Date().toISOString() })
      });
      
      if (response.ok) {
        fetchMesBons();
      }
    } catch (error) {
      console.error("Erreur démarrage:", error);
    }
  };

  const terminerBon = async (bonId, rapport, tempsPasseH) => {
    try {
      const response = await fetch(`http://localhost:8089/PI/pi/bons/${bonId}/fin-reel?technicienId=${user.userId || user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateFinReel: new Date().toISOString(),
          rapport,
          tempsPasseH: parseFloat(tempsPasseH)
        })
      });
      
      if (response.ok) {
        setShowModal(false);
        fetchMesBons();
      }
    } catch (error) {
      console.error("Erreur clôture:", error);
    }
  };

  const getStatutBadge = (statut) => {
    const styles = {
      PLANIFIE: { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e', border: 'rgba(146, 64, 14, 0.2)' },
      EN_COURS: { bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1e40af', border: 'rgba(30, 64, 175, 0.2)' },
      TERMINE: { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#065f46', border: 'rgba(6, 95, 70, 0.2)' }
    };
    
    const style = styles[statut] || styles.PLANIFIE;
    
    return (
      <span style={{
        padding: '0.5rem 1rem',
        borderRadius: '1rem',
        fontSize: '0.75rem',
        fontWeight: '700',
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`
      }}>
        {statut.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #003061',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#003061', fontWeight: '600' }}>Chargement de vos bons de travail...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: '#003061',
            padding: '2rem',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}>
                🔧
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
                  Mes Bons de Travail
                </h1>
                <p style={{ opacity: 0.8, margin: 0 }}>
                  Interventions assignées et en cours
                </p>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ALL', 'PLANIFIE', 'EN_COURS', 'TERMINE'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: filter === status ? '#003061' : '#f3f4f6',
                    color: filter === status ? 'white' : '#374151',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {status === 'ALL' ? 'Tous' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Liste des bons */}
          <div style={{ padding: '1.5rem' }}>
            {bons.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                  Aucun bon de travail
                </h3>
                <p>Aucun bon de travail trouvé pour ce filtre</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {bons.map(bon => (
                  <div
                    key={bon.id}
                    style={{
                      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      transition: 'all 0.3s ease',
                      animation: 'fadeInUp 0.5s ease-out'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#1f2937' }}>
                          {bon.description}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                          Intervention: {bon.intervention?.description || 'N/A'}
                        </p>
                      </div>
                      {getStatutBadge(bon.statut)}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>📅 PLANIFIÉ</span>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                          {bon.dateDebut ? new Date(bon.dateDebut).toLocaleDateString('fr-FR') : 'Non défini'} - 
                          {bon.dateFin ? new Date(bon.dateFin).toLocaleDateString('fr-FR') : 'Non défini'}
                        </p>
                      </div>
                      {bon.dateDebutReel && (
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>🚀 RÉEL</span>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                            {new Date(bon.dateDebutReel).toLocaleDateString('fr-FR')} - 
                            {bon.dateFinReel ? new Date(bon.dateFinReel).toLocaleDateString('fr-FR') : 'En cours'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {bon.statut === 'PLANIFIE' && (
                        <button
                          onClick={() => demarrerBon(bon.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          🚀 Démarrer
                        </button>
                      )}
                      {bon.statut === 'EN_COURS' && (
                        <button
                          onClick={() => {
                            setSelectedBon(bon);
                            setShowModal(true);
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          🏁 Terminer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de clôture */}
        {showModal && selectedBon && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
                Terminer le bon de travail
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                terminerBon(selectedBon.id, formData.get('rapport'), formData.get('tempsPasseH'));
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Rapport d'intervention
                  </label>
                  <textarea
                    name="rapport"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                    placeholder="Décrivez le travail effectué..."
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Temps passé (heures)
                  </label>
                  <input
                    type="number"
                    name="tempsPasseH"
                    step="0.25"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                    placeholder="Ex: 2.5"
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#003061',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Terminer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
