import React, { useState, useEffect } from 'react';
import { useSecurity } from '../../../contexts/SecurityContext';

/**
 * Composant pour créer un nouveau projet
 */
export default function CreateProject({ fetchProjects, showNotification }) {
  const { user } = useSecurity();
  
  // Récupérer le nom complet de l'utilisateur connecté
  const getUserFullName = () => {
    if (!user) return '';
    const firstName = user.firstName || user.firstname || '';
    const lastName = user.lastName || user.lastname || '';
    return `${firstName} ${lastName}`.trim() || user.username || user.email || '';
  };

  const [formData, setFormData] = useState({
    nomProjet: "",
    nomChefProjet: getUserFullName(),
    description: "",
    date: "",
    budget: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Mettre à jour le nom du chef de projet si l'utilisateur change
  useEffect(() => {
    const fullName = getUserFullName();
    if (fullName && !formData.nomChefProjet) {
      setFormData(prev => ({ ...prev, nomChefProjet: fullName }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSend = {
      projectName: formData.nomProjet,
      projectManagerName: formData.nomChefProjet,
      description: formData.description,
      budget: parseFloat(formData.budget),
      date: formData.date,
      components: []
    };

    try {
      const response = await fetch("http://localhost:8089/PI/PI/projects/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Projet créé avec succès:', result);
        
        showNotification('success', `🎉 Projet "${formData.nomProjet}" créé avec succès!`, {
          subtitle: `Budget alloué: ${formData.budget} DT`,
          duration: 6000,
          sound: true
        });
        
        if (parseFloat(formData.budget) > 10000) {
          showNotification('warning', `⚠️ Budget élevé détecté!`, {
            subtitle: `Le projet "${formData.nomProjet}" a un budget de ${formData.budget} DT`,
            duration: 8000,
            sound: true
          });
        }
        
        setFormData({
          nomProjet: "",
          nomChefProjet: "",
          description: "",
          date: "",
          budget: ""
        });
        fetchProjects();
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur lors de la création du projet:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        showNotification('error', `❌ Erreur lors de la création du projet (${response.status})`);
      }
    } catch (error) {
      showNotification('error', '❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .gradient-border {
          position: relative;
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(135deg, #003061, #0078d4, #00c9ff);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          background-size: 200% 200%;
        }
      `}</style>
      
      <div style={{ 
        position: 'relative'
      }}>

      <form onSubmit={handleSubmit} className="gradient-border" style={{
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              🏗️ Nom du Projet
            </label>
            <input
              type="text"
              name="nomProjet"
              value={formData.nomProjet}
              onChange={handleChange}
              onFocus={() => setFocusedField('nomProjet')}
              onBlur={() => setFocusedField(null)}
              placeholder="Entrez le nom du projet"
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: focusedField === 'nomProjet' ? '2px solid #003061' : '2px solid rgba(0,48,97,0.1)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: focusedField === 'nomProjet' ? 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(255,255,255,1) 100%)' : 'rgba(255,255,255,0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: focusedField === 'nomProjet' ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: focusedField === 'nomProjet' ? '0 10px 25px rgba(0,48,97,0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              👨‍💼 Chef de Projet
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="nomChefProjet"
                value={formData.nomChefProjet}
                onChange={handleChange}
                onFocus={() => setFocusedField('nomChefProjet')}
                onBlur={() => setFocusedField(null)}
                placeholder="Nom du chef de projet"
                required
                readOnly
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3.5rem',
                  border: focusedField === 'nomChefProjet' ? '2px solid #0078d4' : '2px solid rgba(0,120,212,0.2)',
                  borderRadius: '16px',
                  fontSize: '1rem',
                  background: focusedField === 'nomChefProjet' 
                    ? 'linear-gradient(135deg, rgba(0,120,212,0.05) 0%, rgba(255,255,255,1) 100%)' 
                    : 'rgba(255,255,255,0.8)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: focusedField === 'nomChefProjet' ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
                  boxShadow: focusedField === 'nomChefProjet' 
                    ? '0 15px 35px rgba(0,120,212,0.2), 0 0 0 4px rgba(0,120,212,0.1)' 
                    : '0 4px 15px rgba(0,48,97,0.08)',
                  outline: 'none',
                  cursor: 'default',
                  color: '#003061',
                  fontWeight: '600'
                }}
              />
              <div style={{
                position: 'absolute',
                left: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                color: 'white',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                ✓
              </div>
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              📅 Date de Début
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              onFocus={() => setFocusedField('date')}
              onBlur={() => setFocusedField(null)}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: focusedField === 'date' ? '2px solid #003061' : '2px solid rgba(0,48,97,0.1)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: focusedField === 'date' ? 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(255,255,255,1) 100%)' : 'rgba(255,255,255,0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: focusedField === 'date' ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: focusedField === 'date' ? '0 10px 25px rgba(0,48,97,0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              💰 Budget Estimé
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              onFocus={() => setFocusedField('budget')}
              onBlur={() => setFocusedField(null)}
              placeholder="En Dinars"
              min="0"
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: focusedField === 'budget' ? '2px solid #003061' : '2px solid rgba(0,48,97,0.1)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: focusedField === 'budget' ? 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(255,255,255,1) 100%)' : 'rgba(255,255,255,0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: focusedField === 'budget' ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: focusedField === 'budget' ? '0 10px 25px rgba(0,48,97,0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            📝 Description du Projet
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
            rows="4"
            placeholder="Décrivez les objectifs et détails du projet"
            required
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              border: focusedField === 'description' ? '2px solid #003061' : '2px solid rgba(0,48,97,0.1)',
              borderRadius: '12px',
              fontSize: '1rem',
              background: focusedField === 'description' ? 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(255,255,255,1) 100%)' : 'rgba(255,255,255,0.8)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: focusedField === 'description' ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: focusedField === 'description' ? '0 10px 25px rgba(0,48,97,0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
              outline: 'none',
              resize: 'vertical',
              minHeight: '100px'
            }}
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              position: 'relative',
              background: isLoading 
                ? 'linear-gradient(135deg, rgba(0,48,97,0.7) 0%, rgba(0,120,212,0.7) 100%)' 
                : 'linear-gradient(135deg, #003061 0%, #0078d4 50%, #00c9ff 100%)',
              backgroundSize: '200% 200%',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '1.25rem 3rem',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isLoading ? 'scale(0.98)' : 'scale(1)',
              boxShadow: isLoading 
                ? '0 4px 20px rgba(0,48,97,0.3)' 
                : '0 15px 40px rgba(0,120,212,0.4), 0 0 0 0 rgba(0,120,212,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              margin: '0 auto',
              minWidth: '250px',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,120,212,0.5), 0 0 0 8px rgba(0,120,212,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,120,212,0.4), 0 0 0 0 rgba(0,120,212,0.2)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Création en cours...
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.5rem' }}>🚀</span>
                Lancer le Projet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
