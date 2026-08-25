import React, { useState } from 'react';
import { PortfolioCompany, Sector } from '../types';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCompany: (companyData: Partial<PortfolioCompany>) => void;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onAddCompany }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [sector, setSector] = useState<Sector>('SaaS / Enterprise');
  const [stage, setStage] = useState('Series A');
  const [arr, setArr] = useState('5000000');
  const [burnRateMoM, setBurnRateMoM] = useState('400000');
  const [runwayMonths, setRunwayMonths] = useState('18');
  const [grossMargin, setGrossMargin] = useState('72');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCompany({
      name: name.trim(),
      code: code.trim() || name.slice(0, 2).toUpperCase(),
      sector,
      stage,
      arr: Number(arr) || 5000000,
      burnRateMoM: Number(burnRateMoM) || 400000,
      runwayMonths: Number(runwayMonths) || 18,
      grossMargin: Number(grossMargin) || 72,
      description: description.trim(),
      healthScore: 85,
      healthStatus: 'Healthy',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl border border-outline-variant/40 shadow-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">add_business</span>
            <h2 className="text-sm font-bold text-on-surface">Onboard New Portfolio Venture</h2>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface cursor-pointer">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-outline font-semibold mb-1">Company Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Cloud Solutions"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="block text-outline font-semibold mb-1">Ticker / Code</label>
              <input
                type="text"
                placeholder="AC"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 font-mono uppercase text-on-surface focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-semibold mb-1">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as Sector)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
              >
                <option value="SaaS / Enterprise">SaaS / Enterprise</option>
                <option value="Deep Tech">Deep Tech</option>
                <option value="Fintech">Fintech</option>
                <option value="Supply Chain">Supply Chain</option>
                <option value="Cleantech Hardware">Cleantech Hardware</option>
                <option value="HealthTech">HealthTech</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>
            <div>
              <label className="block text-outline font-semibold mb-1">Investment Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
              >
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
                <option value="Series C">Series C</option>
                <option value="Growth">Growth</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-outline font-semibold mb-1">ARR (USD)</label>
              <input
                type="number"
                value={arr}
                onChange={(e) => setArr(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 font-mono text-on-surface focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-outline font-semibold mb-1">MoM Burn ($)</label>
              <input
                type="number"
                value={burnRateMoM}
                onChange={(e) => setBurnRateMoM(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 font-mono text-on-surface focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-outline font-semibold mb-1">Runway (Mos)</label>
              <input
                type="number"
                value={runwayMonths}
                onChange={(e) => setRunwayMonths(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 font-mono text-on-surface focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-outline font-semibold mb-1">Core Description</label>
            <textarea
              rows={2}
              placeholder="Enterprise software company focused on..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-outline hover:text-on-surface">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-secondary text-on-secondary font-bold rounded-lg shadow-xs hover:bg-secondary/90 cursor-pointer"
            >
              Onboard Venture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
