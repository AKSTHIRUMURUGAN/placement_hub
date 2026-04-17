'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Briefcase, 
  FileText, 
  BarChart3,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { authManager, makeAuthenticatedRequest } from '@/lib/utils/clientAuth';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface StudentNavbarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
  avatarUrl?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Drives', href: '/drives', icon: Briefcase },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Vault', href: '/vault', icon: User },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

export function StudentNavbar({ user, avatarUrl }: StudentNavbarProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    // Fetch notification count
    const fetchNotifications = async () => {
      try {
        const response = await makeAuthenticatedRequest('/api/notifications');
        const data = await response.json();
        if (data.success) {
          const unreadCount = data.data.notifications.filter((n: any) => !n.isRead).length;
          setNotifications(unreadCount);
        }
      } catch (error) {
        // Silently fail for notifications
      }
    };

    if (authManager.isAuthenticated()) {
      fetchNotifications();
    }
  }, []);

  const handleLogout = () => {
    toast.success('Logged out successfully');
    authManager.signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PH</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 hidden sm:block">
                PlacementHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                    {item.name === 'Notifications' && notifications > 0 && (
                      <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                        {notifications}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Profile and Mobile menu */}
          <div className="flex items-center space-x-4">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-semibold text-sm">
                      {user ? getInitials(user.name) : 'U'}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role || 'Student'}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile Settings
                  </Link>
                  
                  <Link
                    href="/vault"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Career Vault
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-md text-base font-medium',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                    {item.name === 'Notifications' && notifications > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">
                        {notifications}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </nav>
  );
}