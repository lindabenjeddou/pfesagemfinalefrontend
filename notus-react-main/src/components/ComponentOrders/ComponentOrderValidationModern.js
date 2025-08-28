import React, { useState, useEffect } from 'react';

const ComponentOrderValidation = () => {
  // États pour la gestion des données et de l'interface
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, rejected: 0 });

  // Fonction pour charger les commandes depuis l'API
  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [sousProjetResponse, componentResponse] = await Promise.all([
        fetch('http://localhost:8089/PI/PI/sousprojets/'),
        fetch('http://localhost:8089/PI/PI/component/all')
      ]);

      if (!sousProjetResponse.ok || !componentResponse.ok) {
        throw new Error(`Erreur API: ${sousProjetResponse.status}/${componentResponse.status}`);
      }

      const sousProjets = await sousProjetResponse.json();
      const components = await componentResponse.json();

      // Créer un index des composants
      const componentIndex = {};
      components.forEach(comp => {
        if (comp.TRART_ARTICLE) {
          componentIndex[comp.TRART_ARTICLE] = comp;
        }
      });

      // Transformer les sous-projets en commandes
      const transformedOrders = [];
      let orderIdCounter = 1;

      sousProjets.forEach(sousProjet => {
        if (sousProjet.components && sousProjet.components.length > 0) {
          sousProjet.components.forEach(componentRef => {
            const componentDetails = componentIndex[componentRef] || {
              TRART_ARTICLE: componentRef,
              TRART_DESIGNATION: `Composant ${componentRef}`,
              TRART_QUANTITE: 1,
              Prix: 0
            };

            const order = {
              id: orderIdCounter++,
              sousProjetName: sousProjet.sousProjetName,
              projectName: sousProjet.project?.projectName || 'Projet inconnu',
              component: {
                reference: componentDetails.TRART_ARTICLE,
                name: componentDetails.TRART_DESIGNATION,
                quantity: componentDetails.TRART_QUANTITE || 1,
                unitPrice: componentDetails.Prix || 0
              },
              totalPrice: (componentDetails.TRART_QUANTITE || 1) * (componentDetails.Prix || 0),
              status: 'pending',
              orderDate: new Date().toISOString().split('T')[0]
            };

            transformedOrders.push(order);
          });
        }
      });

      const newStats = {
        total: transformedOrders.length,
        pending: transformedOrders.filter(o => o.status === 'pending').length,
        confirmed: transformedOrders.filter(o => o.status === 'confirmed').length,
        rejected: transformedOrders.filter(o => o.status === 'rejected').length
      };

      setOrders(transformedOrders);
      setFilteredOrders(transformedOrders);
      setStats(newStats);
      
    } catch (err) {
      setError(`Erreur de chargement: ${err.message}`);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filtrage des commandes
  useEffect(() => {
    let filtered = [...orders];
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.sousProjetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.component.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    const newStats = {
      total: updatedOrders.length,
      pending: updatedOrders.filter(o => o.status === 'pending').length,
      confirmed: updatedOrders.filter(o => o.status === 'confirmed').length,
      rejected: updatedOrders.filter(o => o.status === 'rejected').length
    };
    
    setStats(newStats);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>Chargement des commandes...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '2rem',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
            Erreur de Chargement
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error}</p>
          <button 
            onClick={loadOrders}
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .glassmorphism {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Éléments décoratifs flottants */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        <div style={{
          padding: '2rem',
          position: 'relative',
          zIndex: 1
        }}>
          {/* En-tête principal */}
          <div style={{
            marginBottom: '2rem',
            animation: 'slideInDown 0.8s ease-out'
          }}>
            <div className="glassmorphism" style={{
              padding: '2rem',
              borderRadius: '24px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                animation: 'shimmer 2s infinite'
              }} />
              
              <div style={{
                fontSize: '3rem',
                marginBottom: '0.5rem',
                animation: 'pulse 2s infinite'
              }}>🚀</div>
              
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Validation Intelligente des Commandes
              </h1>
              
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                🎯 Interface Avancée • 🔍 Filtrage Intelligent • ⚡ Actions en Masse • 📊 Analytics Temps Réel
              </p>
            </div>
          </div>

          {/* Statistiques */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
            animation: 'fadeInUp 0.8s ease-out 0.2s both'
          }}>
            {[
              { label: 'Total Commandes', value: stats.total, color: '#3b82f6', icon: '📦' },
              { label: 'En Attente', value: stats.pending, color: '#f59e0b', icon: '⏳' },
              { label: 'Confirmées', value: stats.confirmed, color: '#10b981', icon: '✅' },
              { label: 'Rejetées', value: stats.rejected, color: '#ef4444', icon: '❌' }
            ].map((stat, index) => (
              <div key={index} className="glassmorphism" style={{
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: stat.color,
                  marginBottom: '0.5rem'
                }}>{stat.value}</div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Barre de recherche et filtres */}
          <div className="glassmorphism" style={{
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            animation: 'fadeInUp 0.8s ease-out 0.4s both'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              alignItems: 'end'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  🔍 Rechercher
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Projet, composant, référence..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.8)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  📊 Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                >
                  <option value="all" style={{ background: '#1f2937', color: 'white' }}>Tous les statuts</option>
                  <option value="pending" style={{ background: '#1f2937', color: 'white' }}>En attente</option>
                  <option value="confirmed" style={{ background: '#1f2937', color: 'white' }}>Confirmées</option>
                  <option value="rejected" style={{ background: '#1f2937', color: 'white' }}>Rejetées</option>
                </select>
              </div>
              
              <button
                onClick={loadOrders}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🔄 Actualiser
              </button>
            </div>
          </div>

          {/* Tableau des commandes */}
          <div className="glassmorphism" style={{
            borderRadius: '16px',
            overflow: 'hidden',
            animation: 'fadeInUp 0.8s ease-out 0.6s both'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📋 Commandes de Composants ({filteredOrders.length})
              </h2>
            </div>
            
            {filteredOrders.length === 0 ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Aucune commande trouvée
                </h3>
                <p>Aucune commande ne correspond aux critères de recherche.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                      {['Sous-Projet', 'Projet', 'Composant', 'Référence', 'Quantité', 'Prix Total', 'Statut', 'Actions'].map((header) => (
                        <th key={header} style={{
                          padding: '1rem',
                          textAlign: 'left',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => (
                      <tr key={order.id} style={{
                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                      onMouseOut={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent'}>
                        <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {order.sousProjetName}
                        </td>
                        <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {order.projectName}
                        </td>
                        <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {order.component.name}
                        </td>
                        <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {order.component.reference}
                        </td>
                        <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {order.component.quantity}
                        </td>
                        <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {order.totalPrice.toFixed(2)} €
                        </td>
                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            background: order.status === 'pending' ? '#f59e0b' : 
                                       order.status === 'confirmed' ? '#10b981' : '#ef4444',
                            color: 'white'
                          }}>
                            {order.status === 'pending' ? 'En Attente' : 
                             order.status === 'confirmed' ? 'Confirmée' : 'Rejetée'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleStatusChange(order.id, 'confirmed')}
                              style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseOver={(e) => e.target.style.background = '#059669'}
                              onMouseOut={(e) => e.target.style.background = '#10b981'}
                            >
                              ✅
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, 'rejected')}
                              style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseOver={(e) => e.target.style.background = '#dc2626'}
                              onMouseOut={(e) => e.target.style.background = '#ef4444'}
                            >
                              ❌
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ComponentOrderValidation;
