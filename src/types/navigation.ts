export type NavigationTab = 'staff' | 'booking' | 'schedule' | 'blog' | 'calendar' | 'tutorials';

export interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: string;
}