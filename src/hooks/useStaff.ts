import { useState, useEffect, useMemo } from 'react';
import { Staff, StaffFilters } from '../types/staff';
import { staffApi } from '../services/api';

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StaffFilters>({
    search: '',
    type: 'all',
    department: '',
    status: 'all'
  });

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.getAll(filters);
      setStaff(response.data);
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      setError(err.response?.data?.error || 'Error al cargar el personal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [filters]);

  const addStaff = async (newStaff: Omit<Staff, 'id'>) => {
    try {
      const response = await staffApi.create(newStaff);
      setStaff(prev => [...prev, response.data]);
    } catch (err: any) {
      console.error('Error adding staff:', err);
      throw new Error(err.response?.data?.error || 'Error al agregar personal');
    }
  };

  const updateStaff = async (id: string, updatedData: Partial<Staff>) => {
    try {
      const response = await staffApi.update(id, updatedData);
      setStaff(prev => prev.map(person => 
        person.id === id ? response.data : person
      ));
    } catch (err: any) {
      console.error('Error updating staff:', err);
      throw new Error(err.response?.data?.error || 'Error al actualizar personal');
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      await staffApi.delete(id);
      setStaff(prev => prev.filter(person => person.id !== id));
    } catch (err: any) {
      console.error('Error deleting staff:', err);
      throw new Error(err.response?.data?.error || 'Error al eliminar personal');
    }
  };

  // Get departments
  const [departments, setDepartments] = useState<string[]>([]);
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await staffApi.getDepartments();
        setDepartments(response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  // Get stats
  const [stats, setStats] = useState({
    total: 0,
    doctors: 0,
    nurses: 0,
    administrative: 0,
    technicians: 0,
    reception: 0,
    call_center: 0,
    active: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await staffApi.getStats();
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, [staff]);

  return {
    staff,
    loading,
    error,
    filters,
    setFilters,
    addStaff,
    updateStaff,
    deleteStaff,
    departments,
    stats,
    refetch: fetchStaff
  };
}