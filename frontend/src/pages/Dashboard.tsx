import { useState } from 'react';
import { Search, Bell, Plus, Calendar, List } from 'lucide-react';
import UserProfile from '../components/UserProfile';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import CreateEventModal from '../components/CreateEventModal';
import EventList from '../components/EventList';
import CalendarView from '../components/CalendarView';
import { Clock, CheckCircle, TrendingUp } from 'lucide-react';
import type { Event, CreateEventData } from '../types/event';

export default function Dashboard() {
  const [user] = useState({
    name: 'Sarah Connor',
    email: 'sarah@gmail.com',
    avatar: '',
  });

  const [events, setEvents] = useState<Event[]>(
    [
      {
        id: '1',
        title: 'Team Meeting',
        description: 'Weekly team sync-up',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
        status: 'BUSY',
        participants: ['John', 'Jane', 'Mike'],
      },
      {
        id: '2',
        title: 'Design Review',
        description: 'Review new UI mockups',
        date: '2024-01-15',
        startTime: '14:00',
        endTime: '15:30',
        status: 'SWAPPABLE',
        participants: ['Alice', 'Bob'],
      },
      {
        id: '3',
        title: 'Client Presentation',
        description: 'Q4 results presentation',
        date: '2024-01-16',
        startTime: '09:00',
        endTime: '10:30',
        status: 'BUSY',
        participants: ['Charlie', 'David', 'Eve'],
      },
    ]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const handleCreateEvent = (eventData: CreateEventData) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      ...eventData,
      status: 'BUSY',
      participants: [],
    };
    setEvents([...events, newEvent]);
  };

  const handleMakeSwappable = (id: string) => {
    setEvents(
      events.map((event) =>
        event.id === id
          ? { ...event, status: event.status === 'BUSY' ? 'SWAPPABLE' : 'BUSY' }
          : event
      )
    );
  };

  const handleEdit = (id: string) => {
    console.log('Edit event:', id);
    // Implement edit functionality
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const handleEventClick = (event: Event) => {
    console.log('Event clicked:', event);
    // Show event details
  };

  const totalEvents = events.length;
  const swappableEvents = events.filter((e) => e.status === 'SWAPPABLE').length;
  const busyEvents = events.filter((e) => e.status === 'BUSY').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-72 min-h-screen bg-white border-r border-gray-200 p-6 sticky top-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-purple-600">📊</span> SlotSwapper
            </h1>
          </div>

          <div className="mb-8">
            <UserProfile
              name={user.name}
              email={user.email}
              avatar={user.avatar}
            />
          </div>

          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Hello, {user.name.split(' ')[0]}
              </h2>
              <p className="text-gray-500">
                Today is{' '}
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30"
              >
                <Plus size={20} />
                Add New Event
              </button>

              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={24} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              label="Total Events"
              value={totalEvents}
              icon={<Calendar size={24} />}
              color="purple"
            />
            <StatsCard
              label="Swappable Events"
              value={swappableEvents}
              icon={<CheckCircle size={24} />}
              color="teal"
            />
            <StatsCard
              label="Busy Events"
              value={busyEvents}
              icon={<Clock size={24} />}
              color="coral"
            />
          </div>

          {/* View Toggle */}
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800">My Events</h3>
            <div className="flex bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={18} />
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar size={18} />
                Calendar View
              </button>
            </div>
          </div>

          {/* Events Display */}
          {viewMode === 'list' ? (
            <EventList
              events={events}
              onMakeSwappable={handleMakeSwappable}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <CalendarView events={events} onEventClick={handleEventClick} />
          )}
        </main>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  );
}
