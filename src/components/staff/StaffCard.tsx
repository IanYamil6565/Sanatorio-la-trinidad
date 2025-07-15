import React from 'react';
import { Mail, Phone, MapPin, Edit, Trash2, User } from 'lucide-react';
import { Staff } from '../../types/staff';

interface StaffCardProps {
  staff: Staff;
  onEdit: (staff: Staff) => void;
  onDelete: (id: string) => void;
}

export function StaffCard({ staff, onEdit, onDelete }: StaffCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'nurse': return 'bg-pink-100 text-pink-800';
      case 'administrative': return 'bg-gray-100 text-gray-800';
      case 'technician': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'doctor': return 'Médico';
      case 'nurse': return 'Enfermera';
      case 'administrative': return 'Administrativo';
      case 'technician': return 'Técnico';
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
              {staff.avatar ? (
                <img 
                  src={staff.avatar} 
                  alt={`${staff.first_name} ${staff.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {staff.first_name} {staff.last_name}
              </h3>
              <p className="text-sm text-gray-600 truncate">{staff.position}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => onEdit(staff)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(staff.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{staff.department}</span>
          </div>
          {staff.specialty && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Especialidad:</span> 
              <span className="ml-1">{staff.specialty}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{staff.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{staff.phone}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(staff.type)}`}>
            {getTypeLabel(staff.type)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            staff.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {staff.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {staff.bio && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">{staff.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
