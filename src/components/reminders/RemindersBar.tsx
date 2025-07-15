import React, { useState } from 'react';
import { Bell, X, Clock, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { Reminder } from '../../types/reminder';

interface RemindersBarProps {
  reminders: Reminder[];
  onCompleteReminder: (id: string) => void;
  onDismissReminder: (id: string) => void;
  onAddReminder: () => void;
}

export function RemindersBar({ reminders, onCompleteReminder, onDismissReminder, onAddReminder }: RemindersBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const activeReminders = reminders.filter(r => r.status === 'pending');
  const urgentReminders = activeReminders.filter(r => r.priority === 'urgent' || r.priority === 'high');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  if (activeReminders.length === 0) {
    return (
      <div className="bg-green-50 border-b border-green-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">No hay recordatorios pendientes</span>
          </div>
          <button
            onClick={onAddReminder}
            className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-amber-800 hover:text-amber-900"
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">
              {activeReminders.length} recordatorio{activeReminders.length !== 1 ? 's' : ''} pendiente{activeReminders.length !== 1 ? 's' : ''}
              {urgentReminders.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                  {urgentReminders.length} urgente{urgentReminders.length !== 1 ? 's' : ''}
                </span>
              )}
            </span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onAddReminder}
              className="flex items-center space-x-1 text-amber-600 hover:text-amber-800 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-2">
            {activeReminders.slice(0, 5).map((reminder) => {
              const PriorityIcon = getPriorityIcon(reminder.priority);
              
              return (
                <div
                  key={reminder.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getPriorityColor(reminder.priority)}`}
                >
                  <div className="flex items-center space-x-3">
                    <PriorityIcon className="w-4 h-4" />
                    <div>
                      <p className="font-medium text-sm">{reminder.title}</p>
                      {reminder.description && (
                        <p className="text-xs opacity-75">{reminder.description}</p>
                      )}
                      <p className="text-xs opacity-75">
                        Vence: {new Date(reminder.dueDate).toLocaleDateString('es-ES')}
                        {reminder.dueTime && ` a las ${reminder.dueTime}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onCompleteReminder(reminder.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                      title="Marcar como completado"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDismissReminder(reminder.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                      title="Descartar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {activeReminders.length > 5 && (
              <p className="text-center text-sm text-amber-700">
                Y {activeReminders.length - 5} recordatorio{activeReminders.length - 5 !== 1 ? 's' : ''} más...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}