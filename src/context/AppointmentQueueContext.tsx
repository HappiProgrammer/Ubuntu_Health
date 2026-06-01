'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface QueueStatus {
  doctorId: string;
  doctorName: string;
  queue: string[];
  currentUserPosition: number;
  status: 'waiting' | 'in_consultation' | 'completed';
  estimatedWaitTime: number;
}

interface AppointmentQueueContextType {
  currentQueue: QueueStatus | null;
  bookAppointment: (doctorId: string, doctorName: string, initialQueueLength: number) => void;
  leaveQueue: () => void;
  updateQueuePosition: (newPosition: number, newWaitTime: number) => void;
}

const AppointmentQueueContext = createContext<AppointmentQueueContextType | undefined>(undefined);

export const AppointmentQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentQueue, setCurrentQueue] = useState<QueueStatus | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('active_appointment_queue');
    if (savedQueue) {
      setCurrentQueue(JSON.parse(savedQueue));
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (currentQueue) {
      localStorage.setItem('active_appointment_queue', JSON.stringify(currentQueue));
    } else {
      localStorage.removeItem('active_appointment_queue');
    }
  }, [currentQueue]);

  const bookAppointment = useCallback((doctorId: string, doctorName: string, initialQueueLength: number) => {
    const newQueue: QueueStatus = {
      doctorId,
      doctorName,
      queue: Array.from({ length: initialQueueLength }, (_, i) => `user_${i + 1}`),
      currentUserPosition: initialQueueLength + 1,
      status: 'waiting',
      estimatedWaitTime: (initialQueueLength + 1) * 15 // 15 mins per patient
    };
    
    // Add current user to queue
    newQueue.queue.push('current_user_id'); // Placeholder for actual user ID
    setCurrentQueue(newQueue);
  }, []);

  const leaveQueue = useCallback(() => {
    setCurrentQueue(null);
  }, []);

  const updateQueuePosition = useCallback((newPosition: number, newWaitTime: number) => {
    setCurrentQueue(prev => {
      if (!prev) return null;
      
      const newStatus = newPosition <= 0 ? 'completed' : (newPosition === 1 ? 'in_consultation' : 'waiting');
      
      return {
        ...prev,
        currentUserPosition: newPosition,
        estimatedWaitTime: newWaitTime,
        status: newStatus
      };
    });
  }, []);

  return (
    <AppointmentQueueContext.Provider value={{ currentQueue, bookAppointment, leaveQueue, updateQueuePosition }}>
      {children}
    </AppointmentQueueContext.Provider>
  );
};

export const useAppointmentQueue = () => {
  const context = useContext(AppointmentQueueContext);
  if (context === undefined) {
    throw new Error('useAppointmentQueue must be used within an AppointmentQueueProvider');
  }
  return context;
};
