import React, { useState, useEffect } from 'react';
import { User, NotificationItem, PortfolioCompany } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenAddCompany: () => void;
  onOpenSettings: () => void;
  onSelectCompany: (companyId: string) => void;
  companies: PortfolioCompany[];
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenAddCompany,
  onOpenSettings,
  onSelectCompany,
  companies,
  notifications,
  onMarkNotificationRead,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredCompanies = searchQuery.trim()
    ? companies.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.sector.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close menus on click outside
  useEffect(() => {
    const handleClick = () => {
      setIsNotifOpen(false);
      setIsUserMenuOpen(false);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant/30 px-4 md:px-6 py-3 flex items-center justify-between shadow-xs">
      {/* Brand & Workspace */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-lg shadow-xs">
            P
          </div>
          <span className="font-bold text-lg tracking-tight text-on-surface">
            Portfolio<span className="text-secondary">Pilot</span> <span className="text-xs bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full uppercase font-mono tracking-wider ml-0.5">AI</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-outline-variant/40">
          <span className="material-symbols-outlined text-sm text-outline">corporate_fare</span>
          <span className="text-xs font-semibold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md border border-outline-variant/20">
            Alpha Capital • Fund I ($450M)
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="relative max-w-md w-full mx-4 hidden md:block">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-lg">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search companies, metrics, ticker (e.g., 'EcoFlow', 'EF')..."
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-outline bg-surface-container-lowest border border-outline-variant/40 rounded shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 border-b border-outline-variant/20 text-[11px] font-semibold text-outline uppercase tracking-wider">
              Portfolio Companies ({filteredCompanies.length})
            </div>
            {filteredCompanies.length === 0 ? (
              <div className="p-4 text-xs text-outline text-center">No matching companies found</div>
            ) : (
              filteredCompanies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCompany(c.id);
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-surface-container-low flex items-center justify-between transition-colors border-b border-outline-variant/10 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-secondary-container/20 text-secondary font-bold text-xs flex items-center justify-center">
                      {c.code}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-on-surface">{c.name}</div>
                      <div className="text-[11px] text-outline">{c.sector} • {c.stage}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-on-surface">${(c.arr / 1e6).toFixed(1)}M ARR</div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        c.healthStatus === 'Optimal' || c.healthStatus === 'Healthy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Score: {c.healthScore}/100
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Onboard Company Button */}
        <button
          onClick={onOpenAddCompany}
          className="flex items-center gap-1.5 bg-secondary text-on-secondary hover:bg-secondary/90 px-3 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add_business</span>
          <span className="hidden sm:inline">Add Company</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error font-mono text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                <div className="font-semibold text-xs text-on-surface">Notifications ({unreadCount} unread)</div>
                <button
                  onClick={() => notifications.forEach((n) => onMarkNotificationRead(n.id))}
                  className="text-[11px] text-secondary hover:underline cursor-pointer font-medium"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/10">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-outline">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-3 hover:bg-surface-container-low transition-colors cursor-pointer flex gap-3 ${
                        !n.read ? 'bg-secondary/5' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        <span
                          className={`material-symbols-outlined text-lg ${
                            n.type === 'critical' ? 'text-error' : n.type === 'recommendation' ? 'text-secondary' : 'text-emerald-600'
                          }`}
                        >
                          {n.type === 'critical' ? 'warning' : n.type === 'recommendation' ? 'auto_awesome' : 'description'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-on-surface flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-outline font-normal">{n.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">{n.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container font-bold text-xs flex items-center justify-center border border-outline-variant/40 shadow-xs">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-on-surface leading-none">{user.name}</div>
              <div className="text-[10px] text-outline leading-tight mt-0.5">{user.role}</div>
            </div>
            <span className="material-symbols-outlined text-base text-outline hidden lg:inline">arrow_drop_down</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl z-50 overflow-hidden py-1">
              <div className="px-3 py-2 border-b border-outline-variant/20">
                <div className="text-xs font-bold text-on-surface">{user.name}</div>
                <div className="text-[11px] text-outline truncate">{user.email}</div>
                <div className="mt-1 inline-block text-[10px] bg-secondary/10 text-secondary font-semibold px-2 py-0.5 rounded">
                  {user.role} • Alpha Capital
                </div>
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-base text-outline">settings</span>
                Workspace Settings
              </button>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 text-xs text-error hover:bg-error-container/20 flex items-center gap-2 cursor-pointer transition-colors border-t border-outline-variant/10 mt-1"
              >
                <span className="material-symbols-outlined text-base text-error">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
