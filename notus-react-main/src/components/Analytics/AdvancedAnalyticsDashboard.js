import React, { useState, useEffect } from 'react';

const AdvancedAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('stock');
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState(null);

  // Données simulées avancées
  const mockAnalyticsData = {
    stockAnalytics: {
      totalComponents: 1247,
      lowStockItems: 23,
      outOfStockItems: 3,
      stockValue: 156780,
      turnoverRate: 2.4,
      averageLeadTime: 7.2,
      stockAccuracy: 98.5,
      wastePercentage: 1.2
    },
    performanceKPIs: {
      orderFulfillmentRate: 96.8,
      averageProcessingTime: 3.2,
      customerSatisfaction: 4.7,
      errorRate: 0.8,
      productivityIndex: 87.3,
      costEfficiency: 92.1,
      qualityScore: 94.6,
      deliveryPerformance: 89.4
    },
    predictiveInsights: {
      stockPredictions: [
        { component: 'ELEC0047', currentStock: 15, predictedOutOfStock: '2025-08-06', confidence: 92 },
        { component: 'ELEC0014', currentStock: 45, predictedOutOfStock: '2025-08-12', confidence: 87 },
        { component: 'ELEC0015', currentStock: 8, predictedOutOfStock: '2025-08-04', confidence: 95 }
      ],
      demandForecast: {
        nextWeek: { increase: 15, components: ['ELEC0047', 'MECH0023'] },
        nextMonth: { decrease: 8, components: ['ELEC0089', 'ELEC0156'] }
      },
      seasonalTrends: {
        winter: { highDemand: ['HEATING_COMPONENTS'], increase: 45 },
        summer: { highDemand: ['COOLING_COMPONENTS'], increase: 38 }
      }
    },
    supplierAnalytics: {
      topSuppliers: [
        { name: 'Fournisseur A', reliability: 94, avgDeliveryTime: 5.2, costIndex: 87 },
        { name: 'Fournisseur B', reliability: 89, avgDeliveryTime: 6.8, costIndex: 92 },
        { name: 'Fournisseur C', reliability: 96, avgDeliveryTime: 4.1, costIndex: 95 }
      ],
      qualityMetrics: {
        defectRate: 0.3,
        returnRate: 1.2,
        complianceScore: 97.8
      }
    },
    financialMetrics: {
      totalSpend: 234567,
      costSavings: 12890,
      budgetUtilization: 87.3,
      roi: 23.4,
      costPerUnit: 45.67,
      profitMargin: 18.9
    }
  };

  // Données pour les graphiques CSS
  const chartData = {
    stockTrends: {
      months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul'],
      stockTotal: [1200, 1180, 1250, 1220, 1280, 1247, 1290],
      stockCritique: [45, 38, 52, 41, 35, 23, 18]
    },
    performanceMetrics: [
      { label: 'Qualité', current: 94.6, target: 95, color: '#3b82f6' },
      { label: 'Délais', current: 89.4, target: 90, color: '#10b981' },
      { label: 'Coûts', current: 92.1, target: 95, color: '#f59e0b' },
      { label: 'Service', current: 96.8, target: 98, color: '#ef4444' },
      { label: 'Innovation', current: 78.3, target: 85, color: '#8b5cf6' },
      { label: 'Durabilité', current: 85.7, target: 90, color: '#06b6d4' }
    ],
    suppliers: [
      { name: 'Fournisseur A', reliability: 94, deliveryTime: 5.2, color: '#3b82f6' },
      { name: 'Fournisseur B', reliability: 89, deliveryTime: 6.8, color: '#10b981' },
      { name: 'Fournisseur C', reliability: 96, deliveryTime: 4.1, color: '#f59e0b' },
      { name: 'Fournisseur D', reliability: 82, deliveryTime: 7.5, color: '#ef4444' }
    ],
    costBreakdown: [
      { category: 'Composants Électroniques', percentage: 45, color: '#3b82f6' },
      { category: 'Mécaniques', percentage: 25, color: '#10b981' },
      { category: 'Logiciels', percentage: 15, color: '#f59e0b' },
      { category: 'Services', percentage: 10, color: '#ef4444' },
      { category: 'Transport', percentage: 5, color: '#8b5cf6' }
    ]
  };

  useEffect(() => {
    // Simuler le chargement des données
    setLoading(true);
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setPredictions(mockAnalyticsData.predictiveInsights);
      setLoading(false);
    }, 1500);
  }, [selectedPeriod]);

  // Composant graphique linéaire CSS
  const LineChart = ({ data, title }) => {
    const maxValue = Math.max(...data.stockTotal, ...data.stockCritique);
    return (
      <div style={{ width: '100%', height: '300px', position: 'relative' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
          {title}
        </h4>
        <div style={{ display: 'flex', height: '250px', alignItems: 'end', gap: '20px', padding: '20px 0' }}>
          {data.months.map((month, index) => {
            const stockHeight = (data.stockTotal[index] / maxValue) * 200;
            const critiqueHeight = (data.stockCritique[index] / maxValue) * 200;
            return (
              <div key={month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'end', gap: '4px', marginBottom: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: `${stockHeight}px`,
                    background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderRadius: '6px 6px 0 0',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '10px',
                      color: '#3b82f6',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      {data.stockTotal[index]}
                    </div>
                  </div>
                  <div style={{
                    width: '12px',
                    height: `${critiqueHeight}px`,
                    background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                    borderRadius: '6px 6px 0 0',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '10px',
                      color: '#ef4444',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      {data.stockCritique[index]}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>{month}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Stock Total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Stock Critique</span>
          </div>
        </div>
      </div>
    );
  };

  // Composant radar de performance CSS
  const PerformanceRadar = ({ metrics, title }) => (
    <div style={{ width: '100%', height: '300px' }}>
      <h4 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
        {title}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {metrics.map((metric, index) => (
          <div key={index} style={{
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            padding: '16px',
            border: `2px solid ${metric.color}20`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{metric.label}</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Obj: {metric.target}%</span>
            </div>
            <div style={{ position: 'relative', height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${(metric.current / 100) * 100}%`,
                background: `linear-gradient(90deg, ${metric.color} 0%, ${metric.color}80 100%)`,
                borderRadius: '4px',
                transition: 'width 1s ease'
              }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: metric.color }}>
                {metric.current}%
              </span>
              <span style={{
                fontSize: '12px',
                color: metric.current >= metric.target ? '#10b981' : '#ef4444',
                fontWeight: '600'
              }}>
                {metric.current >= metric.target ? '✅' : '⚠️'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Composant graphique en barres pour fournisseurs
  const SupplierBarChart = ({ suppliers, title }) => (
    <div style={{ width: '100%', height: '300px' }}>
      <h4 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
        {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {suppliers.map((supplier, index) => (
          <div key={index} style={{ background: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{supplier.name}</span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
                <span>Fiabilité: {supplier.reliability}%</span>
                <span>Délai: {supplier.deliveryTime}j</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${supplier.reliability}%`,
                    background: supplier.color,
                    borderRadius: '3px',
                    transition: 'width 1s ease'
                  }}></div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(supplier.deliveryTime * 10, 100)}%`,
                    background: `${supplier.color}80`,
                    borderRadius: '3px',
                    transition: 'width 1s ease'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Composant graphique en secteurs CSS
  const DonutChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.percentage, 0);
    let cumulativePercentage = 0;
    
    return (
      <div style={{ width: '100%', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
          {title}
        </h4>
        <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '20px' }}>
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `conic-gradient(${data.map(item => {
              const startAngle = (cumulativePercentage / 100) * 360;
              cumulativePercentage += item.percentage;
              const endAngle = (cumulativePercentage / 100) * 360;
              return `${item.color} ${startAngle}deg ${endAngle}deg`;
            }).join(', ')})`,
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120px',
              height: '120px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>100%</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Total</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', width: '100%', maxWidth: '300px' }}>
          {data.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: item.color,
                borderRadius: '4px',
                flexShrink: 0
              }}></div>
              <span style={{ fontSize: '14px', color: '#1f2937', flex: 1 }}>{item.category}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: item.color }}>
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Composant KPI Card
  const KPICard = ({ title, value, unit, trend, icon, color, description }) => (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: `2px solid ${color}20`,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-4px)';
      e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ fontSize: '2rem', color: color }}>{icon}</div>
        <div style={{
          background: trend > 0 ? '#dcfce7' : '#fef2f2',
          color: trend > 0 ? '#16a34a' : '#dc2626',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      </div>
      <h3 style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0', fontWeight: '500' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
        <span style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>{unit}</span>
      </div>
      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: '1.4' }}>
        {description}
      </p>
    </div>
  );

  // Composant de prédiction
  const PredictionCard = ({ prediction }) => (
    <div style={{
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      borderRadius: '12px',
      padding: '16px',
      border: '2px solid #f59e0b',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, color: '#92400e', fontWeight: '600' }}>
          ⚠️ {prediction.component}
        </h4>
        <span style={{
          background: '#f59e0b',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {prediction.confidence}% confiance
        </span>
      </div>
      <p style={{ margin: '0 0 8px 0', color: '#78350f', fontSize: '14px' }}>
        Stock actuel: <strong>{prediction.currentStock}</strong>
      </p>
      <p style={{ margin: 0, color: '#78350f', fontSize: '14px' }}>
        Rupture prévue: <strong>{new Date(prediction.predictedOutOfStock).toLocaleDateString()}</strong>
      </p>
    </div>
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2>📊 Chargement Analytics...</h2>
          <p>Analyse des données en cours</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              📊 Analytics Avancé Sagemcom
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem', margin: '0.5rem 0 0 0' }}>
              Intelligence d'affaires et prédictions IA
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                background: 'white',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 année</option>
            </select>
            <button style={{
              background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1.5rem',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              📥 Exporter Rapport
            </button>
          </div>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <KPICard
          title="Composants Total"
          value={analyticsData.stockAnalytics.totalComponents}
          unit="unités"
          trend={5.2}
          icon="📦"
          color="#3b82f6"
          description="Inventaire total avec tendance positive"
        />
        <KPICard
          title="Taux de Service"
          value={analyticsData.performanceKPIs.orderFulfillmentRate}
          unit="%"
          trend={2.1}
          icon="✅"
          color="#10b981"
          description="Commandes livrées dans les délais"
        />
        <KPICard
          title="Valeur Stock"
          value={Math.round(analyticsData.stockAnalytics.stockValue / 1000)}
          unit="k€"
          trend={-1.3}
          icon="💰"
          color="#f59e0b"
          description="Valeur totale de l'inventaire"
        />
        <KPICard
          title="Précision Stock"
          value={analyticsData.stockAnalytics.stockAccuracy}
          unit="%"
          trend={0.8}
          icon="🎯"
          color="#8b5cf6"
          description="Exactitude des données d'inventaire"
        />
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Tendances Stock */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <LineChart 
            data={chartData.stockTrends} 
            title="📈 Évolution des Stocks" 
          />
        </div>

        {/* Prédictions IA */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937', fontSize: '1.25rem', fontWeight: '600' }}>
            🤖 Prédictions IA
          </h3>
          {predictions?.stockPredictions.map((prediction, index) => (
            <PredictionCard key={index} prediction={prediction} />
          ))}
          <div style={{
            background: '#dcfce7',
            border: '2px solid #16a34a',
            borderRadius: '12px',
            padding: '12px',
            marginTop: '16px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#15803d', fontSize: '14px', fontWeight: '600' }}>
              💡 Recommandation IA
            </h4>
            <p style={{ margin: 0, color: '#166534', fontSize: '12px' }}>
              Commande groupée recommandée pour optimiser les coûts de transport (-15%)
            </p>
          </div>
        </div>
      </div>

      {/* Performance Radar & Supplier Analysis */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <PerformanceRadar 
            metrics={chartData.performanceMetrics} 
            title="🎯 Performance Globale" 
          />
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <SupplierBarChart 
            suppliers={chartData.suppliers} 
            title="🏭 Analyse Fournisseurs" 
          />
        </div>
      </div>

      {/* Cost Analysis */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <DonutChart 
          data={chartData.costBreakdown} 
          title="💰 Répartition des Coûts" 
        />
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
