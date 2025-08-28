import React, { useState, useMemo } from 'react';

const AdvancedPagination = ({ 
  data, 
  itemsPerPageOptions = [5, 10, 20, 50], 
  defaultItemsPerPage = 10,
  searchFields = [],
  sortFields = [],
  filterFields = [],
  renderItem,
  className = '',
  showSearch = true,
  showFilters = true,
  showSort = true
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});

  // Filtrage et recherche
  const filteredData = useMemo(() => {
    let result = [...data];

    // Recherche
    if (searchTerm && searchFields.length > 0) {
      result = result.filter(item =>
        searchFields.some(field => {
          const value = getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Filtres
    Object.entries(filters).forEach(([field, value]) => {
      if (value && value !== '') {
        result = result.filter(item => {
          const itemValue = getNestedValue(item, field);
          return itemValue && itemValue.toString().toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    // Tri
    if (sortField) {
      result.sort((a, b) => {
        const aValue = getNestedValue(a, sortField);
        const bValue = getNestedValue(b, sortField);
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, searchFields, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Fonction utilitaire pour accéder aux propriétés imbriquées
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Gestion du changement de page
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Gestion du changement d'éléments par page
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Gestion des filtres
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  // Gestion du tri
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Génération des numéros de page
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className={className} style={{ width: '100%' }}>
      {/* Barre de contrôles */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        {/* Recherche */}
        {showSearch && searchFields.length > 0 && (
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              🔍 Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Rechercher dans ${searchFields.join(', ')}...`}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#003061';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,48,97,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}

        {/* Tri */}
        {showSort && sortFields.length > 0 && (
          <div style={{ minWidth: '150px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              📊 Trier par
            </label>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                background: 'white'
              }}
            >
              <option value="">-- Choisir --</option>
              {sortFields.map(field => (
                <option key={field.key} value={field.key}>
                  {field.label} {sortField === field.key ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Éléments par page */}
        <div style={{ minWidth: '120px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            📄 Par page
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              background: 'white'
            }}
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && filterFields.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{
            width: '100%',
            margin: '0 0 0.5rem 0',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            🎯 Filtres Avancés
          </h4>
          {filterFields.map(field => (
            <div key={field.key} style={{ minWidth: '150px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '0.25rem'
              }}>
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  value={filters[field.key] || ''}
                  onChange={(e) => handleFilterChange(field.key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    background: 'white'
                  }}
                >
                  <option value="">Tous</option>
                  {field.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={filters[field.key] || ''}
                  onChange={(e) => handleFilterChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Informations sur les résultats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Affichage de {startIndex + 1} à {Math.min(endIndex, filteredData.length)} sur {filteredData.length} résultats
          {data.length !== filteredData.length && (
            <span style={{ color: '#f59e0b', fontWeight: '600' }}>
              {' '}(filtré sur {data.length} total)
            </span>
          )}
        </span>
        
        {(searchTerm || Object.values(filters).some(v => v)) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({});
              setSortField('');
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f3f4f6';
            }}
          >
            🗑️ Effacer les filtres
          </button>
        )}
      </div>

      {/* Contenu paginé */}
      <div style={{ marginBottom: '2rem' }}>
        {currentData.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.2rem', color: '#374151', marginBottom: '0.5rem' }}>
              Aucun résultat trouvé
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Essayez de modifier vos critères de recherche ou filtres
            </p>
          </div>
        ) : (
          <div>
            {currentData.map((item, index) => renderItem(item, startIndex + index))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          {/* Bouton Précédent */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage === 1 ? '#f3f4f6' : '#003061',
              color: currentPage === 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ← Précédent
          </button>

          {/* Numéros de page */}
          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
              disabled={pageNum === '...'}
              style={{
                padding: '0.5rem 0.75rem',
                background: pageNum === currentPage ? '#003061' : pageNum === '...' ? 'transparent' : 'white',
                color: pageNum === currentPage ? 'white' : pageNum === '...' ? '#9ca3af' : '#374151',
                border: pageNum === '...' ? 'none' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: pageNum === '...' ? 'default' : 'pointer',
                minWidth: '40px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (pageNum !== '...' && pageNum !== currentPage) {
                  e.target.style.background = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (pageNum !== '...' && pageNum !== currentPage) {
                  e.target.style.background = 'white';
                }
              }}
            >
              {pageNum}
            </button>
          ))}

          {/* Bouton Suivant */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage === totalPages ? '#f3f4f6' : '#003061',
              color: currentPage === totalPages ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedPagination;
