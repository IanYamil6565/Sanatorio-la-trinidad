import React, { useState } from 'react';
import { Calendar, Filter, Clock, User, Phone, Edit, X, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { AppointmentWithDetails, AppointmentFilters } from '../../types/appointment';
import { Staff } from '../../types/staff';
import { AppointmentModal } from './AppointmentModal';

interface AppointmentScheduleProps {
  appointments: AppointmentWithDetails[];
  staff: Staff[];
  filters: AppointmentFilters;
  onFiltersChange: (filters: AppointmentFilters) => void;
  onUpdateAppointment: (id: string, updates: any) => void;
  onCancelAppointment: (id: string) => void;
}

export function AppointmentSchedule({
  appointments,
  staff,
  filters,
  onFiltersChange,
  onUpdateAppointment,
  onCancelAppointment
}: AppointmentScheduleProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const doctors = staff.filter(s => s.type === 'doctor' && s.status === 'active');
  const specialties = Array.from(new Set(doctors.map(d => d.specialty || d.position))).sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'pending': return AlertCircle;
      case 'cancelled': return XCircle;
      case 'completed': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const groupAppointmentsByDate = () => {
    const grouped: Record<string, AppointmentWithDetails[]> = {};
    
    appointments.forEach(appointment => {
      if (!grouped[appointment.date]) {
        grouped[appointment.date] = [];
      }
      grouped[appointment.date].push(appointment);
    });

    // Sort appointments within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.time.localeCompare(b.time));
    });

    return grouped;
  };

  const groupedAppointments = groupAppointmentsByDate();
  const sortedDates = Object.keys(groupedAppointments).sort();

  const handleEditAppointment = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const handleModalSave = (appointmentData: any) => {
    if (selectedAppointment) {
      onUpdateAppointment(selectedAppointment.id, appointmentData);
    }
    setModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Agenda Médica</h2>
            <p className="text-gray-600">Gestión de turnos programados</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor
            </label>
            <select
              value={filters.doctorId}
              onChange={(e) => onFiltersChange({ ...filters, doctorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los doctores</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidad
            </label>
            <select
              value={filters.specialty}
              onChange={(e) => onFiltersChange({ ...filters, specialty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las especialidades</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => onFiltersChange({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="confirmed">Confirmados</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Cancelados</option>
              <option value="completed">Completados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        {sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {formatDate(date)}
                </h3>
                <p className="text-sm text-gray-600">
                  {groupedAppointments[date].length} turno{groupedAppointments[date].length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {groupedAppointments[date].map(appointment => {
                  const StatusIcon = getStatusIcon(appointment.status);
                  
                  return (
                    <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span className="text-lg font-semibold text-gray-900">
                              {appointment.time}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {appointment.patient.firstName} {appointment.patient.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Doc: {appointment.patient.document}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {appointment.patient.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {appointment.doctor.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.doctor.specialty}
                            </p>
                          </div>

                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{getStatusLabel(appointment.status)}</span>
                          </span>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditAppointment(appointment)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {appointment.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  if (window.confirm('¿Está seguro de que desea cancelar este turno?')) {
                                    onCancelAppointment(appointment.id);
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-3 pl-7">
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Notas:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron turnos</p>
            <p className="text-gray-400 text-sm mt-2">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Edit Appointment Modal */}
      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSave={handleModalSave}
        appointment={selectedAppointment}
        staff={staff}
      />
    </div>
  );
}