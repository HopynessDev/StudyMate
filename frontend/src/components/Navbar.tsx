import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  BarChart3,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/materials', icon: BookOpen, label: 'Materials' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
    { path: '/progress', icon: BarChart3, label: 'Progress' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              StudyMate
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Hello, {user?.username}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-gray-200">
              <div className="px-3 py-2 text-sm text-gray-600">
                <span className="font-medium">Hello, {user?.username}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;