import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  HiHome, 
  HiGlobe, 
  HiFire, 
  HiBookmark,
  HiCog 
} from 'react-icons/hi';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const Sidebar = () => {
  const { isAuthenticated } = useAuthStore();

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  const categories = categoriesData?.categories || [];

  const mainLinks = [
    { to: '/', label: 'Home', icon: HiHome },
    { to: '/explore', label: 'Explore', icon: HiGlobe },
    { to: '/trending', label: 'Trending', icon: HiFire },
  ];

  const userLinks = [
    { to: '/bookmarks', label: 'Bookmarks', icon: HiBookmark },
    { to: '/settings', label: 'Settings', icon: HiCog },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Main Navigation */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
          Menu
        </h3>
        <nav className="space-y-1">
          {mainLinks.map((link) => (
            <SidebarLink key={link.to} {...link} />
          ))}
        </nav>
      </div>

      {/* User Links (if authenticated) */}
      {isAuthenticated && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Personal
          </h3>
          <nav className="space-y-1">
            {userLinks.map((link) => (
              <SidebarLink key={link.to} {...link} />
            ))}
          </nav>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
          Categories
        </h3>
        <nav className="space-y-1">
          {categories.slice(0, 8).map((category) => (
            <NavLink
              key={category._id}
              to={`/category/${category.slug}`}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-400 hover:bg-dark-100 hover:text-gray-200'
                }
              `}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm truncate">{category.name}</span>
              {category.postCount > 0 && (
                <span className="ml-auto text-xs text-gray-500">
                  {category.postCount}
                </span>
              )}
            </NavLink>
          ))}
          {categories.length > 8 && (
            <NavLink
              to="/categories"
              className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:underline"
            >
              View all categories →
            </NavLink>
          )}
        </nav>
      </div>

      {/* Popular Tags */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2 px-3">
          {['javascript', 'react', 'webdev', 'programming', 'design', 'ai'].map((tag) => (
            <NavLink
              key={tag}
              to={`/tag/${tag}`}
              className="badge-secondary hover:bg-primary/20 hover:text-primary transition-colors"
            >
              #{tag}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sidebar Link Component
const SidebarLink = ({ to, label, icon: Icon }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
      ${isActive 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-gray-400 hover:bg-dark-100 hover:text-gray-200'
      }
    `}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </NavLink>
);

export default Sidebar;
