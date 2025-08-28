import React, { useState, useEffect } from 'react';

const AdvancedNotificationCenter = ({ userId, userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [realUserId, setRealUserId] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [usingRealData, setUsingRealData] = useState(false);

  // Types de notifications avec icônes et couleurs
  const notificationTypes = {
    SOUS_PROJET_CREATED: { label: 'Nouveau Sous-Projet', icon: '🏗️', color: '#3b82f6' },
    COMPONENT_ORDER: { label: 'Commande Composants', icon: '📦', color: '#10b981' },
    STOCK_ALERT: { label: 'Alerte Stock', icon: '⚠️', color: '#f59e0b' },
    MAINTENANCE_DUE: { label: 'Maintenance Prévue', icon: '🔧', color: '#8b5cf6' },
    URGENT_REPAIR: { label: 'Réparation Urgente', icon: '🚨', color: '#ef4444' }
  };

  // Priorités avec styles
  const priorityStyles = {
    CRITICAL: { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
    HIGH: { color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
    NORMAL: { color: '#059669', bg: '#d1fae5', border: '#86efac' },
    LOW: { color: '#4b5563', bg: '#f3f4f6', border: '#d1d5db' }
  };

  // Simulation de données enrichies
  const generateEnhancedNotifications = () => {
    return [
      {
        id: 1,
        title: 'Nouveau sous-projet créé',
        message: 'Le sous-projet "Installation Capteurs Bâtiment A" a été créé avec 15 composants commandés.',
        type: 'SOUS_PROJET_CREATED',
        priority: 'NORMAL',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        project: 'Modernisation Usine',
        tags: ['capteurs', 'installation']
      },
      {
        id: 2,
        title: 'Commande de composants urgente',
        message: 'Commande de 8 capteurs de température pour intervention critique.',
        type: 'COMPONENT_ORDER',
        priority: 'HIGH',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        project: 'Maintenance Critique',
        tags: ['urgent', 'capteurs', 'température']
      },
      {
        id: 3,
        title: 'Stock faible détecté',
        message: 'Le stock de résistances 10kΩ est inférieur au seuil critique (5 unités restantes).',
        type: 'STOCK_ALERT',
        priority: 'HIGH',
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        project: null,
        tags: ['stock', 'résistances', 'critique']
      }
    ];
  };

  // Récupérer l'ID utilisateur depuis localStorage ou utiliser un ID par défaut
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    // Si pas d'utilisateur connecté, utiliser l'ID du magasinier par défaut (comme le dashboard)
    const userId = userInfo.id || 2; // ID 2 = Linda Benjeddou (MAGASINIER)
    
    console.log('👤 Utilisateur pour notifications:', { userInfo, userId });
    setRealUserId(userId);
  }, []);

  // Chargement des notifications
  const loadNotifications = async () => {
    // Toujours essayer l'API en premier, même sans utilisateur "officiellement" connecté
    const userId = realUserId || 2; // Utiliser l'ID par défaut si nécessaire
    
    setLoading(true);
    try {
      console.log('🔄 Chargement des notifications depuis l\'API pour l\'utilisateur:', userId);
      // Utiliser la même URL que le dashboard magasinier pour la synchronisation
      const response = await fetch(`http://localhost:8089/PI/PI/notifications/user/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Notifications récupérées depuis l\'API:', data);
        
        // TOUJOURS utiliser les données de l'API, même si vides
        setNotifications(data || []);
        setUsingRealData(true);
        console.log('✅ Utilisation des notifications réelles de l\'API:', data.length, 'notifications');
        
      } else {
        console.log('❌ Erreur API:', response.status, response.statusText);
        // En cas d'erreur, utiliser les données simulées comme fallback
        const simulatedData = generateEnhancedNotifications();
        setNotifications(simulatedData);
        setUsingRealData(false);
        console.log('🧪 Utilisation des données simulées comme fallback');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des notifications:', error);
      // En cas d'erreur réseau, utiliser les données simulées
      const simulatedData = generateEnhancedNotifications();
      setNotifications(simulatedData);
      setUsingRealData(false);
      console.log('🧪 Fallback vers les données simulées à cause de l\'erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  // Charger les notifications quand realUserId est disponible
  useEffect(() => {
    if (realUserId) {
      loadNotifications();
      
      // 🔄 Rafraîchissement automatique toutes les 30 secondes pour synchronisation
      const refreshInterval = setInterval(() => {
        console.log('🔄 Rafraîchissement automatique des notifications...');
        loadNotifications();
      }, 30000); // 30 secondes
      
      // Nettoyage de l'intervalle lors du démontage du composant
      return () => {
        clearInterval(refreshInterval);
        console.log('🛑 Arrêt du rafraîchissement automatique');
      };
    } else {
      // Mode test : utiliser des données simulées si pas d'utilisateur connecté
      console.log('⚠️ Aucun utilisateur connecté, utilisation des données de test');
      const testNotifications = [
        {
          id: 1,
          type: 'COMPONENT_ORDER',
          title: 'Nouvelle commande de composants',
          message: 'Commande de 15 résistances 10kΩ pour le sous-projet SP-001',
          priority: 'HIGH',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2h
          projectName: 'Maintenance Équipement A',
          componentCount: 15
        },
        {
          id: 2,
          type: 'SOUS_PROJET_CREATED',
          title: 'Nouveau sous-projet créé',
          message: 'Le sous-projet SP-002 a été créé et nécessite validation',
          priority: 'NORMAL',
          isRead: false,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // Il y a 4h
          projectName: 'Rénovation Ligne B',
          componentCount: 8
        },
        {
          id: 3,
          type: 'STOCK_ALERT',
          title: 'Alerte stock critique',
          message: 'Stock de condensateurs 100μF en dessous du seuil critique (5 unités)',
          priority: 'CRITICAL',
          isRead: true,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // Il y a 6h
          projectName: 'Stock Général',
          componentCount: 5
        },
        {
          id: 4,
          type: 'MAINTENANCE_DUE',
          title: 'Maintenance programmée',
          message: 'Maintenance préventive prévue pour l\'équipement C-105',
          priority: 'NORMAL',
          isRead: false,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // Il y a 8h
          projectName: 'Maintenance Préventive',
          componentCount: 0
        },
        {
          id: 5,
          type: 'URGENT_REPAIR',
          title: 'Réparation urgente requise',
          message: 'Panne critique détectée sur la ligne de production 3',
          priority: 'CRITICAL',
          isRead: false,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Il y a 1h
          projectName: 'Intervention Urgente',
          componentCount: 12
        }
      ];
      setNotifications(testNotifications);
      setLoading(false);
    }
  }, [realUserId]);

  // Filtrage des notifications
  useEffect(() => {
    let filtered = [...notifications];

    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.status === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filters.status === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        (n.project && n.project.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredNotifications(filtered);
  }, [notifications, filters, searchQuery]);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.has(n.id)));
    setSelectedNotifications(new Set());
  };

  const toggleSelection = (notificationId) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(notificationId)) {
      newSelection.delete(notificationId);
    } else {
      newSelection.add(notificationId);
    }
    setSelectedNotifications(newSelection);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #003061 0%, #0066cc 100%)',
          padding: '30px',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                🔔 Centre de Notifications Avancé
              </h1>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                margin: 0
              }}>
                Gestion intelligente des notifications pour {userRole}
              </p>
            </div>
            <button
              onClick={loadNotifications}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🔄 Actualiser
            </button>
          </div>

          {/* Statistiques */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {notifications.length}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Total Notifications
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {notifications.filter(n => !n.isRead).length}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Non Lues
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>
                {notifications.filter(n => n.priority === 'CRITICAL' || n.priority === 'HIGH').length}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Priorité Élevée
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et Recherche */}
        <div style={{
          padding: '20px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Filtre par type */}
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              <option value="all">Tous les types</option>
              {Object.entries(notificationTypes).map(([key, type]) => (
                <option key={key} value={key}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>

            {/* Filtre par priorité */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              <option value="all">Toutes priorités</option>
              <option value="CRITICAL">🚨 Critique</option>
              <option value="HIGH">⚠️ Élevée</option>
              <option value="NORMAL">ℹ️ Normale</option>
              <option value="LOW">📝 Faible</option>
            </select>

            {/* Filtre par statut */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              <option value="all">Tous statuts</option>
              <option value="unread">Non lues</option>
              <option value="read">Lues</option>
            </select>
          </div>

          {/* Barre de recherche */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="🔍 Rechercher dans les notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  paddingLeft: '40px'
                }}
              />
            </div>

            {/* Actions en masse */}
            {selectedNotifications.size > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    selectedNotifications.forEach(id => markAsRead(id));
                    setSelectedNotifications(new Set());
                  }}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ✅ Marquer lues
                </button>
                <button
                  onClick={deleteSelected}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Supprimer
                </button>
              </div>
            )}

            <button
              onClick={markAllAsRead}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ✅ Tout marquer lu
            </button>
          </div>
        </div>

        {/* Liste des notifications */}
        <div style={{
          padding: '20px',
          background: 'white'
        }}>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
              Chargement des notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                Aucune notification trouvée
              </h3>
              <p style={{ margin: 0 }}>
                Essayez de modifier vos filtres ou votre recherche
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {filteredNotifications.map((notification) => {
                const type = notificationTypes[notification.type] || { icon: '📄', label: 'Notification' };
                const priority = priorityStyles[notification.priority] || priorityStyles.NORMAL;
                
                return (
                  <div
                    key={notification.id}
                    style={{
                      background: notification.isRead ? '#f9fafb' : 'white',
                      border: `2px solid ${notification.isRead ? '#e5e7eb' : priority.border}`,
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: notification.isRead ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}>
                      {/* Checkbox de sélection */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        style={{
                          width: '16px',
                          height: '16px',
                          marginTop: '4px'
                        }}
                      />

                      {/* Icône du type */}
                      <div style={{
                        fontSize: '24px',
                        marginTop: '2px'
                      }}>
                        {type.icon}
                      </div>

                      {/* Contenu principal */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            margin: 0,
                            color: notification.isRead ? '#6b7280' : '#1f2937'
                          }}>
                            {notification.title}
                          </h4>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            {/* Badge de priorité */}
                            <span style={{
                              background: priority.bg,
                              color: priority.color,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {notification.priority}
                            </span>
                            
                            {/* Temps */}
                            <span style={{
                              fontSize: '12px',
                              color: '#9ca3af'
                            }}>
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                        </div>

                        <p style={{
                          fontSize: '14px',
                          color: notification.isRead ? '#9ca3af' : '#4b5563',
                          margin: '0 0 12px 0',
                          lineHeight: '1.5'
                        }}>
                          {notification.message}
                        </p>

                        {/* Métadonnées */}
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          {notification.project && (
                            <span style={{
                              background: '#e0e7ff',
                              color: '#3730a3',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              📁 {notification.project}
                            </span>
                          )}
                          
                          {notification.tags && notification.tags.map(tag => (
                            <span key={tag} style={{
                              background: '#f3f4f6',
                              color: '#374151',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}>
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div style={{
                          display: 'flex',
                          gap: '8px'
                        }}>
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              ✅ Marquer comme lue
                            </button>
                          )}
                          
                          <button
                            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedNotificationCenter;
