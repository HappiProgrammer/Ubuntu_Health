'use client'

import { useEffect, useRef } from 'react';
import { useAppointmentQueue } from '@/context/AppointmentQueueContext';

export const useQueueSimulator = () => {
  const { currentQueue, updateQueuePosition, leaveQueue } = useAppointmentQueue();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only simulate if user is in a queue and status is not completed
    if (currentQueue && currentQueue.status !== 'completed') {
      // Clear existing timer if any
      if (timerRef.current) clearInterval(timerRef.current);

      // Start simulation: Every 10-15 seconds remove the first person in queue
      timerRef.current = setInterval(() => {
        const nextPosition = currentQueue.currentUserPosition - 1;
        const nextWaitTime = Math.max(0, (nextPosition - 1) * 15); // 15 mins per patient

        if (nextPosition < 0) {
          // Consultation finished, wait a bit then complete
          updateQueuePosition(0, 0);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          updateQueuePosition(nextPosition, nextWaitTime);
        }
      }, 10000 + Math.random() * 5000); // 10-15 seconds
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQueue?.doctorId, currentQueue?.currentUserPosition, currentQueue?.status, updateQueuePosition]);

  return null;
};
