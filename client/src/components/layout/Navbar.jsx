import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiSearch, 
  HiPlus, 
  HiBell, 
  HiMenu, 
  HiX,
  HiUser,
  HiCog,
  HiLogout,
  HiBookmark
} from 'react-icons/hi';
import Logo from '../common/Logo';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import useAuthStore from '../../stores/authStore';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-dark-300/95 backdrop-blur-lg border-b border-dark-50 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-400 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>

          <Logo />
        </div>

        {/* Center - Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <form onSubmit={handleSearch} className="w-full relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search discussions, users, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-dark-50 rounded-full
                         text-gray-100 placeholder-gray-500
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                         transition-all duration-200"
            />
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-primary transition-colors"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <HiSearch className="w-6 h-6" />
          </button>

          {isAuthenticated ? (
            <>
              {/* Create Post Button */}
              <Link to="/create">
                <Button variant="primary" size="sm" icon={HiPlus}>
                  <span className="hidden sm:inline">Create</span>
                </Button>
              </Link>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-primary transition-colors">
                <HiBell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-dark-100 transition-colors"
                >
                  <Avatar 
                    src={user?.avatar} 
                    alt={user?.displayName || user?.username} 
                    size="sm"
                  />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-dark-200 border border-dark-50 rounded-xl shadow-lg overflow-hidden"
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-dark-50">
                        <p className="font-semibold text-gray-100">{user?.displayName}</p>
                        <p className="text-sm text-gray-500">@{user?.username}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <ProfileMenuItem 
                          to={`/user/${user?.username}`} 
                          icon={HiUser}
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Profile
                        </ProfileMenuItem>
                        <ProfileMenuItem 
                          to="/bookmarks" 
                          icon={HiBookmark}
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Bookmarks
                        </ProfileMenuItem>
                        <ProfileMenuItem 
                          to="/settings" 
                          icon={HiCog}
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Settings
                        </ProfileMenuItem>
                        <hr className="my-2 border-dark-50" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-dark-100 transition-colors"
                        >
                          <HiLogout className="w-5 h-5" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-dark-50 bg-dark-300"
          >
            <form onSubmit={handleSearch} className="p-4">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-dark-50 rounded-lg
                             text-gray-100 placeholder-gray-500
                             focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 top-16 bg-dark/95 backdrop-blur-lg z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-64 h-full bg-dark-300 border-r border-dark-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile sidebar content */}
              <MobileNavLinks onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Profile Menu Item Component
const ProfileMenuItem = ({ to, icon: Icon, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-primary hover:bg-dark-100 transition-colors"
  >
    <Icon className="w-5 h-5" />
    {children}
  </Link>
);

// Mobile Navigation Links
const MobileNavLinks = ({ onClose }) => {
  const links = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/explore', label: 'Explore', icon: '🔍' },
    { to: '/categories', label: 'Categories', icon: '📂' },
    { to: '/trending', label: 'Trending', icon: '🔥' },
  ];

  return (
    <div className="space-y-2">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-dark-100 hover:text-primary transition-colors"
        >
          <span>{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </div>
  );
};

export default Navbar;
