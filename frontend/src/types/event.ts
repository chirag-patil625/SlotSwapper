export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'BUSY' | 'SWAPPABLE';
  participants?: string[];
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
}
