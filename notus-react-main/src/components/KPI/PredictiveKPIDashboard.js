import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useNotifications } from '../Notifications/NotificationSystem';
import ResponsiveWrapper from '../Layout/ResponsiveWrapper';

const PredictiveKPIDashboard = () => {
  const { projects, sousProjects } = useProjectContext();
  const { addNotification } = useNotifications();
  
  const [kpiData, setKpiData] = useState({});
  const [predictions, setPredictions] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(false);

  // KPI Sagemcom spécifiques
  const calculateKPIs = () => {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    
    // MTTR (Mean Time To Repair) - Temps moyen de réparation
    const mttr = calculateMTTR();
    
    // MTBF (Mean Time Between Failures) - Temps moyen entre pannes
    const mtbf = calculateMTBF();
    
    // Taux d'exécution des interventions
    const executionRate = calculateExecutionRate();
    
    // Taux de disponibilité des équipements
    const availabilityRate = calculateAvailabilityRate();
    
    // Ruptures de stock PDR
    const stockBreaches = calculateStockBreaches();
    
    // Efficacité des techniciens
    const technicianEfficiency = calculateTechnicianEfficiency();
    
    return {
      mttr,
      mtbf,
      executionRate,
      availabilityRate,
      stockBreaches,
      technicianEfficiency,
      lastUpdated: new Date()
    };
  };

  const calculateMTTR = () => {
    // Simulation du calcul MTTR
    const interventions = [
      { duration: 2.5, type: 'CURATIVE' },
      { duration: 1.8, type: 'CURATIVE' },
      { duration: 3.2, type: 'CURATIVE' },
      { duration: 2.1, type: 'CURATIVE' }
    ];
    
    const totalTime = interventions.reduce((sum, int) => sum + int.duration, 0);
    const avgTime = totalTime / interventions.length;
    
    return {
      current: avgTime,
      target: 2.0,
      trend: avgTime < 2.5 ? 'improving' : 'declining',
      unit: 'heures'
    };
  };

  const calculateMTBF = () => {
    // Simulation du calcul MTBF
    const totalOperatingTime = 720; // heures par mois
    const numberOfFailures = 12;
    const mtbf = totalOperatingTime / numberOfFailures;
    
    return {
      current: mtbf,
      target: 80,
      trend: mtbf > 50 ? 'improving' : 'declining',
      unit: 'heures'
    };
  };

  const calculateExecutionRate = () => {
    const totalInterventions = 45;
    const completedInterventions = 42;
    const rate = (completedInterventions / totalInterventions) * 100;
    
    return {
      current: rate,
      target: 95,
      trend: rate > 90 ? 'stable' : 'declining',
      unit: '%'
    };
  };

  const calculateAvailabilityRate = () => {
    const totalTime = 720; // heures
    const downTime = 18; // heures d'arrêt
    const availability = ((totalTime - downTime) / totalTime) * 100;
    
    return {
      current: availability,
      target: 98,
      trend: availability > 95 ? 'improving' : 'declining',
      unit: '%'
    };
  };

  const calculateStockBreaches = () => {
    const totalPDR = 150;
    const criticalStock = 8;
    const breachRate = (criticalStock / totalPDR) * 100;
    
    return {
      current: breachRate,
      target: 5,
      trend: breachRate < 10 ? 'improving' : 'critical',
      unit: '%',
      criticalItems: ['Roulement SKF 6205', 'Courroie HTD 8M', 'Capteur proximité']
    };
  };

  const calculateTechnicianEfficiency = () => {
    const techniciens = [
      { name: 'Ahmed Ben Ali', efficiency: 92, interventions: 15 },
      { name: 'Fatma Trabelsi', efficiency: 88, interventions: 12 },
      { name: 'Mohamed Gharbi', efficiency: 95, interventions: 18 },
      { name: 'Leila Mansouri', efficiency: 85, interventions: 10 }
    ];
    
    const avgEfficiency = techniciens.reduce((sum, tech) => sum + tech.efficiency, 0) / techniciens.length;
    
    return {
      current: avgEfficiency,
      target: 90,
      trend: avgEfficiency > 88 ? 'improving' : 'declining',
      unit: '%',
      details: techniciens
    };
  };

  // Prédictions IA
  const generatePredictions = () => {
    setLoading(true);
    
    setTimeout(() => {
      const newPredictions = {
        mttr: {
          nextMonth: kpiData.mttr?.current * 0.95, // Amélioration prévue
          confidence: 85,
          factors: ['Formation techniciens', 'Nouveaux outils diagnostics']
        },
        mtbf: {
          nextMonth: kpiData.mtbf?.current * 1.1, // Amélioration prévue
          confidence: 78,
          factors: ['Maintenance préventive renforcée', 'Pièces de qualité']
        },
        stockBreaches: {
          nextMonth: kpiData.stockBreaches?.current * 1.2, // Risque augmenté
          confidence: 92,
          factors: ['Pic de production prévu', 'Délais fournisseurs']
        },
        availabilityRate: {
          nextMonth: kpiData.availabilityRate?.current + 1.5,
          confidence: 88,
          factors: ['Optimisation planning', 'Réduction temps arrêt']
        }
      };
      
      setPredictions(newPredictions);
      generateAlerts(newPredictions);
      setLoading(false);
      
      addNotification('success', '🔮 Prédictions IA générées!', {
        subtitle: 'Analyse prédictive terminée',
        duration: 4000
      });
    }, 2500);
  };

  const generateAlerts = (predictions) => {
    const newAlerts = [];
    
    // Alerte MTTR
    if (predictions.mttr.nextMonth > 3.0) {
      newAlerts.push({
        type: 'warning',
        title: 'MTTR élevé prévu',
        message: `Le temps de réparation pourrait atteindre ${predictions.mttr.nextMonth.toFixed(1)}h le mois prochain`,
        action: 'Planifier formation techniciens',
        priority: 'medium'
      });
    }
    
    // Alerte Stock
    if (predictions.stockBreaches.nextMonth > 10) {
      newAlerts.push({
        type: 'critical',
        title: 'Risque rupture stock critique',
        message: `${predictions.stockBreaches.nextMonth.toFixed(1)}% de PDR en rupture prévue`,
        action: 'Commander pièces critiques immédiatement',
        priority: 'high'
      });
    }
    
    // Alerte Disponibilité
    if (predictions.availabilityRate.nextMonth < 95) {
      newAlerts.push({
        type: 'warning',
        title: 'Disponibilité sous objectif',
        message: `Disponibilité prévue: ${predictions.availabilityRate.nextMonth.toFixed(1)}% (objectif: 98%)`,
        action: 'Réviser planning maintenance préventive',
        priority: 'medium'
      });
    }
    
    setAlerts(newAlerts);
  };

  useEffect(() => {
    const kpis = calculateKPIs();
    setKpiData(kpis);
  }, [projects, sousProjects, selectedPeriod]);

  const KPICard = ({ title, data, icon, color }) => {
    const getTrendIcon = (trend) => {
      switch (trend) {
        case 'improving': return '📈';
        case 'declining': return '📉';
        case 'stable': return '➡️';
        case 'critical': return '🚨';
        default: return '📊';
      }
    };

    const getTrendColor = (trend) => {
      switch (trend) {
        case 'improving': return '#10b981';
        case 'declining': return '#ef4444';
        case 'stable': return '#6b7280';
        case 'critical': return '#dc2626';
        default: return '#6b7280';
      }
    };

    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
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
          background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`
        }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              {title}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: color }}>
                {data?.current?.toFixed(1)}
              </span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {data?.unit}
              </span>
            </div>
          </div>
          
          <div style={{
            fontSize: '2rem',
            background: `${color}20`,
            padding: '0.75rem',
            borderRadius: '12px'
          }}>
            {icon}
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: getTrendColor(data?.trend) }}>
              {getTrendIcon(data?.trend)}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Objectif: {data?.target}{data?.unit}
            </span>
          </div>
          
          <div style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: data?.current >= data?.target ? '#dcfce7' : '#fef3c7',
            color: data?.current >= data?.target ? '#166534' : '#92400e'
          }}>
            {data?.current >= data?.target ? '✅ Atteint' : '⚠️ Sous objectif'}
          </div>
        </div>
      </div>
    );
  };

  const PredictionCard = ({ title, prediction, kpiKey }) => {
    if (!prediction) return null;
    
    return (
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: '1px solid #0ea5e9',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🔮</span>
          <h4 style={{ margin: 0, color: '#0c4a6e', fontWeight: '600' }}>
            {title} - Prédiction
          </h4>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
              {prediction.nextMonth?.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {kpiData[kpiKey]?.unit} (mois prochain)
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: '#dbeafe',
              color: '#1e40af'
            }}>
              Confiance: {prediction.confidence}%
            </div>
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Facteurs influents:
          </div>
          {prediction.factors?.map((factor, index) => (
            <div key={index} style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              • {factor}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveWrapper>
      <div style={{ padding: '2rem' }}>
      {/* Header */}
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
            📊 Dashboard KPI Prédictif
          </h2>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            Indicateurs temps réel avec prédictions IA
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
          </select>
          
          <button
            onClick={generatePredictions}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
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
            {loading ? '⏳' : '🔮'} Prédire
          </button>
        </div>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            🚨 Alertes Prédictives
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {alerts.map((alert, index) => (
              <div key={index} style={{
                background: alert.type === 'critical' ? 
                  'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' :
                  'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: `1px solid ${alert.type === 'critical' ? '#f87171' : '#f59e0b'}`,
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: alert.type === 'critical' ? '#dc2626' : '#d97706',
                      marginBottom: '0.5rem'
                    }}>
                      {alert.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: alert.type === 'critical' ? '#b91c1c' : '#b45309',
                      marginBottom: '0.5rem'
                    }}>
                      {alert.message}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: alert.type === 'critical' ? '#991b1b' : '#a16207'
                    }}>
                      💡 Action: {alert.action}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: alert.priority === 'high' ? '#dc2626' : '#f59e0b',
                    color: 'white'
                  }}>
                    {alert.priority === 'high' ? '🔥 Urgent' : '⚠️ Important'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <KPICard
          title="MTTR - Temps Moyen de Réparation"
          data={kpiData.mttr}
          icon="🔧"
          color="#ef4444"
        />
        <KPICard
          title="MTBF - Temps Moyen Entre Pannes"
          data={kpiData.mtbf}
          icon="⚡"
          color="#10b981"
        />
        <KPICard
          title="Taux d'Exécution"
          data={kpiData.executionRate}
          icon="✅"
          color="#3b82f6"
        />
        <KPICard
          title="Taux de Disponibilité"
          data={kpiData.availabilityRate}
          icon="🎯"
          color="#8b5cf6"
        />
        <KPICard
          title="Ruptures de Stock PDR"
          data={kpiData.stockBreaches}
          icon="📦"
          color="#f59e0b"
        />
        <KPICard
          title="Efficacité Techniciens"
          data={kpiData.technicianEfficiency}
          icon="👨‍🔧"
          color="#06b6d4"
        />
      </div>

      {/* Prédictions */}
      {Object.keys(predictions).length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            🔮 Prédictions IA
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            <PredictionCard
              title="MTTR"
              prediction={predictions.mttr}
              kpiKey="mttr"
            />
            <PredictionCard
              title="MTBF"
              prediction={predictions.mtbf}
              kpiKey="mtbf"
            />
            <PredictionCard
              title="Ruptures Stock"
              prediction={predictions.stockBreaches}
              kpiKey="stockBreaches"
            />
            <PredictionCard
              title="Disponibilité"
              prediction={predictions.availabilityRate}
              kpiKey="availabilityRate"
            />
          </div>
        </div>
      )}
      </div>
    </ResponsiveWrapper>
  );
};

export default PredictiveKPIDashboard;
