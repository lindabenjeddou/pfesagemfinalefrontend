import React, { useState, useEffect } from 'react';

// Composant de validation des commandes de composants pour magasiniers
const ComponentOrderValidation = () => {
  // Logs immédiats au chargement
  console.log('🚀🚀🚀 COMPOSANT COMPONENTORDERVALIDATION CHARGÉ ! 🚀🚀🚀');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🔥 Version simplifiée pour debug');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour filtrage et recherche avancés
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  
  // États pour actions en masse
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [massActionLoading, setMassActionLoading] = useState(false);
  
  // États pour gestion du stock
  const [stockData, setStockData] = useState({});
  const [stockAlerts, setStockAlerts] = useState([]);
  
  // États pour interface avancée
  const [viewMode, setViewMode] = useState('table'); // 'table', 'cards', 'compact'
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Test de l'API dans useEffect pour éviter les erreurs de rendu
  useEffect(() => {
    console.log('🎯 useEffect: Chargement initial des commandes et du stock');
    
    // Test de l'API
    fetch('http://localhost:8089/PI/PI/sousprojets/')
      .then(response => {
        console.log('📡 Test API - Statut:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('📊 Test API - Données reçues:', data.length, 'sous-projets');
      })
      .catch(error => {
        console.log('🚨 Test API - Erreur:', error.message);
      });
    
    // Charger les commandes et les données de stock en parallèle
    Promise.all([
      loadOrders(),
      loadStockData()
    ]).then(() => {
      console.log('✅ Chargement initial terminé');
    });
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    console.log('📡 Chargement des commandes depuis l\'API /PI/PI/sousprojets/ ...');
    
    try {
      // 1. Récupérer les sous-projets
      const response = await fetch('http://localhost:8089/PI/PI/sousprojets/');
      console.log('📊 Statut réponse API sous-projets:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erreur API sous-projets: ${response.status}`);
      }
      
      const sousProjects = await response.json();
      console.log('📋 Sous-projets récupérés:', sousProjects.length);
      
      // 2. Récupérer tous les composants pour avoir leurs détails complets
      const componentsResponse = await fetch('http://localhost:8089/PI/PI/component/all');
      console.log('📊 Statut réponse API composants:', componentsResponse.status);
      
      if (!componentsResponse.ok) {
        throw new Error(`Erreur API composants: ${componentsResponse.status}`);
      }
      
      const allComponents = await componentsResponse.json();
      console.log('🔧 Composants récupérés:', allComponents.length);
      console.log('🔍 DEBUG: Structure d\'un composant:', allComponents[0]);
      
      // 3. Créer un map des composants par référence pour un accès rapide
      const componentMap = {};
      allComponents.forEach(comp => {
        if (comp.reference) {
          componentMap[comp.reference] = comp;
        }
      });
      console.log('📚 Map des composants créé:', Object.keys(componentMap).length, 'références');
      
      // 4. Convertir les sous-projets en commandes de validation
      const convertedOrders = sousProjects
        .filter(sp => sp.components && sp.components.length > 0)
        .map(sp => {
          console.log(`🔍 DEBUG: Traitement sous-projet ${sp.sousProjetName}:`, sp.components);
          
          // Résoudre les références de composants en objets complets
          const resolvedComponents = sp.components.map((compRef, index) => {
            const fullComponent = componentMap[compRef];
            console.log(`🔍 Résolution composant ${compRef}:`, fullComponent ? 'TROUVÉ' : 'NON TROUVÉ');
            
            if (fullComponent) {
              return {
                id: fullComponent.id || index + 1,
                name: fullComponent.designation || fullComponent.nom || compRef,
                quantity: fullComponent.quantite || 1,
                unitPrice: fullComponent.prix || 0,
                totalPrice: (fullComponent.prix || 0) * (fullComponent.quantite || 1),
                supplier: fullComponent.fournisseur || fullComponent.marque || 'Fournisseur Standard',
                reference: fullComponent.reference || compRef,
                category: fullComponent.famille || fullComponent.categorie || 'Composants'
              };
            } else {
              // Fallback si le composant n'est pas trouvé
              return {
                id: index + 1,
                name: compRef,
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
                supplier: 'Fournisseur Inconnu',
                reference: compRef,
                category: 'Composants'
              };
            }
          });
          
          return {
            id: `api-${sp.id}`,
            sousProjetId: sp.id,
            sousProjetName: sp.sousProjetName || `Sous-Projet ${sp.id}`,
            projectName: `Projet ${sp.projectId}`,
            orderDate: new Date().toISOString(),
            status: sp.confirmed === 1 ? 'CONFIRMED' : 'PENDING',
            demandeur: 'Utilisateur',
            deliveryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
            priority: 'NORMAL',
            totalPrice: sp.totalPrice || resolvedComponents.reduce((total, comp) => total + comp.totalPrice, 0),
            components: resolvedComponents
          };
        });
        
        console.log('🔄 Commandes converties:', convertedOrders.length);
        setOrders(convertedOrders);
        setError(null);
    } catch (error) {
      console.log('🚨 Erreur fetch:', error.message);
      setError(`Erreur lors du chargement: ${error.message}`);
      setOrders([]);
    } finally {
      setLoading(false);
      console.log('✅ Chargement terminé');
    }
  };

  // Fonction pour charger les données de stock
  const loadStockData = async () => {
    try {
      const response = await fetch('http://localhost:8089/PI/PI/component/all');
      if (response.ok) {
        const components = await response.json();
        const stockMap = {};
        const alerts = [];
        
        components.forEach(comp => {
          const stock = comp.quantite || 0;
          const minStock = comp.seuilMinimal || 5; // Seuil par défaut
          
          stockMap[comp.reference] = {
            available: stock,
            minimum: minStock,
            status: stock <= 0 ? 'rupture' : stock <= minStock ? 'critique' : 'normal'
          };
          
          if (stock <= minStock) {
            alerts.push({
              reference: comp.reference,
              name: comp.designation || comp.nom,
              stock: stock,
              minimum: minStock,
              severity: stock <= 0 ? 'error' : 'warning'
            });
          }
        });
        
        setStockData(stockMap);
        setStockAlerts(alerts);
        console.log('📦 Données de stock chargées:', Object.keys(stockMap).length, 'composants');
        console.log('⚠️ Alertes stock:', alerts.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement stock:', error);
    }
  };

  // Fonctions pour actions en masse
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders(new Set());
    } else {
      const allOrderIds = filteredOrders.map(order => order.id);
      setSelectedOrders(new Set(allOrderIds));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
    setSelectAll(newSelected.size === filteredOrders.length);
  };

  const handleMassAction = async (action, reason = '') => {
    if (selectedOrders.size === 0) {
      alert('Veuillez sélectionner au moins une commande.');
      return;
    }

    setMassActionLoading(true);
    try {
      const selectedOrdersList = Array.from(selectedOrders);
      console.log(`🔄 Action en masse: ${action} sur ${selectedOrdersList.length} commandes`);
      
      // Simuler l'appel API pour l'action en masse
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour les commandes localement
      const updatedOrders = orders.map(order => {
        if (selectedOrders.has(order.id)) {
          return {
            ...order,
            status: action === 'approve' ? 'CONFIRMED' : 'REJECTED',
            lastAction: {
              action: action,
              reason: reason,
              timestamp: new Date().toISOString(),
              user: 'Magasinier'
            }
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      setSelectedOrders(new Set());
      setSelectAll(false);
      
      console.log(`✅ Action ${action} appliquée à ${selectedOrdersList.length} commandes`);
    } catch (error) {
      console.error('❌ Erreur action en masse:', error);
      alert('Erreur lors de l\'exécution de l\'action en masse.');
    } finally {
      setMassActionLoading(false);
    }
  };

  // Fonction de tri avancé
  const sortOrders = (ordersToSort) => {
    return [...ordersToSort].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'orderDate':
          aValue = new Date(a.orderDate);
          bValue = new Date(b.orderDate);
          break;
        case 'totalPrice':
          aValue = a.totalPrice;
          bValue = b.totalPrice;
          break;
        case 'sousProjetName':
          aValue = a.sousProjetName.toLowerCase();
          bValue = b.sousProjetName.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { 'HIGH': 3, 'NORMAL': 2, 'LOW': 1 };
          aValue = priorityOrder[a.priority] || 2;
          bValue = priorityOrder[b.priority] || 2;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Filtrage avancé des commandes avec tri
  const getFilteredAndSortedOrders = () => {
    let filtered = orders.filter(order => {
      // Filtre par statut
      const matchesStatus = filter === 'all' || order.status.toLowerCase() === filter.toLowerCase();
      
      // Recherche multi-critères
      const matchesSearch = searchTerm === '' || 
        order.sousProjetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.demandeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.components.some(comp => 
          comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comp.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comp.supplier.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Filtre par catégorie
      const matchesCategory = categoryFilter === 'all' || 
        order.components.some(comp => comp.category.toLowerCase().includes(categoryFilter.toLowerCase()));
      
      // Filtre par prix
      const matchesPrice = (() => {
        switch (priceFilter) {
          case 'low': return order.totalPrice < 100;
          case 'medium': return order.totalPrice >= 100 && order.totalPrice < 500;
          case 'high': return order.totalPrice >= 500;
          case 'all': 
          default: return true;
        }
      })();
      
      // Filtre par date
      const matchesDate = (() => {
        if (dateFilter === 'all') return true;
        const orderDate = new Date(order.orderDate);
        const now = new Date();
        const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);
        
        switch (dateFilter) {
          case 'today': return daysDiff < 1;
          case 'week': return daysDiff < 7;
          case 'month': return daysDiff < 30;
          case 'old': return daysDiff >= 30;
          default: return true;
        }
      })();
      
      // Filtre par fournisseur
      const matchesSupplier = supplierFilter === 'all' || 
        order.components.some(comp => comp.supplier.toLowerCase().includes(supplierFilter.toLowerCase()));
      
      return matchesStatus && matchesSearch && matchesCategory && matchesPrice && matchesDate && matchesSupplier;
    });
    
    // Appliquer le tri
    return sortOrders(filtered);
  };
  
  const filteredOrders = getFilteredAndSortedOrders();

  const getStatusCounts = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
      rejected: orders.filter(o => o.status === 'REJECTED').length
    };
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    console.log(`📝 Commande ${orderId} mise à jour: ${newStatus}`);
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Validation des Commandes de Composants
                  </h3>
                </div>
              </div>
            </div>
            <div className="block w-full overflow-x-auto">
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-blueGray-600">Chargement des commandes...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap mt-4">
      {/* Alertes de stock */}
      {stockAlerts.length > 0 && (
        <div className="w-full mb-4 px-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Alertes Stock ({stockAlerts.length})
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    {stockAlerts.slice(0, 3).map((alert, index) => (
                      <li key={index}>
                        <span className="font-medium">{alert.reference}</span> - {alert.name}: 
                        <span className={`ml-1 ${alert.severity === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {alert.stock} en stock (min: {alert.minimum})
                        </span>
                      </li>
                    ))}
                    {stockAlerts.length > 3 && (
                      <li className="text-yellow-600">... et {stockAlerts.length - 3} autres</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div style={{
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* En-tête principal avec glassmorphism */}
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
            {/* Effet shimmer sur le titre */}
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
                  disabled={loading}
                >
                  {loading ? '⏳' : '🔄'} Actualiser
                </button>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="table">📋 Tableau</option>
                  <option value="cards">🗃️ Cartes</option>
                  <option value="compact">📱 Compact</option>
                </select>
              </div>
            </div>
          </div>

          {/* Barre de filtres avancés */}
          <div className="px-4 py-3 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {/* Recherche globale */}
              <div className="col-span-1 md:col-span-2">
                <input
                  type="text"
                  placeholder="🔍 Rechercher (projet, composant, référence, fournisseur...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Filtre par statut */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-2"
              >
                <option value="all">📊 Tous les statuts</option>
                <option value="pending">⏳ En attente</option>
                <option value="confirmed">✅ Confirmés</option>
                <option value="rejected">❌ Refusés</option>
              </select>

              {/* Filtre par catégorie */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-2"
              >
                <option value="all">🏷️ Toutes catégories</option>
                <option value="elec">⚡ Électrique</option>
                <option value="pneu">🔧 Pneumatique</option>
                <option value="cable">🔌 Câbles</option>
              </select>

              {/* Filtre par prix */}
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-2"
              >
                <option value="all">💰 Tous les prix</option>
                <option value="low">💸 &lt; 100€</option>
                <option value="medium">💵 100-500€</option>
                <option value="high">💎 &gt; 500€</option>
              </select>

              {/* Filtre par date */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-2"
              >
                <option value="all">📅 Toutes les dates</option>
                <option value="today">📆 Aujourd'hui</option>
                <option value="week">📊 Cette semaine</option>
                <option value="month">📈 Ce mois</option>
                <option value="old">📋 Plus anciennes</option>
              </select>
            </div>

            {/* Barre d'actions en masse */}
            {selectedOrders.size > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">
                    {selectedOrders.size} commande(s) sélectionnée(s)
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMassAction('approve')}
                      disabled={massActionLoading}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1 rounded transition-all duration-150"
                    >
                      {massActionLoading ? '⏳' : '✅'} Valider tout
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Raison du refus (optionnel):');
                        if (reason !== null) handleMassAction('reject', reason);
                      }}
                      disabled={massActionLoading}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded transition-all duration-150"
                    >
                      {massActionLoading ? '⏳' : '❌'} Refuser tout
                    </button>
                    <button
                      onClick={() => setSelectedOrders(new Set())}
                      className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded transition-all duration-150"
                    >
                      🚫 Annuler sélection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statistiques rapides */}
          <div className="flex flex-wrap mb-6">
            <div className="w-full lg:w-3/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                        Total Commandes
                      </h5>
                      <span className="font-semibold text-xl text-blueGray-700">
                        {filteredOrders.length}
                      </span>
                    </div>
                    <div className="relative w-auto pl-4 flex-initial">
                      <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-blue-500">
                        <i className="fas fa-box"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-3/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                        En Attente
                      </h5>
                      <span className="font-semibold text-xl text-blueGray-700">
                        {counts.pending}
                      </span>
                    </div>
                    <div className="relative w-auto pl-4 flex-initial">
                      <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-yellow-500">
                        <i className="fas fa-clock"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-3/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                        Confirmées
                      </h5>
                      <span className="font-semibold text-xl text-blueGray-700">
                        {counts.confirmed}
                      </span>
                    </div>
                    <div className="relative w-auto pl-4 flex-initial">
                      <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-green-500">
                        <i className="fas fa-check"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-3/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                <div className="flex-auto p-4">
                  <div className="flex flex-wrap">
                    <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                      <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                        Rejetées
                      </h5>
                      <span className="font-semibold text-xl text-blueGray-700">
                        {counts.rejected}
                      </span>
                    </div>
                    <div className="relative w-auto pl-4 flex-initial">
                      <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-red-500">
                        <i className="fas fa-times"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau détaillé des composants commandés */}
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    📦 Tous les Composants Commandés
                  </h3>
                  <p className="text-sm text-blueGray-400">
                    Liste détaillée de tous les composants à valider
                  </p>
                </div>
              </div>
            </div>
            <div className="block w-full overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-blueGray-600">Chargement des composants...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center p-8">
                  <i className="fas fa-box-open text-4xl text-blueGray-300 mb-4"></i>
                  <p className="text-blueGray-500">Aucun composant commandé trouvé</p>
                  <p className="text-sm text-blueGray-400">Les commandes apparaîtront ici une fois créées</p>
                </div>
              ) : (
                <table className="items-center w-full bg-transparent border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={toggleSelectAll}
                          className="form-checkbox h-4 w-4 text-blue-600"
                          title="Sélectionner tout"
                        />
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Sous-Projet
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Composant
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Référence
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Quantité
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Prix Unitaire
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Prix Total
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Fournisseur
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Statut
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) =>
                      order.components.map((component, compIndex) => (
                        <tr key={`${order.id}-${compIndex}`}>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
                            {compIndex === 0 && (
                              <input
                                type="checkbox"
                                checked={selectedOrders.has(order.id)}
                                onChange={() => toggleSelectOrder(order.id)}
                                className="form-checkbox h-4 w-4 text-blue-600"
                                title="Sélectionner cette commande"
                              />
                            )}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                                {order.sousProjetName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-blueGray-600">
                                  {order.sousProjetName}
                                </span>
                                <br />
                                <span className="text-xs text-blueGray-500">
                                  {order.projectName}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <div>
                              <span className="font-bold text-blueGray-600">
                                {component.name}
                              </span>
                              <br />
                              <span className="text-xs text-blueGray-500">
                                {component.category}
                              </span>
                            </div>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="font-mono text-blueGray-600">
                              {component.reference}
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="font-bold text-lg text-blueGray-700">
                              {component.quantity}
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="font-semibold text-blueGray-600">
                              {component.unitPrice.toFixed(2)} €
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="font-bold text-lg text-green-600">
                              {component.totalPrice.toFixed(2)} €
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="text-blueGray-600">
                              {component.supplier}
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                              order.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status === 'CONFIRMED' ? '✅ Confirmé' :
                               order.status === 'REJECTED' ? '❌ Rejeté' :
                               '⏳ En Attente'}
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {order.status === 'PENDING' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                                  className="bg-green-500 text-white active:bg-green-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 hover:bg-green-600"
                                  type="button"
                                >
                                  ✅ Confirmer
                                </button>
                                <button
                                  onClick={() => handleStatusChange(order.id, 'REJECTED')}
                                  className="bg-red-500 text-white active:bg-red-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 hover:bg-red-600"
                                  type="button"
                                >
                                  ❌ Rejeter
                                </button>
                              </div>
                            )}
                            {order.status !== 'PENDING' && (
                              <span className="text-xs text-blueGray-400">
                                {order.status === 'CONFIRMED' ? 'Validé' : 'Rejeté'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="px-4 py-3 border-b border-blueGray-200">
            <div className="flex flex-wrap items-center">
              <div className="w-full md:w-1/2 px-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher par nom de projet ou sous-projet..."
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2 px-2">
                <div className="relative">
                  <select
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmées</option>
                    <option value="rejected">Rejetées</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des commandes */}
          <div className="block w-full overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-inbox text-4xl text-blueGray-300 mb-4"></i>
                <p className="text-blueGray-500">Aucune commande trouvée</p>
              </div>
            ) : (
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Sous-Projet
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Demandeur
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Composants
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Prix Total
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Statut
                    </th>
                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <div>
                          <span className="font-bold text-blueGray-600">
                            {order.sousProjetName}
                          </span>
                          <br />
                          <span className="text-blueGray-500">
                            {order.projectName}
                          </span>
                        </div>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        {order.demandeur}
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className="bg-blueGray-100 text-blueGray-600 px-2 py-1 rounded">
                          {order.components.length} composant(s)
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className="font-bold text-blueGray-600">
                          {order.totalPrice.toFixed(2)} €
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status === 'PENDING' ? 'En Attente' :
                           order.status === 'CONFIRMED' ? 'Confirmée' : 'Rejetée'}
                        </span>
                      </td>
                      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        {order.status === 'PENDING' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                              className="bg-green-500 text-white active:bg-green-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none ease-linear transition-all duration-150"
                              title="Confirmer la commande"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, 'REJECTED')}
                              className="bg-red-500 text-white active:bg-red-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none ease-linear transition-all duration-150"
                              title="Rejeter la commande"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentOrderValidation;
