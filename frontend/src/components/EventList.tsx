import type { Event } from '../types/event';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  onMakeSwappable?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function EventList({ events, onMakeSwappable, onEdit, onDelete }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No events yet. Create your first event!</p>
      </div>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort();

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => (
        <div key={date}>
          <div className="sticky top-0 bg-gradient-to-br from-gray-50 to-gray-100 py-3 mb-4 z-10">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {getDateLabel(date)}
              <span className="text-sm font-normal text-gray-500">
                ({groupedEvents[date].length} event{groupedEvents[date].length !== 1 ? 's' : ''})
              </span>
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedEvents[date].map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onMakeSwappable={onMakeSwappable}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
