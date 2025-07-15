import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, Plus, Trash2 } from 'lucide-react';
import { Tutorial, TutorialStep } from '../../types/tutorial';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tutorial: Omit<Tutorial, 'id' | 'publishedAt' | 'updatedAt' | 'views'>) => void;
  tutorial?: Tutorial;
  mode: 'add' | 'edit';
}

export function TutorialModal({ isOpen, onClose, onSave, tutorial, mode }: TutorialModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'procedures' as Tutorial['category'],
    tags: [] as string[],
    author: 'Usuario Actual',
    authorId: 'current-user',
    difficulty: 'beginner' as Tutorial['difficulty'],
    estimatedTime: 15,
    steps: [] as TutorialStep[],
    rating: 0,
    isPublished: true
  });

  const [tagInput, setTagInput] = useState('');
  const [stepInput, setStepInput] = useState({ title: '', content: '' });

  useEffect(() => {
    if (tutorial && mode === 'edit') {
      setFormData({
        title: tutorial.title,
        content: tutorial.content,
        category: tutorial.category,
        tags: tutorial.tags,
        author: tutorial.author,
        authorId: tutorial.authorId,
        difficulty: tutorial.difficulty,
        estimatedTime: tutorial.estimatedTime,
        steps: tutorial.steps,
        rating: tutorial.rating,
        isPublished: tutorial.isPublished
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'procedures',
        tags: [],
        author: 'Usuario Actual',
        authorId: 'current-user',
        difficulty: 'beginner',
        estimatedTime: 15,
        steps: [],
        rating: 0,
        isPublished: true
      });
    }
  }, [tutorial, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addStep = () => {
    if (stepInput.title.trim() && stepInput.content.trim()) {
      const newStep: TutorialStep = {
        id: Date.now().toString(),
        title: stepInput.title.trim(),
        content: stepInput.content.trim(),
        order: formData.steps.length + 1
      };
      setFormData({
        ...formData,
        steps: [...formData.steps, newStep]
      });
      setStepInput({ title: '', content: '' });
    }
  };

  const removeStep = (stepId: string) => {
    const updatedSteps = formData.steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, order: index + 1 }));
    
    setFormData({
      ...formData,
      steps: updatedSteps
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'add' ? 'Nuevo Tutorial' : 'Editar Tutorial'}
              </h2>
              <p className="text-sm text-gray-500">
                {mode === 'add' ? 'Crear un nuevo tutorial o guía' : 'Modificar tutorial existente'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título del tutorial"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Tutorial['category'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="procedures">Procedimientos</option>
                <option value="software">Software</option>
                <option value="equipment">Equipamiento</option>
                <option value="policies">Políticas</option>
                <option value="emergency">Emergencias</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dificultad *
              </label>
              <select
                required
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Tutorial['difficulty'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo estimado (minutos) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autor
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del autor"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido *
              </label>
              <textarea
                rows={6}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contenido principal del tutorial"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Agregar tag y presionar Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pasos del tutorial
              </label>
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={stepInput.title}
                    onChange={(e) => setStepInput({ ...stepInput, title: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Título del paso"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={stepInput.content}
                      onChange={(e) => setStepInput({ ...stepInput, content: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descripción del paso"
                    />
                    <button
                      type="button"
                      onClick={addStep}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {formData.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{step.title}</p>
                      <p className="text-sm text-gray-600">{step.content}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  Publicar tutorial
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{mode === 'add' ? 'Crear' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}