import React from 'react';
import { Users, Calendar, CalendarPlus, Megaphone, CalendarDays, BookOpen } from 'lucide-react';
import { NavigationTab } from '../../types/navigation';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    {
      id: 'staff' as NavigationTab,
      label: 'Personal',
      icon: Users,
      description: 'Gestión de personal médico'
    },
    {
      id: 'booking' as NavigationTab,
      label: 'Reservar Turno',
      icon: CalendarPlus,
      description: 'Agendar nueva cita médica'
    },
    {
      id: 'schedule' as NavigationTab,
      label: 'Agenda Médica',
      icon: Calendar,
      description: 'Ver turnos programados'
    },
    {
      id: 'blog' as NavigationTab,
      label: 'Anuncios',
      icon: Megaphone,
      description: 'Noticias y comunicados'
    },
    {
      id: 'calendar' as NavigationTab,
      label: 'Calendario',
      icon: CalendarDays,
      description: 'Calendario compartido'
    },
    {
      id: 'tutorials' as NavigationTab,
      label: 'Tutoriales',
      icon: BookOpen,
      description: 'Guías y procedimientos'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}