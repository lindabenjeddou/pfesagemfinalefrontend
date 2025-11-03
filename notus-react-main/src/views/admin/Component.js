import React, { useState, useEffect } from "react";

// Constantes
const API_URL = "http://localhost:8089/PI/PI/component/all";
const API_ADD_OR_UPDATE = "http://localhost:8089/PI/PI/component/addOrIncrement";
const API_DELETE = "http://localhost:8089/PI/PI/component/delete";
const API_SEARCH = "http://localhost:8089/PI/PI/component/search";
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

// Icônes SVG pour Précédent et Suivant
const PreviousIcon = () => (
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
);

const NextIcon = () => (
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
);

// Icônes SVG pour Modifier et Supprimer
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style={{ height: "1.25rem", width: "1.25rem" }}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style={{ height: "1.25rem", width: "1.25rem" }}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

// Composant Modal
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          width: "500px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

// Composant pour afficher la table
const Table = ({
  data,
  currentPage,
  itemsPerPage,
  indexOfFirstItem,
  indexOfLastItem,
  onEdit,
  onDelete,
}) => {
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #ffffff, #f8fafc)",
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        border: "1px solid rgba(0, 48, 97, 0.1)",
      }}
    >
      <table
        style={{
          width: "100%",
          backgroundColor: "transparent",
          borderCollapse: "separate",
          borderSpacing: "0",
        }}
      >
        <thead>
          <tr style={{ background: "#003061", position: "relative" }}>
            {[
              "📦 Article",
              "🏷️ ATL",
              "🏢 BUR",
              "📝 Désignation",
              "🔢 Quantité",
              "💰 Prix",
              "⚡ Actions",
            ].map((head, i) => (
              <th
                key={i}
                style={{
                  background: "transparent",
                  color: "white",
                  border: "none",
                  padding: "1rem 1.25rem",
                  textAlign: i === 6 ? "center" : "left",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    justifyContent: i === 6 ? "center" : "flex-start",
                  }}
                >
                  {head}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr
              key={index}
              style={{
                background:
                  index % 2 === 0
                    ? "linear-gradient(145deg, #ffffff, #f8fafc)"
                    : "linear-gradient(145deg, #f8fafc, #ffffff)",
                position: "relative",
              }}
            >
              <td
                style={{
                  border: "none",
                  borderBottom: "1px solid rgba(0, 48, 97, 0.1)",
                  padding: "1rem 1.25rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "0.5rem",
                      height: "0.5rem",
                      background: "#003061",
                      borderRadius: "50%",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "monospace",
                      color: "#003061",
                      fontWeight: 700,
                    }}
                  >
                    {item.trartArticle}
                  </span>
                </div>
              </td>

              <td
                style={{
                  border: "none",
                  borderBottom: "1px solid rgba(0, 48, 97, 0.1)",
                  padding: "1rem 1.25rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(135deg, #e0f2fe, #f0f9ff)",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#0369a1",
                    border: "1px solid rgba(3, 105, 161, 0.2)",
                  }}
                >
                  {item.atl}
                </span>
              </td>

              <td
                style={{
                  border: "none",
                  borderBottom: "1px solid rgba(0, 48, 97, 0.1)",
                  padding: "1rem 1.25rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(135deg, #fef3c7, #fef9e7)",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#d97706",
                    border: "1px solid rgba(217, 119, 6, 0.2)",
                  }}
                >
                  {item.bur}
                </span>
              </td>

              <td
                style={{
                  border: "none",
                  borderBottom: "1px solid rgba(0, 48, 97, 0.1)",
                  padding: "1rem 1.25rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  maxWidth: "200px",
                }}
              >
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: "1.5",
                  }}
                >
                  {item.trartDesignation}
                </div>
              </td>

              <td
                style={{
                  border: "none",
                  borderBottom: "1px solid rgba(0, 48, 97, 0.1)",
                  padding: "1rem 1.25rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background:
                      item.trartQuantite < 10
                        ? "linear-gradient(135deg, #fef2f2, #fef7f7)"
                        : "linear-gradient(135deg, #f0fdf4, #f7fef9)",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.5rem",
                    border:
                      item.trartQuantite < 10
                        ? "1px solid rgba(239, 68, 68, 0.2)"
                        : "1px solid rgba(34, 197, 94, 0.2)",
                    color: item.trartQuantite < 10 ? "#dc2626" : "#16a34a",
                  }}
                >
                  <span style={{ fontSize: "0.75rem" }}>
                    {item.trartQuantite < 10 ? "⚠️" : "✅"}
                  </span>
                  {item.trartQuantite}
                </div>
              </td>

              <td
                style={{
                  border: "none",
                  borderBottom: "1px solid rgba(0, 48, 97, 0.1)",
                  padding: "1rem 1.25rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#059669",
                    border: "1px solid rgba(5, 150, 105, 0.2)",
                    fontFamily: "monospace",
                  }}
                >
                  {item.prix}€
                </span>
              </td>

              <td
                style={{
                  border: "none",
                  borderBottom: "1px solid rgba(0, 48, 97, 0.1)",
                  padding: "1rem 1.25rem",
                  textAlign: "center",
                  fontSize: "0.875rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                  <button
                    onClick={() => onEdit(item)}
                    style={{
                      background: "#003061",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      padding: "0.5rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 6px rgba(0, 48, 97, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      padding: "0.5rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 6px rgba(239, 68, 68, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
  );
};

// Composant pour la carte de recherche et d'ajout
const SearchAndAddCard = ({ onAddComponent, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm, onSearch]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minWidth: "0",
        wordWrap: "break-word",
        width: "100%",
        marginBottom: "1.5rem",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        borderRadius: "0.375rem",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          borderRadius: "0.375rem 0.375rem 0 0",
          marginBottom: "0",
          padding: "1.5rem",
          border: "0",
          backgroundColor: "#f7fafc",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem",
                padding: "0.5rem 0.75rem",
                marginRight: "0.5rem",
                minWidth: "200px",
              }}
            />
          </div>
          <button
            type="button"
            onClick={onAddComponent}
            style={{
              backgroundColor: "#003366",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            Ajouter un composant
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal
const Maps = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState(null);

  const fetchData = () => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur de récupération des données");
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm) {
      fetchData();
      return;
    }

    try {
      const response = await fetch(`${API_SEARCH}?trartArticle=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
      setError("Une erreur s'est produite lors de la recherche. Veuillez réessayer.");
    }
  };

  const handleSave = async (componentData) => {
    try {
      // Optionnel: convertir les champs numériques (si attendu par le backend)
      if (componentData.trartQuantite !== undefined)
        componentData.trartQuantite = Number(componentData.trartQuantite);
      if (componentData.prix !== undefined)
        componentData.prix = Number(componentData.prix);

      const response = await fetch(API_ADD_OR_UPDATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(componentData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout ou de la mise à jour du composant");
      }

      await response.json();
      fetchData();
      closeModal();
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  const handleDelete = async () => {
    if (componentToDelete) {
      try {
        const response = await fetch(
          `${API_DELETE}/${encodeURIComponent(componentToDelete.trartArticle)}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du composant");
        }

        fetchData();
        closeDeleteModal();
      } catch (error) {
        console.error("Erreur :", error);
      }
    }
  };

  const openAddModal = () => {
    setSelectedComponent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (component) => {
    setSelectedComponent(component);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedComponent(null);
  };

  const openDeleteModal = (component) => {
    setComponentToDelete(component);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setComponentToDelete(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

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
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div
        style={{
          position: "relative",
          padding: "40px",
          maxWidth: "1400px",
          margin: "0 auto",
          fontFamily: "Poppins, sans-serif",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            position: "relative",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {/* En-tête */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
              flexWrap: "wrap",
              gap: "16px",
              padding: "20px 0",
              borderBottom: "2px solid rgba(0, 48, 97, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "#003061",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  boxShadow: "0 8px 25px rgba(0, 48, 97, 0.3)",
                  color: "#fff",
                }}
              >
                🔧
              </div>
              <div>
                <h2
                  style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "#003061",
                    margin: 0,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Gestion des Composants
                </h2>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    margin: "4px 0 0 0",
                    fontWeight: 500,
                  }}
                >
                  Gestion intelligente des pièces et composants
                </p>
              </div>
            </div>
          </div>

          <SearchAndAddCard onAddComponent={openAddModal} onSearch={handleSearch} />

          <div style={{ display: "block", width: "100%", overflowX: "auto" }}>
            <Table
              data={data}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />

            {/* Section de pagination */}
            <div
              style={{
                background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                borderRadius: "1rem",
                padding: "1.5rem 2rem",
                marginTop: "1.5rem",
                boxShadow:
                  "0 10px 25px rgba(0, 48, 97, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 48, 97, 0.1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Items per page */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(3, 105, 161, 0.2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#0369a1",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      📄 Items par page:
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        border: "2px solid #0369a1",
                        background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                        color: "#0369a1",
                        cursor: "pointer",
                        outline: "none",
                        boxShadow: "0 2px 4px rgba(3, 105, 161, 0.1)",
                      }}
                    >
                      {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                        <option
                          key={option}
                          value={option}
                          style={{ background: "#ffffff", color: "#0369a1", fontWeight: 600 }}
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Infos pagination */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#16a34a",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      📊 Affichage:
                    </span>
                    <div
                      style={{
                        background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                        padding: "0.375rem 0.75rem",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "#16a34a",
                        fontFamily: "monospace",
                        boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, data.length)} sur {data.length}
                    </div>
                  </div>
                </div>

                {/* Boutons de navigation */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    style={{
                      background: currentPage === 1 ? "linear-gradient(135deg, #9ca3af, #6b7280)" : "#003061",
                      color: "white",
                      border: "none",
                      borderRadius: "0.75rem",
                      padding: "0.75rem 1rem",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      boxShadow:
                        currentPage === 1
                          ? "0 2px 4px rgba(156, 163, 175, 0.3)"
                          : "0 4px 12px rgba(0, 48, 97, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <PreviousIcon />
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                      Précédent
                    </span>
                  </button>

                  {/* Indicateur de page */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #fef3c7, #fef9e7)",
                      border: "2px solid #f59e0b",
                      borderRadius: "0.75rem",
                      padding: "0.75rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: 600, textTransform: "uppercase" }}>
                      Page
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#d97706",
                        fontFamily: "monospace",
                      }}
                    >
                      {currentPage}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: 600 }}>
                      / {totalPages}
                    </span>
                  </div>

                  <button
                    style={{
                      background:
                        currentPage === totalPages
                          ? "linear-gradient(135deg, #9ca3af, #6b7280)"
                          : "#003061",
                      color: "white",
                      border: "none",
                      borderRadius: "0.75rem",
                      padding: "0.75rem 1rem",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      boxShadow:
                        currentPage === totalPages
                          ? "0 2px 4px rgba(156, 163, 175, 0.3)"
                          : "0 4px 12px rgba(0, 48, 97, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <span style={{ marginRight: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                      Suivant
                    </span>
                    <NextIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem", position: "relative", overflow: "hidden" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "4rem",
              height: "4rem",
              background: "linear-gradient(135deg, #003061, #0066cc)",
              borderRadius: "50%",
              marginBottom: "1rem",
              boxShadow: "0 8px 32px rgba(0, 48, 97, 0.3)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1.5rem",
            }}
          >
            ⚙️
          </div>
          <h2
            style={{
              color: "#003061",
              fontWeight: 700,
              fontSize: "1.5rem",
              margin: "0 0 0.5rem 0",
            }}
          >
            {selectedComponent ? "✏️ Modifier le composant" : "➕ Ajouter un composant"}
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
            {selectedComponent
              ? "Modifiez les informations du composant"
              : "Créez un nouveau composant pour votre inventaire"}
          </p>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const componentData = Object.fromEntries(formData.entries());
            handleSave(componentData);
          }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          {/* Colonne gauche */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Champ Article */}
            <div style={{ position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                📦 Article
              </label>
              <input
                type="text"
                name="trartArticle"
                defaultValue={selectedComponent?.trartArticle || ""}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.875rem",
                  background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                  outline: "none",
                }}
              />
            </div>

            {/* Champ ATL */}
            <div style={{ position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                🏷️ ATL
              </label>
              <input
                type="text"
                name="atl"
                defaultValue={selectedComponent?.atl || ""}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.875rem",
                  background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                  outline: "none",
                }}
              />
            </div>

            {/* Champ BUR */}
            <div style={{ position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                🏢 BUR
              </label>
              <input
                type="text"
                name="bur"
                defaultValue={selectedComponent?.bur || ""}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.875rem",
                  background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Colonne droite */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Champ Designation */}
            <div style={{ position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                📝 Désignation
              </label>
              <input
                type="text"
                name="trartDesignation"
                defaultValue={selectedComponent?.trartDesignation || ""}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.875rem",
                  background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                  outline: "none",
                }}
              />
            </div>

            {/* Champ Quantité */}
            <div style={{ position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                🔢 Quantité
              </label>
              <input
                type="number"
                name="trartQuantite"
                defaultValue={selectedComponent?.trartQuantite || ""}
                required
                min="0"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.875rem",
                  background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                  outline: "none",
                }}
              />
            </div>

            {/* Champ Prix */}
            <div style={{ position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                💰 Prix
              </label>
              <input
                type="number"
                name="prix"
                defaultValue={selectedComponent?.prix || ""}
                required
                min="0"
                step="0.01"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.875rem",
                  background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Bouton Enregistrer */}
          <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "1rem", position: "relative" }}>
            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #003061, #0066cc)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.875rem 2.5rem",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                boxShadow: "0 4px 15px rgba(0, 48, 97, 0.3)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                💾 Enregistrer
              </span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#003366", fontWeight: "bold" }}>
          Supprimer un composant
        </h2>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Êtes-vous sûr de vouloir supprimer ce composant ?
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <button
            onClick={closeDeleteModal}
            style={{
              backgroundColor: "#ccc",
              color: "#333",
              border: "none",
              borderRadius: "4px",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            style={{
              backgroundColor: "#ff4d4d",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Supprimer
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Maps;
