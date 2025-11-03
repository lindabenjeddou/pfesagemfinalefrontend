import React, { useState, useEffect } from 'react';

const MagasinierNotifications = ({ userId, userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Simulation des notifications basée sur les données réelles créées en backend
  const simulateNotifications = () => {
    const baseNotifications = [
      {
        id: Date.now() + 1,
        title: "🆕 Nouveau sous-projet créé",
        message: "Un nouveau sous-projet a été créé avec des composants commandés. Veuillez vérifier le stock et préparer les composants nécessaires.",
        type: "SOUS_PROJET_CREATED",
        isRead: false,
        createdAt: new Date().toISOString(),
        priority: "high",
        status: "pending"
      },
      {
        id: Date.now() + 2,
        title: "📦 Commande de composants",
        message: "Commande de composants: ELEC0014, ELEC0015, ELEC0047. Stock à vérifier et préparation requise.",
        type: "COMPONENT_ORDER",
        isRead: false,
        createdAt: new Date().toISOString(),
        priority: "medium",
        status: "in_progress"
      },
      {
        id: Date.now() + 3,
        title: "⚠️ Stock faible détecté",
        message: "Le composant ELEC0020 a un stock critique (< 5 unités). Réapprovisionnement urgent requis.",
        type: "LOW_STOCK_ALERT",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        priority: "high",
        status: "completed"
      },
      {
        id: Date.now() + 4,
        title: "✅ Commande validée",
        message: "La commande #CMD-2024-001 a été validée et expédiée vers l'atelier.",
        type: "ORDER_VALIDATED",
        isRead: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        priority: "low",
        status: "completed"
      },
      {
        id: Date.now() + 5,
        title: "🔄 Mise à jour stock",
        message: "Mise à jour automatique du stock suite à la réception de la livraison LIV-2024-015.",
        type: "STOCK_UPDATE",
        isRead: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        priority: "medium",
        status: "pending"
      },
      {
        id: Date.now() + 6,
        title: "📋 Inventaire programmé",
        message: "Inventaire mensuel programmé pour demain à 9h00. Préparation des zones de stockage requise.",
        type: "INVENTORY_SCHEDULED",
        isRead: false,
        createdAt: new Date(Date.now() - 900000).toISOString(),
        priority: "medium",
        status: "pending"
      }
    ];

    return baseNotifications;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date inconnue";
    
    try {
      if (dateValue instanceof Date && !isNaN(dateValue)) {
        return dateValue.toLocaleString("fr-FR");
      }
      
      if (typeof dateValue === 'number') {
        return new Date(dateValue).toLocaleString("fr-FR");
      }
      
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString("fr-FR");
        }
      }
      
      if (Array.isArray(dateValue) && dateValue.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        const date = new Date(year, month - 1, day, hour, minute, second);
        return date.toLocaleString("fr-FR");
      }
      
      return "Date invalide";
    } catch (error) {
      console.error("Erreur formatage date:", error, dateValue);
      return "Date invalide";
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    console.log('🔍 Récupération des notifications pour userId:', userId);
    try {
      // Tentative d'appel à l'API backend avec le bon chemin /PI/PI/
      const response = await fetch(`http://localhost:8089/PI/PI/notifications/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('📡 Réponse API notifications:', response.status);

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        console.log('✅ Notifications récupérées depuis l\'API:', data);
      } else {
        throw new Error('API non disponible');
      }
    } catch (error) {
      console.warn('⚠️ API backend non disponible, utilisation de la simulation:', error.message);
      
      // Fallback: utiliser la simulation si l'API ne fonctionne pas
      const simulatedNotifications = simulateNotifications();
      setNotifications(simulatedNotifications);
      setError('API backend temporairement indisponible - Affichage simulé');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'MAGASINIER') {
      fetchNotifications();
      
      // Actualiser les notifications toutes les 30 secondes
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, userRole]);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' };
      case 'medium': return { bg: '#fef3c7', border: '#d97706', text: '#92400e' };
      case 'low': return { bg: '#dbeafe', border: '#2563eb', text: '#1d4ed8' };
      default: return { bg: '#f3f4f6', border: '#6b7280', text: '#374151' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', border: '#d97706', text: '#92400e' };
      case 'in_progress': return { bg: '#dbeafe', border: '#2563eb', text: '#1d4ed8' };
      case 'completed': return { bg: '#d1fae5', border: '#059669', text: '#065f46' };
      default: return { bg: '#f3f4f6', border: '#6b7280', text: '#374151' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SOUS_PROJET_CREATED': return '📁';
      case 'BON_TRAVAIL_CREATED': return '🛠️';
      case 'INTERVENTION_ASSIGNED': return '🔧';
      case 'INTERVENTION_CREATED': return '📋';
      case 'COMPONENT_ORDER': return '📦';
      case 'LOW_STOCK_ALERT': return '⚠️';
      case 'ORDER_VALIDATED': return '✅';
      case 'STOCK_UPDATE': return '🔄';
      case 'INVENTORY_SCHEDULED': return '📝';
      default: return '🔔';
    }
  };

  // Filtrage et pagination
  const filteredNotifications = notifications.filter(notification => {
    const priorityMatch = filterPriority === 'all' || notification.priority === filterPriority;
    const statusMatch = filterStatus === 'all' || notification.status === filterStatus;
    return priorityMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (userRole !== 'MAGASINIER') {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Header avec filtres */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #e5e7eb',
        background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔔 Centre de Notifications Magasinier
          </h3>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 12px',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            {filteredNotifications.filter(n => !n.isRead).length} nouvelles
          </span>
        </div>

        {/* Filtres */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <select
            value={filterPriority}
            onChange={(e) => {
              setFilterPriority(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <option value="all" style={{ color: '#000' }}>🎯 Toutes priorités</option>
            <option value="high" style={{ color: '#000' }}>🔴 Haute</option>
            <option value="medium" style={{ color: '#000' }}>🟡 Moyenne</option>
            <option value="low" style={{ color: '#000' }}>🔵 Basse</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <option value="all" style={{ color: '#000' }}>📊 Tous statuts</option>
            <option value="pending" style={{ color: '#000' }}>⏳ En attente</option>
            <option value="in_progress" style={{ color: '#000' }}>🔄 En cours</option>
            <option value="completed" style={{ color: '#000' }}>✅ Terminé</option>
          </select>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <option value={5} style={{ color: '#000' }}>5 par page</option>
            <option value={10} style={{ color: '#000' }}>10 par page</option>
            <option value={15} style={{ color: '#000' }}>15 par page</option>
          </select>
        </div>

        {/* Pagination au-dessus */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
              Page {currentPage} sur {totalPages} • {filteredNotifications.length} notifications
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: currentPage === 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                  color: currentPage === 1 ? 'rgba(255,255,255,0.5)' : 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                ← Précédent
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: currentPage === totalPages ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                  color: currentPage === totalPages ? 'rgba(255,255,255,0.5)' : 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(255,193,7,0.2)',
            border: '1px solid rgba(255,193,7,0.4)',
            color: '#fff3cd',
            fontSize: '14px',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Liste des notifications */}
      <div style={{
        maxHeight: '500px',
        overflowY: 'auto',
        background: '#f8fafc'
      }}>
        {paginatedNotifications.length === 0 ? (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '16px', margin: 0 }}>
              {filteredNotifications.length === 0 ? 'Aucune notification correspondante' : 'Aucune notification pour le moment'}
            </p>
          </div>
        ) : (
          paginatedNotifications.map((notification) => {
            const priorityColors = getPriorityColor(notification.priority);
            const statusColors = getStatusColor(notification.status);
            
            return (
              <div
                key={notification.id}
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #e5e7eb',
                  background: !notification.isRead ? '#f0f9ff' : 'white',
                  borderLeft: !notification.isRead ? '4px solid #3b82f6' : '4px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = !notification.isRead ? '#f0f9ff' : 'white';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                onClick={() => markAsRead(notification.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    fontSize: '28px',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: !notification.isRead ? '#1f2937' : '#6b7280',
                        margin: 0,
                        lineHeight: '1.4'
                      }}>
                        {notification.title}
                      </h4>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {!notification.isRead && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            background: '#3b82f6',
                            borderRadius: '50%',
                            animation: 'pulse 2s infinite'
                          }} />
                        )}
                        <span style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p style={{
                      fontSize: '14px',
                      color: !notification.isRead ? '#374151' : '#6b7280',
                      margin: '0 0 12px 0',
                      lineHeight: '1.5'
                    }}>
                      {notification.message}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: priorityColors.bg,
                        color: priorityColors.text,
                        border: `1px solid ${priorityColors.border}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {notification.priority === 'high' ? '🔴 HAUTE' : 
                         notification.priority === 'medium' ? '🟡 MOYENNE' : '🔵 BASSE'}
                      </span>
                      
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: statusColors.bg,
                        color: statusColors.text,
                        border: `1px solid ${statusColors.border}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {notification.status === 'pending' ? '⏳ EN ATTENTE' : 
                         notification.status === 'in_progress' ? '🔄 EN COURS' : '✅ TERMINÉ'}
                      </span>
                      
                      {!notification.isRead && (
                        <span style={{
                          fontSize: '12px',
                          color: '#3b82f6',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          ⚡ Action requise
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer avec statistiques */}
      <div style={{
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600'
          }}>
            📊 Total: {notifications.length} notifications
          </span>
          <span style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            • {filteredNotifications.length} affichées
          </span>
        </div>
        
        <button
          onClick={fetchNotifications}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,48,97,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          🔄 Actualiser
        </button>
      </div>
    </div>
  );
};

export default MagasinierNotifications;
