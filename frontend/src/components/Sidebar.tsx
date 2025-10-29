import { Home, BarChart3, List, Clock, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: List, label: 'Marketplace', path: '/marketplace' },
  { icon: Clock, label: 'Requests', path: '/requests' },
  { icon: Settings, label: 'Setting', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-purple-50 text-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
