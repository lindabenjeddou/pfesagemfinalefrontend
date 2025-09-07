import React, { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useSecurity } from "../contexts/SecurityContext";

export default function TechnicianSchedule() {
  const { t } = useLanguage();
  const { user } = useSecurity();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log('🔄 useEffect déclenché, user:', user);
    if (user?.userId || user?.id) {
      console.log('✅ User trouvé, lancement du fetch');
      fetchInterventions();
    } else {
      console.log('⚠️ Pas d\'user, arrêt du loading');
      setLoading(false);
      setError("Utilisateur non connecté");
    }
  }, [user?.userId, user?.id]); // Dépendance plus spécifique

  const fetchInterventions = async () => {
    console.log('🚀 DEBUT fetchInterventions - TechnicianSchedule');
    console.log('🚀 User object:', user);
    
    if (!user?.userId && !user?.id) {
      console.log('❌ Pas d\'utilisateur connecté');
      setError("Utilisateur non connecté");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout - arrêt du fetch');
      setLoading(false);
      setError("Timeout - impossible de charger les interventions");
    }, 10000);

    try {
      console.log('📡 Début fetch interventions...');
      const response = await fetch("http://localhost:8089/PI/PI/demandes/recuperer/all");
      
      clearTimeout(timeoutId);
      
      console.log('📡 Réponse:', response.status, response.ok);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Data reçue:', data?.length || 0, 'interventions');
      console.log('📊 Première intervention complète:', data[0]);
      
      const userId = user?.userId || user?.id;
      console.log('👤 User ID connecté:', userId);
      
      // Analyser chaque intervention pour trouver le lien avec le technicien
      const filtered = data.filter(intervention => {
        console.log('🔍 Analyse intervention:', intervention.id);
        console.log('🔍 demandeur:', intervention.demandeur);
        console.log('🔍 demandeurId:', intervention.demandeurId);
        console.log('🔍 userId connecté:', userId);
        console.log('🔍 Tous les champs:', Object.keys(intervention));
        
        const notCompleted = intervention.statut !== 'TERMINE' && intervention.statut !== 'ANNULE';
        
        // Vérifier si l'intervention est assignée à ce technicien via demandeurId
        const isAssignedToUser = intervention.demandeurId === parseInt(userId);
        
        console.log(`Intervention ${intervention.id}: demandeurId=${intervention.demandeurId}, userId=${userId}, assignée=${isAssignedToUser}, notCompleted=${notCompleted}`);
        
        return isAssignedToUser && notCompleted;
      });
      
      console.log('✅ Filtré:', filtered.length, 'interventions');
      setInterventions(filtered);
      
      if (filtered.length === 0) {
        setError("Aucune intervention disponible");
      } else {
        setError(""); // Clear any previous error
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("❌ Erreur:", error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
      console.log('🏁 Fetch terminé');
    }
  };

  const markInterventionCompleted = async (interventionId) => {
    try {
      console.log('🔄 Marquage terminé pour intervention:', interventionId);
      
      const response = await fetch(`http://localhost:8089/PI/PI/demandes/update/${interventionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: 'TERMINEE' })
      });
      
      console.log('📡 Réponse marquage:', response.status, response.ok);
      
      if (response.ok) {
        console.log('✅ Intervention marquée comme terminée');
        // Refresh the list
        await fetchInterventions();
        
        // Send completion notification
        await sendCompletionNotification(interventionId);
      } else {
        console.error('❌ Erreur marquage:', response.status);
      }
    } catch (error) {
      console.error("❌ Erreur marquage terminé:", error);
    }
  };

  const sendCompletionNotification = async (interventionId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8089/PI/user-profile/${user.userId}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activityType: 'INTERVENTION_COMPLETED',
          description: `Intervention #${interventionId} terminée avec succès`,
          icon: '✅',
          relatedEntityId: interventionId,
          relatedEntityType: 'INTERVENTION'
        })
      });
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  };

  const getPriorityColor = (priorite) => {
    switch (priorite) {
      case 'CRITIQUE': return '#ef4444';
      case 'HAUTE': return '#f97316';
      case 'NORMALE': return '#eab308';
      case 'FAIBLE': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'TERMINE': return '#22c55e';
      case 'EN_COURS': return '#3b82f6';
      case 'EN_ATTENTE': return '#eab308';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6c757d'
      }}>
        Chargement de votre emploi du temps...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #003061 0%, #0066cc 70%, #4da6ff 100%)',
          padding: '3rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            margin: '0 0 1rem 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            🔧 Mon Emploi du Temps
          </h1>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.9,
            margin: 0
          }}>
            Interventions assignées et planning
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '3rem' }}>
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {interventions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderRadius: '16px',
              border: '1px solid rgba(0, 48, 97, 0.1)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ fontSize: '1.5rem', color: '#003061', marginBottom: '1rem' }}>
                Aucune intervention assignée
              </h3>
              <p style={{ color: '#6b7280' }}>
                Votre emploi du temps est libre pour le moment.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '2rem'
            }}>
              {interventions.map((intervention, index) => (
                <div
                  key={intervention.id}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid rgba(0, 48, 97, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{
                      color: '#003061',
                      margin: 0,
                      flex: 1
                    }}>
                      {intervention.taskDescription || intervention.titre || 'Intervention'}
                    </h3>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexDirection: 'column',
                      alignItems: 'flex-end'
                    }}>
                      <span style={{
                        background: getPriorityColor(intervention.priority || intervention.priorite),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {intervention.priority || intervention.priorite || 'NORMALE'}
                      </span>
                      <span style={{
                        background: getStatusColor(intervention.status || intervention.statut),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {intervention.status || intervention.statut || 'EN_ATTENTE'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    color: '#6b7280',
                    marginBottom: '1.5rem',
                    lineHeight: '1.6'
                  }}>
                    {intervention.taskDescription || intervention.description || 'Aucune description disponible'}
                  </p>

                  {/* Date */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    <span>📅</span>
                    <span>
                      {intervention.startDate 
                        ? `Début: ${new Date(intervention.startDate).toLocaleDateString()}`
                        : intervention.dateAssignation 
                        ? `Assignée le: ${new Date(intervention.dateAssignation).toLocaleDateString()}`
                        : 'Date non spécifiée'
                      }
                    </span>
                  </div>

                  {/* Actions */}
                  {(intervention.status || intervention.statut) !== 'TERMINE' && (
                    <div style={{
                      display: 'flex',
                      gap: '1rem'
                    }}>
                      <button
                        onClick={() => markInterventionCompleted(intervention.id)}
                        style={{
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        ✅ Marquer terminé
                      </button>
                    </div>
                  )}

                  {(intervention.status || intervention.statut) === 'TERMINE' && (
                    <div style={{
                      background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                      color: '#166534',
                      padding: '1rem',
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      ✅ Intervention terminée
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
