import React, { useState } from 'react';
import { WorkspaceSettings, UserRole } from '../types';

interface SettingsViewProps {
  settings: WorkspaceSettings;
  onUpdateSettings: (newSettings: Partial<WorkspaceSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'integrations' | 'apikeys' | 'billing'>('profile');
  const [firmName, setFirmName] = useState(settings.organizationName);
  const [fundName, setFundName] = useState(settings.fundName);

  // Invite team member modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Associate');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      organizationName: firmName,
      fundName: fundName,
    });
    alert('Workspace details updated successfully.');
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newUsers = [
      ...settings.users,
      {
        id: 'usr-' + Date.now(),
        name: inviteName.trim() || inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'Pending' as const,
      },
    ];

    onUpdateSettings({ users: newUsers });
    setInviteName('');
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  const toggleIntegration = (name: string) => {
    const updated = settings.connectedIntegrations.map((i) => {
      if (i.name === name) {
        return {
          ...i,
          status: i.status === 'Connected' ? ('Disconnected' as const) : ('Connected' as const),
          lastSync: i.status === 'Connected' ? 'Never' : 'Just now',
        };
      }
      return i;
    });
    onUpdateSettings({ connectedIntegrations: updated });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-outline mt-0.5">Manage fund workspace, team roles, API keys, and data sync integrations.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 bg-surface-container-lowest p-1 rounded-xl gap-1 overflow-x-auto">
        {[
          { id: 'profile', label: 'Fund Profile', icon: 'corporate_fare' },
          { id: 'team', label: `Team (${settings.users.length})`, icon: 'group' },
          { id: 'integrations', label: 'Integrations', icon: 'hub' },
          { id: 'apikeys', label: 'API Keys', icon: 'key' },
          { id: 'billing', label: 'Billing & Plan', icon: 'credit_card' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id ? 'bg-secondary text-on-secondary shadow-xs' : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content 1: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-on-surface border-b border-outline-variant/20 pb-2">Firm & Fund Profile</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-outline font-semibold mb-1">Venture Firm Name</label>
              <input
                type="text"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5 text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">Primary Active Fund</label>
              <input
                type="text"
                value={fundName}
                onChange={(e) => setFundName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5 text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button type="submit" className="bg-secondary text-on-secondary px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer">
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* Content 2: Team */}
      {activeTab === 'team' && (
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <h2 className="text-sm font-bold text-on-surface">Team Members & Role Access</h2>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="bg-secondary text-on-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Invite Member
            </button>
          </div>

          <div className="divide-y divide-outline-variant/10 text-xs">
            {settings.users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold text-xs flex items-center justify-center">
                    {u.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">{u.name}</div>
                    <div className="text-[11px] text-outline">{u.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded text-[10px]">{u.role}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {u.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content 3: Integrations */}
      {activeTab === 'integrations' && (
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-on-surface border-b border-outline-variant/20 pb-2">Automated Portfolio Data Connectors</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.connectedIntegrations.map((item) => (
              <div key={item.name} className="p-4 bg-surface-container-low/40 rounded-xl border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-on-surface">{item.name} Sync</div>
                    <div className="text-[10px] text-outline">Last Sync: {item.lastSync}</div>
                  </div>
                </div>

                <button
                  onClick={() => toggleIntegration(item.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    item.status === 'Connected' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-surface-container-high text-outline hover:text-on-surface'
                  }`}
                >
                  {item.status}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant/40 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="text-sm font-bold text-on-surface">Invite Partner or Team Member</h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-outline font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Business Email</label>
                <input
                  type="email"
                  required
                  placeholder="elena.r@alphacapital.vc"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Role Permission</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                >
                  <option value="Partner">Partner (Full Access)</option>
                  <option value="Principal">Principal (Lead Deal Access)</option>
                  <option value="Associate">Associate (Data Room Access)</option>
                  <option value="Analyst">Analyst (Read Only)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsInviteOpen(false)} className="px-3 py-1.5 text-outline">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-secondary text-on-secondary font-bold rounded-lg cursor-pointer">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
