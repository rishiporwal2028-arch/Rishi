import React, { useState } from 'react';
import { AlertItem, PortfolioCompany, AlertSeverity } from '../types';

interface InsightsViewProps {
  alerts: AlertItem[];
  companies: PortfolioCompany[];
  onSelectCompany: (companyId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onArchiveAlert: (alertId: string) => void;
  onAddAlertNote: (alertId: string, note: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  alerts,
  companies,
  onSelectCompany,
  onResolveAlert,
  onArchiveAlert,
  onAddAlertNote,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [noteInputs, setNoteInputs] = useState<{ [key: string]: string }>({});

  const activeAlerts = alerts.filter((a) => a.status === 'active');

  const filteredAlerts = activeAlerts.filter((a) => {
    if (filterSeverity === 'All') return true;
    return a.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter((a) => a.severity === 'warning').length;

  const handleNoteSubmit = (alertId: string) => {
    const text = noteInputs[alertId];
    if (text && text.trim()) {
      onAddAlertNote(alertId, text.trim());
      setNoteInputs((prev) => ({ ...prev, [alertId]: '' }));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">AI Insights & Risk Alerts</h1>
          <p className="text-xs text-outline mt-0.5">
            Real-time automated detection of revenue drops, runway shortfalls, CAC spikes, and unit margin contractions.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-error/10 text-error px-3 py-1.5 rounded-lg border border-error/20 font-bold">
            {criticalCount} Critical
          </div>
          <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 font-bold">
            {warningCount} Warning
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/30 shadow-xs">
        <div className="flex gap-1">
          {['All', 'Critical', 'Warning', 'Info'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterSeverity === s
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {s} {s === 'Critical' && `(${criticalCount})`}
            </button>
          ))}
        </div>
        <span className="text-xs text-outline hidden sm:inline">Showing {filteredAlerts.length} active risk triggers</span>
      </div>

      {/* Grid Layout: Main Alerts + Sidebar Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Alert Cards */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2">check_circle</span>
              <div className="text-sm font-bold text-on-surface">No Active Alerts in this Category</div>
              <p className="text-xs text-outline mt-1">All portfolio risk indicators are currently within optimal thresholds.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const comp = companies.find((c) => c.id === alert.companyId || c.code === alert.companyCode);
              return (
                <div
                  key={alert.id}
                  className={`bg-surface-container-lowest p-4 rounded-2xl border transition-all shadow-xs space-y-3 ${
                    alert.severity === 'critical'
                      ? 'border-error/40 bg-error/5'
                      : alert.severity === 'warning'
                      ? 'border-amber-400/40'
                      : 'border-outline-variant/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center font-mono ${
                          alert.severity === 'critical'
                            ? 'bg-error text-on-error'
                            : alert.severity === 'warning'
                            ? 'bg-amber-400 text-amber-950'
                            : 'bg-secondary text-on-secondary'
                        }`}
                      >
                        {alert.companyCode}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-on-surface">{alert.companyName}</span>
                          <span className="text-[10px] text-outline font-mono">• {alert.timestamp}</span>
                        </div>
                        <h3 className="text-xs font-bold text-on-surface mt-0.5">{alert.title}</h3>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-error bg-error/10 border border-error/20 px-2.5 py-1 rounded-md">
                      {alert.impact}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed">{alert.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 text-xs">
                    <div className="text-[11px] text-outline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">hub</span>
                      <span>Source: {alert.dataSource}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectCompany(alert.companyId)}
                        className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
                      >
                        Explore Company &rarr;
                      </button>
                      <button
                        onClick={() => onResolveAlert(alert.id)}
                        className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] rounded-md transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => onArchiveAlert(alert.id)}
                        className="px-2 py-1 text-outline hover:text-on-surface text-[11px] rounded cursor-pointer"
                      >
                        Archive
                      </button>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {alert.notes && alert.notes.length > 0 && (
                    <div className="pt-2 border-t border-outline-variant/10 space-y-1">
                      <div className="text-[10px] font-bold text-outline uppercase tracking-wider">Partner Notes:</div>
                      {alert.notes.map((n, idx) => (
                        <div key={idx} className="text-[11px] text-on-surface bg-surface-container-low p-2 rounded-lg italic">
                          "{n}"
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Note Input */}
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add partner observation or action note..."
                      value={noteInputs[alert.id] || ''}
                      onChange={(e) => setNoteInputs({ ...noteInputs, [alert.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleNoteSubmit(alert.id)}
                      className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-lg px-2.5 py-1 text-xs text-on-surface focus:outline-none"
                    />
                    <button
                      onClick={() => handleNoteSubmit(alert.id)}
                      className="bg-surface-container-high hover:bg-outline-variant/30 text-on-surface text-xs px-2.5 py-1 rounded-lg font-semibold cursor-pointer"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar: Systemic Risk Radar */}
        <div className="space-y-4">
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">radar</span>
              <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider">Systemic Risk Radar</h2>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-error/5 border border-error/20 rounded-xl space-y-1">
                <div className="font-bold text-error flex justify-between">
                  <span>GPU & Compute Cost Burn</span>
                  <span>High Impact</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Affecting 3 AI/Deep Tech portfolio companies (Overture AI, Lumina Health). Infrastructure cost scaling faster than ARR expansion.
                </p>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-400/30 rounded-xl space-y-1">
                <div className="font-bold text-amber-800 flex justify-between">
                  <span>CAC Inflation (+35% MoM)</span>
                  <span>Medium Risk</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Paid advertising channels seeing saturation across Fintech cohort (Nexus Tech, QuantumPay).
                </p>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl space-y-1 border border-outline-variant/20">
                <div className="font-bold text-on-surface flex justify-between">
                  <span>Runway Under 6 Months</span>
                  <span>3 Companies</span>
                </div>
                <p className="text-[11px] text-outline">
                  Nexus Tech (2.5m), QuantumPay (3.5m), BioGenetics (4.0m). Emergency capital planning advised.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
