import { useState, useEffect } from 'react';
import { Search, Bell, Plus, Calendar, List, Clock, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import CreateEventModal from '../components/CreateEventModal';
import EventList from '../components/EventList';
import CalendarView from '../components/CalendarView';
import EditEventModal from '../components/EditEventModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Event, CreateEventData } from '../types/event';
import { useAuth } from '../context/AuthContext';
import { eventsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getAll();
      // Transform backend response to match frontend Event type
      const transformedEvents = data.map((event: any) => ({
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        status: event.status,
        participants: event.participants || [],
      }));
      setEvents(transformedEvents);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: CreateEventData) => {
    try {
      const newEvent = await eventsAPI.create(eventData);
      // Optimistically update UI instead of refetching
      const transformedEvent = {
        id: newEvent._id,
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        status: newEvent.status,
        participants: newEvent.participants || [],
      };
      setEvents(prev => [...prev, transformedEvent]);
      showToast('Event created successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create event', 'error');
    }
  };

  const handleMakeSwappable = async (id: string) => {
    try {
      // Optimistically update UI
      setEvents(prev => prev.map(event => 
        event.id === id 
          ? { ...event, status: event.status === 'BUSY' ? 'SWAPPABLE' : 'BUSY' }
          : event
      ));
      
      await eventsAPI.toggleSwappable(id);
      showToast('Event status updated successfully!', 'success');
    } catch (err: any) {
      // Revert on error
      await fetchEvents();
      showToast(err.message || 'Failed to update event', 'error');
    }
  };

  const handleEdit = (id: string) => {
    const event = events.find(e => e.id === id);
    if (event) {
      setEditingEvent(event);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      // Optimistically update UI
      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, ...eventData } : event
      ));
      
      await eventsAPI.update(id, eventData);
      setIsEditModalOpen(false);
      setEditingEvent(null);
      showToast('Event updated successfully!', 'success');
    } catch (err: any) {
      // Revert on error
      await fetchEvents();
      showToast(err.message || 'Failed to update event', 'error');
    }
  };

  const handleDelete = (id: string) => {
    setDeletingEventId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingEventId) {
      try {
        // Optimistically remove from UI
        setEvents(prev => prev.filter(event => event.id !== deletingEventId));
        
        await eventsAPI.delete(deletingEventId);
        showToast('Event deleted successfully!', 'success');
      } catch (err: any) {
        // Revert on error
        await fetchEvents();
        showToast(err.message || 'Failed to delete event', 'error');
      } finally {
        setDeletingEventId(null);
      }
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseEventDetail = () => {
    setSelectedEvent(null);
  };

  // Filter events based on search query
  const filteredEvents = events.filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query)
    );
  });

  const totalEvents = filteredEvents.length;
  const swappableEvents = filteredEvents.filter((e) => e.status === 'SWAPPABLE').length;
  const busyEvents = filteredEvents.filter((e) => e.status === 'BUSY').length;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Add check for user authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your dashboard</p>
          <Link
            to="/"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar - Hidden on mobile, shown on desktop */}
        <aside className="hidden lg:block w-72 min-h-screen bg-white border-r border-gray-200 p-6 sticky top-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-purple-600">📊</span> SlotSwapper
            </h1>
          </div>

          <div className="mb-8">
            <UserProfile
              name={user?.name || 'User'}
              email={user?.email || ''}
              avatar={user?.avatar}
            />
          </div>

          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
          {/* Header */}
          <header className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Hello, {user.name?.split(' ')[0] || 'User'}
                </h2>
                <p className="text-sm md:text-base text-gray-500">
                  Today is{' '}
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                <div className="relative flex-1 md:flex-initial">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-auto pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-purple-600 text-white px-4 md:px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30 text-sm md:text-base whitespace-nowrap"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add Event</span>
                </button>
              </div>
            </div>
          </header>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
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
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              My Events {searchQuery && `(${filteredEvents.length})`}
            </h3>
            <div className="flex bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 sm:flex-initial px-3 md:px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors text-sm ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={16} />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex-1 sm:flex-initial px-3 md:px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors text-sm ${
                  viewMode === 'calendar'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar size={16} />
                <span className="hidden sm:inline">Calendar</span>
              </button>
            </div>
          </div>

          {/* Events Display */}
          {viewMode === 'list' ? (
            <EventList
              events={filteredEvents}
              onMakeSwappable={handleMakeSwappable}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <CalendarView events={filteredEvents} onEventClick={handleEventClick} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 shadow-lg">
        <div className="flex justify-around items-center">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-purple-600 transition-all hover:scale-105">
            <Calendar size={20} />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link to="/marketplace" className="flex flex-col items-center gap-1 text-gray-600 transition-all hover:scale-105 hover:text-purple-600">
            <List size={20} />
            <span className="text-xs">Marketplace</span>
          </Link>
          <Link to="/requests" className="flex flex-col items-center gap-1 text-gray-600 transition-all hover:scale-105 hover:text-purple-600">
            <Bell size={20} />
            <span className="text-xs">Requests</span>
          </Link>
        </div>
      </nav>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateEvent={handleCreateEvent}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        onUpdateEvent={handleUpdateEvent}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingEventId(null);
        }}
      />

      {/* Event Detail Modal for Calendar View */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseEventDetail}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-4 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">{selectedEvent.title}</h2>
              <button
                onClick={handleCloseEventDetail}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 md:space-y-4">
              <p className="text-sm md:text-base text-gray-600">{selectedEvent.description}</p>
              
              <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                <Calendar size={16} className="md:w-5 md:h-5" />
                <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>

              <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                <Clock size={16} className="md:w-5 md:h-5" />
                <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                  selectedEvent.status === 'SWAPPABLE'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {selectedEvent.status === 'SWAPPABLE' ? 'Swappable' : 'Busy'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 md:gap-3 mt-6">
              <button
                onClick={() => {
                  handleEdit(selectedEvent.id);
                  handleCloseEventDetail();
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 md:py-2.5 rounded-lg text-sm md:text-base transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  handleMakeSwappable(selectedEvent.id);
                  handleCloseEventDetail();
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 md:py-2.5 rounded-lg text-sm md:text-base transition-colors"
              >
                {selectedEvent.status === 'SWAPPABLE' ? 'Mark Busy' : 'Make Swappable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

