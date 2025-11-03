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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState('');
  const [processingOrders, setProcessingOrders] = useState(new Set());

  // Fonction pour charger les commandes depuis l'API
  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [sousProjetResponse, componentResponse, bonsTravailResponse] = await Promise.all([
        fetch('http://localhost:8089/PI/PI/sousprojets/'),
        fetch('http://localhost:8089/PI/PI/component/all'),
        fetch('http://localhost:8089/PI/pi/bons', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('sagemcom_token') || localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!sousProjetResponse.ok || !componentResponse.ok) {
        throw new Error(`Erreur API: ${sousProjetResponse.status}/${componentResponse.status}`);
      }

      const sousProjets = await sousProjetResponse.json();
      const components = await componentResponse.json();
      
      // Charger les bons de travail (peut échouer si pas authentifié)
      let bonsTravail = [];
      if (bonsTravailResponse.ok) {
        const bonsTravailData = await bonsTravailResponse.json();
        bonsTravail = Array.isArray(bonsTravailData) ? bonsTravailData : 
                      Array.isArray(bonsTravailData.content) ? bonsTravailData.content : [];
      }

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

      // 1. Ajouter les commandes des sous-projets
      sousProjets.forEach(sousProjet => {
        if (sousProjet.components && sousProjet.components.length > 0) {
          sousProjet.components.forEach(componentRef => {
            const componentDetails = componentIndex[componentRef] || {
              TRART_ARTICLE: componentRef,
              TRART_DESIGNATION: `Composant ${componentRef}`,
              TRART_QUANTITE: 1,
              prix: 0
            };

            const order = {
              id: orderIdCounter++,
              source: 'Sous-Projet',
              sousProjetName: sousProjet.sousProjetName,
              projectName: sousProjet.project?.projectName || 'Projet inconnu',
              component: {
                reference: componentDetails.TRART_ARTICLE,
                name: componentDetails.TRART_DESIGNATION,
                quantity: componentDetails.TRART_QUANTITE || 1,
                unitPrice: componentDetails.prix || 0
              },
              totalPrice: (componentDetails.TRART_QUANTITE || 1) * (componentDetails.prix || 0),
              status: 'pending',
              orderDate: new Date().toISOString().split('T')[0]
            };

            transformedOrders.push(order);
          });
        }
      });

      // 2. Ajouter les commandes des bons de travail
      bonsTravail.forEach(bon => {
        if (bon.composants && Array.isArray(bon.composants) && bon.composants.length > 0) {
          bon.composants.forEach(bonComposant => {
            const compDetails = bonComposant.component || {};
            const componentDetails = componentIndex[compDetails.trartArticle] || compDetails;

            const order = {
              id: orderIdCounter++,
              source: 'Bon de Travail',
              sousProjetName: `Bon #${bon.id}`,
              projectName: bon.description || bon.intervention?.description || 'Intervention',
              component: {
                reference: componentDetails.trartArticle || componentDetails.TRART_ARTICLE || 'N/A',
                name: componentDetails.trartDesignation || componentDetails.TRART_DESIGNATION || 'Composant',
                quantity: bonComposant.quantiteUtilisee || componentDetails.trartQuantite || 1,
                unitPrice: componentDetails.prix || 0
              },
              totalPrice: (bonComposant.quantiteUtilisee || 1) * (componentDetails.prix || 0),
              status: bon.statut === 'TERMINE' ? 'confirmed' : 'pending',
              orderDate: bon.dateCreation ? new Date(bon.dateCreation).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              bonTravailId: bon.id,
              technicien: bon.technicien ? `${bon.technicien.firstName || ''} ${bon.technicien.lastName || ''}`.trim() : 'Non assigné'
            };

            transformedOrders.push(order);
          });
        }
      });

      // Restaurer les validations depuis localStorage
      const savedValidations = JSON.parse(localStorage.getItem('component_validations') || '{}');
      transformedOrders.forEach(order => {
        if (savedValidations[order.id]) {
          order.status = savedValidations[order.id].status;
          order.validatedAt = savedValidations[order.id].validatedAt;
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

  // Fonction de validation des commandes avec persistance
  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Marquer comme en cours de traitement
    setProcessingOrders(prev => new Set([...prev, orderId]));

    try {
      // Si c'est une commande provenant d'un bon de travail, mettre à jour le bon
      if (order.source === 'Bon de Travail' && order.bonTravailId) {
        try {
          const token = localStorage.getItem('sagemcom_token') || localStorage.getItem('token');
          const updateResponse = await fetch(`http://localhost:8089/PI/pi/bons/update/${order.bonTravailId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              statut: newStatus === 'confirmed' ? 'TERMINE' : 'EN_ATTENTE'
            })
          });

          if (!updateResponse.ok) {
            console.warn('Impossible de mettre à jour le bon de travail côté serveur');
          }
        } catch (err) {
          console.warn('Erreur lors de la mise à jour du bon:', err);
        }
      }

      // Mettre à jour localement
      const updatedOrders = orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus, validatedAt: new Date().toISOString() } : o
      );

      setOrders(updatedOrders);

      // Sauvegarder dans localStorage pour persistance
      const validationData = JSON.parse(localStorage.getItem('component_validations') || '{}');
      validationData[orderId] = {
        status: newStatus,
        validatedAt: new Date().toISOString(),
        orderId: orderId,
        componentRef: order.component.reference
      };
      localStorage.setItem('component_validations', JSON.stringify(validationData));

      // Mettre à jour les statistiques
      const newStats = {
        total: updatedOrders.length,
        pending: updatedOrders.filter(o => o.status === 'pending').length,
        confirmed: updatedOrders.filter(o => o.status === 'confirmed').length,
        rejected: updatedOrders.filter(o => o.status === 'rejected').length
      };
      setStats(newStats);

      // Afficher message de succès
      const statusText = newStatus === 'confirmed' ? 'confirmée' : 'rejetée';
      setSuccessMessage(`✅ Commande ${order.component.reference} ${statusText} avec succès !`);
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      setError(`Erreur lors de la validation: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      // Retirer du traitement
      setProcessingOrders(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  // Logique de pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#003061'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid rgba(0,48,97,0.3)',
            borderTop: '4px solid #003061',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ fontSize: '1.2rem', fontWeight: '500', color: '#003061' }}>Chargement des commandes...</p>
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
        background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)',
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .glassmorphism {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 48, 97, 0.1);
          box-shadow: 0 8px 32px rgba(0, 48, 97, 0.1);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)',
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
          {/* Message de succès */}
          {successMessage && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
              animation: 'slideInDown 0.5s ease-out',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: '500',
              fontSize: '1rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              {successMessage}
            </div>
          )}

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
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)'
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
                color: 'white',
                marginBottom: '1rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
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
              <div key={index} style={{
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
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
                  color: 'white',
                  marginBottom: '0.5rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>{stat.value}</div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.9)',
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
                  color: '#374151',
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
                    border: '1px solid rgba(0, 48, 97, 0.2)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: '#374151',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#003061';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 48, 97, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 48, 97, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
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
                    border: '1px solid rgba(0, 48, 97, 0.2)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: '#374151',
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
                color: '#003061',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📋 Commandes de Composants ({filteredOrders.length})
              </h2>
            </div>
            
            {currentOrders.length === 0 ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#64748b'
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
                    <tr style={{ background: 'rgba(0, 48, 97, 0.05)' }}>
                      {['Source', 'Sous-Projet', 'Projet', 'Composant', 'Référence', 'Quantité', 'Prix Total', 'Statut', 'Actions'].map((header) => (
                        <th key={header} style={{
                          padding: '1rem',
                          textAlign: 'left',
                          color: '#374151',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          borderBottom: '1px solid rgba(0, 48, 97, 0.1)'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order, index) => (
                      <tr key={order.id} style={{
                        background: index % 2 === 0 ? 'rgba(0, 48, 97, 0.02)' : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 48, 97, 0.05)'}
                      onMouseOut={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'rgba(0, 48, 97, 0.02)' : 'transparent'}>
                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(0, 48, 97, 0.1)' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: order.source === 'Bon de Travail' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            color: 'white',
                            display: 'inline-block'
                          }}>
                            {order.source === 'Bon de Travail' ? '🔧 BT' : '📋 SP'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#374151', borderBottom: '1px solid rgba(0, 48, 97, 0.1)', fontWeight: '500' }}>
                          {order.sousProjetName}
                        </td>
                        <td style={{ padding: '1rem', color: '#374151', borderBottom: '1px solid rgba(0, 48, 97, 0.1)' }}>
                          {order.projectName}
                        </td>
                        <td style={{ padding: '1rem', color: '#374151', borderBottom: '1px solid rgba(0, 48, 97, 0.1)' }}>
                          {order.component.name}
                        </td>
                        <td style={{ padding: '1rem', color: '#64748b', borderBottom: '1px solid rgba(0, 48, 97, 0.1)', fontFamily: 'monospace' }}>
                          {order.component.reference}
                        </td>
                        <td style={{ padding: '1rem', color: '#374151', borderBottom: '1px solid rgba(0, 48, 97, 0.1)', textAlign: 'center', fontWeight: '600' }}>
                          {order.component.quantity}
                        </td>
                        <td style={{ padding: '1rem', color: '#059669', borderBottom: '1px solid rgba(0, 48, 97, 0.1)', fontWeight: '600' }}>
                          {order.totalPrice.toFixed(2)} €
                        </td>
                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(0, 48, 97, 0.1)' }}>
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
                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(0, 48, 97, 0.1)' }}>
                          {processingOrders.has(order.id) ? (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              color: '#6b7280',
                              fontSize: '0.9rem'
                            }}>
                              <div style={{
                                width: '20px',
                                height: '20px',
                                border: '3px solid rgba(0, 48, 97, 0.2)',
                                borderTop: '3px solid #003061',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }}></div>
                              Traitement...
                            </div>
                          ) : order.status !== 'pending' ? (
                            <div style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              background: order.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: order.status === 'confirmed' ? '#059669' : '#dc2626',
                              textAlign: 'center'
                            }}>
                              {order.status === 'confirmed' ? '✅ Validée' : '❌ Rejetée'}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleStatusChange(order.id, 'confirmed')}
                                disabled={processingOrders.has(order.id)}
                                style={{
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  transition: 'all 0.3s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.background = '#059669';
                                  e.target.style.transform = 'translateY(-2px)';
                                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = '#10b981';
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = 'none';
                                }}
                              >
                                ✅ Valider
                              </button>
                              <button
                                onClick={() => handleStatusChange(order.id, 'rejected')}
                                disabled={processingOrders.has(order.id)}
                                style={{
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  transition: 'all 0.3s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.background = '#dc2626';
                                  e.target.style.transform = 'translateY(-2px)';
                                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = '#ef4444';
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = 'none';
                                }}
                              >
                                ❌ Rejeter
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Contrôles de pagination */}
          {filteredOrders.length > 0 && (
            <div className="glassmorphism" style={{
              padding: '1.5rem',
              borderRadius: '16px',
              marginTop: '2rem',
              animation: 'fadeInUp 0.8s ease-out 0.8s both'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                {/* Informations de pagination */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  color: '#374151',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ fontWeight: '500' }}>
                    📊 Affichage {startIndex + 1} à {Math.min(endIndex, filteredOrders.length)} sur {filteredOrders.length} commandes
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontWeight: '500', color: '#374151' }}>📄 Par page:</label>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 48, 97, 0.2)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        color: '#374151',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Boutons de navigation */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: currentPage === 1 ? '#e5e7eb' : '#003061',
                      color: currentPage === 1 ? '#9ca3af' : 'white',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.background = '#002244';
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.background = '#003061';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    ← Précédent
                  </button>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    margin: '0 1rem'
                  }}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: currentPage === pageNum ? '#003061' : 'rgba(0, 48, 97, 0.1)',
                            color: currentPage === pageNum ? 'white' : '#374151',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            if (currentPage !== pageNum) {
                              e.target.style.background = 'rgba(0, 48, 97, 0.2)';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (currentPage !== pageNum) {
                              e.target.style.background = 'rgba(0, 48, 97, 0.1)';
                            }
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: currentPage === totalPages ? '#e5e7eb' : '#003061',
                      color: currentPage === totalPages ? '#9ca3af' : 'white',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.background = '#002244';
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.background = '#003061';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ComponentOrderValidation;