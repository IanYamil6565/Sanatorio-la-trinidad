export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  specialty?: string;
  type: 'doctor' | 'administrative' | 'technician' | 'nurse' | 'reception' | 'call_center';
  status: 'active' | 'inactive';
  hireDate: string;
  avatar?: string;
  bio?: string;
  certifications?: string[];
  keywords?: string[];
}

export interface StaffFilters {
  search: string;
  type: 'all' | 'doctor' | 'administrative' | 'technician' | 'nurse' | 'reception' | 'call_center';
  department: string;
  status: 'all' | 'active' | 'inactive';
}

export type ViewMode = 'gallery' | 'table';