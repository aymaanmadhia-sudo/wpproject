import React, { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Boxes,
  PlusCircle,
  BellRing,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBanner from './StatusBanner';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/items', label: 'My Items', icon: Boxes },
    { to: '/items/add', label: 'Add Item', icon: PlusCircle },
    { to: '/reminders', label: 'Warranty Reminders', icon: BellRing },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/40 text-stone-900">
      <StatusBanner />

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-bold text-base tracking-tight text-stone-900">ProofPocket</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                        }`
                      }
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* User Profile & Logout */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-stone-100/80 border border-stone-200 text-xs">
                <div className="w-5 h-5 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
                <span className="font-medium text-stone-800">{user?.name || 'Account'}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile trigger */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <div className="py-2 mb-2 border-b border-stone-100 flex items-center justify-between text-xs text-stone-600">
              <span className="font-medium text-stone-900">{user?.name}</span>
              <span className="text-[11px] text-stone-500">{user?.email}</span>
            </div>

            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <span>ProofPocket</span>
          <span>Purchases, receipts &amp; warranty tracker</span>
        </div>
      </footer>
    </div>
  );
}
