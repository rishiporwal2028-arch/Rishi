import React, { useState } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { PortfolioCompany, DocumentItem, FounderUpdate, ActionTask } from '../types';

interface CompanyDetailViewProps {
  company: PortfolioCompany;
  onBack: () => void;
  onRunAIAudit: (companyId: string) => void;
  documents: DocumentItem[];
  updates: FounderUpdate[];
  tasks: ActionTask[];
  onUploadDocument: (companyId: string) => void;
  onCreateUpdate: (companyId: string) => void;
  onCreateTask: (companyId: string) => void;
  onAskAIChat: (companyId: string, query: string) => Promise<string>;
  isAILoading: boolean;
}

export const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({
  company,
  onBack,
  onRunAIAudit,
  documents,
  updates,
  tasks,
  onUploadDocument,
  onCreateUpdate,
  onCreateTask,
  onAskAIChat,
  isAILoading,
}) => {
  const [activeTab, setActiveTab] = useState<'financials' | 'documents' | 'updates' | 'tasks'>('financials');
  const [chatQuery, setChatQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([
    {
      sender: 'assistant',
      text: `Hello, I'm PortfolioPilot AI for ${company.name}. You can ask me any financial, operational, or valuation questions about this company.`,
    },
  ]);
  const [isChatSending, setIsChatSending] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const companyDocs = documents.filter((d) => d.companyId === company.id || d.companyName === company.name);
  const companyUpdates = updates.filter((u) => u.companyId === company.id || u.companyName === company.name);
  const companyTasks = tasks.filter((t) => t.companyId === company.id || t.companyName === company.name);

  // Financial chart data formatting
  const chartData = company.financials.map((f) => ({
    quarter: f.quarter,
    Revenue: f.revenue / 1e6,
    COGS: f.cogs / 1e6,
    GrossProfit: f.grossProfit / 1e6,
    OpEx: f.operatingExpenses / 1e6,
    NetIncome: f.netIncome / 1e6,
  }));

  const handleSendChat = async () => {
    if (!chatQuery.trim() || isChatSending) return;
    const userText = chatQuery.trim();
    setChatQuery('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsChatSending(true);

    try {
      const reply = await onAskAIChat(company.id, userText);
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: 'Sorry, I encountered an error retrieving company analysis.' }]);
    } finally {
      setIsChatSending(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-outline font-medium">
          <button onClick={onBack} className="hover:text-on-surface transition-colors cursor-pointer">
            Portfolio
          </button>
          <span>/</span>
          <span className="text-on-surface font-semibold">{company.name} ({company.code})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-secondary/20"
          >
            <span className="material-symbols-outlined text-base">chat</span>
            <span>AI Copilot</span>
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container-high rounded-lg text-xs font-semibold text-on-surface transition-all cursor-pointer border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back
          </button>
        </div>
      </div>

      {/* Header Vitals Card */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary font-bold text-lg flex items-center justify-center border border-secondary/30 shadow-xs">
              {company.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">{company.name}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                    company.healthStatus === 'Optimal' || company.healthStatus === 'Healthy'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Score: {company.healthScore}/100 • {company.healthStatus}
                </span>
              </div>
              <p className="text-xs text-outline mt-0.5">
                {company.sector} • {company.stage} • Partner Lead: Sarah Jenkins • Acquired {company.acquiredDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunAIAudit(company.id)}
              disabled={isAILoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>{isAILoading ? 'Auditing...' : 'GENERATE AI BRIEF'}</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-outline-variant/20">
          <div className="bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/20">
            <div className="text-[10px] text-outline uppercase font-semibold">Annual ARR</div>
            <div className="text-base font-bold text-on-surface font-mono mt-0.5">${(company.arr / 1e6).toFixed(2)}M</div>
          </div>
          <div className="bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/20">
            <div className="text-[10px] text-outline uppercase font-semibold">MoM Net Burn</div>
            <div className="text-base font-bold text-error font-mono mt-0.5">-${(company.burnRateMoM / 1e6).toFixed(2)}M</div>
          </div>
          <div className="bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/20">
            <div className="text-[10px] text-outline uppercase font-semibold">Cash Runway</div>
            <div className={`text-base font-bold font-mono mt-0.5 ${company.runwayMonths < 6 ? 'text-error animate-pulse' : 'text-on-surface'}`}>
              {company.runwayMonths} mos
            </div>
          </div>
          <div className="bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/20">
            <div className="text-[10px] text-outline uppercase font-semibold">Gross Margin</div>
            <div className="text-base font-bold text-on-surface font-mono mt-0.5">{company.grossMargin}%</div>
          </div>
          <div className="bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/20">
            <div className="text-[10px] text-outline uppercase font-semibold">CAC Payback</div>
            <div className="text-base font-bold text-on-surface font-mono mt-0.5">{company.cacPaybackMonths} mos</div>
          </div>
          <div className="bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/20">
            <div className="text-[10px] text-outline uppercase font-semibold">Employees / Hiring</div>
            <div className="text-base font-bold text-on-surface font-mono mt-0.5">{company.employeeCount} ({company.hiringStatus})</div>
          </div>
        </div>
      </div>

      {/* AI Diagnostic Summary Banner */}
      <div className="bg-secondary-container/10 border border-secondary/30 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-lg">auto_awesome</span>
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">AI Operating Partner Diagnostic Brief</span>
        </div>
        <p className="text-xs text-on-surface leading-relaxed font-medium">{company.aiSummary}</p>
        {company.keyRisks && company.keyRisks.length > 0 && (
          <div className="pt-2 border-t border-secondary/20 flex items-center gap-2 text-xs">
            <span className="font-bold text-error">Key Risk Identified:</span>
            <span className="text-on-surface-variant">{company.keyRisks[0]}</span>
          </div>
        )}
      </div>

      {/* Revenue Growth Recharts Section */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Financial Performance & Revenue Growth</h2>
            <p className="text-xs text-outline">Quarterly breakdown of Revenue, Gross Profit, and Operating Expenses ($ Millions)</p>
          </div>
          <div className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Gross Profit Growth: +18.2%
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5eeff" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#76777d' }} />
              <YAxis tick={{ fontSize: 11, fill: '#76777d' }} unit="M" />
              <Tooltip
                formatter={(value: any) => [`$${value}M`, '']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', borderColor: '#c6c6cd', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Revenue" fill="#316bf3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="COGS" fill="#bec6e0" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="GrossProfit" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabbed Detail Section */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-outline-variant/30 bg-surface-container-low/50 px-4 pt-2">
          {[
            { id: 'financials', label: 'Financial P&L', icon: 'table_chart' },
            { id: 'documents', label: `Data Room (${companyDocs.length})`, icon: 'folder' },
            { id: 'updates', label: `Founder Updates (${companyUpdates.length})`, icon: 'forum' },
            { id: 'tasks', label: `Strategic Tasks (${companyTasks.length})`, icon: 'checklist' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-secondary text-secondary bg-surface-container-lowest rounded-t-lg'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-5">
          {/* Tab 1: Financials Table */}
          {activeTab === 'financials' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant/20 font-semibold">
                    <th className="p-3">Quarter</th>
                    <th className="p-3">Revenue</th>
                    <th className="p-3">COGS</th>
                    <th className="p-3">Gross Profit</th>
                    <th className="p-3">Operating Exp</th>
                    <th className="p-3">Net Income</th>
                    <th className="p-3">Cash Reserve</th>
                    <th className="p-3">Runway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 font-mono">
                  {company.financials.map((f, i) => (
                    <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-3 font-sans font-bold text-on-surface">{f.quarter}</td>
                      <td className="p-3 font-bold text-on-surface">${(f.revenue / 1e6).toFixed(2)}M</td>
                      <td className="p-3 text-outline">${(f.cogs / 1e6).toFixed(2)}M</td>
                      <td className="p-3 text-emerald-700 font-bold">${(f.grossProfit / 1e6).toFixed(2)}M</td>
                      <td className="p-3 text-outline">${(f.operatingExpenses / 1e6).toFixed(2)}M</td>
                      <td className={`p-3 font-bold ${f.netIncome >= 0 ? 'text-emerald-700' : 'text-error'}`}>
                        ${(f.netIncome / 1e6).toFixed(2)}M
                      </td>
                      <td className="p-3 text-on-surface">${(f.cashBalance / 1e6).toFixed(1)}M</td>
                      <td className="p-3 text-on-surface">{f.runwayMonths} mos</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Data Room & Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Data Room Files</span>
                <button
                  onClick={() => onUploadDocument(company.id)}
                  className="flex items-center gap-1 bg-secondary text-on-secondary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  Upload File
                </button>
              </div>

              {companyDocs.length === 0 ? (
                <div className="p-8 text-center text-xs text-outline border border-dashed border-outline-variant/40 rounded-xl">
                  No documents uploaded for this company yet. Click 'Upload File' to add pitch decks or financial audits.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {companyDocs.map((doc) => (
                    <div key={doc.id} className="p-3 bg-surface-container-low/40 rounded-xl border border-outline-variant/30 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-secondary text-xl">description</span>
                          <div>
                            <div className="text-xs font-bold text-on-surface truncate max-w-xs">{doc.title}</div>
                            <div className="text-[10px] text-outline">{doc.category} • {doc.fileSize} • {doc.uploadDate}</div>
                          </div>
                        </div>
                        <a
                          href={`#download-${doc.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading file ${doc.title}...`);
                          }}
                          className="text-secondary p-1 hover:bg-secondary/10 rounded"
                          title="Download"
                        >
                          <span className="material-symbols-outlined text-lg">download</span>
                        </a>
                      </div>
                      {doc.summary && (
                        <p className="text-[11px] text-on-surface-variant bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 italic">
                          "{doc.summary}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Founder Updates */}
          {activeTab === 'updates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Founder Monthly Reports</span>
                <button
                  onClick={() => onCreateUpdate(company.id)}
                  className="flex items-center gap-1 bg-secondary text-on-secondary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">post_add</span>
                  Add Founder Note
                </button>
              </div>

              <div className="space-y-3">
                {companyUpdates.map((u) => (
                  <div key={u.id} className="p-4 bg-surface-container-low/30 rounded-xl border border-outline-variant/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={u.authorAvatar} alt={u.authorName} className="w-6 h-6 rounded-full border border-outline-variant/30" />
                        <span className="text-xs font-bold text-on-surface">{u.authorName} ({u.authorRole})</span>
                        <span className="text-[10px] text-outline">• {u.date}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded">{u.title}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{u.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Strategic Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Partner Execution Items</span>
                <button
                  onClick={() => onCreateTask(company.id)}
                  className="flex items-center gap-1 bg-secondary text-on-secondary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">add_task</span>
                  New Task
                </button>
              </div>

              {companyTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-outline border border-dashed border-outline-variant/40 rounded-xl">
                  No active execution tasks. Click 'New Task' to assign strategic partner action items.
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/10">
                  {companyTasks.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-outline">{t.taskCode}</span>
                          <span className="text-xs font-bold text-on-surface">{t.title}</span>
                          {t.aiGenerated && (
                            <span className="text-[10px] bg-secondary/10 text-secondary font-semibold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-outline mt-0.5">{t.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold text-outline font-mono">Due {t.dueDate}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            t.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating / Slide-out AI Copilot Drawer */}
      {isChatDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-surface-container-lowest border-l border-outline-variant/30 shadow-2xl z-50 flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">auto_awesome</span>
              <div>
                <div className="text-xs font-bold text-on-surface">PortfolioPilot AI Copilot</div>
                <div className="text-[10px] text-outline">Context: {company.name} Financial Data</div>
              </div>
            </div>
            <button
              onClick={() => setIsChatDrawerOpen(false)}
              className="text-outline hover:text-on-surface p-1 rounded-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-secondary text-on-secondary rounded-br-none'
                      : 'bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isChatSending && (
              <div className="flex justify-start">
                <div className="bg-surface-container-low p-3 rounded-2xl text-xs text-outline animate-pulse flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  Analyzing {company.name} financial metrics...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-surface-container-low border-t border-outline-variant/30 flex gap-2">
            <input
              type="text"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask AI about burn, CAC, or valuation..."
              className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
            <button
              onClick={handleSendChat}
              disabled={isChatSending}
              className="bg-secondary text-on-secondary px-3 py-2 rounded-lg text-xs font-bold hover:bg-secondary/90 transition-all cursor-pointer disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
