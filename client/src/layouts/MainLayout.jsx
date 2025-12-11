import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import useAuthStore from '../stores/authStore';

const MainLayout = () => {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-400">Loading Thinkify...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-16">
        {/* Sidebar - Hidden on mobile */}
        <aside className="hidden lg:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] overflow-y-auto border-r border-dark-50 bg-dark-300/50">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="container mx-auto px-4 py-6 max-w-4xl"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Right Sidebar - Hidden on tablet and mobile */}
        <aside className="hidden xl:block fixed right-0 top-16 w-80 h-[calc(100vh-4rem)] overflow-y-auto border-l border-dark-50 bg-dark-300/50 p-4">
          <TrendingSection />
        </aside>
      </div>
    </div>
  );
};

// Trending Section Component
const TrendingSection = () => {
  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <span className="text-primary">🔥</span> Trending
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Who to Follow */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <span className="text-primary">👥</span> Who to Follow
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="skeleton h-4 w-24 mb-1" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="text-xs text-gray-500 space-y-2">
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:text-primary transition-colors">About</a>
          <span>·</span>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <span>·</span>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <span>·</span>
          <a href="#" className="hover:text-primary transition-colors">Help</a>
        </div>
        <p>© 2024 Thinkify. All rights reserved.</p>
      </div>
    </div>
  );
};

export default MainLayout;
