import React, { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (message: string, type?: NotificationItem['type']) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addNotification = useCallback((message: string, type: NotificationItem['type'] = 'info') => {
    const id = generateId();
    const notification: NotificationItem = { id, message, type, timestamp: Date.now() };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationDisplay />
    </NotificationContext.Provider>
  );
};

const NotificationDisplay: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border-l-4 bg-white animate-slideInRight cursor-pointer
            ${notification.type === 'success' ? 'border-green-500' : 
              notification.type === 'error' ? 'border-red-500' :
              notification.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'}`}
          onClick={() => removeNotification(notification.id)}
        >
          {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
          <span className="text-gray-800">{notification.message}</span>
        </div>
      ))}
    </div>
  );
};