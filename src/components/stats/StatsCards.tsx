import React from 'react';
import { Users, UserCheck, Stethoscope, Shield, Wrench, Heart } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    total: number;
    doctors: number;
    nurses: number;
    administrative: number;
    technicians: number;
    active: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Personal',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
      change: '+2%'
    },
    {
      title: 'Personal Activo',
      value: stats.active,
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Médicos',
      value: stats.doctors,
      icon: Stethoscope,
      color: 'bg-purple-500',
      change: '+1%'
    },
    {
      title: 'Enfermeras',
      value: stats.nurses,
      icon: Heart,
      color: 'bg-pink-500',
      change: '+3%'
    },
    {
      title: 'Administrativos',
      value: stats.administrative,
      icon: Shield,
      color: 'bg-indigo-500',
      change: '0%'
    },
    {
      title: 'Técnicos',
      value: stats.technicians,
      icon: Wrench,
      color: 'bg-orange-500',
      change: '+4%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-green-600 mt-1">{card.change} vs mes anterior</p>
            </div>
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}