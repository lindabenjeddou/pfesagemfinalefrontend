import React, { useState, useEffect } from 'react';
import { useSecurity } from '../../contexts/SecurityContext';

const NotificationCenter = () => {
  const { user } = useSecurity();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger les notifications depuis localStorage
  useEffect(() => {
    if (user?.role === 'MAGASINIER') {
      loadNotifications();
      // Vérifier les nouvelles notifications toutes les 5 secondes
      const interval = setInterval(loadNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = () => {
    try {
      const storedNotifications = JSON.parse(localStorage.getItem('magasinierNotifications') || '[]');
      setNotifications(storedNotifications);
      const unread = storedNotifications.filter(notif => !notif.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const markAsRead = (notificationId) => {
    try {
      const updatedNotifications = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);
      localStorage.setItem('magasinierNotifications', JSON.stringify(updatedNotifications));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const markAllAsRead = () => {
    try {
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
      localStorage.setItem('magasinierNotifications', JSON.stringify(updatedNotifications));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  const clearAllNotifications = () => {
    try {
      setNotifications([]);
      localStorage.removeItem('magasinierNotifications');
      setUnreadCount(0);
      setShowNotifications(false);
    } catch (error) {
      console.error('Erreur suppression notifications:', error);
    }
  };

  // Supprimer les notifications de test au chargement
  useEffect(() => {
    if (user?.role === 'MAGASINIER') {
      // Vider les notifications de test
      localStorage.removeItem('magasinierNotifications');
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ne plus afficher le système de notification
  return null;
};

export default NotificationCenter;
