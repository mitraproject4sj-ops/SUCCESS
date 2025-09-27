import React, { useState } from 'react';
import { useWindowSize, useOrientation, useSwipe } from '../utils/responsiveHooks';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const { isMobile, isTablet } = useWindowSize();
  const orientation = useOrientation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState(0);

  // Split children into views for mobile
  const childrenArray = React.Children.toArray(children);
  const totalViews = childrenArray.length;

  useSwipe({
    onSwipeLeft: () => {
      if (currentView < totalViews - 1) {
        setCurrentView(prev => prev + 1);
      }
    },
    onSwipeRight: () => {
      if (currentView > 0) {
        setCurrentView(prev => prev - 1);
      }
    }
  });

  if (!isMobile && !isTablet) {
    return <div className="p-4">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-2"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-white font-semibold">LAKSHYA Trading System</h1>
          <div className="w-8" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/95 mt-16">
          <nav className="p-4">
            {/* Add navigation items here */}
          </nav>
        </div>
      )}

      {/* Mobile Content */}
      <main className="pt-16 pb-20">
        <div
          className="transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentView * 100}%)`,
            width: `${totalViews * 100}%`,
            display: 'flex'
          }}
        >
          {childrenArray.map((child, index) => (
            <div
              key={index}
              className="min-w-full px-4 py-2"
            >
              {child}
            </div>
          ))}
        </div>
      </main>

      {/* Mobile Navigation Dots */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center space-x-2">
        {Array.from({ length: totalViews }).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentView ? 'bg-cyan-500' : 'bg-slate-600'
            }`}
            onClick={() => setCurrentView(index)}
          />
        ))}
      </div>

      {/* Mobile View Navigation */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-between px-4">
        {currentView > 0 && (
          <button
            onClick={() => setCurrentView(prev => prev - 1)}
            className="p-2 bg-slate-800 rounded-full text-white"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {currentView < totalViews - 1 && (
          <button
            onClick={() => setCurrentView(prev => prev + 1)}
            className="p-2 bg-slate-800 rounded-full text-white ml-auto"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Orientation Warning */}
      {isMobile && orientation === 'landscape' && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center text-white">
          <div className="text-center p-4">
            <p>Please rotate your device to portrait mode for better experience.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveLayout;