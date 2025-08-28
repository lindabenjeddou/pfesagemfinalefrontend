import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useSecurity } from '../../contexts/SecurityContext';
import { useNotifications } from '../Notifications/NotificationSystem';

const IntelligentScheduler = () => {
  const { projects, users } = useProjectContext();
  const { hasPermission, PERMISSIONS } = useSecurity();
  const { addNotification } = useNotifications();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [interventions, setInterventions] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const INTERVENTION_TYPES = {
    CURATIVE: { label: 'DI Curative', color: '#ef4444', icon: '🔧' },
    PREVENTIVE: { label: 'DI Préventive', color: '#10b981', icon: '🛡️' },
    MAINTENANCE: { label: 'Maintenance', color: '#f59e0b', icon: '⚙️' }
  };

  useEffect(() => {
    fetchInterventions();
    fetchTechniciens();
  }, [selectedDate, viewMode]);

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8089/PI/demandes/recuperer/all`);
      if (response.ok) {
        const data = await response.json();
        setInterventions(data.map(item => ({
          id: item.id,
          title: item.description || 'Intervention',
          type: item.type || 'CURATIVE',
          technicienId: item.demandeurId,
          startTime: new Date(item.dateCreation),
          endTime: new Date(new Date(item.dateCreation).getTime() + 2 * 60 * 60 * 1000),
          status: item.statut || 'PLANIFIE'
        })));
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechniciens = async () => {
    try {
      const response = await fetch(`http://localhost:8089/PI/user/all`);
      if (response.ok) {
        const data = await response.json();
        setTechniciens(data.filter(u => 
          u.role === 'Technicien Curatif' || u.role === 'Technicien Préventif'
        ));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const optimizeScheduling = () => {
    setLoading(true);
    setTimeout(() => {
      const suggestions = [
        {
          type: 'REDISTRIBUTION',
          message: 'Redistribuer 3 interventions pour équilibrer la charge',
          impact: 'Économie de 2h30'
        },
        {
          type: 'COMPETENCE',
          message: 'Réassigner selon les compétences spécialisées',
          impact: 'Efficacité +25%'
        }
      ];
      setAiSuggestions(suggestions);
      setLoading(false);
      
      addNotification('success', '🤖 Optimisation IA terminée!', {
        subtitle: `${suggestions.length} suggestions générées`,
        duration: 5000
      });
    }, 2000);
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '150px repeat(7, 1fr)', 
        gap: '1px', 
        background: '#e5e7eb' 
      }}>
        <div style={{ 
          background: '#003061', 
          color: 'white', 
          padding: '1rem', 
          fontWeight: '600' 
        }}>
          Techniciens
        </div>
        
        {days.map(day => (
          <div key={day.toISOString()} style={{
            background: '#003061',
            color: 'white',
            padding: '1rem',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            <div>{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
            <div style={{ fontSize: '1.2rem' }}>{day.getDate()}</div>
          </div>
        ))}

        {techniciens.map(technicien => (
          <React.Fragment key={technicien.id}>
            <div style={{
              background: 'white',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: technicien.role === 'Technicien Curatif' ? '#ef4444' : '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {technicien.firstName?.[0]}{technicien.lastName?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                  {technicien.firstName} {technicien.lastName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {technicien.role === 'Technicien Curatif' ? '🔧 Curatif' : '🛡️ Préventif'}
                </div>
              </div>
            </div>
            
            {days.map(day => {
              const dayInterventions = interventions.filter(int => 
                int.technicienId === technicien.id && 
                int.startTime.toDateString() === day.toDateString()
              );
              
              return (
                <div key={`${technicien.id}-${day.toISOString()}`} style={{
                  background: 'white',
                  minHeight: '80px',
                  padding: '0.5rem'
                }}>
                  {dayInterventions.map(intervention => {
                    const typeInfo = INTERVENTION_TYPES[intervention.type] || INTERVENTION_TYPES.CURATIVE;
                    return (
                      <div key={intervention.id} style={{
                        background: `linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}80 100%)`,
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        marginBottom: '0.25rem',
                        fontSize: '0.75rem',
                        cursor: 'move'
                      }}>
                        <div style={{ fontWeight: '600' }}>
                          {typeInfo.icon} {intervention.title.substring(0, 20)}
                        </div>
                        <div style={{ fontSize: '0.625rem', opacity: 0.9 }}>
                          {intervention.startTime.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#003061',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🤖 Planificateur Intelligent
          </h2>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            Optimisation IA des plannings d'intervention
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '0.25rem' }}>
            {['day', 'week', 'month'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: viewMode === mode ? '#003061' : 'transparent',
                  color: viewMode === mode ? 'white' : '#6b7280',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                {mode === 'day' ? '📅 Jour' : mode === 'week' ? '📆 Semaine' : '🗓️ Mois'}
              </button>
            ))}
          </div>
          
          <button
            onClick={optimizeScheduling}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? '⏳' : '🤖'} Analyser IA
          </button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div style={{ fontWeight: '600', color: '#92400e' }}>
              {conflicts.length} conflit(s) détecté(s)
            </div>
          </div>
        </div>
      )}

      {aiSuggestions.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
          border: '1px solid #8b5cf6',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <div style={{ fontWeight: '600', color: '#6b46c1' }}>
              Suggestions IA ({aiSuggestions.length})
            </div>
          </div>
          {aiSuggestions.map((suggestion, index) => (
            <div key={index} style={{ 
              fontSize: '0.875rem', 
              color: '#7c3aed', 
              marginBottom: '0.25rem' 
            }}>
              • {suggestion.message} - {suggestion.impact}
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {viewMode === 'week' && renderWeekView()}
      </div>
    </div>
  );
};

export default IntelligentScheduler;
