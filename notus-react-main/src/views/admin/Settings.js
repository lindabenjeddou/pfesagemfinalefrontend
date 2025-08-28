import React, { useState, useEffect } from "react";

// Animations CSS
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

// Injection des styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

// Composant de notification moderne
const Notification = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? '#10B981' : '#EF4444';
  const icon = type === 'success' ? '✅' : '❌';
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      background: bgColor,
      color: "white",
      padding: "1rem 1.5rem",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      animation: "slideIn 0.3s ease-out",
      minWidth: "300px"
    }}>
      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
      <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: "500" }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: "1.2rem",
          cursor: "pointer",
          padding: "0.25rem",
          borderRadius: "4px",
          opacity: 0.8,
          transition: "opacity 0.3s ease"
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.8}
      >
        ×
      </button>
    </div>
  );
};

// Icônes SVG pour les statistiques
const StatsIcon = ({ type }) => {
  const icons = {
    total: (
      <svg style={{ width: "32px", height: "32px", color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    admin: (
      <svg style={{ width: "32px", height: "32px", color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    technician: (
      <svg style={{ width: "32px", height: "32px", color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    unconfirmed: (
      <svg style={{ width: "32px", height: "32px", color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )
  };
  return icons[type] || icons.total;
};

// Icônes SVG pour les formulaires
const FormIcon = ({ type, size = "20px", color = "#6B7280" }) => {
  const icons = {
    search: (
      <svg style={{ width: size, height: size, color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    filter: (
      <svg style={{ width: size, height: size, color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
    user: (
      <svg style={{ width: size, height: size, color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    edit: (
      <svg style={{ width: size, height: size, color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    delete: (
      <svg style={{ width: size, height: size, color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    check: (
      <svg style={{ width: size, height: size, color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
  };
  return icons[type] || icons.user;
};

export default function Settings() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showUnconfirmedOnly, setShowUnconfirmedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  
  // États pour le formulaire de modification
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    adress: "",
    resetToken: "",
    role: "ADMIN",
    confirmation: 0
  });
  
  // États pour les statistiques
  const [statistics, setStatistics] = useState({
    total: 0,
    admin: 0,
    technicians: 0,
    unconfirmed: 0
  });

  // Fonction pour charger les utilisateurs
  const loadUsers = async () => {
    try {
      console.log("🔄 Chargement des utilisateurs...");
      const response = await fetch("http://localhost:8089/PI/user/all");
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("📊 Utilisateurs reçus:", data);
      
      const usersArray = Array.isArray(data) ? data : [];
      setUsers(usersArray);
      
      // Calculer les statistiques
      const stats = {
        total: usersArray.length,
        admin: usersArray.filter(u => u.role === 'ADMIN').length,
        technicians: usersArray.filter(u => u.role === 'TECHNICIEN_PREVENTIF' || u.role === 'TECHNICIEN_CURATIF').length,
        unconfirmed: usersArray.filter(u => u.confirmation === null || u.confirmation === 0).length
      };
      
      console.log("📈 Statistiques utilisateurs:", stats);
      setStatistics(stats);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des utilisateurs:", error);
      console.log("📊 Utilisation de données de test...");
      
      // Données de test pour démonstration
      const testUsers = [
        { id: 1, firstName: 'Admin', lastName: 'Principal', email: 'admin@example.com', role: 'ADMIN', confirmation: 1 },
        { id: 2, firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com', role: 'TECHNICIEN_PREVENTIF', confirmation: 1 },
        { id: 3, firstName: 'Marie', lastName: 'Martin', email: 'marie@example.com', role: 'TECHNICIEN_CURATIF', confirmation: 0 },
        { id: 4, firstName: 'Pierre', lastName: 'Durand', email: 'pierre@example.com', role: 'MAGASINIER', confirmation: 1 },
        { id: 5, firstName: 'Sophie', lastName: 'Bernard', email: 'sophie@example.com', role: 'CHEF_PROJET', confirmation: null },
        { id: 6, firstName: 'Luc', lastName: 'Moreau', email: 'luc@example.com', role: 'TECHNICIEN_PREVENTIF', confirmation: 1 }
      ];
      
      setUsers(testUsers);
      
      const stats = {
        total: testUsers.length,
        admin: testUsers.filter(u => u.role === 'ADMIN').length,
        technicians: testUsers.filter(u => u.role === 'TECHNICIEN_PREVENTIF' || u.role === 'TECHNICIEN_CURATIF').length,
        unconfirmed: testUsers.filter(u => u.confirmation === null || u.confirmation === 0).length
      };
      
      console.log("📈 Statistiques de test:", stats);
      setStatistics(stats);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un utilisateur
  const deleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8089/PI/user/delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error();
      
      setNotification({
        message: "Utilisateur supprimé avec succès !",
        type: "success"
      });
      
      loadUsers(); // Recharger la liste
    } catch (error) {
      setNotification({
        message: "Erreur lors de la suppression de l'utilisateur",
        type: "error"
      });
    }
  };

  // Confirmer un utilisateur
  const confirmUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8089/PI/user/confirm/${userId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error();
      
      setNotification({
        message: "Utilisateur confirmé avec succès !",
        type: "success"
      });
      
      loadUsers(); // Recharger la liste
    } catch (error) {
      setNotification({
        message: "Erreur lors de la confirmation de l'utilisateur",
        type: "error"
      });
    }
  };

  // Fonctions pour le formulaire de modification
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      id: user.id || 0,
      firstName: user.firstName || user.firstname || "",
      lastName: user.lastName || user.lastname || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || user.phone || "",
      adress: user.adress || user.address || "",
      resetToken: user.resetToken || "",
      role: user.role || "ADMIN",
      confirmation: user.confirmation || 0
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditForm({
      id: 0,
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      adress: "",
      resetToken: "",
      role: "ADMIN",
      confirmation: 0
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!editForm.firstName || !editForm.lastName || !editForm.email) {
      setNotification({
        message: "Veuillez remplir tous les champs obligatoires",
        type: "error"
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8089/PI/user/update/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      setNotification({
        message: `Utilisateur ${editForm.firstName} ${editForm.lastName} modifié avec succès !`,
        type: "success"
      });
      
      closeEditModal();
      loadUsers(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      setNotification({
        message: "Erreur lors de la modification de l'utilisateur",
        type: "error"
      });
    }
  };

  // Fonction pour vérifier les utilisateurs non confirmés
  const checkUnconfirmedUsers = () => {
    const unconfirmed = users.filter((u) => u.confirmation === null || u.confirmation === 0);
    if (unconfirmed.length === 0) {
      setNotification({
        message: "Tous les utilisateurs sont confirmés !",
        type: "success"
      });
    } else {
      setNotification({
        message: `${unconfirmed.length} utilisateur(s) non confirmé(s) trouvé(s)`,
        type: "error"
      });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];
    
    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(term) ||
          u.lastName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }
    
    if (showUnconfirmedOnly) {
      filtered = filtered.filter((u) => u.confirmation === null || u.confirmation === 0);
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, roleFilter, searchTerm, showUnconfirmedOnly]);

  // Format role names for display (e.g., 'ROLE_ADMIN' -> 'Admin')
  const formatRoleName = (role) => {
    if (!role) return 'Non défini';
    // Remove 'ROLE_' prefix if it exists
    const formatted = role.replace('ROLE_', '');
    // Capitalize first letter and make the rest lowercase
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
  };

  // Get background color for role badges
  const getRoleBadgeColor = (role) => {
    if (!role) return 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)';
    
    const roleMap = {
      'ROLE_ADMIN': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', // Purple
      'ADMIN': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      'ROLE_TECHNICIAN': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', // Blue
      'TECHNICIAN': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      'ROLE_USER': 'linear-gradient(135deg, #10B981 0%, #059669 100%)', // Green
      'USER': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      'ROLE_MANAGER': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', // Amber
      'MANAGER': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      'default': 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)' // Gray
    };
    
    return roleMap[role] || roleMap['default'];
  };

  const uniqueRoles = Array.from(new Set(users.map((user) => user.role)));
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Affichage des notifications
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "400px",
        fontSize: "1.2rem",
        color: "#6B7280"
      }}>
        🔄 Chargement des utilisateurs...
      </div>
    );
  }
  return (
    <>
      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Titre et description */}
      <div style={{
        background: "linear-gradient(135deg, #EBF4FF 0%, #E0E7FF 50%, #F3E8FF 100%)",
        padding: "2rem 0",
        marginBottom: "2rem"
      }}>
        <h1 style={{
          textAlign: "center",
          fontSize: "2.5rem",
          fontWeight: "700",
          color: "#1F2937",
          margin: "0 0 0.5rem 0",
          textShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          👥 Gestion des Utilisateurs
        </h1>
        <p style={{
          color: "#6B7280",
          fontSize: "1.1rem",
          margin: "0.5rem 0 0 0",
          fontWeight: "500",
          textAlign: "center"
        }}>
          Administration et suivi des comptes utilisateurs
        </p>
      </div>

      {/* Statistiques */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem",
        maxWidth: "1200px",
        margin: "0 auto 2rem auto"
      }}>
        {[
          { key: 'total', label: 'Total Utilisateurs', value: statistics.total, color: '#3B82F6', type: 'total' },
          { key: 'admin', label: 'Administrateurs', value: statistics.admin, color: '#EF4444', type: 'admin' },
          { key: 'technicians', label: 'Techniciens', value: statistics.technicians, color: '#8B5CF6', type: 'technician' },
          { key: 'unconfirmed', label: 'Non Confirmés', value: statistics.unconfirmed, color: '#F59E0B', type: 'unconfirmed' }
        ].map((stat) => (
          <div key={stat.key} style={{
            background: "linear-gradient(135deg, " + stat.color + " 0%, " + stat.color + "CC 100%)",
            borderRadius: "16px",
            padding: "1.5rem",
            color: "white",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            transition: "all 0.3s ease",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.9, fontWeight: "500" }}>{stat.label}</p>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "2rem", fontWeight: "700" }}>{stat.value}</p>
              </div>
              <div style={{ opacity: 0.8 }}>
                <StatsIcon type={stat.type} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire de gestion */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        overflow: "hidden"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
          padding: "1.5rem",
          color: "white"
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            🔍 Recherche et Filtres
          </h2>
        </div>
        
        <div style={{ padding: "2rem" }}>
          {/* Filtres */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem"
          }}>
            {/* Recherche */}
            <div style={{ position: "relative" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5rem"
              }}>
                <FormIcon type="search" size="18px" color="#667EEA" />
                🔍 Rechercher
              </label>
              <input
                type="text"
                placeholder="Nom, prénom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #E5E7EB",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667EEA";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Filtre par rôle */}
            <div style={{ position: "relative" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5rem"
              }}>
                <FormIcon type="filter" size="18px" color="#667EEA" />
                🏷️ Filtrer par rôle
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #E5E7EB",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  transition: "all 0.3s ease",
                  outline: "none",
                  backgroundColor: "white"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667EEA";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="">Tous les rôles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>{formatRoleName(role)}</option>
                ))}
              </select>
            </div>

            {/* Checkbox pour non confirmés */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "1.5rem" }}>
              <input
                type="checkbox"
                id="unconfirmed"
                checked={showUnconfirmedOnly}
                onChange={(e) => setShowUnconfirmedOnly(e.target.checked)}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "#667EEA"
                }}
              />
              <label htmlFor="unconfirmed" style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                cursor: "pointer"
              }}>
                ⚠️ Afficher uniquement les non confirmés
              </label>
            </div>

            {/* Bouton de vérification */}
            <div style={{ display: "flex", alignItems: "end" }}>
              <button
                onClick={checkUnconfirmedUsers}
                style={{
                  background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color: "white",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                }}
              >
                🔍 Vérifier Utilisateurs
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Liste des utilisateurs */}
      <div style={{
        maxWidth: "1200px",
        margin: "2rem auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1.5rem"
      }}>
        {currentUsers.map((user) => (
          <div key={user.id} style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            border: "1px solid #E5E7EB",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "700"
              }}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "#1F2937"
                }}>
                  {user.firstName} {user.lastName}
                </h3>
                <p style={{
                  margin: "0.25rem 0 0 0",
                  fontSize: "0.875rem",
                  color: "#6B7280"
                }}>
                  {user.email}
                </p>
              </div>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <span style={{
                display: "inline-block",
                padding: "0.25rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "white",
                background: getRoleBadgeColor(user.role)
              }}>
                {formatRoleName(user.role)}
              </span>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: user.confirmation === 1 ? "#10B981" : "#EF4444"
              }}>
                {user.confirmation === 1 ? "✅" : "⚠️"}
                {user.confirmation === 1 ? "Confirmé" : "Non confirmé"}
              </span>
            </div>
            
            <div style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end"
            }}>
              {user.confirmation !== 1 && (
                <button
                  onClick={() => confirmUser(user.id)}
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  <FormIcon type="check" size="14px" color="white" />
                  Confirmer
                </button>
              )}
              <button
                onClick={() => openEditModal(user)}
                style={{
                  background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              >
                <FormIcon type="edit" size="14px" color="white" />
                Modifier
              </button>
              <button
                onClick={() => deleteUser(user.id)}
                style={{
                  background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              >
                <FormIcon type="delete" size="14px" color="white" />
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.5rem",
          margin: "2rem 0"
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: "0.5rem 1rem",
              border: "2px solid #E5E7EB",
              borderRadius: "8px",
              background: currentPage === 1 ? "#F9FAFB" : "white",
              color: currentPage === 1 ? "#9CA3AF" : "#374151",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Précédent
          </button>
          
          <span style={{
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            color: "#6B7280"
          }}>
            Page {currentPage} sur {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: "0.5rem 1rem",
              border: "2px solid #E5E7EB",
              borderRadius: "8px",
              background: currentPage === totalPages ? "#F9FAFB" : "white",
              color: currentPage === totalPages ? "#9CA3AF" : "#374151",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Suivant
          </button>
        </div>
      )}
      
      {/* Modal de modification */}
      {showEditModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "2rem",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            animation: "slideIn 0.3s ease-out"
          }}>
            {/* En-tête du modal */}
            <div style={{
              background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
              margin: "-2rem -2rem 2rem -2rem",
              padding: "1.5rem 2rem",
              borderRadius: "20px 20px 0 0",
              color: "white"
            }}>
              <h2 style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <FormIcon type="edit" size="24px" color="white" />
                Modifier l'utilisateur
              </h2>
              <p style={{
                margin: "0.5rem 0 0 0",
                fontSize: "0.875rem",
                opacity: 0.9
              }}>
                Modifiez les informations de {editingUser?.firstName} {editingUser?.lastName}
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleUpdateUser}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem"
              }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "0.5rem"
                  }}>
                    👤 Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditFormChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #E5E7EB",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                      transition: "all 0.3s ease",
                      outline: "none"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3B82F6";
                      e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E5E7EB";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "0.5rem"
                  }}>
                    👥 Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditFormChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #E5E7EB",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                      transition: "all 0.3s ease",
                      outline: "none"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3B82F6";
                      e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E5E7EB";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem"
                }}>
                  📧 Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #E5E7EB",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    transition: "all 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3B82F6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem"
              }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "0.5rem"
                  }}>
                    📞 Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={handleEditFormChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #E5E7EB",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                      transition: "all 0.3s ease",
                      outline: "none"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3B82F6";
                      e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E5E7EB";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "0.5rem"
                  }}>
                    🏆 Rôle
                  </label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditFormChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #E5E7EB",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                      transition: "all 0.3s ease",
                      outline: "none",
                      backgroundColor: "white"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3B82F6";
                      e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E5E7EB";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    <option value="ADMIN">🔑 Admin</option>
                    <option value="MAGASINIER">📦 Magasinier</option>
                    <option value="CHEF_PROJET">📈 Chef de Projet</option>
                    <option value="TECHNICIEN_CURATIF">🔧 Technicien Curatif</option>
                    <option value="TECHNICIEN_PREVENTIF">⚙️ Technicien Préventif</option>
                    <option value="CHEF_SECTEUR">🏁 Chef de Secteur</option>
                    <option value="SUPERVISEUR_PRODUCTION">👥 Superviseur Production</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem"
                }}>
                  🏠 Adresse
                </label>
                <input
                  type="text"
                  name="adress"
                  value={editForm.adress}
                  onChange={handleEditFormChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #E5E7EB",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    transition: "all 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3B82F6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Boutons */}
              <div style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end"
              }}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "2px solid #E5E7EB",
                    borderRadius: "12px",
                    backgroundColor: "white",
                    color: "#374151",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#F9FAFB";
                    e.target.style.borderColor = "#D1D5DB";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "white";
                    e.target.style.borderColor = "#E5E7EB";
                  }}
                >
                  Annuler
                </button>
                
                <button
                  type="submit"
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                    color: "white",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 10px 25px -5px rgba(59, 130, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <FormIcon type="check" size="16px" color="white" />
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}