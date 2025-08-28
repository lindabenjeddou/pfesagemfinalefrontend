import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const formatRole = (role) => {
  switch (role) {
    case 'ADMIN': return 'Administrateur';
    case 'TECHNICIEN_CURATIF': return 'Technicien Curatif';
    case 'TECHNICIEN_PREVENTIF': return 'Technicien Préventif';
    case 'CHEF_SECTEUR': return 'Chef de Secteur';
    case 'MAGASINIER': return 'Magasinier';
    default: return 'Rôle inconnu';
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case 'ADMIN': return '#003366';         // Bleu nuit foncé
    case 'TECHNICIEN_CURATIF': return '#004B8D';   // Bleu profond
    case 'TECHNICIEN_PREVENTIF': return '#006BB6'; // Bleu Sagemcom
    case 'CHEF_SECTEUR': return '#3399CC';  // Bleu azur
    case 'MAGASINIER': return '#66B2FF';    // Bleu clair
    default: return '#A0C4FF';              // Bleu très clair
  }
};

const arrayToIso = (arr) =>
  Array.isArray(arr)
    ? new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]).toISOString()
    : arr;

const padSeconds = (str) => (str.length === 16 ? str + ':00' : str);

const PlanningHoraireCalendar = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ id: null, userId: '', startDate: '', endDate: '', description: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:8089/PI/user/all');
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (users.length === 0) return;
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8089/PI/PI/planningHoraire/all');
        const data = await res.json();
        const mapped = data.map((p) => ({
          id: p.id,
          title: `${p.firstName} ${p.lastName} - ${formatRole(p.role)}\n${p.description || ''}`,
          start: arrayToIso(p.startDate),
          end: arrayToIso(p.endDate),
          backgroundColor: getRoleColor(p.role),
          borderColor: '#fff',
          textColor: '#fff',
          extendedProps: {
            userId: p.userId,
            description: p.description,
            role: p.role,
            firstName: p.firstName,
            lastName: p.lastName,
          },
        }));
        setEvents(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [refreshKey, users]);

  const getFilteredEvents = () =>
    events
      .filter((ev) => selectedRole === 'ALL' || ev.extendedProps.role === selectedRole)
      .filter((ev) => ev.title.toLowerCase().includes(search.toLowerCase()));

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddOrUpdatePlanning = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!form.userId || !form.startDate || !form.endDate)
      return setMessage('Tous les champs sont obligatoires.');
    if (new Date(form.startDate) >= new Date(form.endDate))
      return setMessage('La date de début doit précéder la date de fin.');

    const payload = {
      id: form.id,
      user: { id: Number(form.userId) },
      startDate: padSeconds(form.startDate),
      endDate: padSeconds(form.endDate),
      description: form.description,
    };

    const url = form.id
      ? `http://localhost:8089/PI/planningHoraire/update/${form.id}`
      : 'http://localhost:8089/PI/PI/planningHoraire/add';
    const method = form.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      setMessage('✅ Planning enregistré.');
      setShowFormModal(false);
      setForm({ id: null, userId: '', startDate: '', endDate: '', description: '' });
      setRefreshKey((k) => k + 1);
    } catch {
      setMessage('❌ Une erreur est survenue.');
    }
  };

  const handleEventClick = ({ event }) => {
    const { id, extendedProps, start, end } = event;
    setForm({
      id,
      userId: extendedProps.userId,
      startDate: new Date(start).toISOString().slice(0, 16),
      endDate: new Date(end).toISOString().slice(0, 16),
      description: extendedProps.description,
    });
    setShowFormModal(true);
  };

  const handleDelete = async () => {
    if (!form.id || !window.confirm('Confirmer la suppression ?')) return;
    try {
      await fetch(`http://localhost:8089/PI/planningHoraire/delete/${form.id}`, { method: 'DELETE' });
      setShowFormModal(false);
      setRefreshKey((k) => k + 1);
    } catch {
      setMessage('❌ Erreur lors de la suppression.');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Planning des utilisateurs', 14, 15);
    const rows = getFilteredEvents().map((ev) => [
      ev.extendedProps.firstName + ' ' + ev.extendedProps.lastName,
      formatRole(ev.extendedProps.role),
      ev.extendedProps.description || '',
      new Date(ev.start).toLocaleString('fr-FR'),
      new Date(ev.end).toLocaleString('fr-FR'),
    ]);
    doc.autoTable({ head: [['Utilisateur', 'Rôle', 'Description', 'Début', 'Fin']], body: rows, startY: 25 });
    doc.save('planning.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(getFilteredEvents().map((ev) => ({
      Utilisateur: ev.extendedProps.firstName + ' ' + ev.extendedProps.lastName,
      Rôle: formatRole(ev.extendedProps.role),
      Description: ev.extendedProps.description || '',
      Début: new Date(ev.start).toLocaleString('fr-FR'),
      Fin: new Date(ev.end).toLocaleString('fr-FR'),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Planning');
    XLSX.writeFile(wb, 'planning.xlsx');
  };

  const renderEventContent = ({ event }) => {
    const [fullName, role, ...descParts] = event.title.split(/ - |\n/);
    const description = descParts.join('\n');
    
    // Obtenir l'icône selon le rôle
    const getRoleIcon = (roleText) => {
      if (roleText?.includes('Administrateur')) return '👑';
      if (roleText?.includes('Technicien Curatif')) return '🔧';
      if (roleText?.includes('Technicien Préventif')) return '⚙️';
      if (roleText?.includes('Chef de Secteur')) return '👨‍💼';
      if (roleText?.includes('Magasinier')) return '📦';
      return '👤';
    };

    return (
      <div 
        style={{ 
          whiteSpace: 'pre-wrap', 
          padding: '8px 10px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(4px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Élément décoratif */}
        <div 
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '20px',
            height: '20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 3s ease-in-out infinite'
          }}
        />
        
        {/* Contenu principal */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px'
            }}
          >
            <span style={{ fontSize: '14px' }}>{getRoleIcon(role)}</span>
            <div 
              style={{ 
                fontWeight: 700, 
                fontSize: '13px', 
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                letterSpacing: '0.025em'
              }}
            >
              {fullName}
            </div>
          </div>
          
          <div 
            style={{ 
              fontSize: '11px', 
              fontStyle: 'italic', 
              color: 'rgba(255,255,255,0.9)',
              fontWeight: '500',
              marginBottom: description ? '6px' : '0'
            }}
          >
            {role}
          </div>
          
          {description && (
            <div 
              style={{
                fontSize: '10px',
                color: 'rgba(255,255,255,0.8)',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                paddingTop: '4px',
                fontWeight: '500',
                lineHeight: '1.3'
              }}
            >
              📝 {description}
            </div>
          )}
        </div>
      </div>
    );
  };

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
            transform: translateX(-50px);
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
        
        .calendar-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }
        
        .calendar-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
      
      <div 
        style={{
          position: 'relative',
          padding: '40px',
          maxWidth: '1400px',
          margin: '0 auto',
          fontFamily: 'Poppins, sans-serif',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'fadeInUp 0.8s ease-out',
          overflow: 'hidden'
        }}
      >
        {/* Éléments décoratifs flottants */}
        <div 
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            borderRadius: '50%',
            opacity: '0.1',
            animation: 'float 4s ease-in-out infinite'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '30px',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, #f093fb, #f5576c)',
            borderRadius: '50%',
            opacity: '0.1',
            animation: 'float 3s ease-in-out infinite reverse'
          }}
        />
        
        <div 
          style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            position: 'relative',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(255,255,255,0.2)',
            animation: 'slideInLeft 0.8s ease-out 0.2s both'
          }}
        >
          {/* En-tête moderne avec animations */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              flexWrap: 'wrap',
              gap: '16px',
              padding: '20px 0',
              borderBottom: '2px solid rgba(0, 70, 128, 0.1)',
              animation: 'fadeInUp 0.8s ease-out 0.4s both'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  animation: 'pulse 2s infinite',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                }}
              >
                📆
              </div>
              <div>
                <h2 
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: '0',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Planning
                </h2>
                <p 
                  style={{
                    fontSize: '16px',
                    color: '#64748b',
                    margin: '4px 0 0 0',
                    fontWeight: '500'
                  }}
                >
                  Gestion avancée des emplois du temps
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={exportToPDF}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                }}
              >
                📄 Export PDF
              </button>
              
              <button 
                onClick={exportToExcel}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                }}
              >
                📊 Export Excel
              </button>
              
              <button 
                onClick={() => {
                  setForm({ id: null, userId: '', startDate: '', endDate: '', description: '' });
                  setShowFormModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'pulse 2s infinite'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
                  e.currentTarget.style.animation = 'none';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
                  e.currentTarget.style.animation = 'pulse 2s infinite';
                }}
              >
                ✨ Nouveau Planning
              </button>
            </div>
          </div>

          {/* Contrôles de filtrage modernes */}
          <div 
            style={{
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              padding: '24px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              animation: 'fadeInUp 0.8s ease-out 0.6s both'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
              >
                🎯
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>Filtres :</span>
            </div>
            
            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                minWidth: '280px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
              }}
            >
              <option value="ALL">🌟 Tous les rôles</option>
              <option value="ADMIN">👑 Administrateur</option>
              <option value="TECHNICIEN_CURATIF">🔧 Technicien Curatif</option>
              <option value="TECHNICIEN_PREVENTIF">⚙️ Technicien Préventif</option>
              <option value="CHEF_SECTEUR">👨‍💼 Chef de Secteur</option>
              <option value="MAGASINIER">📦 Magasinier</option>
            </select>
            
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <input 
                type="text" 
                placeholder="Rechercher un utilisateur..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 45px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '16px',
                  color: '#9ca3af'
                }}
              >
                🔍
              </div>
            </div>
          </div>

          {/* LÉGENDE DES RÔLES MODERNE */}
          <div 
            style={{
              marginBottom: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              animation: 'fadeInUp 0.8s ease-out 0.8s both'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
              >
                🏷️
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0' }}>Légende des Rôles</h3>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {[
                { role: 'ADMIN', label: 'Administrateur', color: '#003366', icon: '👑' },
                { role: 'TECHNICIEN_CURATIF', label: 'Technicien Curatif', color: '#004B8D', icon: '🔧' },
                { role: 'TECHNICIEN_PREVENTIF', label: 'Technicien Préventif', color: '#006BB6', icon: '⚙️' },
                { role: 'CHEF_SECTEUR', label: 'Chef de Secteur', color: '#3399CC', icon: '👨‍💼' },
                { role: 'MAGASINIER', label: 'Magasinier', color: '#66B2FF', icon: '📦' },
              ].map(({ label, color, icon }, index) => (
                <div 
                  key={label} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '2px solid rgba(148, 163, 184, 0.1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    animation: `fadeInUp 0.6s ease-out ${0.9 + index * 0.1}s both`,
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                  }}
                >
                  <div style={{ fontSize: '20px' }}>{icon}</div>
                  <div 
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: '2px solid #ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }} 
                  />
                  <span 
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      letterSpacing: '0.025em'
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendrier avec design moderne */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              animation: 'fadeInUp 0.8s ease-out 1s both',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Élément décoratif pour le calendrier */}
            <div 
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                borderRadius: '50%',
                opacity: '0.05',
                animation: 'float 5s ease-in-out infinite'
              }}
            />
            
            {loading ? (
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px',
                  gap: '20px'
                }}
              >
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
                <p 
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#64748b',
                    margin: '0'
                  }}
                >
                  Chargement du planning...
                </p>
              </div>
            ) : (
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Styles CSS personnalisés pour le calendrier */}
                <style jsx>{`
                  .fc {
                    font-family: 'Poppins', sans-serif !important;
                    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
                    border-radius: 16px !important;
                    overflow: hidden !important;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.08) !important;
                  }
                  
                  .fc-header-toolbar {
                    background: #003061 !important;
                    padding: 20px 24px !important;
                    margin-bottom: 0 !important;
                    border-radius: 16px 16px 0 0 !important;
                    box-shadow: 0 4px 15px rgba(0, 48, 97, 0.3) !important;
                  }
                  
                  .fc-toolbar-title {
                    color: white !important;
                    font-size: 24px !important;
                    font-weight: 700 !important;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
                    letter-spacing: -0.5px !important;
                  }
                  
                  .fc-button {
                    background: rgba(255,255,255,0.2) !important;
                    border: 2px solid rgba(255,255,255,0.3) !important;
                    color: white !important;
                    border-radius: 12px !important;
                    padding: 8px 16px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
                  }
                  
                  .fc-button:hover {
                    background: rgba(255,255,255,0.3) !important;
                    border-color: rgba(255,255,255,0.5) !important;
                    transform: translateY(-2px) scale(1.05) !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
                  }
                  
                  .fc-button-active {
                    background: rgba(255,255,255,0.4) !important;
                    border-color: rgba(255,255,255,0.6) !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
                  }
                  
                  .fc-col-header {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
                    border-bottom: 2px solid rgba(0, 48, 97, 0.2) !important;
                  }
                  
                  .fc-col-header-cell {
                    padding: 16px 8px !important;
                    border-right: 1px solid rgba(148, 163, 184, 0.2) !important;
                  }
                  
                  .fc-col-header-cell-cushion {
                    color: #374151 !important;
                    font-weight: 700 !important;
                    font-size: 14px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                  }
                  
                  .fc-timegrid-slot {
                    border-bottom: 1px solid rgba(148, 163, 184, 0.1) !important;
                    transition: background-color 0.2s ease !important;
                  }
                  
                  .fc-timegrid-slot:hover {
                    background-color: rgba(0, 48, 97, 0.05) !important;
                  }
                  
                  .fc-timegrid-slot-label {
                    color: #64748b !important;
                    font-weight: 600 !important;
                    font-size: 12px !important;
                    padding: 8px !important;
                  }
                  
                  .fc-timegrid-col {
                    border-right: 1px solid rgba(148, 163, 184, 0.2) !important;
                  }
                  
                  .fc-event {
                    border-radius: 8px !important;
                    border: none !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    cursor: pointer !important;
                  }
                  
                  .fc-event:hover {
                    transform: scale(1.02) !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
                    z-index: 10 !important;
                  }
                  
                  .fc-event-title {
                    font-weight: 600 !important;
                    font-size: 13px !important;
                    color: white !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
                  }
                  
                  /* Amélioration de la visibilité dans la vue mois */
                  .fc-daygrid-event {
                    font-size: 12px !important;
                    font-weight: 600 !important;
                    color: white !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.7) !important;
                    padding: 2px 6px !important;
                    margin: 1px 0 !important;
                    border-radius: 4px !important;
                    min-height: 20px !important;
                    line-height: 1.2 !important;
                  }
                  
                  .fc-daygrid-event-harness {
                    margin: 1px 2px !important;
                  }
                  
                  .fc-daygrid-event .fc-event-title {
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    color: white !important;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                  }
                  
                  .fc-daygrid-event .fc-event-time {
                    font-size: 10px !important;
                    font-weight: 600 !important;
                    color: rgba(255,255,255,0.9) !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.7) !important;
                  }
                  
                  .fc-daygrid-day {
                    transition: background-color 0.2s ease !important;
                  }
                  
                  .fc-daygrid-day:hover {
                    background-color: rgba(0, 48, 97, 0.05) !important;
                  }
                  
                  .fc-today {
                    background: linear-gradient(135deg, rgba(0, 48, 97, 0.1) 0%, rgba(0, 48, 97, 0.05) 100%) !important;
                    border: 2px solid rgba(0, 48, 97, 0.4) !important;
                  }
                  
                  .fc-scrollgrid {
                    border: none !important;
                  }
                  
                  .fc-scrollgrid-section > * {
                    border-left: none !important;
                    border-right: none !important;
                  }
                  
                  .fc-theme-standard td, .fc-theme-standard th {
                    border-color: rgba(148, 163, 184, 0.2) !important;
                  }
                  
                  /* Animation pour les événements */
                  @keyframes eventPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                  }
                  
                  .fc-event-new {
                    animation: eventPulse 2s infinite !important;
                  }
                  
                  /* Responsive design */
                  @media (max-width: 768px) {
                    .fc-toolbar-title {
                      font-size: 18px !important;
                    }
                    
                    .fc-button {
                      padding: 6px 12px !important;
                      font-size: 12px !important;
                    }
                  }
                `}</style>
                
                <FullCalendar
                  plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  allDaySlot={false}
                  slotMinTime="00:00:00"
                  slotMaxTime="24:00:00"
                  locale={frLocale}
                  firstDay={1}
                  events={getFilteredEvents()}
                  height="auto"
                  eventContent={renderEventContent}
                  eventClick={handleEventClick}
                  headerToolbar={{ 
                    left: 'prev,next today', 
                    center: 'title', 
                    right: 'timeGridDay,timeGridWeek,dayGridMonth' 
                  }}
                  buttonText={{ 
                    today: '🏠 Aujourd\'hui', 
                    week: '📅 Semaine', 
                    day: '📋 Jour', 
                    month: '🗓️ Mois' 
                  }}
                  slotLabelFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  }}
                  dayHeaderFormat={{
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit'
                  }}
                  eventDidMount={(info) => {
                    // Ajouter des classes CSS personnalisées aux événements
                    info.el.style.borderRadius = '8px';
                    info.el.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                    info.el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    
                    // Effet de survol personnalisé
                    info.el.addEventListener('mouseenter', () => {
                      info.el.style.transform = 'scale(1.02)';
                      info.el.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                      info.el.style.zIndex = '10';
                    });
                    
                    info.el.addEventListener('mouseleave', () => {
                      info.el.style.transform = 'scale(1)';
                      info.el.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                      info.el.style.zIndex = '1';
                    });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal ultra-moderne avec animations avancées */}
      {showFormModal && (
        <>
          {/* Overlay avec effet de flou */}
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={() => setShowFormModal(false)}
          >
            {/* Modal Container */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '24px',
                padding: '0',
                width: '520px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.2)',
                position: 'relative',
                overflow: 'hidden',
                animation: 'modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Éléments décoratifs */}
              <div 
                style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '150px',
                  height: '150px',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  opacity: '0.1',
                  animation: 'float 6s ease-in-out infinite'
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                  borderRadius: '50%',
                  opacity: '0.1',
                  animation: 'float 4s ease-in-out infinite reverse'
                }}
              />
              
              {/* En-tête du modal */}
              <div 
                style={{
                  padding: '32px 32px 24px 32px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div 
                      style={{
                        width: '50px',
                        height: '50px',
                        background: '#003061',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        animation: 'pulse 2s infinite',
                        boxShadow: '0 8px 25px rgba(0, 48, 97, 0.3)'
                      }}
                    >
                      {form.id ? '✏️' : '➕'}
                    </div>
                    <div>
                      <h3 
                        style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#003061',
                          margin: '0',
                          letterSpacing: '-0.5px'
                        }}
                      >
                        {form.id ? 'Modifier Planning' : 'Nouveau Planning'}
                      </h3>
                      <p 
                        style={{
                          fontSize: '14px',
                          color: '#003061',
                          margin: '4px 0 0 0',
                          fontWeight: '500',
                          opacity: '0.8'
                        }}
                      >
                        {form.id ? 'Modifiez les détails du planning' : 'Créez un nouveau planning utilisateur'}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'rgba(148, 163, 184, 0.1)',
                      color: '#64748b',
                      fontSize: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
                      e.currentTarget.style.color = '#64748b';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              {/* Corps du modal */}
              <div style={{ padding: '32px', position: 'relative', zIndex: 1 }}>
                <form onSubmit={handleAddOrUpdatePlanning} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Champs du formulaire avec design moderne */}
                  {[
                    { label: 'Utilisateur', name: 'userId', type: 'select', icon: '👤', placeholder: '-- Sélectionner un utilisateur --' },
                    { label: 'Date de début', name: 'startDate', type: 'datetime-local', icon: '📅', placeholder: 'jj/mm/aaaa --:--' },
                    { label: 'Date de fin', name: 'endDate', type: 'datetime-local', icon: '🕐', placeholder: 'jj/mm/aaaa --:--' },
                    { label: 'Description', name: 'description', type: 'text', icon: '📝', placeholder: 'Description du planning...' }
                  ].map(({ label, name, type, icon, placeholder }, index) => (
                    <div 
                      key={name}
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${0.1 + index * 0.1}s both`
                      }}
                    >
                      {/* Label avec icône */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div 
                          style={{
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px'
                          }}
                        >
                          {icon}
                        </div>
                        <label 
                          style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#374151',
                            letterSpacing: '0.025em'
                          }}
                        >
                          {label}
                        </label>
                      </div>
                      
                      {/* Champ de saisie */}
                      {type === 'select' ? (
                        <select 
                          name={name} 
                          value={form[name]} 
                          onChange={handleFormChange}
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            fontSize: '14px',
                            fontWeight: '500',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            appearance: 'none',
                            backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\' /%3e%3c/svg%3e")',
                            backgroundPosition: 'right 12px center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '16px',
                            paddingRight: '40px'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <option value="" style={{ color: '#9ca3af' }}>{placeholder}</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id} style={{ color: '#374151' }}>
                              {u.firstName} {u.lastName} ({formatRole(u.role)})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type={type} 
                          name={name} 
                          value={form[name]} 
                          onChange={handleFormChange}
                          placeholder={placeholder}
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            fontSize: '14px',
                            fontWeight: '500',
                            backgroundColor: '#ffffff',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        />
                      )}
                    </div>
                  ))}
                  {/* Message de statut */}
                  {message && (
                    <div 
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        backgroundColor: message.startsWith('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `2px solid ${message.startsWith('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        textAlign: 'center',
                        animation: 'fadeInUp 0.4s ease-out'
                      }}
                    >
                      <p 
                        style={{
                          color: message.startsWith('✅') ? '#059669' : '#dc2626',
                          fontSize: '14px',
                          fontWeight: '600',
                          margin: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>
                          {message.startsWith('✅') ? '✅' : '❌'}
                        </span>
                        {message.replace(/^[✅❌]\s*/, '')}
                      </p>
                    </div>
                  )}
                  {/* Boutons d'action */}
                  <div 
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '16px',
                      paddingTop: '24px',
                      borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                      animation: 'fadeInUp 0.6s ease-out 0.5s both'
                    }}
                  >
                    {/* Bouton Supprimer (si modification) */}
                    {form?.id && (
                      <button 
                        type="button" 
                        onClick={handleDelete}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: '#ffffff',
                          padding: '12px 20px',
                          borderRadius: '12px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    )}
                    
                    {/* Bouton Annuler */}
                    <button 
                      type="button" 
                      onClick={() => setShowFormModal(false)}
                      style={{
                        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                        color: '#374151',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
                      }}
                    >
                      ❌ Annuler
                    </button>
                    
                    {/* Bouton Principal (Enregistrer/Modifier) */}
                    <button 
                      type="submit"
                      style={{
                        background: '#003061',
                        color: '#ffffff',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 15px rgba(0, 48, 97, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        animation: 'pulse 2s infinite'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 48, 97, 0.4)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #003061 0%, #002347 100%)';
                        e.currentTarget.style.animation = 'none';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 48, 97, 0.3)';
                        e.currentTarget.style.background = '#003061';
                        e.currentTarget.style.animation = 'pulse 2s infinite';
                      }}
                    >
                      {form.id ? '✏️ Modifier' : '✨ Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PlanningHoraireCalendar;
