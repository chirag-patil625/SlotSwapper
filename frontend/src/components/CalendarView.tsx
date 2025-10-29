import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Event } from '../types/event';

interface CalendarViewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export default function CalendarView({ events, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDayEvents = (date: Date | null) => {
    if (!date) return [];
    return events.filter(
      (event) => event.date === date.toISOString().split('T')[0]
    );
  };

  const renderEventBadge = (event: Event, isMobile: boolean = false) => {
    const statusColor = event.status === 'SWAPPABLE' ? 'bg-green-100 border-green-400' : 'bg-blue-100 border-blue-400';
    
    if (isMobile) {
      return (
        <div
          key={event.id}
          onClick={() => onEventClick?.(event)}
          className={`text-[10px] px-1.5 py-0.5 rounded border ${statusColor} cursor-pointer hover:opacity-80 transition-opacity truncate max-w-full`}
          title={`${event.title} (${event.startTime} - ${event.endTime})`}
        >
          <span className="block truncate">{event.title}</span>
        </div>
      );
    }

    return (
      <div
        key={event.id}
        onClick={() => onEventClick?.(event)}
        className={`text-xs px-2 py-1 rounded border ${statusColor} cursor-pointer hover:opacity-80 transition-opacity`}
        title={`${event.title} (${event.startTime} - ${event.endTime})`}
      >
        <p className="font-medium truncate">{event.title}</p>
        <p className="text-[10px] opacity-75">{event.startTime}</p>
      </div>
    );
  };

  const isCurrentDay = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Build calendar grid with proper days
  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    const prevMonthDay = new Date(year, month, -firstDayOfMonth + i + 1);
    calendarDays.push(prevMonthDay);
  }
  
  // Add all days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }
  
  // Add empty cells to complete the last week
  const remainingCells = 7 - (calendarDays.length % 7);
  if (remainingCells < 7) {
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push(new Date(year, month + 1, i));
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-2xl font-bold text-gray-800">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="p-2 md:p-3 text-center text-xs md:text-sm font-semibold text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[60px] md:min-h-[100px] p-1 md:p-2 border-b border-r last:border-r-0 bg-gray-50"
                />
              );
            }

            const dayEvents = getDayEvents(day);
            const isToday = isCurrentDay(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();

            return (
              <div
                key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border-b border-r last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={`text-xs md:text-sm font-medium mb-1 ${
                      isToday
                        ? 'bg-purple-600 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs'
                        : isCurrentMonth
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  <div className="flex-1 space-y-0.5 md:space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div key={event.id} className="w-full">
                        {/* Mobile view */}
                        <div className="md:hidden">
                          {renderEventBadge(event, true)}
                        </div>
                        {/* Desktop view */}
                        <div className="hidden md:block">
                          {renderEventBadge(event, false)}
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <button
                        onClick={() => onEventClick?.(dayEvents[0])}
                        className="text-[9px] md:text-xs text-purple-600 font-medium hover:underline w-full text-left"
                      >
                        +{dayEvents.length - 2} more
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-6 text-xs md:text-sm flex-wrap">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-100 border border-blue-400 rounded"></div>
          <span className="text-gray-600">Busy</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-green-100 border border-green-400 rounded"></div>
          <span className="text-gray-600">Swappable</span>
        </div>
      </div>
    </div>
  );
}
