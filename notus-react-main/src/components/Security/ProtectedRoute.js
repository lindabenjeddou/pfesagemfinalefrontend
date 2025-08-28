import React, { useContext, useEffect } from 'react';
import { useSecurity } from '../../contexts/SecurityContext';
import { useNotifications } from '../Notifications/NotificationSystem';

const ProtectedRoute = ({ children, requiredPermission, fallbackMessage }) => {
  const { hasPermission, user, isAuthenticated } = useSecurity();
  const { addNotification } = useNotifications();

  // Calculer les conditions d'accès
  const isPermissionDenied = requiredPermission && !hasPermission(requiredPermission);

  // Hook pour notification d'accès refusé (appelé inconditionnellement)
  useEffect(() => {
    if (isPermissionDenied) {
      addNotification('warning', '🚫 Accès refusé', {
        subtitle: fallbackMessage || 'Vous n\'avez pas les permissions nécessaires',
        duration: 5000
      });
    }
  }, [isPermissionDenied, fallbackMessage, addNotification]);

  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated || !user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
          Accès Non Autorisé
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Vous devez être connecté pour accéder à cette page.
        </p>
        <button
          onClick={() => window.location.href = '/auth/login'}
          style={{
            padding: '0.75rem 2rem',
            background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Se Connecter
        </button>
      </div>
    );
  }

  // Vérifier les permissions si requises
  if (isPermissionDenied) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⛔</div>
        <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
          Permissions Insuffisantes
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          {fallbackMessage || 'Vous n\'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.'}
        </p>
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          maxWidth: '400px'
        }}>
          <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
            👤 Votre rôle actuel : {user.role}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#b45309' }}>
            Contactez votre administrateur pour obtenir les accès nécessaires.
          </div>
        </div>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '0.75rem 2rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Retour
        </button>
      </div>
    );
  }

  // Afficher le contenu si tout est OK
  return children;
};

export default ProtectedRoute;
