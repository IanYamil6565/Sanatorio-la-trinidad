import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Phone, FileText, Save, AlertCircle, CalendarPlus } from 'lucide-react';
import { Staff } from '../../types/staff';
import { TimeSlot } from '../../types/appointment';

interface AppointmentBookingProps {
  staff: Staff[];
  onBookAppointment: (appointmentData: {
    patientData: {
      firstName: string;
      lastName: string;
      document: string;
      phone: string;
      email?: string;
    };
    doctorId: string;
    date: string;
    time: string;
    notes?: string;
  }) => void;
  generateTimeSlots: (doctorId: string, date: string) => TimeSlot[];
}

export function AppointmentBooking({ staff, onBookAppointment, generateTimeSlots }: AppointmentBookingProps) {
  const [formData, setFormData] = useState({
    // Patient data
    firstName: '',
    lastName: '',
    document: '',
    phone: '',
    email: '',
    // Appointment data
    doctorId: '',
    specialty: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const doctors = useMemo(() => {
    return staff.filter(s => s.type === 'doctor' && s.status === 'active');
  }, [staff]);

  const specialties = useMemo(() => {
    return Array.from(new Set(doctors.map(d => d.specialty || d.position))).sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!formData.specialty) return doctors;
    return doctors.filter(d => 
      (d.specialty || d.position).toLowerCase().includes(formData.specialty.toLowerCase())
    );
  }, [doctors, formData.specialty]);

  const availableTimeSlots = useMemo(() => {
    if (!formData.doctorId || !formData.date) return [];
    return generateTimeSlots(formData.doctorId, formData.date);
  }, [formData.doctorId, formData.date, generateTimeSlots]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
    if (!formData.document.trim()) newErrors.document = 'El documento es requerido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!formData.doctorId) newErrors.doctorId = 'Debe seleccionar un doctor';
    if (!formData.date) newErrors.date = 'Debe seleccionar una fecha';
    if (!formData.time) newErrors.time = 'Debe seleccionar una hora';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onBookAppointment({
      patientData: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        document: formData.document,
        phone: formData.phone,
        email: formData.email || undefined
      },
      doctorId: formData.doctorId,
      date: formData.date,
      time: formData.time,
      notes: formData.notes || undefined
    });

    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      document: '',
      phone: '',
      email: '',
      doctorId: '',
      specialty: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      notes: ''
    });

    alert('Turno agendado exitosamente');
  };

  const selectedDoctor = doctors.find(d => d.id === formData.doctorId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CalendarPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reservar Turno Médico</h2>
            <p className="text-gray-600">Complete los datos para agendar una nueva cita</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Datos del Paciente</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del paciente"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.firstName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Apellido del paciente"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.lastName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula/Documento *
                </label>
                <input
                  type="text"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.document ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Número de documento"
                />
                {errors.document && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.document}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Número de teléfono"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Correo electrónico"
                />
              </div>
            </div>
          </div>

          {/* Appointment Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Datos de la Cita</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidad
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value, doctorId: '' })}
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
                  Doctor *
                </label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.doctorId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar doctor</option>
                  {filteredDoctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName} - {doctor.specialty || doctor.position}
                    </option>
                  ))}
                </select>
                {errors.doctorId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.doctorId}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.date}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora *
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  disabled={!formData.doctorId || !formData.date}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.time ? 'border-red-300' : 'border-gray-300'
                  } ${!formData.doctorId || !formData.date ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Seleccionar hora</option>
                  {availableTimeSlots
                    .filter(slot => slot.available)
                    .map(slot => (
                      <option key={slot.time} value={slot.time}>
                        {slot.time}
                      </option>
                    ))}
                </select>
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.time}</span>
                  </p>
                )}
                {formData.doctorId && formData.date && availableTimeSlots.filter(s => s.available).length === 0 && (
                  <p className="mt-1 text-sm text-amber-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>No hay horarios disponibles para esta fecha</span>
                  </p>
                )}
              </div>
            </div>

            {selectedDoctor && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Doctor Seleccionado</h4>
                <p className="text-blue-700">
                  {selectedDoctor.firstName} {selectedDoctor.lastName} - {selectedDoctor.specialty || selectedDoctor.position}
                </p>
                <p className="text-sm text-blue-600">{selectedDoctor.department}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notas adicionales
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Motivo de la consulta, síntomas, etc. (opcional)"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              <span>Agendar Turno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}