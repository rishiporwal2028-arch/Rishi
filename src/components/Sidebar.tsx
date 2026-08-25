import React from 'react';

export type ActiveTab = 'dashboard' | 'portfolio' | 'insights' | 'action_plans' | 'reports' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  criticalAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, criticalAlertCount }) => {
  const navItems: { id: ActiveTab; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'portfolio', label: 'Portfolio', icon: 'domain' },
    { id: 'insights', label: 'Insights & Alerts', icon: 'notifications_active', badge: criticalAlertCount },
    { id: 'action_plans', label: 'Action Plans', icon: 'checklist' },
    { id: 'reports', label: 'Reports & Docs', icon: 'description' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="w-16 md:w-60 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col justify-between select-none shrink-0 transition-all">
      {/* Navigation list */}
      <div className="py-4 px-2 md:px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-outline hidden md:block">
          Operating Partner OS
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-center md:justify-between px-2.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-secondary text-on-secondary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
              title={item.label}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-lg ${isActive ? 'text-on-secondary' : 'text-outline'}`}>
                  {item.icon}
                </span>
                <span className="hidden md:inline">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`hidden md:inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold font-mono rounded-full ${
                    isActive ? 'bg-on-secondary text-secondary' : 'bg-error text-on-error'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Fund Info Box */}
      <div className="p-3 m-2 bg-surface-container-low rounded-xl border border-outline-variant/20 hidden md:block">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-sm text-secondary">auto_awesome</span>
          <span className="text-xs font-bold text-on-surface">Alpha Capital Fund I</span>
        </div>
        <div className="text-[11px] text-outline font-mono">15 Active Co's • $450M</div>
        <div className="w-full bg-outline-variant/30 h-1.5 rounded-full mt-2 overflow-hidden">
          <div className="bg-secondary h-full rounded-full" style={{ width: '68%' }} />
        </div>
        <div className="text-[10px] text-outline mt-1 flex justify-between">
          <span>Deployment</span>
          <span className="font-semibold text-on-surface">68%</span>
        </div>
      </div>
    </aside>
  );
};
