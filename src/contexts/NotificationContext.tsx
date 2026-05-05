import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/services/api';

interface NotificationContextType {
  notificationCount: number;
  refreshNotifications: () => Promise<void>;
  decrementCount: (amount?: number) => void;
  incrementCount: (amount?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotificationCount = async () => {
    if (!user || (role !== "student" && role !== "supervisor")) {
      setNotificationCount(0);
      return;
    }

    try {
      let count = 0;
      
      if (role === "student") {
        // For students: count unread messages + unread announcements
        try {
          const [messagesRes, announcementsRes] = await Promise.all([
            api.get("/messages/unread"),
            api.get("/announcements/unread").catch(() => ({ data: { count: 0 } }))
          ]);
          
          const unreadMessages = messagesRes.data.count || 0;
          const unreadAnnouncements = announcementsRes.data.count || 0;
          
          count = unreadMessages + unreadAnnouncements;
          console.log("Student notification count:", { unreadMessages, unreadAnnouncements, total: count });
        } catch (error) {
          console.error("Error fetching student notifications:", error);
          // Fallback: just get unread messages
          try {
            const messagesRes = await api.get("/messages/unread");
            count = messagesRes.data.count || 0;
          } catch (fallbackError) {
            console.error("Fallback error:", fallbackError);
            count = 0;
          }
        }
      } else if (role === "supervisor") {
        // For supervisors: count unread messages + pending proposals + unread announcements
        try {
          const [messagesRes, proposalsRes, announcementsRes] = await Promise.all([
            api.get("/messages/unread"),
            api.get("/proposals"),
            api.get("/announcements/unread").catch(() => ({ data: { count: 0 } }))
          ]);
          
          const unreadMessages = messagesRes.data.count || 0;
          const unreadAnnouncements = announcementsRes.data.count || 0;
          const pendingProposals = proposalsRes.data.filter((p: any) => 
            p.status === "pending"
          ).length;
          
          count = unreadMessages + unreadAnnouncements + pendingProposals;
          console.log("Supervisor notification count:", { unreadMessages, unreadAnnouncements, pendingProposals, total: count });
        } catch (error) {
          console.error("Error fetching supervisor notifications:", error);
          // Fallback: just get unread messages and pending proposals
          try {
            const [messagesRes, proposalsRes] = await Promise.all([
              api.get("/messages/unread"),
              api.get("/proposals")
            ]);
            
            const unreadMessages = messagesRes.data.count || 0;
            const pendingProposals = proposalsRes.data.filter((p: any) => 
              p.status === "pending"
            ).length;
            
            count = unreadMessages + pendingProposals;
          } catch (fallbackError) {
            console.error("Fallback error:", fallbackError);
            count = 0;
          }
        }
      }
      
      setNotificationCount(count);
    } catch (error) {
      console.error("Error fetching notification count:", error);
      setNotificationCount(0);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotificationCount();
  };

  const decrementCount = (amount: number = 1) => {
    setNotificationCount(prev => Math.max(0, prev - amount));
  };

  const incrementCount = (amount: number = 1) => {
    setNotificationCount(prev => prev + amount);
  };

  // Initial fetch and periodic refresh
  useEffect(() => {
    if (user && (role === "student" || role === "supervisor")) {
      fetchNotificationCount();
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    } else {
      setNotificationCount(0);
    }
  }, [user, role]);

  return (
    <NotificationContext.Provider value={{
      notificationCount,
      refreshNotifications,
      decrementCount,
      incrementCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}