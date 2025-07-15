import { useState, useEffect, useMemo } from 'react';
import { Appointment, Patient, AppointmentWithDetails, AppointmentFilters, TimeSlot } from '../types/appointment';
import { Staff } from '../types/staff';
import { appointmentsApi } from '../services/api';

export function useAppointments(staff: Staff[]) {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AppointmentFilters>({
    doctorId: '',
    specialty: '',
    date: new Date().toISOString().split('T')[0],
    status: 'all'
  });

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await appointmentsApi.getAll(filters);
      setAppointments(response.data);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.response?.data?.error || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const generateTimeSlots = async (doctorId: string, date: string): Promise<TimeSlot[]> => {
    try {
      const response = await appointmentsApi.getTimeSlots(doctorId, date);
      return response.data;
    } catch (err: any) {
      console.error('Error generating time slots:', err);
      return [];
    }
  };

  const addAppointment = async (appointmentData: {
    patientData: Omit<Patient, 'id'>;
    doctorId: string;
    date: string;
    time: string;
    notes?: string;
  }) => {
    try {
      const response = await appointmentsApi.create(appointmentData);
      setAppointments(prev => [...prev, response.data]);
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      throw new Error(err.response?.data?.error || 'Error al crear la cita');
    }
  };

  const updateAppointment = async (id: string, updates: any) => {
    try {
      const response = await appointmentsApi.update(id, updates);
      setAppointments(prev => prev.map(appointment =>
        appointment.id === id ? response.data : appointment
      ));
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      throw new Error(err.response?.data?.error || 'Error al actualizar la cita');
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      await appointmentsApi.cancel(id);
      setAppointments(prev => prev.map(appointment =>
        appointment.id === id ? { ...appointment, status: 'cancelled' as const } : appointment
      ));
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      throw new Error(err.response?.data?.error || 'Error al cancelar la cita');
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await appointmentsApi.delete(id);
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      throw new Error(err.response?.data?.error || 'Error al eliminar la cita');
    }
  };

  return {
    appointments,
    loading,
    error,
    filters,
    setFilters,
    generateTimeSlots,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
    refetch: fetchAppointments
  };
}