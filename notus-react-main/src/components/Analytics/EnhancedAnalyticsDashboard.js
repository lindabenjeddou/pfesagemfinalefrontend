import React, { useState, useEffect, useRef } from 'react';
import { useProjectContext } from '../../contexts/ProjectContext';
import ResponsiveWrapper from '../Layout/ResponsiveWrapper';

const EnhancedAnalyticsDashboard = () => {
  const { projects, sousProjects, getStatistics, loading } = useProjectContext();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('budget');
  const [exportFormat, setExportFormat] = useState('pdf');
  const canvasRef = useRef(null);

  const stats = getStatistics();
  
  // Debug logging
  useEffect(() => {
    console.log('📊 Analytics Dashboard - Data State:', {
      projects: projects.length,
      sousProjects: sousProjects.length,
      stats
    });
  }, [projects, sousProjects]);

  // Données pour les graphiques avancés
  const chartData = {
    budget: projects.map(p => ({
      name: p.projectName || p.nomProjet || 'Projet',
      value: parseFloat(p.budget) || 0,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    })),
    timeline: projects.map(p => ({
      name: p.projectName || p.nomProjet || 'Projet',
      date: new Date(p.date),
      budget: parseFloat(p.budget) || 0
    })).sort((a, b) => a.date - b.date),
    confirmation: [
      { name: 'Confirmés', value: stats.confirmedSousProjects, color: '#10b981' },
      { name: 'En attente', value: stats.pendingSousProjects, color: '#f59e0b' }
    ]
  };

  // Graphique en barres avancé avec animations
  const AdvancedBarChart = ({ data, title, height = 300 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#374151',
            margin: 0
          }}>
            📊 {title}
          </h3>
          <button
            onClick={() => exportChart('bar', data, title)}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📥 Export
          </button>
        </div>
        
        <div style={{ 
          height: `${height}px`, 
          display: 'flex', 
          alignItems: 'end', 
          gap: '0.5rem',
          padding: '1rem 0'
        }}>
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 60) : 0;
            return (
              <div key={index} style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#003061',
                  textAlign: 'center'
                }}>
                  {item.value.toLocaleString()} DT
                </div>
                <div style={{
                  width: '100%',
                  height: `${barHeight}px`,
                  background: `linear-gradient(180deg, ${item.color || '#003061'} 0%, ${item.color || '#0078d4'} 100%)`,
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.8s ease-in-out',
                  animation: `growUp 1.5s ease-out ${index * 0.1}s both`,
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scaleY(1.05)';
                  e.target.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scaleY(1)';
                  e.target.style.filter = 'brightness(1)';
                }}
                />
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  textAlign: 'center',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Graphique en ligne pour la timeline
  const TimelineChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.budget));
    const minDate = new Date(Math.min(...data.map(d => d.date)));
    const maxDate = new Date(Math.max(...data.map(d => d.date)));
    const dateRange = maxDate - minDate || 1;

    return (
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
          marginBottom: '1.5rem'
        }}>
          📈 {title}
        </h3>
        
        <div style={{ 
          height: '250px', 
          position: 'relative',
          background: '#f9fafb',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            {/* Grille */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Ligne de données */}
            {data.length > 1 && (
              <polyline
                fill="none"
                stroke="#003061"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={data.map((point, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((point.budget / maxValue) * 80);
                  return `${x}%,${y}%`;
                }).join(' ')}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,48,97,0.3))',
                  animation: 'drawLine 2s ease-in-out'
                }}
              />
            )}
            
            {/* Points de données */}
            {data.map((point, index) => {
              const x = (index / Math.max(data.length - 1, 1)) * 100;
              const y = 100 - ((point.budget / maxValue) * 80);
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="6"
                  fill="#003061"
                  stroke="white"
                  strokeWidth="3"
                  style={{
                    cursor: 'pointer',
                    animation: `fadeIn 0.5s ease-out ${index * 0.2}s both`
                  }}
                >
                  <title>{`${point.name}: ${point.budget.toLocaleString()} DT`}</title>
                </circle>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Graphique en donut avancé
  const AdvancedDonutChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
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
          marginBottom: '1.5rem'
        }}>
          🎯 {title}
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ position: 'relative', width: '150px', height: '150px' }}>
            <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
              {data.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const angle = (percentage / 100) * 360;
                const radius = 60;
                const centerX = 75;
                const centerY = 75;
                
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                currentAngle += angle;
                
                const startAngleRad = (startAngle * Math.PI) / 180;
                const endAngleRad = (endAngle * Math.PI) / 180;
                
                const x1 = centerX + radius * Math.cos(startAngleRad);
                const y1 = centerY + radius * Math.sin(startAngleRad);
                const x2 = centerX + radius * Math.cos(endAngleRad);
                const y2 = centerY + radius * Math.sin(endAngleRad);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      animation: `fadeIn 0.8s ease-out ${index * 0.2}s both`
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.filter = 'brightness(1.1)';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.filter = 'brightness(1)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <title>{`${item.name}: ${item.value} (${percentage.toFixed(1)}%)`}</title>
                  </path>
                );
              })}
              
              {/* Cercle intérieur */}
              <circle
                cx="75"
                cy="75"
                r="25"
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
            </svg>
            
            {/* Texte au centre */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#003061'
              }}>
                {total}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                Total
              </div>
            </div>
          </div>
          
          {/* Légende */}
          <div style={{ flex: 1 }}>
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: '#f9fafb',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: item.color,
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {item.value} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Fonction d'export
  const exportChart = (type, data, title) => {
    if (exportFormat === 'pdf') {
      exportToPDF(type, data, title);
    } else if (exportFormat === 'excel') {
      exportToExcel(data, title);
    } else if (exportFormat === 'image') {
      exportToImage(type, data, title);
    }
  };

  const exportToPDF = (type, data, title) => {
    // Simulation d'export PDF
    const content = `
      Rapport Analytics - ${title}
      Date: ${new Date().toLocaleDateString('fr-FR')}
      
      Données:
      ${data.map(item => `- ${item.name}: ${item.value || item.budget} ${item.value ? '' : 'DT'}`).join('\n')}
      
      Statistiques:
      - Total projets: ${stats.totalProjects}
      - Budget total: ${stats.totalBudget.toLocaleString()} DT
      - Sous-projets confirmés: ${stats.confirmedSousProjects}
      - Taux de confirmation: ${stats.confirmationRate.toFixed(1)}%
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (data, title) => {
    // Simulation d'export Excel (CSV)
    const headers = data[0]?.value !== undefined ? 'Nom,Valeur' : 'Nom,Budget,Date';
    const rows = data.map(item => 
      item.value !== undefined ? `${item.name},${item.value}` : `${item.projectName},${item.budget},${item.date}`
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToImage = (elementId) => {
    // Simulation d'export image
    const element = document.getElementById(elementId);
    if (element) {
      // En production, utiliser html2canvas ou similar
      console.log('Export image simulation for:', elementId);
      alert('Export image simulé avec succès!');
    }
  };

  return (
    <ResponsiveWrapper>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
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
                📊 Analytics Dashboard Avancé
              </h2>
              <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                Analyses détaillées et exports de données
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="budget">Budget</option>
                <option value="timeline">Timeline</option>
                <option value="confirmation">Confirmation</option>
              </select>
              
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="image">Image</option>
              </select>
              
              <button
                onClick={() => {
                  if (exportFormat === 'excel') {
                    exportToExcel(projects, 'analytics-data');
                  } else if (exportFormat === 'image') {
                    exportToImage('analytics-dashboard');
                  } else {
                    alert('Export PDF simulé avec succès!');
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#003061',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📤 Exporter
              </button>
            </div>
          </div>

      {/* KPIs améliorés */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { title: 'Projets Totaux', value: stats.totalProjects, icon: '🚀', color: '#003061' },
          { title: 'Budget Total', value: `${stats.totalBudget.toLocaleString()} DT`, icon: '💰', color: '#0078d4' },
          { title: 'Sous-projets', value: stats.totalSousProjects, icon: '📋', color: '#10b981' },
          { title: 'Taux Confirmation', value: `${stats.confirmationRate.toFixed(1)}%`, icon: '✅', color: '#f59e0b' }
        ].map((kpi, index) => (
          <div key={index} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${kpi.color} 0%, ${kpi.color}80 100%)`
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                fontSize: '2rem',
                background: `${kpi.color}20`,
                padding: '0.75rem',
                borderRadius: '12px'
              }}>
                {kpi.icon}
              </div>
              <div>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  color: kpi.color,
                  lineHeight: 1
                }}>
                  {kpi.value}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginTop: '0.25rem'
                }}>
                  {kpi.title}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        <AdvancedBarChart 
          data={chartData.budget} 
          title="Budget par Projet"
        />
        
        <AdvancedDonutChart 
          data={chartData.confirmation}
          title="Statut des Sous-projets"
        />
        
        <div style={{ gridColumn: '1 / -1' }}>
          <TimelineChart 
            data={chartData.timeline}
            title="Timeline des Projets"
          />
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx global>{`
        @keyframes growUp {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            height: var(--final-height);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes drawLine {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
        </div>
      </div>
    </ResponsiveWrapper>
  );
};

export default EnhancedAnalyticsDashboard;
