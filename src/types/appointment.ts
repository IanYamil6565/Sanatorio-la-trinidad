export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  document: string;
  phone: string;
  email?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentWithDetails extends Appointment {
  patient: Patient;
  doctor: {
    id: string;
    name: string;
    specialty: string;
    department: string;
  };
}

export interface AppointmentFilters {
  doctorId: string;
  specialty: string;
  date: string;
  status: 'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed';
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}