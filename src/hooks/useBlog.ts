import { useState, useEffect, useMemo } from 'react';
import { BlogPost, BlogFilters } from '../types/blog';
import { blogApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function useBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BlogFilters>({
    search: '',
    category: '',
    author: '',
    status: 'all'
  });
  const { user } = useAuth();

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogApi.getAll(filters);
      setPosts(response.data);
    } catch (err: any) {
      console.error('Error fetching blog posts:', err);
      setError(err.response?.data?.error || 'Error al cargar anuncios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const addPost = async (newPost: Omit<BlogPost, 'id' | 'publishedAt' | 'updatedAt'>) => {
    try {
      const postData = {
        ...newPost,
        authorId: user?.staffId || 1 // Default to admin if no staff ID
      };
      const response = await blogApi.create(postData);
      setPosts(prev => [...prev, response.data]);
    } catch (err: any) {
      console.error('Error adding blog post:', err);
      throw new Error(err.response?.data?.error || 'Error al crear anuncio');
    }
  };

  const updatePost = async (id: string, updatedData: Partial<BlogPost>) => {
    try {
      const response = await blogApi.update(id, updatedData);
      setPosts(prev => prev.map(post => 
        post.id === id ? response.data : post
      ));
    } catch (err: any) {
      console.error('Error updating blog post:', err);
      throw new Error(err.response?.data?.error || 'Error al actualizar anuncio');
    }
  };

  const deletePost = async (id: string) => {
    try {
      await blogApi.delete(id);
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err: any) {
      console.error('Error deleting blog post:', err);
      throw new Error(err.response?.data?.error || 'Error al eliminar anuncio');
    }
  };

  // Get authors
  const [authors, setAuthors] = useState<string[]>([]);
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await blogApi.getAuthors();
        setAuthors(response.data);
      } catch (err) {
        console.error('Error fetching authors:', err);
      }
    };
    fetchAuthors();
  }, []);

  return {
    posts,
    loading,
    error,
    filters,
    setFilters,
    addPost,
    updatePost,
    deletePost,
    authors,
    refetch: fetchPosts
  };
}