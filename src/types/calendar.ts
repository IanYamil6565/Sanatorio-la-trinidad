export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'training' | 'maintenance' | 'event' | 'holiday';
  location?: string;
  attendees: string[];
  createdBy: string;
  isAllDay: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  color: string;
}

export interface CalendarFilters {
  view: 'month' | 'week' | 'day';
  date: string;
  type: string;
  attendee: string;
}