import { useState, useEffect } from 'react';
import { Tutorial, TutorialFilters } from '../types/tutorial';
import { tutorialsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function useTutorials() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TutorialFilters>({
    search: '',
    category: '',
    difficulty: '',
    author: ''
  });
  const { user } = useAuth();

  // Fetch tutorials
  const fetchTutorials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tutorialsApi.getAll(filters);
      setTutorials(response.data);
    } catch (err: any) {
      console.error('Error fetching tutorials:', err);
      setError(err.response?.data?.error || 'Error al cargar tutoriales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, [filters]);

  const addTutorial = async (newTutorial: Omit<Tutorial, 'id' | 'publishedAt' | 'updatedAt' | 'views'>) => {
    try {
      const tutorialData = {
        ...newTutorial,
        authorId: user?.staffId || 1 // Default to admin if no staff ID
      };
      const response = await tutorialsApi.create(tutorialData);
      setTutorials(prev => [...prev, response.data]);
    } catch (err: any) {
      console.error('Error adding tutorial:', err);
      throw new Error(err.response?.data?.error || 'Error al crear tutorial');
    }
  };

  const updateTutorial = async (id: string, updatedData: Partial<Tutorial>) => {
    try {
      const response = await tutorialsApi.update(id, updatedData);
      setTutorials(prev => prev.map(tutorial => 
        tutorial.id === id ? response.data : tutorial
      ));
    } catch (err: any) {
      console.error('Error updating tutorial:', err);
      throw new Error(err.response?.data?.error || 'Error al actualizar tutorial');
    }
  };

  const deleteTutorial = async (id: string) => {
    try {
      await tutorialsApi.delete(id);
      setTutorials(prev => prev.filter(tutorial => tutorial.id !== id));
    } catch (err: any) {
      console.error('Error deleting tutorial:', err);
      throw new Error(err.response?.data?.error || 'Error al eliminar tutorial');
    }
  };

  const viewTutorial = async (id: string) => {
    try {
      await tutorialsApi.incrementViews(id);
      setTutorials(prev => prev.map(tutorial => 
        tutorial.id === id ? { ...tutorial, views: tutorial.views + 1 } : tutorial
      ));
    } catch (err: any) {
      console.error('Error incrementing tutorial views:', err);
    }
  };

  // Get authors
  const [authors, setAuthors] = useState<string[]>([]);
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await tutorialsApi.getAuthors();
        setAuthors(response.data);
      } catch (err) {
        console.error('Error fetching authors:', err);
      }
    };
    fetchAuthors();
  }, []);

  return {
    tutorials,
    loading,
    error,
    filters,
    setFilters,
    addTutorial,
    updateTutorial,
    deleteTutorial,
    viewTutorial,
    authors,
    refetch: fetchTutorials
  };
}