import React, { useState } from 'react';
import { LPReport, DocumentItem, PortfolioCompany } from '../types';

interface ReportsViewProps {
  reports: LPReport[];
  documents: DocumentItem[];
  companies: PortfolioCompany[];
  onGenerateReport: (type: string, quarter: string) => Promise<LPReport>;
  onUploadDocument: (data: Partial<DocumentItem>) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  documents,
  companies,
  onGenerateReport,
  onUploadDocument,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'reports' | 'dataroom'>('reports');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('quarterly_lp');
  const [reportQuarter, setReportQuarter] = useState('Q3 2024');
  const [isGenerating, setIsGenerating] = useState(false);

  // Data room filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [docSearch, setDocSearch] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload state
  const [docTitle, setDocTitle] = useState('');
  const [docCompany, setDocCompany] = useState(companies[0]?.id || 'comp-5');
  const [docCategory, setDocCategory] = useState<'Financials' | 'Legal & HR' | 'Board Decks' | 'Cap Table' | 'Marketing'>('Financials');
  const [docText, setDocText] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await onGenerateReport(reportType, reportQuarter);
      setIsReportModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const comp = companies.find((c) => c.id === docCompany) || companies[0];

    onUploadDocument({
      companyId: comp.id,
      companyName: comp.name,
      title: docTitle.trim(),
      category: docCategory,
      extractedText: docText,
      fileSize: '1.8 MB',
      fileType: 'pdf',
    });

    setDocTitle('');
    setDocText('');
    setIsUploadModalOpen(false);
  };

  const filteredDocs = documents.filter((d) => {
    const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesQuery = d.title.toLowerCase().includes(docSearch.toLowerCase()) || d.companyName.toLowerCase().includes(docSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">Reports & Portfolio Data Room</h1>
          <p className="text-xs text-outline mt-0.5">
            AI-generated LP performance briefs, board decks, and audited company data room documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-high hover:bg-outline-variant/30 text-on-surface rounded-xl text-xs font-semibold cursor-pointer border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            Upload Document
          </button>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 bg-secondary text-on-secondary px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-secondary/90 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Generate AI Report
          </button>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex border-b border-outline-variant/30 bg-surface-container-lowest p-1 rounded-xl">
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'reports' ? 'bg-secondary text-on-secondary shadow-xs' : 'text-outline hover:text-on-surface'
          }`}
        >
          LP Performance Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveSubTab('dataroom')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'dataroom' ? 'bg-secondary text-on-secondary shadow-xs' : 'text-outline hover:text-on-surface'
          }`}
        >
          Master Data Room Repository ({documents.length})
        </button>
      </div>

      {/* View 1: LP Reports */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          {reports.map((rep) => (
            <div key={rep.id} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant/20 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded font-mono uppercase">
                      {rep.type.replace('_', ' ')}
                    </span>
                    <h2 className="text-base font-bold text-on-surface">{rep.title}</h2>
                  </div>
                  <div className="text-xs text-outline mt-0.5">Generated on {rep.generatedAt} • Quarter: {rep.quarter}</div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 text-xs text-secondary font-semibold hover:underline cursor-pointer self-start sm:self-auto"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  Print / Export PDF
                </button>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-on-surface uppercase tracking-wider">Executive Summary</div>
                <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-xl">
                  {rep.executiveSummary}
                </p>
              </div>

              {/* Highlights & Risks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span> Portfolio Highlights
                  </div>
                  <ul className="space-y-1 list-disc list-inside text-xs text-on-surface-variant">
                    {rep.portfolioHighlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-error uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span> Risk Breakdown
                  </div>
                  <p className="text-xs text-on-surface-variant">{rep.riskAnalysis}</p>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="pt-2 border-t border-outline-variant/20 space-y-1">
                <div className="text-xs font-bold text-secondary uppercase tracking-wider">Partner Action Directives</div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {rep.recommendedActions.map((act, i) => (
                    <span key={i} className="text-xs bg-secondary-container/10 border border-secondary/20 text-on-surface px-2.5 py-1 rounded-lg">
                      • {act}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 2: Data Room Repository */}
      {activeSubTab === 'dataroom' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
              <input
                type="text"
                placeholder="Search documents by file or company..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-2.5 py-1 text-xs text-on-surface focus:outline-none w-full sm:w-64"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              {['All', 'Financials', 'Board Decks', 'Legal & HR', 'Cap Table'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                    selectedCategory === cat ? 'bg-secondary text-on-secondary' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Docs Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant/20 font-semibold">
                  <th className="p-3">Document Title</th>
                  <th className="p-3">Portfolio Company</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Uploaded Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-lg">description</span>
                        <div>
                          <div className="font-bold text-on-surface">{doc.title}</div>
                          <div className="text-[10px] text-outline">{doc.fileSize} • {doc.fileType.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-on-surface">{doc.companyName}</td>
                    <td className="p-3">
                      <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded font-semibold text-on-surface">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-3 text-outline">{doc.uploadDate}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => alert(`Downloading ${doc.title}...`)}
                        className="text-secondary font-semibold hover:underline cursor-pointer text-xs"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant/40 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">auto_awesome</span>
                <h3 className="text-sm font-bold text-on-surface">Generate Gemini AI LP Report</h3>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3 text-xs">
              <div>
                <label className="block text-outline font-semibold mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                >
                  <option value="quarterly_lp">Quarterly LP Performance Brief</option>
                  <option value="monthly_board">Monthly Fund Board Summary</option>
                  <option value="weekly_brief">Weekly GP Operating Partner Report</option>
                </select>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Quarter / Period</label>
                <input
                  type="text"
                  value={reportQuarter}
                  onChange={(e) => setReportQuarter(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3 py-1.5 text-outline hover:text-on-surface rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-1.5 bg-secondary text-on-secondary rounded-lg font-bold shadow-xs hover:bg-secondary/90 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span>{isGenerating ? 'Synthesizing...' : 'Generate Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant/40 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="text-sm font-bold text-on-surface">Upload Data Room Document</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="block text-outline font-semibold mb-1">Target Portfolio Company</label>
                <select
                  value={docCompany}
                  onChange={(e) => setDocCompany(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Q3_Financial_Audit_Final.pdf"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                >
                  <option value="Financials">Financials</option>
                  <option value="Board Decks">Board Decks</option>
                  <option value="Legal & HR">Legal & HR</option>
                  <option value="Cap Table">Cap Table</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Extracted Text Content (Optional AI Indexing)</label>
                <textarea
                  rows={3}
                  placeholder="Paste excerpt or notes for AI auto-summarization..."
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 text-outline hover:text-on-surface rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-secondary text-on-secondary rounded-lg font-bold shadow-xs hover:bg-secondary/90 cursor-pointer"
                >
                  Upload & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
