import { useState, useEffect } from 'react';
import { CalendarEvent, CalendarFilters } from '../types/calendar';
import { calendarApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CalendarFilters>({
    view: 'month',
    date: new Date().toISOString().split('T')[0],
    type: '',
    attendee: ''
  });
  const { user } = useAuth();

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await calendarApi.getAll(filters);
      setEvents(response.data);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
      setError(err.response?.data?.error || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const addEvent = async (newEvent: Omit<CalendarEvent, 'id'>) => {
    try {
      const eventData = {
        ...newEvent,
        createdBy: user?.staffId || 1 // Default to admin if no staff ID
      };
      const response = await calendarApi.create(eventData);
      setEvents(prev => [...prev, response.data]);
    } catch (err: any) {
      console.error('Error adding calendar event:', err);
      throw new Error(err.response?.data?.error || 'Error al crear evento');
    }
  };

  const updateEvent = async (id: string, updatedData: Partial<CalendarEvent>) => {
    try {
      const response = await calendarApi.update(id, updatedData);
      setEvents(prev => prev.map(event => 
        event.id === id ? response.data : event
      ));
    } catch (err: any) {
      console.error('Error updating calendar event:', err);
      throw new Error(err.response?.data?.error || 'Error al actualizar evento');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await calendarApi.delete(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err: any) {
      console.error('Error deleting calendar event:', err);
      throw new Error(err.response?.data?.error || 'Error al eliminar evento');
    }
  };

  return {
    events,
    loading,
    error,
    filters,
    setFilters,
    addEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents
  };
}