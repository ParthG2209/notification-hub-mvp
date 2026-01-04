import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';
import {
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Bell,
  Grid
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/burger-menu.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMenu();
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard-home',
      icon: LayoutDashboard,
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
    },
    {
      label: 'Integrations',
      href: '/integrations',
      icon: Grid,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Custom burger icon component
  const MenuToggleIcon = ({ open }) => (
    <svg
      strokeWidth={2.5}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 32 32"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-8 h-8 text-white transition-transform duration-500 ${open ? '-rotate-45' : ''}`}
    >
      <path
        className={`transition-all duration-500 ${
          open
            ? '[stroke-dasharray:20_300] [stroke-dashoffset:-32.42px]'
            : '[stroke-dasharray:12_63]'
        }`}
        d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
      />
      <path d="M7 16 27 16" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-black relative flex flex-col">
      {/* Grid Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: '#000000',
          backgroundImage: `
            linear-gradient(to right, rgba(75, 85, 99, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(75, 85, 99, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Menu Toggle Button */}
      <div className="fixed top-6 left-6 z-[1100]">
        <button onClick={toggleMenu} className="p-0 bg-transparent border-none cursor-pointer">
          <MenuToggleIcon open={menuOpen} />
        </button>
      </div>

      {/* Burger Menu */}
      <Menu
        isOpen={menuOpen}
        onStateChange={handleStateChange}
        width="280px"
        customBurgerIcon={false}
        customCrossIcon={false}
      >
        <div className="px-4 pb-6 mb-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Notification Hub</h2>
        </div>

        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`menu-item ${isActive(item.href) ? 'active' : ''}`}
              >
                <Icon />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {user && (
          <div className="menu-user-profile">
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="user-dropdown">
                  <div
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="user-dropdown-item logout"
                  >
                    <LogOut />
                    <span>Logout</span>
                  </div>
                </div>
              </>
            )}

            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="user-profile-button"
            >
              <div className="user-avatar">
                <UserIcon />
              </div>
              <div className="user-info">
                <p className="user-name">
                  {user.email?.split('@')[0] || 'User'}
                </p>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </Menu>

      {/* Main Content */}
      <div className="flex flex-1 flex-col w-full relative">
        <main className="p-6 flex-1 relative z-30 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;