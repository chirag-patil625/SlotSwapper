import { MoreVertical } from 'lucide-react';

interface CalendarEvent {
  time: string;
  title: string;
  subtitle: string;
}

interface CalendarWidgetProps {
  events: { date: string; items: CalendarEvent[] }[];
}

export default function CalendarWidget({ events }: CalendarWidgetProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Calendar</h2>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical size={20} className="text-gray-600" />
        </button>
      </div>
      
      <div className="space-y-6">
        {events.map((day, idx) => (
          <div key={idx}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-600">{day.date}</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              {day.items.map((event, eventIdx) => (
                <div key={eventIdx} className="flex gap-4 items-start">
                  <div className="text-sm font-medium text-gray-800 w-16">{event.time}</div>
                  <div className="flex-1 pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{event.title}</p>
                        <p className="text-sm font-medium text-gray-800">{event.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
