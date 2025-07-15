import { useState, useEffect } from 'react';
import { Reminder } from '../types/reminder';
import { remindersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch reminders
  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await remindersApi.getAll({ status: 'pending' });
      setReminders(response.data);
    } catch (err: any) {
      console.error('Error fetching reminders:', err);
      setError(err.response?.data?.error || 'Error al cargar recordatorios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const addReminder = async (newReminder: Omit<Reminder, 'id' | 'createdAt' | 'status'>) => {
    try {
      const reminderData = {
        ...newReminder,
        createdBy: user?.staffId || 1 // Default to admin if no staff ID
      };
      const response = await remindersApi.create(reminderData);
      setReminders(prev => [...prev, response.data]);
    } catch (err: any) {
      console.error('Error adding reminder:', err);
      throw new Error(err.response?.data?.error || 'Error al agregar recordatorio');
    }
  };

  const completeReminder = async (id: string) => {
    try {
      await remindersApi.complete(id);
      setReminders(prev => prev.filter(reminder => reminder.id !== id));
    } catch (err: any) {
      console.error('Error completing reminder:', err);
      throw new Error(err.response?.data?.error || 'Error al completar recordatorio');
    }
  };

  const dismissReminder = async (id: string) => {
    try {
      await remindersApi.delete(id);
      setReminders(prev => prev.filter(reminder => reminder.id !== id));
    } catch (err: any) {
      console.error('Error dismissing reminder:', err);
      throw new Error(err.response?.data?.error || 'Error al descartar recordatorio');
    }
  };

  return {
    reminders,
    loading,
    error,
    addReminder,
    completeReminder,
    dismissReminder,
    refetch: fetchReminders
  };
}