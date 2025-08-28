import React, { useState, useEffect } from "react";
import { useSecurity } from "../../contexts/SecurityContext";

export default function Profile() {
  const { user } = useSecurity();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Récupérer les détails complets de l'utilisateur
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user && user.userId) {
        try {
          setLoading(true);
          console.log('🔍 Fetching user details for userId:', user.userId);
          
          // Utiliser l'endpoint /user/all car /user/{id} n'existe pas dans le backend
          const response = await fetch('http://localhost:8089/PI/user/all');
          console.log('📊 API Response status:', response.status);
          
          if (response.ok) {
            const allUsers = await response.json();
            console.log('📄 All users data from API:', allUsers);
            console.log('🔢 Number of users found:', allUsers.length);
            
            // Chercher l'utilisateur actuel par ID
            const currentUser = allUsers.find(u => u.id === user.userId);
            
            if (currentUser) {
              console.log('✅ Found current user:', currentUser);
              console.log('📝 User properties:', Object.keys(currentUser));
              setUserDetails(currentUser);
              setEditedUser({ ...currentUser });
            } else {
              console.log('⚠️ Current user not found in users list');
              console.log('🔍 Available user IDs:', allUsers.map(u => u.id));
              console.log('🔍 Looking for userId:', user.userId);
              
              // Fallback avec les données du SecurityContext
              setUserDetails(user);
              setEditedUser({ ...user });
            }
          } else {
            console.error('❌ Failed to fetch users. Status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            
            // Fallback avec les données du SecurityContext
            setUserDetails(user);
            setEditedUser({ ...user });
          }
        } catch (error) {
          console.error('❌ Error fetching user details:', error);
          
          // Fallback avec les données du SecurityContext
          setUserDetails(user);
          setEditedUser({ ...user });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleSave = async () => {
    try {
      // Ici vous pouvez ajouter l'appel API pour sauvegarder les modifications
      // await updateUserProfile(editedUser);
      
      setIsEditing(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleCancel = () => {
    setEditedUser({ ...userDetails });
    setIsEditing(false);
    setImagePreview(null);
    setProfileImage(null);
  };

  // Gestion de l'upload d'image
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        alert('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      setProfileImage(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Générer les initiales pour l'avatar par défaut
  const getInitials = () => {
    if (userDetails?.firstName && userDetails?.lastName) {
      return `${userDetails.firstName.charAt(0)}${userDetails.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };

  // Photo par défaut selon le rôle
  const getDefaultPhoto = () => {
    if (userDetails?.role === 'MAGASINIER') {
      // Photo professionnelle de magasinier/warehouse worker
      return 'data:image/svg+xml;base64,' + btoa(`
        <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#003061;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0056b3;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Background -->
          <circle cx="70" cy="70" r="70" fill="url(#bg)"/>
          
          <!-- Warehouse Worker Silhouette -->
          <g transform="translate(35, 25)">
            <!-- Head -->
            <circle cx="35" cy="25" r="12" fill="#ffffff" opacity="0.9"/>
            
            <!-- Body -->
            <rect x="25" y="35" width="20" height="35" rx="3" fill="#ffffff" opacity="0.9"/>
            
            <!-- Arms -->
            <rect x="15" y="40" width="8" height="20" rx="4" fill="#ffffff" opacity="0.8"/>
            <rect x="47" y="40" width="8" height="20" rx="4" fill="#ffffff" opacity="0.8"/>
            
            <!-- Legs -->
            <rect x="28" y="68" width="6" height="22" rx="3" fill="#ffffff" opacity="0.8"/>
            <rect x="36" y="68" width="6" height="22" rx="3" fill="#ffffff" opacity="0.8"/>
            
            <!-- Hard Hat -->
            <ellipse cx="35" cy="18" rx="15" ry="8" fill="#FFD700" opacity="0.9"/>
            <rect x="20" y="18" width="30" height="4" rx="2" fill="#FFA500" opacity="0.8"/>
            
            <!-- Safety Vest Details -->
            <rect x="26" y="42" width="18" height="3" fill="#FFD700" opacity="0.7"/>
            <rect x="26" y="48" width="18" height="3" fill="#FFD700" opacity="0.7"/>
            
            <!-- Warehouse Icon -->
            <g transform="translate(50, 15)">
              <rect x="0" y="5" width="12" height="8" fill="#ffffff" opacity="0.6"/>
              <polygon points="0,5 6,0 12,5" fill="#ffffff" opacity="0.6"/>
              <rect x="2" y="7" width="2" height="4" fill="#003061" opacity="0.8"/>
              <rect x="8" y="7" width="2" height="4" fill="#003061" opacity="0.8"/>
            </g>
          </g>
          
          <!-- Role Badge -->
          <g transform="translate(10, 100)">
            <rect x="0" y="0" width="60" height="20" rx="10" fill="#ffffff" opacity="0.9"/>
            <text x="30" y="13" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#003061">MAGASINIER</text>
          </g>
        </svg>
      `);
    }
    return null;
  };

  if (loading || !userDetails) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6c757d'
      }}>
        Chargement du profil...
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: `
            linear-gradient(135deg, 
              #f8f9fa 0%, 
              #e9ecef 50%,
              #f8f9fa 100%
            )
          `,
          padding: '40px 20px',
        }}
      >
        {/* Success Message */}
        {showSuccessMessage && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              color: 'white',
              padding: '15px 25px',
              borderRadius: '12px',
              boxShadow: '0 8px 25px rgba(40, 167, 69, 0.3)',
              zIndex: 1000,
              animation: 'slideInLeft 0.5s ease-out',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '18px' }}>✅</span>
            <span style={{ fontWeight: '600' }}>Profil mis à jour avec succès!</span>
          </div>
        )}

        <div
          style={{
            minHeight: '100vh',
            background: '#f8fafc',
            padding: '30px 20px',
          }}
        >
          {/* Header */}
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto 30px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#1a202c',
                margin: 0,
              }}
            >
              Mon Profil
            </h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                background: isEditing ? '#dc3545' : '#003061',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {isEditing ? 'ANNULER' : 'MODIFIER'}
            </button>
          </div>

          {/* Main Card */}
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header avec photo */}
            <div
              style={{
                display: 'flex',
                padding: '40px',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              {/* User Info - Left Side */}
              <div style={{ flex: 1, paddingRight: '40px' }}>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#1a202c',
                    margin: '0 0 8px 0',
                  }}
                >
                  {userDetails?.firstName || 'Prénom'} {userDetails?.lastName || 'Nom'}
                </h2>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <span
                    style={{
                      background: '#003061',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    {userDetails?.role || 'ROLE'}
                  </span>
                  <span
                    style={{
                      color: '#68d391',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#68d391' }}></span>
                    LOS ANGELES, CALIFORNIA
                  </span>
                </div>
                
                <div
                  style={{
                    display: 'flex',
                    gap: '40px',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>22</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>Friends</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>10</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>Photos</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c' }}>89</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>Comments</div>
                  </div>
                </div>
              </div>

              {/* Photo de Profil - Right Side */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: imagePreview 
                      ? `url(${imagePreview}) center/cover no-repeat`
                      : getDefaultPhoto() 
                        ? `url(${getDefaultPhoto()}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #003061, #0056b3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    fontWeight: '600',
                    color: 'white',
                    border: '4px solid white',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    cursor: isEditing ? 'pointer' : 'default',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                  onClick={() => isEditing && document.getElementById('profileImageInput').click()}
                >
                  {!imagePreview && !getDefaultPhoto() && (
                    <span>{getInitials()}</span>
                  )}
                  
                  {isEditing && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        borderRadius: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0'}
                    >
                      <div style={{ fontSize: '24px' }}>📷</div>
                      <span style={{ color: 'white', fontSize: '10px' }}>Changer</span>
                    </div>
                  )}
                </div>
                
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

                {/* Profile Content */}
                <div
                  style={{
                    padding: '40px',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '30px',
                    }}
                  >
                    {/* Informations Personnelles */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                        padding: '30px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        animation: 'fadeInUp 0.6s ease-out 0.1s both',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '20px',
                          fontWeight: '600',
                          color: '#1a202c',
                          margin: '0 0 25px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        👤 Informations Personnelles
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Prénom */}
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#495057',
                              marginBottom: '8px',
                            }}
                          >
                            Prénom
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedUser.firstName || ''}
                              onChange={(e) => setEditedUser({...editedUser, firstName: e.target.value})}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                transition: 'all 0.3s ease',
                                fontFamily: 'Inter, sans-serif',
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#003061';
                                e.target.style.boxShadow = '0 0 0 3px rgba(0,48,97,0.1)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                padding: '12px 16px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                fontSize: '16px',
                                color: '#495057',
                              }}
                            >
                              {userDetails.firstName || 'Non renseigné'}
                            </div>
                          )}
                        </div>

                        {/* Nom */}
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#495057',
                              marginBottom: '8px',
                            }}
                          >
                            Nom
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedUser.lastName || ''}
                              onChange={(e) => setEditedUser({...editedUser, lastName: e.target.value})}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                transition: 'all 0.3s ease',
                                fontFamily: 'Inter, sans-serif',
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#003061';
                                e.target.style.boxShadow = '0 0 0 3px rgba(0,48,97,0.1)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                padding: '12px 16px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                fontSize: '16px',
                                color: '#495057',
                              }}
                            >
                              {userDetails.lastName || 'Non renseigné'}
                            </div>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#495057',
                              marginBottom: '8px',
                            }}
                          >
                            Email
                          </label>
                          <div
                            style={{
                              padding: '12px 16px',
                              background: '#f8f9fa',
                              borderRadius: '8px',
                              fontSize: '16px',
                              color: '#495057',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {userDetails.email || 'Non renseigné'}
                            <span
                              style={{
                                fontSize: '12px',
                                color: '#6c757d',
                                fontStyle: 'italic',
                                marginLeft: '10px',
                              }}
                            >
                              (non modifiable)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informations Professionnelles */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                        padding: '30px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        animation: 'fadeInUp 0.6s ease-out 0.2s both',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '20px',
                          fontWeight: '600',
                          color: '#1a202c',
                          margin: '0 0 25px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        📊 Informations Professionnelles
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Rôle */}
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#495057',
                              marginBottom: '8px',
                            }}
                          >
                            Rôle
                          </label>
                          <div
                            style={{
                              padding: '12px 16px',
                              background: '#f8f9fa',
                              borderRadius: '8px',
                              fontSize: '16px',
                              color: '#495057',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {userDetails.role || 'Non renseigné'}
                          </div>
                        </div>

                        {/* Entreprise */}
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#495057',
                              marginBottom: '8px',
                            }}
                          >
                            Entreprise
                          </label>
                          <div
                            style={{
                              padding: '12px 16px',
                              background: '#f8f9fa',
                              borderRadius: '8px',
                              fontSize: '16px',
                              color: '#495057',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {userDetails.company || 'Non renseigné'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
              borderRadius: '0 0 20px 20px',
              padding: '40px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '30px',
              }}
            >
              {/* Informations Personnelles */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                  padding: '30px',
                  borderRadius: '16px',
                  border: '1px solid #e9ecef',
                  animation: 'fadeInUp 0.6s ease-out 0.1s both',
                }}
              >
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#003061',
                    margin: '0 0 25px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  👤 Informations Personnelles
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Prénom */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#495057',
                        marginBottom: '8px',
                      }}
                    >
                      Prénom
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.firstName || ''}
                        onChange={(e) => setEditedUser({...editedUser, firstName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e9ecef',
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          fontFamily: 'Inter, sans-serif',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#003061';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0,48,97,0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          padding: '12px 16px',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          fontSize: '16px',
                          color: '#495057',
                        }}
                      >
                        {userDetails.firstName || 'Non renseigné'}
                      </div>
                    )}
                  </div>

                  {/* Nom */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#495057',
                        marginBottom: '8px',
                      }}
                    >
                      Nom
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.lastName || ''}
                        onChange={(e) => setEditedUser({...editedUser, lastName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e9ecef',
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          fontFamily: 'Inter, sans-serif',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#003061';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0,48,97,0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          padding: '12px 16px',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          fontSize: '16px',
                          color: '#495057',
                        }}
                      >
                        {userDetails.lastName || 'Non renseigné'}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#495057',
                        marginBottom: '8px',
                      }}
                    >
                      Email
                    </label>
                    <div
                      style={{
                        padding: '12px 16px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#495057',
                        border: '1px solid #e9ecef',
                      }}
                    >
                      {userDetails.email || 'Non renseigné'}
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#6c757d',
                          fontStyle: 'italic',
                          marginLeft: '10px',
                        }}
                      >
                        (non modifiable)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations Professionnelles */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                  padding: '30px',
                  borderRadius: '16px',
                  border: '1px solid #e9ecef',
                  animation: 'fadeInUp 0.6s ease-out 0.2s both',
                }}
              >
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#003061',
                    margin: '0 0 25px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  🏢 Informations Professionnelles
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Rôle */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#495057',
                        marginBottom: '8px',
                      }}
                    >
                      Rôle
                    </label>
                    <div
                      style={{
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #003061, #0056b3)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: 'white',
                        fontWeight: '600',
                        textAlign: 'center',
                      }}
                    >
                      {userDetails.role}                    </div>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#495057',
                        marginBottom: '8px',
                      }}
                    >
                      Téléphone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedUser.phoneNumber || ''}
                        onChange={(e) => setEditedUser({...editedUser, phoneNumber: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e9ecef',
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          fontFamily: 'Inter, sans-serif',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#003061';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0,48,97,0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          padding: '12px 16px',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          fontSize: '16px',
                          color: '#495057',
                        }}
                      >
                        📞 {userDetails.phoneNumber || 'Non renseigné'}
                      </div>
                    )}
                  </div>

                  {/* Adresse */}
                  <div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#495057',
                          marginBottom: '8px',
                        }}
                      >
                        Adresse
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editedUser.adress || ''}
                          onChange={(e) => setEditedUser({...editedUser, adress: e.target.value})}
                          rows="3"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.3s ease',
                            fontFamily: 'Inter, sans-serif',
                            resize: 'vertical',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#003061';
                            e.target.style.boxShadow = '0 0 0 3px rgba(0,48,97,0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e9ecef';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            padding: '12px 16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            fontSize: '16px',
                            color: '#495057',
                            minHeight: '60px',
                          }}
                        >
                          🏠 {userDetails.adress || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  marginTop: '40px',
                  animation: 'fadeInUp 0.5s ease-out',
                }}
              >
                <button
                  onClick={handleCancel}
                  style={{
                    background: 'linear-gradient(135deg, #6c757d, #495057)',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                  }}
                >
                  ❌ Annuler
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                  }}
                >
                  💾 Sauvegarder
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
