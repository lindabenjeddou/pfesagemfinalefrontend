import React, { useState, useEffect } from "react";

// Icônes SVG pour Modifier et Supprimer
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "1.25rem", width: "1.25rem" }} viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "1.25rem", width: "1.25rem" }} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

export default function ListeBonTravail() {
  const [bons, setBons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBon, setSelectedBon] = useState(null);
  const [allComponents, setAllComponents] = useState([]);
  const [selectedComponentIds, setSelectedComponentIds] = useState([]);

  const getCode = (c) => (c.id !== undefined && c.id !== null ? String(c.id) : c.trartArticle);

  const openEditModal = async (bon) => {
    setSelectedBon(bon);
    setSelectedComponentIds(bon.composants ? bon.composants.map(c => getCode(c)) : []);
    try {
      const resp = await fetch("http://localhost:8089/PI/component/all");
      if (resp.ok) {
        const data = await resp.json();
        setAllComponents(data);
      }
    } catch (e) {
      console.error("Erreur chargement composants", e);
    }
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBon(null);
  };

  const fetchBons = async () => {
    try {
      const response = await fetch("http://localhost:8089/PI/pi/bons");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des bons de travail");
      }
      const data = await response.json();
      setBons(data);
    } catch (error) {
      setError("Erreur lors du chargement des bons de travail");
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBons();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bon de travail ?")) {
      try {
        const response = await fetch(`http://localhost:8089/PI/pi/bons/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Erreur lors de la suppression");
        }
        fetchBons();
      } catch (error) {
        setError("Erreur lors de la suppression du bon de travail");
        console.error("Erreur:", error);
      }
    }
  };


  

  const totalPages = Math.ceil(bons.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = bons.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  // États de chargement et d'erreur avec design moderne
  if (loading) {
    return (
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
          padding: '3rem',
          borderRadius: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #003061',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            color: '#003061',
            fontSize: '1.125rem',
            fontWeight: '600',
            margin: 0
          }}>Chargement des bons de travail...</p>
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
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2, #fef7f7)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '1.5rem',
          padding: '2rem',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15)'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>⚠️</div>
          <h3 style={{
            color: '#dc2626',
            fontSize: '1.25rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0'
          }}>Erreur de chargement</h3>
          <p style={{
            color: '#dc2626',
            fontSize: '0.875rem',
            margin: 0
          }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Animations CSS globales */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      {/* Container principal avec design moderne */}
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '2rem',
        overflow: 'hidden'
      }}>
        {/* Éléments décoratifs flottants */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '200px',
          height: '200px',
          background: 'rgba(0, 48, 97, 0.1)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '160px',
          height: '160px',
          background: 'rgba(0, 48, 97, 0.08)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite reverse'
        }}></div>

        {/* Container de la liste */}
        <div style={{
          position: 'relative',
          maxWidth: '1400px',
          margin: '0 auto',
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
          borderRadius: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 48, 97, 0.1)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.8s ease-out',
          zIndex: 1
        }}>
          {/* Header moderne avec icône et animations */}
          <div style={{
            background: '#003061',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Effet de brillance en arrière-plan */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              animation: 'shimmer 3s infinite'
            }}></div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                animation: 'pulse 2s infinite',
                backdropFilter: 'blur(10px)'
              }}>
                📋
              </div>
              <div>
                <h1 style={{
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: '700',
                  margin: 0,
                  letterSpacing: '-0.025em',
                  animation: 'slideInLeft 0.8s ease-out 0.2s both'
                }}>
                  Liste des Bons de Travail
                </h1>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  margin: 0,
                  animation: 'slideInLeft 0.8s ease-out 0.4s both'
                }}>
                  Gestion et suivi des interventions
                </p>
              </div>
            </div>
          </div>

          {/* Table moderne avec design professionnel */}
          <div style={{
            padding: '2rem',
            background: 'transparent'
          }}>
            <div style={{
              background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
              borderRadius: '1.5rem',
              overflow: 'hidden',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 48, 97, 0.05)',
              animation: 'fadeInUp 0.8s ease-out 0.2s both'
            }}>
              <div style={{
                overflowX: 'auto',
                borderRadius: '1.5rem'
              }}>
                <table style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  borderCollapse: 'separate',
                  borderSpacing: 0
                }}>
                  <thead>
                    <tr style={{
                      background: '#003061',
                      position: 'relative'
                    }}>
                      <th style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '1.25rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        position: 'relative'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          📝 Description
                        </div>
                      </th>
                      <th style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '1.25rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          👨‍🔧 Technicien
                        </div>
                      </th>
                      <th style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '1.25rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          🔧 Composants
                        </div>
                      </th>
                      <th style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '1.25rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          📅 Création
                        </div>
                      </th>
                      <th style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '1.25rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          🚀 Début
                        </div>
                      </th>
                      <th style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '1.25rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          🏁 Fin
                        </div>
                      </th>
                      <th style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '1.25rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          📊 Statut
                        </div>
                      </th>
                      <th style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '1.25rem 1rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}>
                          ⚙️ Actions
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((bon, index) => (
                      <tr 
                        key={bon.id} 
                        onClick={() => console.log("Bon sélectionné :", bon)} 
                        style={{
                          cursor: 'pointer',
                          background: index % 2 === 0 
                            ? 'linear-gradient(135deg, #ffffff, #f8fafc)' 
                            : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          animation: `fadeInUp 0.6s ease-out ${0.1 * index}s both`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #e0f2fe, #f0f9ff)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 48, 97, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = index % 2 === 0 
                            ? 'linear-gradient(135deg, #ffffff, #f8fafc)' 
                            : 'linear-gradient(135deg, #f8fafc, #f1f5f9)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <td style={{
                          border: 'none',
                          padding: '1.25rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: '500',
                          borderBottom: '1px solid rgba(0, 48, 97, 0.1)'
                        }}>
                          <div style={{
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {bon.description}
                          </div>
                        </td>
                        <td style={{
                          border: 'none',
                          padding: '1.25rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: '500',
                          borderBottom: '1px solid rgba(0, 48, 97, 0.1)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <div style={{
                              width: '2rem',
                              height: '2rem',
                              borderRadius: '50%',
                              background: bon.technicien 
                                ? 'linear-gradient(135deg, #10b981, #059669)' 
                                : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {bon.technicien 
                                ? (bon.technicien.firstname?.[0] || '?') + (bon.technicien.lastname?.[0] || '') 
                                : '?'}
                            </div>
                            <span>
                              {bon.technicien 
                                ? `${bon.technicien.firstname} ${bon.technicien.lastname}` 
                                : "Non assigné"}
                            </span>
                          </div>
                        </td>
                        <td style={{
                          border: 'none',
                          padding: '1.25rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: '500',
                          borderBottom: '1px solid rgba(0, 48, 97, 0.1)'
                        }}>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.25rem',
                            maxWidth: '200px'
                          }}>
                            {bon.composants && bon.composants.length > 0 ? (
                              bon.composants.slice(0, 2).map((comp, idx) => (
                                <span 
                                  key={idx}
                                  style={{
                                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                                    color: '#1e40af',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    border: '1px solid rgba(30, 64, 175, 0.2)'
                                  }}
                                >
                                  {comp.name || comp.trartArticle || `Comp ${comp.id}`}
                                </span>
                              ))
                            ) : (
                              <span style={{
                                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                                color: '#92400e',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                border: '1px solid rgba(146, 64, 14, 0.2)'
                              }}>
                                Aucun composant
                              </span>
                            )}
                            {bon.composants && bon.composants.length > 2 && (
                              <span style={{
                                background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
                                color: '#374151',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                +{bon.composants.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{
                          border: 'none',
                          padding: '1.25rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: '500',
                          borderBottom: '1px solid rgba(0, 48, 97, 0.1)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <div style={{
                              width: '0.5rem',
                              height: '0.5rem',
                              borderRadius: '50%',
                              background: '#10b981'
                            }}></div>
                            {bon.dateCreation ? new Date(bon.dateCreation).toLocaleDateString('fr-FR') : "-"}
                          </div>
                        </td>
                        <td style={{
                          border: 'none',
                          padding: '1.25rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: '500',
                          borderBottom: '1px solid rgba(0, 48, 97, 0.1)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <div style={{
                              width: '0.5rem',
                              height: '0.5rem',
                              borderRadius: '50%',
                              background: bon.dateDebut ? '#3b82f6' : '#9ca3af'
                            }}></div>
                            {bon.dateDebut ? new Date(bon.dateDebut).toLocaleDateString('fr-FR') : "-"}
                          </div>
                        </td>
                        <td style={{
                          border: 'none',
                          padding: '1.25rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: '500',
                          borderBottom: '1px solid rgba(0, 48, 97, 0.1)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <div style={{
                              width: '0.5rem',
                              height: '0.5rem',
                              borderRadius: '50%',
                              background: bon.dateFin ? '#ef4444' : '#9ca3af'
                            }}></div>
                            {bon.dateFin ? new Date(bon.dateFin).toLocaleDateString('fr-FR') : "-"}
                          </div>
                        </td>
                        <td style={{
                          border: 'none',
                          padding: '1.25rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: '500',
                          borderBottom: '1px solid rgba(0, 48, 97, 0.1)'
                        }}>
                          <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: bon.statut === "EN_ATTENTE" 
                              ? 'linear-gradient(135deg, #fef3c7, #fde68a)' 
                              : bon.statut === "EN_COURS" 
                              ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)' 
                              : bon.statut === "TERMINE" 
                              ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' 
                              : 'linear-gradient(135deg, #fecaca, #fca5a5)',
                            color: bon.statut === "EN_ATTENTE" 
                              ? '#92400e' 
                              : bon.statut === "EN_COURS" 
                              ? '#1e40af' 
                              : bon.statut === "TERMINE" 
                              ? '#065f46' 
                              : '#991b1b',
                            border: `1px solid ${bon.statut === "EN_ATTENTE" 
                              ? 'rgba(146, 64, 14, 0.2)' 
                              : bon.statut === "EN_COURS" 
                              ? 'rgba(30, 64, 175, 0.2)' 
                              : bon.statut === "TERMINE" 
                              ? 'rgba(6, 95, 70, 0.2)' 
                              : 'rgba(153, 27, 27, 0.2)'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <div style={{
                              width: '0.5rem',
                              height: '0.5rem',
                              borderRadius: '50%',
                              background: bon.statut === "EN_ATTENTE" 
                                ? '#f59e0b' 
                                : bon.statut === "EN_COURS" 
                                ? '#3b82f6' 
                                : bon.statut === "TERMINE" 
                                ? '#10b981' 
                                : '#ef4444'
                            }}></div>
                            {bon.statut.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{
                          border: 'none',
                          padding: '1.25rem 1rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid rgba(0, 48, 97, 0.1)'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEditModal(bon); }} 
                              style={{
                                background: '#003061',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0, 48, 97, 0.3)'
                              }}
                              title="Modifier"
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px) scale(1.1)';
                                e.target.style.boxShadow = '0 8px 20px rgba(0, 48, 97, 0.4)';
                                e.target.style.backgroundColor = '#002244';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0, 48, 97, 0.3)';
                                e.target.style.backgroundColor = '#003061';
                              }}
                            >
                              <EditIcon />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(bon.id); }} 
                              style={{
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                              }}
                              title="Supprimer"
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px) scale(1.1)';
                                e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                                e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                                e.target.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                              }}
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section de pagination moderne */}
            <div style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderRadius: '0 0 2rem 2rem',
              border: '1px solid rgba(0, 48, 97, 0.1)',
              borderTop: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Éléments décoratifs flottants */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '20px',
                width: '40px',
                height: '40px',
                background: 'rgba(0, 48, 97, 0.1)',
                borderRadius: '50%',
                animation: 'float 4s ease-in-out infinite'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-15px',
                left: '30px',
                width: '30px',
                height: '30px',
                background: 'rgba(0, 48, 97, 0.08)',
                borderRadius: '50%',
                animation: 'float 3s ease-in-out infinite reverse'
              }}></div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                position: 'relative',
                zIndex: 1
              }}>
                {/* Sélecteur d'éléments par page */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                  padding: '0.75rem 1rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 12px rgba(0, 48, 97, 0.1)',
                  border: '1px solid rgba(0, 48, 97, 0.1)'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#003061',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    📄 Items par page:
                  </span>
                  <select 
                    value={itemsPerPage} 
                    onChange={handleItemsPerPageChange} 
                    style={{
                      fontSize: '0.875rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.75rem',
                      border: '2px solid #003061',
                      background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                      color: '#003061',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 48, 97, 0.1)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Informations de pagination */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '1rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
                  }}>
                    📊 {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, bons.length)} sur {bons.length}
                  </div>

                  {/* Indicateur de page actuelle */}
                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '1rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                    animation: 'pulse 2s infinite'
                  }}>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#d97706',
                      fontFamily: 'monospace'
                    }}>{currentPage}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#d97706',
                      fontWeight: '600'
                    }}>/ {totalPages}</span>
                  </div>
                </div>

                {/* Boutons de navigation */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <button
                    style={{
                      background: currentPage === 1 
                        ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                        : '#003061',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: currentPage === 1 
                        ? '0 2px 4px rgba(156, 163, 175, 0.3)' 
                        : '0 4px 12px rgba(0, 48, 97, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      gap: '0.5rem',
                      minWidth: '100px'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.transform = 'translateY(-2px) scale(1.05)';
                        e.target.style.boxShadow = '0 8px 20px rgba(0, 48, 97, 0.4)';
                        e.target.style.backgroundColor = '#002244';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 48, 97, 0.3)';
                        e.target.style.backgroundColor = '#003061';
                      }
                    }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ⬅️ Précédent
                  </button>

                  <button
                    style={{
                      background: currentPage === totalPages 
                        ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                        : '#003061',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: currentPage === totalPages 
                        ? '0 2px 4px rgba(156, 163, 175, 0.3)' 
                        : '0 4px 12px rgba(0, 48, 97, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      gap: '0.5rem',
                      minWidth: '100px'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.transform = 'translateY(-2px) scale(1.05)';
                        e.target.style.boxShadow = '0 8px 20px rgba(0, 48, 97, 0.4)';
                        e.target.style.backgroundColor = '#002244';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 48, 97, 0.3)';
                        e.target.style.backgroundColor = '#003061';
                      }
                    }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Suivant ➡️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/* Modal for editing a work order */}
    {isEditModalOpen && selectedBon && (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}>
        <div style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 400, position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
          <button onClick={closeEditModal} style={{ position: "absolute", top: 8, right: 12, background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>×</button>
          <h2 style={{ marginBottom: 16, color: "#003366" }}>Modifier le Bon de Travail</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedBon = {};
            formData.forEach((value, key) => { updatedBon[key] = value; });
            updatedBon.id = selectedBon.id;
            updatedBon.composantsIds = selectedComponentIds;
            try {
              const response = await fetch(`http://localhost:8089/PI/pi/bons/update/${selectedBon.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedBon)
              });
              if (!response.ok) throw new Error("Erreur lors de la modification");
              closeEditModal();
              fetchBons();
            } catch (err) {
              alert("Erreur lors de la modification du bon de travail");
            }
          }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(selectedBon.demandeur || selectedBon.technicien) && (
              <label>Nom Demandeur
                <input
                  name="demandeurNom"
                  value={(selectedBon.demandeur ? `${selectedBon.demandeur.firstname}${selectedBon.demandeur.lastname ? ' ' + selectedBon.demandeur.lastname : ''}` : `${selectedBon.technicien.firstname}${selectedBon.technicien.lastname ? ' ' + selectedBon.technicien.lastname : ''}`)}
                  readOnly
                  style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc", background: "#f3f3f3" }}
                />
              </label>
            )}
            {(selectedBon.demandeur || selectedBon.technicien) && (
              <label>ID Demandeur
                <input
                  name="demandeurId"
                  value={selectedBon.demandeur ? selectedBon.demandeur.id : selectedBon.technicien.id}
                  readOnly
                  style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc", background: "#f3f3f3" }}
                />
              </label>
            )}
            <label>Description
              <input name="description" defaultValue={selectedBon.description} style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }} required />
            </label>
            <label>Date Création
              <input name="dateCreation" type="date" defaultValue={selectedBon.dateCreation ? (typeof selectedBon.dateCreation === 'string' && selectedBon.dateCreation.split ? selectedBon.dateCreation.split('T')[0] : new Date(selectedBon.dateCreation).toISOString().split('T')[0]) : ""} style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }} required />
            </label>
            <label>Date Début
              <input name="dateDebut" type="date" defaultValue={selectedBon.dateDebut ? (typeof selectedBon.dateDebut === 'string' && selectedBon.dateDebut.split ? selectedBon.dateDebut.split('T')[0] : new Date(selectedBon.dateDebut).toISOString().split('T')[0]) : ""} style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }} />
            </label>
            <label>Date Fin
              <input name="dateFin" type="date" defaultValue={selectedBon.dateFin ? (typeof selectedBon.dateFin === 'string' && selectedBon.dateFin.split ? selectedBon.dateFin.split('T')[0] : new Date(selectedBon.dateFin).toISOString().split('T')[0]) : ""} style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }} />
            </label>
            <label>Composants
              <select
                multiple
                value={selectedComponentIds}
                onChange={(e) => {
                  const opts = Array.from(e.target.options).filter(o => o.selected).map(o => Number(o.value));
                  setSelectedComponentIds(opts);
                }}
                style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc", height: 120, overflowY: "auto" }}
              >
                {allComponents.map(c => (
                  <option key={c.id} value={c.id}>{c.name || c.trartArticle || `Composant ${c.id}`}</option>
                ))}
              </select>
              {selectedComponentIds.length > 0 && (
                <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedComponentIds.map(id => {
                    const comp = allComponents.find(c => c.id === id);
                    const label = comp ? (comp.name || comp.trartArticle || `Composant ${id}`) : `Composant ${id}`;
                    return (
                      <span key={id} style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>
                        {label}
                      </span>
                    );
                  })}
                </div>
              )}
            </label>
            <label>Statut
              <select name="statut" defaultValue={selectedBon.statut} style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }} required>
                <option value="EN_ATTENTE">EN_ATTENTE</option>
                <option value="EN_COURS">EN_COURS</option>
                <option value="TERMINE">TERMINE</option>
              </select>
            </label>
            <button type="submit" style={{ marginTop: 16, background: "#3B82F6", color: "#fff", border: "none", borderRadius: 4, padding: "10px 0", fontWeight: 600, cursor: "pointer" }}>Enregistrer</button>
          </form>
        </div>
      </div>
    )}
    </>
  );
}