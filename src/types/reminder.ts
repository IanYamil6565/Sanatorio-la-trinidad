export interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'meeting' | 'deadline' | 'maintenance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  dueTime?: string;
  assignedTo?: string;
  createdBy: string;
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
  completedAt?: string;
}