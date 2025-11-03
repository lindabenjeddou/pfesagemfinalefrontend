import React from 'react';

/**
 * Composant pour afficher et gérer la liste des projets
 */
export default function ManageProjects({ 
  projects, 
  loadingProjects, 
  statistics,
  onSelectProject,
  onChangeTab
}) {
  const { totalBudget, totalSpent, totalProjects, budgetPercentage } = statistics;

  return (
    <div style={{ animation: 'slideDown 0.3s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{
          background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          margin: '0 0 0.5rem 0'
        }}>
          💰 Suivi des Dépenses
        </h2>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Visualisez et suivez les dépenses de vos projets
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,48,97,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Projets Actifs</h3>
          </div>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
            {totalProjects}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(5,150,105,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Budget Total</h3>
          </div>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
            {totalBudget.toLocaleString()} DT
          </p>
        </div>

        <div style={{
          background: budgetPercentage > 80 
            ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
            : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: budgetPercentage > 80 
            ? '0 4px 15px rgba(220,38,38,0.3)'
            : '0 4px 15px rgba(124,58,237,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📈</span>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Utilisation</h3>
          </div>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
            {budgetPercentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontWeight: '600', color: '#374151' }}>Progression du budget</span>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            {totalSpent.toLocaleString()} / {totalBudget.toLocaleString()} DT
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          backgroundColor: '#e5e7eb',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(budgetPercentage, 100)}%`,
            height: '100%',
            background: budgetPercentage > 90
              ? 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)'
              : budgetPercentage > 80
              ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
              : 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
            transition: 'width 0.5s ease-in-out'
          }} />
        </div>
      </div>

      {/* Liste des projets */}
      <div>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '1rem'
        }}>
          📋 Liste des Projets ({totalProjects})
        </h3>
        
        {loadingProjects ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #003061',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ color: '#6b7280' }}>Chargement des projets...</p>
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '2px dashed #d1d5db'
          }}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>📁</span>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Aucun projet trouvé</h4>
            <p style={{ margin: 0, color: '#6b7280' }}>Créez votre premier projet pour commencer !</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  onSelectProject(project);
                  onChangeTab('subprojects');
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,48,97,0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#003061'
                    }}>
                      🚀 {project.projectName}
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '0.5rem'
                    }}>
                      <span>👨‍💼 {project.projectManagerName}</span>
                      <span>📅 {new Date(project.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {project.description && (
                      <p style={{
                        margin: '0.5rem 0 0 0',
                        fontSize: '0.9rem',
                        color: '#4b5563',
                        lineHeight: '1.4'
                      }}>
                        📝 {project.description}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: '#059669'
                    }}>
                      💰 {project.budget ? project.budget.toLocaleString() : '0'} DT
                    </p>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      background: '#f3f4f6',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      marginTop: '0.5rem',
                      display: 'inline-block'
                    }}>
                      ID: {project.id}
                    </span>
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#0078d4',
                      fontWeight: '600'
                    }}>
                      🔗 Cliquer pour voir les sous-projets
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
