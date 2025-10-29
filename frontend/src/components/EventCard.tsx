import { Calendar, Clock, Edit2, Trash2, RefreshCw } from 'lucide-react';
import type { Event } from '../types/event';

interface EventCardProps {
  event: Event;
  onMakeSwappable?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function EventCard({ event, onMakeSwappable, onEdit, onDelete }: EventCardProps) {
  const isSwappable = event.status === 'SWAPPABLE';
  
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 ${
      isSwappable ? 'border-green-500' : 'border-gray-400'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{event.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isSwappable 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {event.status}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>{event.startTime} - {event.endTime}</span>
        </div>
      </div>

      {event.participants && event.participants.length > 0 && (
        <div className="flex -space-x-2 mb-4">
          {event.participants.slice(0, 4).map((participant, idx) => (
            <img
              key={idx}
              src={`https://ui-avatars.com/api/?name=${participant}&background=random`}
              alt={participant}
              className="w-7 h-7 rounded-full border-2 border-white"
              title={participant}
            />
          ))}
          {event.participants.length > 4 && (
            <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              +{event.participants.length - 4}
            </div>
          )}
        </div>
      )}
      
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        {onMakeSwappable && (
          <button
            onClick={() => onMakeSwappable(event.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isSwappable
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            <RefreshCw size={16} />
            {isSwappable ? 'Mark as Busy' : 'Make Swappable'}
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(event.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
