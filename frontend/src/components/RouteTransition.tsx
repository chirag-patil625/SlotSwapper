import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function RouteTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 400); // 400ms transition delay

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-white z-[9999] flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-purple-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-purple-600 font-semibold text-lg animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
