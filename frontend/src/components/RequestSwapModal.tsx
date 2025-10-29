import { useState } from 'react';
import { X, Calendar, Clock, CheckCircle, ArrowLeftRight } from 'lucide-react';
import type { Event } from '../types/event';

interface RequestSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    ownerName: string;
  } | null;
  userSwappableSlots: Event[];
  onConfirmSwap: (targetSlotId: string, offerSlotId: string) => void;
}

export default function RequestSwapModal({
  isOpen,
  onClose,
  targetSlot,
  userSwappableSlots,
  onConfirmSwap,
}: RequestSwapModalProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  if (!isOpen || !targetSlot) return null;

  const handleConfirm = () => {
    if (selectedSlotId) {
      onConfirmSwap(targetSlot.id, selectedSlotId);
      setSelectedSlotId(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Request Swap</h2>
              <p className="text-purple-100 text-sm">Select one of your swappable slots to offer in exchange</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Target Slot Info */}
          <div className="bg-purple-50 rounded-xl p-4 mb-6 border border-purple-200">
            <h3 className="text-sm font-medium text-purple-900 mb-3 flex items-center gap-2">
              <ArrowLeftRight size={16} />
              You want to swap with:
            </h3>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">{targetSlot.title}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{new Date(targetSlot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{targetSlot.startTime} - {targetSlot.endTime}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Owner: {targetSlot.ownerName}</p>
            </div>
          </div>

          {/* User's Swappable Slots */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Your Swappable Slots ({userSwappableSlots.length})
            </h3>
            
            {userSwappableSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">You don't have any swappable slots yet.</p>
                <p className="text-sm text-gray-400">Go to your dashboard and mark some events as swappable.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userSwappableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedSlotId === slot.id
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{slot.title}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">{slot.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                        </div>
                      </div>
                      {selectedSlotId === slot.id && (
                        <CheckCircle size={24} className="text-purple-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedSlotId}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                selectedSlotId
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/30'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirm Swap Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
