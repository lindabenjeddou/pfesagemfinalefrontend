import React, { useState, useEffect } from 'react';

const AnalyticsDashboard = ({ projects = [], sousProjects = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Calcul des KPIs avec données réelles
  const calculateKPIs = () => {
    const totalProjects = projects.length;
    const totalBudget = projects.reduce((sum, project) => {
      const budget = parseFloat(project.budget) || 0;
      return sum + budget;
    }, 0);
    
    // Pour l'instant, on simule les dépenses à 0 car pas encore implémentées
    const totalSpent = 0;
    const confirmedSousProjects = sousProjects.filter(sp => sp.confirmed === 1 || sp.confirmed === true).length;
    const pendingSousProjects = sousProjects.filter(sp => sp.confirmed === 0 || sp.confirmed === false).length;
    
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const confirmationRate = sousProjects.length > 0 ? (confirmedSousProjects / sousProjects.length) * 100 : 0;

    return {
      totalProjects,
      totalBudget,
      totalSpent,
      budgetUtilization,
      confirmationRate,
      confirmedSousProjects,
      pendingSousProjects,
      totalSousProjects: sousProjects.length
    };
  };

  const kpis = calculateKPIs();

  // Données pour le graphique en barres (budget par projet)
  const budgetChartData = projects.slice(0, 5).map((project, index) => ({
    name: project.nomProjet || `Projet ${index + 1}`,
    budget: parseFloat(project.budget) || 0,
    spent: 0 // Pour l'instant, pas de données de dépenses
  }));

  // Graphique simple en CSS (sans bibliothèque externe)
  const SimpleBarChart = ({ data, title }) => (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        📊 {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => Math.max(d.budget, d.spent)));
          const budgetWidth = maxValue > 0 ? (item.budget / maxValue) * 100 : 0;
          const spentWidth = maxValue > 0 ? (item.spent / maxValue) * 100 : 0;
          
          return (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.25rem'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  {item.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {item.spent.toLocaleString()} / {item.budget.toLocaleString()} DT
                </span>
              </div>
              
              {/* Barre de budget */}
              <div style={{
                width: '100%',
                height: '8px',
                background: '#f3f4f6',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '2px'
              }}>
                <div style={{
                  width: `${budgetWidth}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #e5e7eb, #d1d5db)',
                  borderRadius: '4px'
                }} />
              </div>
              
              {/* Barre de dépenses */}
              <div style={{
                width: '100%',
                height: '8px',
                background: '#f3f4f6',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${spentWidth}%`,
                  height: '100%',
                  background: item.spent > item.budget ? 
                    'linear-gradient(90deg, #dc2626, #ef4444)' :
                    'linear-gradient(90deg, #10b981, #059669)',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Graphique circulaire simple
  const SimpleDonutChart = ({ confirmed, pending, title }) => {
    const total = confirmed + pending;
    const confirmedPercentage = total > 0 ? (confirmed / total) * 100 : 0;
    const pendingPercentage = total > 0 ? (pending / total) * 100 : 0;
    
    return (
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '1rem'
        }}>
          🎯 {title}
        </h3>
        
        {/* Graphique circulaire CSS */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `conic-gradient(
            #10b981 0deg ${confirmedPercentage * 3.6}deg,
            #f59e0b ${confirmedPercentage * 3.6}deg 360deg
          )`,
          margin: '0 auto 1rem',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>
              {total}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Total
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981'
            }} />
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>
              Confirmés ({confirmed})
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#f59e0b'
            }} />
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>
              En attente ({pending})
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header avec sélecteur de période */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
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
            📈 Analytics Dashboard
          </h2>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            Vue d'ensemble des performances et métriques
          </p>
        </div>
        
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            background: 'white'
          }}
        >
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      {/* KPIs Cards */}
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
          boxShadow: '0 4px 12px rgba(0,48,97,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🚀</span>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Projets Actifs</h3>
          </div>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
            {kpis.totalProjects}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
            Total des projets en cours
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(5,150,105,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>💰</span>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Budget Total</h3>
          </div>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
            {kpis.totalBudget.toLocaleString()}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
            DT alloués aux projets
          </p>
        </div>

        <div style={{
          background: kpis.budgetUtilization > 90 
            ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
            : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(124,58,237,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>📊</span>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Utilisation Budget</h3>
          </div>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
            {kpis.budgetUtilization.toFixed(1)}%
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
            Efficacité: {kpis.efficiency}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>✅</span>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Taux Confirmation</h3>
          </div>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
            {kpis.confirmationRate.toFixed(1)}%
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
            Sous-projets validés
          </p>
        </div>
      </div>

      {/* Graphiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        <SimpleBarChart 
          data={budgetChartData} 
          title="Budget vs Dépenses par Projet"
        />
        
        <SimpleDonutChart 
          confirmed={kpis.confirmedSousProjects}
          pending={kpis.pendingSousProjects}
          title="Statut des Sous-projets"
        />
      </div>

      {/* Tableau de performance */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        marginTop: '2rem'
      }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '1rem'
        }}>
          🏆 Performance des Projets
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Projet
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Budget
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Dépensé
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Utilisation
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {budgetChartData.map((project, index) => {
                const utilization = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
                const status = utilization > 100 ? 'Dépassement' : utilization > 90 ? 'Critique' : utilization > 70 ? 'Normal' : 'Excellent';
                const statusColor = utilization > 100 ? '#dc2626' : utilization > 90 ? '#f59e0b' : utilization > 70 ? '#0078d4' : '#059669';
                
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                      {project.name}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                      {project.budget.toLocaleString()} DT
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                      {project.spent.toLocaleString()} DT
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                      {utilization.toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'white',
                        background: statusColor
                      }}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
