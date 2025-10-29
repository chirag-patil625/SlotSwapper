import { useState, useEffect } from 'react';
import { Search, Tickets, ArrowRightLeft, Calendar, List, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import SwappableSlotCard from '../components/SwappableSlotCard';
import RequestSwapModal from '../components/RequestSwapModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { swapAPI } from '../services/api';

export default function Marketplace() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [marketplaceSlots, setMarketplaceSlots] = useState<any[]>([]);
  const [userSwappableSlots, setUserSwappableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsData, mySwappableData] = await Promise.all([
        swapAPI.getSwappableSlots(),
        swapAPI.getMySwappableSlots(),
      ]);
      
      setMarketplaceSlots(slotsData);
      
      // Transform user's swappable slots
      const transformedUserSlots = mySwappableData.map((slot: any) => ({
        id: slot._id,
        title: slot.title,
        description: slot.description,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
      }));
      setUserSwappableSlots(transformedUserSlots);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch marketplace data');
      console.error('Error fetching marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = (slotId: string) => {
    const slot = marketplaceSlots.find((s) => s.id === slotId);
    if (slot) {
      setSelectedSlot(slot);
      setIsModalOpen(true);
    }
  };

  const handleConfirmSwap = async (targetSlotId: string, offerSlotId: string) => {
    try {
      // Optimistically remove the slot from marketplace
      setMarketplaceSlots(prev => prev.filter(slot => slot.id !== targetSlotId));
      
      // Optimistically update user's swappable slots
      setUserSwappableSlots(prev => prev.filter(slot => slot.id !== offerSlotId));
      
      const result = await swapAPI.createSwapRequest(offerSlotId, targetSlotId);
      showToast(result.message || 'Swap request sent successfully!', 'success');
      
      setIsModalOpen(false);
      setSelectedSlot(null);
    } catch (err: any) {
      // Revert on error
      await fetchData();
      showToast(err.message || 'Failed to create swap request', 'error');
    }
  };

  const filteredSlots = marketplaceSlots.filter((slot) => {
    const matchesSearch = slot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         slot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         slot.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  // Add check for user authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view the marketplace</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 lg:pb-0">
      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar - Hidden on mobile */}
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
        <main className="flex-1 p-4 md:p-8">
          {/* Header */}
          <header className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Marketplace</h2>
            <p className="text-sm md:text-base text-gray-600">
              Discover and swap time slots with other users
            </p>
          </header>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
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

          {/* Search Bar */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6 md:mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 md:mb-6">
            <p className="text-base md:text-lg font-semibold text-gray-800">
              {filteredSlots.length} Available Slot{filteredSlots.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Slots Grid */}
          {filteredSlots.length === 0 ? (
            <div className="text-center py-12 md:py-16 bg-white rounded-xl">
              <p className="text-gray-500 text-base md:text-lg mb-2">No slots found</p>
              <p className="text-sm md:text-base text-gray-400">
                {marketplaceSlots.length === 0
                  ? 'No swappable slots available at the moment'
                  : 'Try adjusting your search'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredSlots.map((slot) => (
                <SwappableSlotCard key={slot.id} slot={slot} onRequestSwap={handleRequestSwap} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 shadow-lg">
        <div className="flex justify-around items-center">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-600 transition-all hover:scale-105 hover:text-purple-600">
            <Calendar size={20} />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link to="/marketplace" className="flex flex-col items-center gap-1 text-purple-600 transition-all hover:scale-105">
            <List size={20} />
            <span className="text-xs">Marketplace</span>
          </Link>
          <Link to="/requests" className="flex flex-col items-center gap-1 text-gray-600 transition-all hover:scale-105 hover:text-purple-600">
            <Bell size={20} />
            <span className="text-xs">Requests</span>
          </Link>
        </div>
      </nav>

      {/* Modals */}
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