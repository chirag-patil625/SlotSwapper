import { useState } from 'react';
import { Search, Filter, TrendingUp, Users, Tickets, ArrowRightLeft } from 'lucide-react';
import UserProfile from '../components/UserProfile';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import SwappableSlotCard from '../components/SwappableSlotCard';
import RequestSwapModal from '../components/RequestSwapModal';
import type { Event } from '../types/event';

// Static data for marketplace slots
const marketplaceSlots = [
  {
    id: 'm1',
    title: 'Product Strategy Meeting',
    description: 'Quarterly planning and roadmap discussion with product team',
    date: '2024-01-20',
    startTime: '09:00',
    endTime: '10:30',
    ownerName: 'John Smith',
    category: 'Meeting',
  },
  {
    id: 'm2',
    title: 'UX Workshop',
    description: 'Interactive workshop on user research methodologies',
    date: '2024-01-21',
    startTime: '14:00',
    endTime: '16:00',
    ownerName: 'Emily Davis',
    category: 'Workshop',
  },
  {
    id: 'm3',
    title: 'Code Review Session',
    description: 'Weekly code review for backend API changes',
    date: '2024-01-22',
    startTime: '11:00',
    endTime: '12:00',
    ownerName: 'Michael Chen',
    category: 'Review',
  },
  {
    id: 'm4',
    title: 'Sales Training',
    description: 'New product features training for sales team',
    date: '2024-01-23',
    startTime: '10:00',
    endTime: '11:30',
    ownerName: 'Sarah Johnson',
    category: 'Training',
  },
  {
    id: 'm5',
    title: 'Design Sprint Planning',
    description: 'Planning session for upcoming design sprint',
    date: '2024-01-24',
    startTime: '13:00',
    endTime: '14:30',
    ownerName: 'Alex Rivera',
    category: 'Meeting',
  },
  {
    id: 'm6',
    title: 'Technical Architecture Review',
    description: 'Review of system architecture and scalability plans',
    date: '2024-01-25',
    startTime: '15:00',
    endTime: '16:30',
    ownerName: 'David Park',
    category: 'Review',
  },
  {
    id: 'm7',
    title: 'Customer Feedback Session',
    description: 'Discussion of recent customer feedback and action items',
    date: '2024-01-26',
    startTime: '09:30',
    endTime: '11:00',
    ownerName: 'Lisa Anderson',
    category: 'Meeting',
  },
  {
    id: 'm8',
    title: 'Agile Methodology Workshop',
    description: 'Workshop on improving agile practices in the team',
    date: '2024-01-27',
    startTime: '14:00',
    endTime: '17:00',
    ownerName: 'Robert Martinez',
    category: 'Workshop',
  },
];

// Static user's swappable slots
const userSwappableSlots: Event[] = [
  {
    id: 'u1',
    title: 'Marketing Sync',
    description: 'Weekly marketing team synchronization',
    date: '2024-01-22',
    startTime: '10:00',
    endTime: '11:00',
    status: 'SWAPPABLE',
  },
  {
    id: 'u2',
    title: 'Budget Planning',
    description: 'Q1 budget review and planning',
    date: '2024-01-24',
    startTime: '15:00',
    endTime: '16:30',
    status: 'SWAPPABLE',
  },
  {
    id: 'u3',
    title: 'Team Retrospective',
    description: 'Sprint retrospective meeting',
    date: '2024-01-26',
    startTime: '16:00',
    endTime: '17:00',
    status: 'SWAPPABLE',
  },
];

export default function Marketplace() {
  const [user] = useState({
    name: 'Sarah Connor',
    email: 'sarah@gmail.com',
    avatar: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<typeof marketplaceSlots[0] | null>(null);

  const categories = ['All', 'Meeting', 'Workshop', 'Training', 'Review'];

  const filteredSlots = marketplaceSlots.filter((slot) => {
    const matchesSearch = slot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         slot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         slot.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || slot.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRequestSwap = (slotId: string) => {
    const slot = marketplaceSlots.find((s) => s.id === slotId);
    if (slot) {
      setSelectedSlot(slot);
      setIsModalOpen(true);
    }
  };

  const handleConfirmSwap = (targetSlotId: string, offerSlotId: string) => {
    console.log('Swap request:', { targetSlotId, offerSlotId });
    // TODO: Connect to API when backend is ready
    alert('Swap request sent successfully! The owner will be notified.');
  };

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
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Marketplace</h2>
            <p className="text-gray-600">
              Discover and swap time slots with other users
            </p>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              label="Available Slots"
              value={marketplaceSlots.length}
              icon={<Tickets size={24} />}
              color="purple"
            />
            <StatsCard
              label="Your Swappable"
              value={userSwappableSlots.length}
              icon={<ArrowRightLeft size={24} />}
              color="coral"
            />
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by title, description, or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-800">{filteredSlots.length}</span> available slot{filteredSlots.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Slots Grid */}
          {filteredSlots.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <p className="text-gray-500 text-lg mb-2">No slots found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSlots.map((slot) => (
                <SwappableSlotCard
                  key={slot.id}
                  slot={slot}
                  onRequestSwap={handleRequestSwap}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Request Swap Modal */}
      <RequestSwapModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
        }}
        targetSlot={selectedSlot}
        userSwappableSlots={userSwappableSlots}
        onConfirmSwap={handleConfirmSwap}
      />
    </div>
  );
}
