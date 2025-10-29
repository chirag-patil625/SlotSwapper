import { Calendar, Clock, User, ArrowLeftRight } from 'lucide-react';

interface SwappableSlot {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  ownerName: string;
  ownerAvatar?: string;
  category?: string;
}

interface SwappableSlotCardProps {
  slot: SwappableSlot;
  onRequestSwap: (slotId: string) => void;
}

const categoryColors: Record<string, string> = {
  Meeting: 'bg-blue-100 text-blue-700',
  Workshop: 'bg-purple-100 text-purple-700',
  Training: 'bg-teal-100 text-teal-700',
  Review: 'bg-orange-100 text-orange-700',
  Default: 'bg-gray-100 text-gray-700',
};

export default function SwappableSlotCard({ slot, onRequestSwap }: SwappableSlotCardProps) {
  const categoryColor = categoryColors[slot.category || 'Default'] || categoryColors.Default;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-200 hover:border-purple-300">
      {/* Header with Category Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
          {slot.category || 'General'}
        </span>
        <div className="flex items-center gap-2">
          <img
            src={slot.ownerAvatar || `https://ui-avatars.com/api/?name=${slot.ownerName}&background=random`}
            alt={slot.ownerName}
            className="w-8 h-8 rounded-full border-2 border-gray-200"
          />
        </div>
      </div>

      {/* Slot Details */}
      <h3 className="text-lg font-bold text-gray-800 mb-2">{slot.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{slot.description}</p>

      {/* Date and Time Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-purple-600" />
          <span>{new Date(slot.date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} className="text-purple-600" />
          <span>{slot.startTime} - {slot.endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} className="text-purple-600" />
          <span>{slot.ownerName}</span>
        </div>
      </div>

      {/* Request Swap Button */}
      <button
        onClick={() => onRequestSwap(slot.id)}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
      >
        <ArrowLeftRight size={18} />
        Request Swap
      </button>
    </div>
  );
}
