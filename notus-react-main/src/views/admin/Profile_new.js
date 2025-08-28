import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [editedUser, setEditedUser] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Fonction pour récupérer les détails complets de l'utilisateur
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/PI/user/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const users = await response.json();
        const currentUser = users.find(u => u.id === user?.userId);
        
        if (currentUser) {
          setUserDetails(currentUser);
          setEditedUser(currentUser);
        } else {
          setUserDetails({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            role: user?.role || '',
            phoneNumber: user?.phoneNumber || '',
            adress: user?.adress || ''
          });
          setEditedUser({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            role: user?.role || '',
            phoneNumber: user?.phoneNumber || '',
            adress: user?.adress || ''
          });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchUserDetails();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/PI/user/update/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedUser)
      });
      
      if (response.ok) {
        setUserDetails(editedUser);
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCancel = () => {
    setEditedUser(userDetails);
    setIsEditing(false);
    setImagePreview(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = () => {
    const firstName = userDetails.firstName || user?.firstName || '';
    const lastName = userDetails.lastName || user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getDefaultPhoto = () => {
    if (userDetails.role === 'MAGASINIER' || user?.role === 'MAGASINIER') {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#003061;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0056b3;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="200" height="200" fill="url(#bg)"/>
          <rect x="30" y="120" width="140" height="60" fill="#2c3e50" stroke="#34495e" stroke-width="2"/>
          <polygon points="30,120 100,80 170,120" fill="#34495e" stroke="#2c3e50" stroke-width="2"/>
          <rect x="80" y="140" width="40" height="30" fill="#e74c3c"/>
          <circle cx="100" cy="70" r="15" fill="#f39c12"/>
          <circle cx="100" cy="85" r="12" fill="#fdbcb4"/>
          <rect x="88" y="95" width="24" height="35" fill="#f39c12" rx="3"/>
          <rect x="85" y="130" width="30" height="25" fill="#2c3e50"/>
          <rect x="90" y="100" width="20" height="3" fill="#ecf0f1"/>
          <rect x="90" y="110" width="20" height="3" fill="#ecf0f1"/>
          <rect x="90" y="120" width="20" height="3" fill="#ecf0f1"/>
          <rect x="60" y="160" width="80" height="20" fill="#003061" rx="10"/>
          <text x="100" y="173" text-anchor="middle" fill="white" font-family="Arial" font-size="10" font-weight="bold">MAGASINIER</text>
        </svg>
      `)}`;
    }
    return null;
  };

  if (!user) {
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
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '30px 20px',
      }}
    >
      {/* Success Message */}
      {showSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #28a745, #20c997)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(40,167,69,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>✅</span>
          <span style={{ fontWeight: '600' }}>Profil mis à jour avec succès!</span>
        </div>
      )}

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
          My account
        </h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            background: isEditing ? '#dc3545' : '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {isEditing ? 'CANCEL' : 'SETTINGS'}
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
            alignItems: 'flex-start',
          }}
        >
          {/* User Info - Left Side */}
          <div style={{ flex: 1, paddingRight: '40px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1a202c',
                  margin: '0 0 8px 0',
                }}
              >
                {userDetails?.firstName || 'Jenna'} {userDetails?.lastName || 'Stones'}
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '14px', color: '#68d391' }}>📍</span>
                <span
                  style={{
                    color: '#68d391',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  LOS ANGELES, CALIFORNIA
                </span>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <span
                  style={{
                    color: '#68d391',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  💼 Solution Manager - Creative Tim Officer
                </span>
              </div>
              
              <div>
                <span
                  style={{
                    color: '#68d391',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  🎓 University of Computer Science
                </span>
              </div>
            </div>
            
            <div
              style={{
                display: 'flex',
                gap: '40px',
                marginBottom: '20px',
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
            
            <p
              style={{
                fontSize: '14px',
                color: '#718096',
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              An artist of considerable range, Jenna the name taken by Melbourne-raised, Brooklyn-based Nick Murphy writes, performs and records all of his own music, giving it a warm, intimate feel with a solid groove structure. An artist of considerable range.
            </p>
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
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: imagePreview 
                  ? `url(${imagePreview}) center/cover no-repeat`
                  : getDefaultPhoto() 
                    ? `url(${getDefaultPhoto()}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
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
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                  <span style={{ color: 'white', fontSize: '12px' }}>Changer</span>
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
            {/* Informations Utilisateur */}
            <div
              style={{
                background: '#f8f9fa',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#718096',
                  margin: '0 0 20px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                USER INFORMATION
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#718096',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    USERNAME
                  </label>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#1a202c',
                      fontWeight: '500',
                    }}
                  >
                    {userDetails.username || 'lucky.jesse'}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#718096',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    EMAIL ADDRESS
                  </label>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#1a202c',
                      fontWeight: '500',
                    }}
                  >
                    {userDetails.email || 'jesse@example.com'}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#718096',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    FIRST NAME
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.firstName || ''}
                      onChange={(e) => setEditedUser({...editedUser, firstName: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#1a202c',
                        fontWeight: '500',
                      }}
                    >
                      {userDetails.firstName || 'Lucky'}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#718096',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    LAST NAME
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.lastName || ''}
                      onChange={(e) => setEditedUser({...editedUser, lastName: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#1a202c',
                        fontWeight: '500',
                      }}
                    >
                      {userDetails.lastName || 'Jesse'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informations de Contact */}
            <div
              style={{
                background: '#f8f9fa',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#718096',
                  margin: '0 0 20px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                CONTACT INFORMATION
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#718096',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    ADDRESS
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.adress || ''}
                      onChange={(e) => setEditedUser({...editedUser, adress: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#1a202c',
                        fontWeight: '500',
                      }}
                    >
                      {userDetails.adress || 'Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09'}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#718096',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    CITY
                  </label>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#1a202c',
                      fontWeight: '500',
                    }}
                  >
                    New York
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#718096',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    COUNTRY
                  </label>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#1a202c',
                      fontWeight: '500',
                    }}
                  >
                    United States
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#718096',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    POSTAL CODE
                  </label>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#1a202c',
                      fontWeight: '500',
                    }}
                  >
                    Postal Code
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Me */}
          <div
            style={{
              background: '#f8f9fa',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginTop: '30px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#718096',
                margin: '0 0 20px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              ABOUT ME
            </h3>
            <div
              style={{
                fontSize: '14px',
                color: '#1a202c',
                fontWeight: '500',
                lineHeight: '1.6',
              }}
            >
              A beautiful UI Kit and Admin for JavaScript & React. It is Free and Open Source.
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '30px',
              }}
            >
              <button
                onClick={handleCancel}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                style={{
                  background: '#003061',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Sauvegarder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
