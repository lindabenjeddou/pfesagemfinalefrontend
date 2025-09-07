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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

    // Normaliser les données pour gérer les différences entre API et données simulées
    filtered = filtered.map(n => ({
      ...n,
      // Assurer la compatibilité des champs
      priority: n.priority || 'NORMAL',
      isRead: n.isRead !== undefined ? n.isRead : n.read || false,
      type: n.type || 'COMPONENT_ORDER',
      project: n.project || n.projectName || null,
      createdAt: n.createdAt || n.timestamp || new Date().toISOString()
    }));

    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(n => {
        const priority = n.priority || 'NORMAL';
        return priority === filters.priority;
      });
    }

    if (filters.status === 'unread') {
      filtered = filtered.filter(n => {
        const isRead = n.isRead !== undefined ? n.isRead : (n.read || false);
        return !isRead;
      });
    } else if (filters.status === 'read') {
      filtered = filtered.filter(n => {
        const isRead = n.isRead !== undefined ? n.isRead : (n.read || false);
        return isRead;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        (n.title && n.title.toLowerCase().includes(query)) ||
        (n.message && n.message.toLowerCase().includes(query)) ||
        (n.project && n.project.toLowerCase().includes(query)) ||
        (n.projectName && n.projectName.toLowerCase().includes(query))
      );
    }

    // Tri par date de création (plus récent en premier)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.timestamp || 0);
      const dateB = new Date(b.createdAt || b.timestamp || 0);
      return dateB - dateA;
    });
    
    setFilteredNotifications(filtered);
    setCurrentPage(1); // Reset to first page when filters change
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

  // Pagination logic
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
    <>
      {/* Background avec éléments décoratifs flottants */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)',
        zIndex: -2
      }}>
        {/* Éléments décoratifs flottants */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${20 + i * 10}px`,
              height: `${20 + i * 10}px`,
              background: `linear-gradient(45deg, ${i % 2 === 0 ? '#00d4ff, #0078d4' : '#ff006e, #8338ec'})`,
              borderRadius: '50%',
              top: `${10 + i * 15}%`,
              left: `${5 + i * 15}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              filter: 'blur(1px)',
              opacity: 0.6
            }}
          />
        ))}
      </div>

    <div style={{
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
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid rgba(0,48,97,0.1)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#003061' }}>
                {notifications.length}
              </div>
              <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                Total Notifications
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid rgba(255,107,107,0.2)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                {notifications.filter(n => !n.isRead).length}
              </div>
              <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                Non Lues
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid rgba(245,158,11,0.2)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                {notifications.filter(n => n.priority === 'CRITICAL' || n.priority === 'HIGH').length}
              </div>
              <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
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
              {currentNotifications.map((notification) => {
                // Normaliser les données pour assurer la compatibilité
                const normalizedNotification = {
                  ...notification,
                  priority: notification.priority || 'NORMAL',
                  isRead: notification.isRead !== undefined ? notification.isRead : (notification.read || false),
                  type: notification.type || 'COMPONENT_ORDER'
                };
                
                const type = notificationTypes[normalizedNotification.type] || { icon: '📄', label: 'Notification' };
                const priority = priorityStyles[normalizedNotification.priority] || priorityStyles.NORMAL;
                
                return (
                  <div
                    key={notification.id}
                    style={{
                      background: normalizedNotification.isRead ? '#f9fafb' : 'white',
                      border: `2px solid ${normalizedNotification.isRead ? '#e5e7eb' : priority.border}`,
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: normalizedNotification.isRead ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
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
                            color: normalizedNotification.isRead ? '#6b7280' : '#1f2937'
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
                              {normalizedNotification.priority}
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
                          color: normalizedNotification.isRead ? '#9ca3af' : '#4b5563',
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
                          {!normalizedNotification.isRead && (
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

        {/* Section de pagination moderne et dynamique */}
        <div style={{
          background: "linear-gradient(145deg, #ffffff, #f8fafc)",
          borderRadius: "1rem",
          padding: "1.5rem 2rem",
          marginTop: "1.5rem",
          boxShadow: "0 10px 25px rgba(0, 48, 97, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
          border: "1px solid rgba(0, 48, 97, 0.1)",
          animation: "fadeInUp 0.8s ease-out",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Éléments décoratifs flottants */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "100px",
            height: "100px",
            background: "rgba(0, 48, 97, 0.1)",
            borderRadius: "50%",
            animation: "float 6s ease-in-out infinite"
          }}></div>
          <div style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "60px",
            height: "60px",
            background: "rgba(0, 48, 97, 0.1)",
            borderRadius: "50%",
            animation: "float 4s ease-in-out infinite reverse"
          }}></div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            position: "relative",
            zIndex: 1
          }}>
            {/* Section Items per page */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
              padding: "0.75rem 1.25rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(3, 105, 161, 0.2)",
              animation: "slideInLeft 0.6s ease-out"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <span style={{
                  fontSize: "0.75rem",
                  color: "#0369a1",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>📄 Items par page:</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    border: "2px solid #0369a1",
                    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                    color: "#0369a1",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    outline: "none",
                    boxShadow: "0 2px 4px rgba(3, 105, 161, 0.1)"
                  }}
                  onFocus={(e) => {
                    e.target.style.transform = "scale(1.05)";
                    e.target.style.boxShadow = "0 4px 12px rgba(3, 105, 161, 0.3)";
                  }}
                  onBlur={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = "0 2px 4px rgba(3, 105, 161, 0.1)";
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {/* Section informations de pagination */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
              padding: "0.75rem 1.25rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              animation: "fadeInUp 0.8s ease-out 0.2s both"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <span style={{
                  fontSize: "0.75rem",
                  color: "#16a34a",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>📊 Affichage:</span>
                <div style={{
                  background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  fontSize: "0.875rem",
                  fontWeight: "700",
                  color: "#16a34a",
                  fontFamily: "monospace",
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)"
                }}>
                  {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, filteredNotifications.length)} sur {filteredNotifications.length}
                </div>
              </div>
            </div>

            {/* Boutons de navigation */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              animation: "slideInLeft 0.8s ease-out 0.4s both"
            }}>
              <button
                style={{
                  background: currentPage === 1 
                    ? "linear-gradient(135deg, #9ca3af, #6b7280)" 
                    : "#003061",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: currentPage === 1 
                    ? "0 2px 4px rgba(156, 163, 175, 0.3)" 
                    : "0 4px 12px rgba(0, 48, 97, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden"
                }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ height: "1.25rem", width: "1.25rem" }}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span style={{
                  marginLeft: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}>Précédent</span>
              </button>

              {/* Indicateur de page actuelle */}
              <div style={{
                background: "linear-gradient(135deg, #fef3c7, #fef9e7)",
                border: "2px solid #f59e0b",
                borderRadius: "0.75rem",
                padding: "0.75rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                animation: "pulse 2s infinite",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
              }}>
                <span style={{
                  fontSize: "0.75rem",
                  color: "#d97706",
                  fontWeight: "600",
                  textTransform: "uppercase"
                }}>Page</span>
                <span style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#d97706",
                  fontFamily: "monospace"
                }}>{currentPage}</span>
                <span style={{
                  fontSize: "0.75rem",
                  color: "#d97706",
                  fontWeight: "600"
                }}>/ {totalPages}</span>
              </div>

              <button
                style={{
                  background: currentPage === totalPages 
                    ? "linear-gradient(135deg, #9ca3af, #6b7280)" 
                    : "#003061",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: currentPage === totalPages 
                    ? "0 2px 4px rgba(156, 163, 175, 0.3)" 
                    : "0 4px 12px rgba(0, 48, 97, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden"
                }}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span style={{
                  marginRight: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}>Suivant</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ height: "1.25rem", width: "1.25rem" }}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Animations CSS */}
    <style jsx global>{`
      @keyframes float {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        33% {
          transform: translateY(-20px) rotate(120deg);
        }
        66% {
          transform: translateY(10px) rotate(240deg);
        }
      }
    `}</style>
    </>
  );
};

export default AdvancedNotificationCenter;
