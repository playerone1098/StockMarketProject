import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousIdsRef = useRef(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/notifications');
      if (res.data.success && res.data.data) {
        const list = res.data.data;
        setNotifications(list);
        
        // Count unread
        const unread = list.filter(n => !n.isRead).length;
        setUnreadCount(unread);

        // Identify new unread notifications (not seen in previous fetches)
        const currentUnreadList = list.filter(n => !n.isRead);
        
        currentUnreadList.forEach(n => {
          if (!previousIdsRef.current.has(n._id)) {
            // Send native push notification
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(n.title, {
                  body: n.message,
                  icon: '/logo192.png'
                });
              } catch (e) {
                console.warn('Native notification failed:', e);
              }
            }
          }
        });

        // Update previous ID cache
        const allIds = new Set(list.map(n => n._id));
        previousIdsRef.current = allIds;
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    }
  }, [user]);

  // Request browser notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'unsupported';
  };

  // Fetch notifications initially and set up polling
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Request permission gracefully on login
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      const interval = setInterval(fetchNotifications, 30 * 1000); // 30s polling
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      previousIdsRef.current = new Set();
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const res = await axios.post(`/api/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await axios.post('/api/notifications/read-all');
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err.message);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      requestPermission
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
