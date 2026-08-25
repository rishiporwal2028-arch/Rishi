import React, { useState } from 'react';
import { PortfolioCompany, AlertItem, Sector } from '../types';

interface DashboardViewProps {
  companies: PortfolioCompany[];
  alerts: AlertItem[];
  onSelectCompany: (companyId: string) => void;
  onNavigateToInsights: () => void;
  onNavigateToActionPlans: () => void;
  onRunAIAudit: (companyId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onCreateTaskForCompany: (company: PortfolioCompany) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  companies,
  alerts,
  onSelectCompany,
  onNavigateToInsights,
  onNavigateToActionPlans,
  onRunAIAudit,
  onResolveAlert,
  onCreateTaskForCompany,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedHealth, setSelectedHealth] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'health' | 'arr' | 'runway'>('health');

  // Active Critical Alerts
  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');

  // Filtered companies
  let filtered = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector = selectedSector === 'All' || c.sector === selectedSector;
    const matchesHealth = selectedHealth === 'All' || c.healthStatus.toLowerCase() === selectedHealth.toLowerCase();

    return matchesSearch && matchesSector && matchesHealth;
  });

  // Sort
  if (sortBy === 'health') {
    filtered.sort((a, b) => b.healthScore - a.healthScore);
  } else if (sortBy === 'arr') {
    filtered.sort((a, b) => b.arr - a.arr);
  } else if (sortBy === 'runway') {
    filtered.sort((a, b) => a.runwayMonths - b.runwayMonths);
  }

  // Summary Metrics
  const totalARR = companies.reduce((sum, c) => sum + c.arr, 0);
  const avgHealth = Math.round(companies.reduce((sum, c) => sum + c.healthScore, 0) / (companies.length || 1));
  const optimalCount = companies.filter((c) => c.healthStatus === 'Optimal').length;
  const healthyCount = companies.filter((c) => c.healthStatus === 'Healthy').length;
  const atRiskCount = companies.filter((c) => c.healthStatus === 'At Risk').length;
  const criticalCount = companies.filter((c) => c.healthStatus === 'Critical').length;

  const sectorsList = ['All', ...Array.from(new Set(companies.map((c) => c.sector)))];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">Portfolio Health Dashboard</h1>
          <p className="text-xs text-outline mt-0.5">
            Real-time monitoring, financial vitals, and AI operational diagnostics across 15 ventures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToInsights}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error hover:bg-error/20 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-error/20"
          >
            <span className="material-symbols-outlined text-base">warning</span>
            <span>{criticalAlerts.length} Critical Alerts</span>
          </button>
          <button
            onClick={onNavigateToActionPlans}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-secondary/20"
          >
            <span className="material-symbols-outlined text-base">task_alt</span>
            <span>Action Board</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Companies */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-outline">Total Active Ventures</span>
            <span className="material-symbols-outlined text-secondary bg-secondary/10 p-1.5 rounded-lg text-lg">domain</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface font-mono">{companies.length}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <span className="material-symbols-outlined text-sm">trending_up</span> +2 this qtr
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-medium">{optimalCount + healthyCount} Healthy</span>
            <span className="text-amber-700 font-medium">{atRiskCount} At Risk</span>
            <span className="text-rose-700 font-bold">{criticalCount} Critical</span>
          </div>
        </div>

        {/* Card 2: Total Deployed & ARR */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-outline">Portfolio Total ARR</span>
            <span className="material-symbols-outlined text-emerald-600 bg-emerald-500/10 p-1.5 rounded-lg text-lg">payments</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface font-mono">${(totalARR / 1e6).toFixed(1)}M</span>
            <span className="text-xs text-emerald-600 font-semibold">+18.4% YoY</span>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/20 text-[11px] text-outline flex justify-between">
            <span>Fund Deployment</span>
            <span className="font-semibold text-on-surface font-mono">$450M Deployed</span>
          </div>
        </div>

        {/* Card 3: Avg Health Score */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-outline">Avg Portfolio Health</span>
            <span className="material-symbols-outlined text-secondary bg-secondary/10 p-1.5 rounded-lg text-lg">ecg</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface font-mono">{avgHealth}/100</span>
            <span className="text-xs text-emerald-600 font-semibold">+2.1 pts MoM</span>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/20 text-[11px] text-outline flex justify-between">
            <span>Health Status</span>
            <span className="font-semibold text-emerald-600">Stable Growth</span>
          </div>
        </div>

        {/* Card 4: Urgent Action Required */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-outline">Active Risk Alerts</span>
            <span className="material-symbols-outlined text-error bg-error/10 p-1.5 rounded-lg text-lg">warning</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface font-mono">{activeAlerts.length}</span>
            <span className="text-xs text-error font-semibold">{criticalAlerts.length} High Severity</span>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/20 text-[11px] text-outline flex justify-between">
            <span>Action Board Status</span>
            <button onClick={onNavigateToActionPlans} className="text-secondary font-semibold hover:underline cursor-pointer">
              View Tasks &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner Widget */}
      {criticalAlerts.length > 0 && (
        <div className="bg-error-container/20 border border-error/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-lg animate-bounce">warning</span>
              <span className="text-xs font-bold text-error uppercase tracking-wider">Critical Risk Items Requiring Partner Action</span>
            </div>
            <button onClick={onNavigateToInsights} className="text-xs font-semibold text-error hover:underline cursor-pointer">
              View All Alerts &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalAlerts.slice(0, 2).map((a) => (
              <div key={a.id} className="bg-surface-container-lowest p-3 rounded-lg border border-error/20 flex flex-col justify-between space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-error/10 text-error font-mono">{a.companyCode}</span>
                    <span className="text-xs font-bold text-on-surface">{a.companyName}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-error bg-error/10 px-2 py-0.5 rounded">{a.impact}</span>
                </div>

                <p className="text-xs text-on-surface-variant font-medium">{a.title}</p>

                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/10 text-[11px]">
                  <span className="text-outline">Source: {a.dataSource}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectCompany(a.companyId)}
                      className="text-secondary font-semibold hover:underline cursor-pointer"
                    >
                      Audit Venture
                    </button>
                    <button
                      onClick={() => onResolveAlert(a.id)}
                      className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Master Portfolio Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden">
        {/* Table Toolbar / Controls */}
        <div className="p-4 bg-surface-container-low/50 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-sm">search</span>
              <input
                type="text"
                placeholder="Filter by company name, sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>

            {/* Sector Dropdown */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="text-xs bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-on-surface focus:outline-none"
            >
              <option value="All">All Sectors</option>
              {sectorsList.filter((s) => s !== 'All').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Health Pills & Sorting */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-surface-container-lowest p-0.5 rounded-lg border border-outline-variant/30 text-xs">
              {['All', 'Optimal', 'Healthy', 'At Risk', 'Critical'].map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHealth(h)}
                  className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                    selectedHealth === h
                      ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-2 py-1.5 text-on-surface focus:outline-none font-medium"
            >
              <option value="health">Sort: Health Score</option>
              <option value="arr">Sort: ARR (High to Low)</option>
              <option value="runway">Sort: Runway (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-outline border-b border-outline-variant/20 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Sector & Stage</th>
                <th className="py-3 px-4">Health Vitals</th>
                <th className="py-3 px-4">ARR (USD)</th>
                <th className="py-3 px-4">MoM Burn & Runway</th>
                <th className="py-3 px-4">Gross Margin</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-outline text-xs">
                    No portfolio companies match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isRunwayCritical = c.runwayMonths < 6;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectCompany(c.id)}
                    >
                      {/* Name & Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-secondary-container/20 text-secondary font-bold text-xs flex items-center justify-center border border-secondary/20">
                            {c.code}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface text-xs group-hover:text-secondary transition-colors">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-outline font-mono">Updated {c.lastUpdated}</div>
                          </div>
                        </div>
                      </td>

                      {/* Sector & Stage */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-on-surface">{c.sector}</div>
                        <div className="text-[10px] text-outline">{c.stage} • Acquired {c.acquiredDate}</div>
                      </td>

                      {/* Health Vitals Score */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                              c.healthStatus === 'Optimal'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.healthStatus === 'Healthy'
                                ? 'bg-blue-100 text-blue-800'
                                : c.healthStatus === 'At Risk'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {c.healthScore}/100
                          </span>
                          <span className="text-[11px] font-semibold text-on-surface-variant">{c.healthStatus}</span>
                        </div>
                      </td>

                      {/* ARR */}
                      <td className="py-3 px-4 font-mono font-bold text-on-surface">
                        ${(c.arr / 1e6).toFixed(2)}M
                      </td>

                      {/* MoM Burn & Runway */}
                      <td className="py-3 px-4 font-mono">
                        <div className="text-on-surface">-${(c.burnRateMoM / 1e6).toFixed(2)}M / mo</div>
                        <div className={`text-[11px] font-bold ${isRunwayCritical ? 'text-error animate-pulse' : 'text-outline'}`}>
                          {c.runwayMonths} mos runway
                        </div>
                      </td>

                      {/* Gross Margin */}
                      <td className="py-3 px-4 font-mono font-semibold text-on-surface">
                        {c.grossMargin}%
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onRunAIAudit(c.id)}
                            className="p-1.5 hover:bg-secondary/10 text-secondary rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Run AI Diagnostic Audit"
                          >
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            <span className="hidden lg:inline">AI Audit</span>
                          </button>
                          <button
                            onClick={() => onCreateTaskForCompany(c)}
                            className="p-1.5 hover:bg-surface-container-high text-on-surface rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Assign Action Task"
                          >
                            <span className="material-symbols-outlined text-sm">add_task</span>
                          </button>
                          <button
                            onClick={() => onSelectCompany(c.id)}
                            className="p-1.5 hover:bg-secondary text-on-secondary rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
