import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  initialCompanies,
  initialAlerts,
  initialTasks,
  initialDocuments,
  initialUpdates,
  initialNotifications,
  initialSettings,
} from './src/data/mockData';
import { PortfolioCompany, AlertItem, ActionTask, DocumentItem, FounderUpdate, NotificationItem, WorkspaceSettings, LPReport } from './src/types';

// In-memory data store for server session
let companiesStore: PortfolioCompany[] = [...initialCompanies];
let alertsStore: AlertItem[] = [...initialAlerts];
let tasksStore: ActionTask[] = [...initialTasks];
let documentsStore: DocumentItem[] = [...initialDocuments];
let updatesStore: FounderUpdate[] = [...initialUpdates];
let notificationsStore: NotificationItem[] = [...initialNotifications];
let settingsStore: WorkspaceSettings = { ...initialSettings };
let reportsStore: LPReport[] = [
  {
    id: 'rep-1',
    title: 'Q3 2024 LP Performance Report',
    type: 'quarterly_lp',
    quarter: 'Q3 2024',
    generatedAt: '2024-10-01',
    executiveSummary: 'Fund I deployed $450M across 24 investments with an average health score of 82/100. Growth in ARR averaged +14% QoQ, driven by Cleantech and SaaS sectors.',
    portfolioHighlights: [
      'EcoFlow Systems achieved $24.5M ARR with positive net income in Q3.',
      'HyperScale Data scaled to $32.0M ARR with 80% gross margin.',
      'BlueLogistics unit economics improved, nearing zero net burn.',
    ],
    riskAnalysis: 'Nexus Tech and QuantumPay face acute cash runway limits under 4 months. Emergency board interventions are underway.',
    recommendedActions: [
      'Facilitate bridge financing for Nexus Tech.',
      'Advise Lumina Health on cloud hosting cost reduction.',
      'Support EcoFlow Systems in microcontroller alternative sourcing.',
    ],
    metricsOverview: {
      totalActiveCos: 24,
      capitalDeployed: '$450M',
      avgHealthScore: 82,
    },
  },
];

// Initialize Gemini AI SDK
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set. Gemini fallback mode enabled.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || 'unconfigured',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Authentication API
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    // Business login validation simulation
    const user = settingsStore.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) || {
      id: 'usr-1',
      name: email ? email.split('@')[0] : 'Sarah Jenkins',
      email: email || 'sarah.j@alphacapital.vc',
      role: 'Partner',
      status: 'Active',
    };
    res.json({
      success: true,
      user,
      token: 'jwt_simulated_token_' + Date.now(),
      organization: {
        id: 'org-1',
        name: settingsStore.organizationName,
        fundName: settingsStore.fundName,
      },
    });
  });

  app.post('/api/auth/signup', (req, res) => {
    const { email, name, firmName, role } = req.body;
    const newUser = {
      id: 'usr-' + Date.now(),
      name: name || 'New Investor',
      email: email || 'investor@firm.vc',
      role: role || 'Partner',
      status: 'Active' as const,
    };
    settingsStore.users.push(newUser);
    if (firmName) {
      settingsStore.organizationName = firmName;
    }
    res.json({
      success: true,
      user: newUser,
      token: 'jwt_simulated_token_' + Date.now(),
      organization: {
        id: 'org-1',
        name: settingsStore.organizationName,
        fundName: settingsStore.fundName,
      },
    });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    res.json({ success: true, message: 'Password reset link sent to your email.' });
  });

  // Companies API
  app.get('/api/companies', (req, res) => {
    const { search, sector, health, sort } = req.query;
    let list = [...companiesStore];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }

    if (sector && typeof sector === 'string' && sector !== 'All') {
      list = list.filter((c) => c.sector === sector);
    }

    if (health && typeof health === 'string' && health !== 'All') {
      list = list.filter((c) => c.healthStatus.toLowerCase() === health.toLowerCase());
    }

    if (sort && typeof sort === 'string') {
      if (sort === 'health_desc') list.sort((a, b) => b.healthScore - a.healthScore);
      if (sort === 'health_asc') list.sort((a, b) => a.healthScore - b.healthScore);
      if (sort === 'arr_desc') list.sort((a, b) => b.arr - a.arr);
      if (sort === 'runway_asc') list.sort((a, b) => a.runwayMonths - b.runwayMonths);
    }

    res.json(list);
  });

  app.get('/api/companies/:id', (req, res) => {
    const company = companiesStore.find((c) => c.id === req.params.id || c.code.toLowerCase() === req.params.id.toLowerCase());
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  });

  app.post('/api/companies', (req, res) => {
    const newCompanyData = req.body;
    const id = 'comp-' + (companiesStore.length + 1);
    const code = newCompanyData.code || newCompanyData.name.slice(0, 2).toUpperCase();
    const newCompany: PortfolioCompany = {
      id,
      code,
      name: newCompanyData.name || 'New Portfolio Co',
      sector: newCompanyData.sector || 'SaaS / Enterprise',
      stage: newCompanyData.stage || 'Series A',
      acquiredDate: newCompanyData.acquiredDate || 'Q4 2024',
      healthScore: newCompanyData.healthScore || 85,
      healthStatus: newCompanyData.healthStatus || 'Healthy',
      revenueTTM: Number(newCompanyData.revenueTTM) || 5000000,
      arr: Number(newCompanyData.arr) || 5000000,
      burnRateMoM: Number(newCompanyData.burnRateMoM) || 500000,
      runwayMonths: Number(newCompanyData.runwayMonths) || 18,
      grossMargin: Number(newCompanyData.grossMargin) || 70,
      cacPaybackMonths: Number(newCompanyData.cacPaybackMonths) || 12,
      employeeCount: Number(newCompanyData.employeeCount) || 35,
      engHires: 2,
      salesHires: 1,
      hiringStatus: 'Active',
      description: newCompanyData.description || 'Newly onboarded portfolio venture.',
      keyRisks: newCompanyData.keyRisks || ['Initial integration and data synchronization pending.'],
      aiSummary: 'Newly added company. AI diagnostic audit in progress.',
      financials: [
        {
          quarter: 'Q3 2024',
          revenue: Math.round((Number(newCompanyData.arr) || 5000000) / 4),
          cogs: Math.round(((Number(newCompanyData.arr) || 5000000) / 4) * 0.3),
          grossProfit: Math.round(((Number(newCompanyData.arr) || 5000000) / 4) * 0.7),
          operatingExpenses: Math.round(((Number(newCompanyData.arr) || 5000000) / 4) * 0.8),
          netIncome: -100000,
          cashBalance: (Number(newCompanyData.burnRateMoM) || 500000) * (Number(newCompanyData.runwayMonths) || 18),
          burnRate: Number(newCompanyData.burnRateMoM) || 500000,
          runwayMonths: Number(newCompanyData.runwayMonths) || 18,
        },
      ],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    companiesStore.unshift(newCompany);

    // Auto generate notification
    notificationsStore.unshift({
      id: 'notif-' + Date.now(),
      title: 'New Company Onboarded',
      message: `${newCompany.name} added to portfolio workspace.`,
      type: 'recommendation',
      timestamp: 'Just now',
      read: false,
    });

    res.status(201).json(newCompany);
  });

  app.put('/api/companies/:id', (req, res) => {
    const idx = companiesStore.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Company not found' });

    companiesStore[idx] = {
      ...companiesStore[idx],
      ...req.body,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    res.json(companiesStore[idx]);
  });

  app.delete('/api/companies/:id', (req, res) => {
    companiesStore = companiesStore.filter((c) => c.id !== req.params.id);
    res.json({ success: true, message: 'Company removed' });
  });

  // Alerts API
  app.get('/api/alerts', (req, res) => {
    res.json(alertsStore);
  });

  app.put('/api/alerts/:id/resolve', (req, res) => {
    const alert = alertsStore.find((a) => a.id === req.params.id);
    if (alert) {
      alert.status = 'resolved';
      return res.json(alert);
    }
    res.status(404).json({ error: 'Alert not found' });
  });

  app.put('/api/alerts/:id/archive', (req, res) => {
    const alert = alertsStore.find((a) => a.id === req.params.id);
    if (alert) {
      alert.status = 'archived';
      return res.json(alert);
    }
    res.status(404).json({ error: 'Alert not found' });
  });

  app.post('/api/alerts/:id/notes', (req, res) => {
    const { note } = req.body;
    const alert = alertsStore.find((a) => a.id === req.params.id);
    if (alert) {
      if (!alert.notes) alert.notes = [];
      alert.notes.push(note);
      return res.json(alert);
    }
    res.status(404).json({ error: 'Alert not found' });
  });

  // Tasks / Action Plans API
  app.get('/api/tasks', (req, res) => {
    res.json(tasksStore);
  });

  app.post('/api/tasks', (req, res) => {
    const newTask: ActionTask = {
      id: 'task-' + Date.now(),
      companyId: req.body.companyId || 'comp-1',
      companyName: req.body.companyName || 'Apex Cloud Solutions',
      taskCode: 'TSK-' + Math.floor(100 + Math.random() * 900),
      title: req.body.title || 'New Execution Task',
      description: req.body.description || '',
      priority: req.body.priority || 'medium',
      status: req.body.status || 'todo',
      dueDate: req.body.dueDate || 'Next Week',
      assignees: req.body.assignees || [{ name: 'Alex Morgan', avatarUrl: '' }],
      aiGenerated: !!req.body.aiGenerated,
      tagColor: req.body.tagColor || 'bg-secondary',
    };
    tasksStore.unshift(newTask);
    res.status(201).json(newTask);
  });

  app.put('/api/tasks/:id', (req, res) => {
    const task = tasksStore.find((t) => t.id === req.params.id);
    if (task) {
      Object.assign(task, req.body);
      return res.json(task);
    }
    res.status(404).json({ error: 'Task not found' });
  });

  app.delete('/api/tasks/:id', (req, res) => {
    tasksStore = tasksStore.filter((t) => t.id !== req.params.id);
    res.json({ success: true });
  });

  // Documents API
  app.get('/api/documents', (req, res) => {
    res.json(documentsStore);
  });

  app.post('/api/documents', async (req, res) => {
    const { title, category, companyId, companyName, fileSize, fileType, extractedText } = req.body;
    
    let summary = 'Document uploaded successfully and indexed in portfolio data room.';
    
    // AI summarization if text provided or triggered
    if (process.env.GEMINI_API_KEY && (extractedText || title)) {
      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `Provide a concise 2-sentence VC operating partner executive summary for this document titled "${title}" with content: "${extractedText || title}".`,
        });
        if (response.text) {
          summary = response.text.trim();
        }
      } catch (err) {
        console.error('Document summary Gemini error:', err);
      }
    }

    const newDoc: DocumentItem = {
      id: 'doc-' + Date.now(),
      companyId: companyId || 'comp-5',
      companyName: companyName || 'EcoFlow Systems',
      title: title || 'Uploaded_Document.pdf',
      category: category || 'Financials',
      dept: 'Executive',
      fileSize: fileSize || '1.5 MB',
      fileType: fileType || 'pdf',
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      summary,
      extractedText,
    };

    documentsStore.unshift(newDoc);

    notificationsStore.unshift({
      id: 'notif-' + Date.now(),
      title: 'Document Uploaded',
      message: `${newDoc.title} uploaded to ${newDoc.companyName} data room.`,
      type: 'document',
      timestamp: 'Just now',
      read: false,
    });

    res.status(201).json(newDoc);
  });

  // Monthly Updates API
  app.get('/api/updates', (req, res) => {
    res.json(updatesStore);
  });

  app.post('/api/updates', (req, res) => {
    const newUpdate: FounderUpdate = {
      id: 'up-' + Date.now(),
      companyId: req.body.companyId || 'comp-5',
      companyName: req.body.companyName || 'EcoFlow Systems',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      title: req.body.title || 'Monthly Founder Update',
      content: req.body.content || '',
      authorName: req.body.authorName || 'Sarah J.',
      authorRole: req.body.authorRole || 'CEO',
      authorAvatar: req.body.authorAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwOdg009NLtlkgNdIC8qlP32Y56GTZ_1tzfJpjhQVrj7_Zc77jdxpJmZmOBAO1QkQQVkfO6_GejZXaO9c4xvLiL8DrltkCMDWmi8cz6cob29iyBL9fjic2JOEwF0jFUSWCj0lvTrVH7CUmmLbA9pa9xHgJ_9S2_Aid786t0Yr26gKnB5R1juMl9ppSAdGN-LsS4jandN_Gu7kTEyaVoQKhsVnLjWenEZUKtoiHx8F30HfcnSJIDjKdqQ',
    };
    updatesStore.unshift(newUpdate);
    res.status(201).json(newUpdate);
  });

  // Notifications API
  app.get('/api/notifications', (req, res) => {
    res.json(notificationsStore);
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const n = notificationsStore.find((x) => x.id === req.params.id);
    if (n) {
      n.read = true;
      return res.json(n);
    }
    res.status(404).json({ error: 'Notification not found' });
  });

  // Settings API
  app.get('/api/settings', (req, res) => {
    res.json(settingsStore);
  });

  app.put('/api/settings', (req, res) => {
    settingsStore = { ...settingsStore, ...req.body };
    res.json(settingsStore);
  });

  // AI Feature 1: Analyze Company (Risk Level, Summary, Recommended Actions)
  app.post('/api/ai/analyze-company', async (req, res) => {
    const { companyId } = req.body;
    const company = companiesStore.find((c) => c.id === companyId || c.code === companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    try {
      const ai = getGeminiClient();
      const prompt = `You are PortfolioPilot AI, a senior VC/PE Operating Partner.
Analyze the following portfolio company data and output a structured analysis JSON:
Company Name: ${company.name}
Sector: ${company.sector}
Stage: ${company.stage}
ARR: $${(company.arr / 1e6).toFixed(1)}M
Burn Rate: $${(company.burnRateMoM / 1e6).toFixed(1)}M/mo
Runway: ${company.runwayMonths} months
Gross Margin: ${company.grossMargin}%
CAC Payback: ${company.cacPaybackMonths} months
Employee Count: ${company.employeeCount}
Key Risks: ${company.keyRisks.join('; ')}

Return JSON with exact keys:
{
  "healthScore": number (0 to 100),
  "healthStatus": "Optimal" | "Healthy" | "At Risk" | "Critical",
  "summary": string (3 sentence strategic assessment),
  "keyRiskIdentified": string (1 line bold headline of biggest risk),
  "recommendedActions": string[] (3 actionable partner steps)
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthScore: { type: Type.INTEGER },
              healthStatus: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyRiskIdentified: { type: Type.STRING },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['healthScore', 'healthStatus', 'summary', 'keyRiskIdentified', 'recommendedActions'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        // update company state
        company.healthScore = parsed.healthScore;
        company.healthStatus = parsed.healthStatus;
        company.aiSummary = parsed.summary;
        return res.json({ company, analysis: parsed });
      }
    } catch (err) {
      console.error('AI analyze error:', err);
    }

    // Fallback response if AI key unconfigured
    res.json({
      company,
      analysis: {
        healthScore: company.healthScore,
        healthStatus: company.healthStatus,
        summary: company.aiSummary,
        keyRiskIdentified: company.keyRisks[0] || 'Runway and burn optimization required.',
        recommendedActions: [
          'Review quarterly OPEX budget and freeze non-essential headcount.',
          'Consolidate cloud hosting and GPU infrastructure commitments.',
          'Prepare next Series raise timeline and pitch deck review.',
        ],
      },
    });
  });

  // AI Feature 2: Company AI Chat Assistant
  app.post('/api/ai/chat', async (req, res) => {
    const { companyId, message, history } = req.body;
    const company = companiesStore.find((c) => c.id === companyId || c.code === companyId) || companiesStore[0];

    const contextPrompt = `You are PortfolioPilot AI Assistant for portfolio company "${company.name}".
Context data:
- Name: ${company.name} (${company.code})
- Sector: ${company.sector}, Stage: ${company.stage}
- ARR: $${(company.arr / 1e6).toFixed(1)}M, Burn Rate: $${(company.burnRateMoM / 1e6).toFixed(1)}M/mo, Runway: ${company.runwayMonths} months
- Gross Margin: ${company.grossMargin}%, CAC Payback: ${company.cacPaybackMonths} months
- Health Score: ${company.healthScore}/100 (${company.healthStatus})
- Employees: ${company.employeeCount}
- Key Risks: ${company.keyRisks.join('; ')}
- P&L Quarters: ${JSON.stringify(company.financials)}

Answer the investor's question accurately using ONLY this company's financial and operational data. Be concise, professional, and quantitative.`;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `${contextPrompt}\n\nInvestor Query: "${message}"`,
      });

      if (response.text) {
        return res.json({ text: response.text.trim() });
      }
    } catch (err) {
      console.error('AI chat error:', err);
    }

    // Fallback response
    res.json({
      text: `Based on ${company.name}'s current financial metrics: ARR stands at $${(company.arr / 1e6).toFixed(1)}M with monthly burn of $${(company.burnRateMoM / 1e6).toFixed(1)}M and ${company.runwayMonths} months of cash runway. ${company.keyRisks[0] || ''}`,
    });
  });

  // AI Feature 3: LP & Board Report Generator
  app.get('/api/reports', (req, res) => {
    res.json(reportsStore);
  });

  app.post('/api/ai/generate-report', async (req, res) => {
    const { type, quarter, focusCompanyId } = req.body;

    const reportType = type || 'quarterly_lp';
    const repQuarter = quarter || 'Q3 2024';

    try {
      const ai = getGeminiClient();
      const summaryData = {
        totalCompanies: companiesStore.length,
        avgHealth: Math.round(companiesStore.reduce((s, c) => s + c.healthScore, 0) / companiesStore.length),
        totalARR: companiesStore.reduce((s, c) => s + c.arr, 0),
        criticalCos: companiesStore.filter((c) => c.healthStatus === 'Critical').map((c) => c.name),
        atRiskCos: companiesStore.filter((c) => c.healthStatus === 'At Risk').map((c) => c.name),
      };

      const prompt = `You are a VC General Partner generating an official ${reportType.toUpperCase()} Report for ${repQuarter}.
Portfolio Context:
- Active Companies: ${summaryData.totalCompanies}
- Total Portfolio ARR: $${(summaryData.totalARR / 1e6).toFixed(1)}M
- Average Portfolio Health Score: ${summaryData.avgHealth}/100
- Critical Companies needing attention: ${summaryData.criticalCos.join(', ')}
- At Risk Companies: ${summaryData.atRiskCos.join(', ')}

Return JSON with schema:
{
  "title": string,
  "executiveSummary": string,
  "portfolioHighlights": string[],
  "riskAnalysis": string,
  "recommendedActions": string[]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              portfolioHighlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              riskAnalysis: { type: Type.STRING },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['title', 'executiveSummary', 'portfolioHighlights', 'riskAnalysis', 'recommendedActions'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        const newReport: LPReport = {
          id: 'rep-' + Date.now(),
          title: parsed.title || `Q3 2024 ${reportType.toUpperCase()} Report`,
          type: reportType,
          quarter: repQuarter,
          generatedAt: new Date().toISOString().split('T')[0],
          executiveSummary: parsed.executiveSummary,
          portfolioHighlights: parsed.portfolioHighlights,
          riskAnalysis: parsed.riskAnalysis,
          recommendedActions: parsed.recommendedActions,
          metricsOverview: {
            totalActiveCos: summaryData.totalCompanies,
            capitalDeployed: '$450M',
            avgHealthScore: summaryData.avgHealth,
          },
        };
        reportsStore.unshift(newReport);
        return res.json(newReport);
      }
    } catch (err) {
      console.error('Report generator error:', err);
    }

    const fallbackReport: LPReport = {
      id: 'rep-' + Date.now(),
      title: `${repQuarter} ${reportType.toUpperCase()} Executive Report`,
      type: reportType,
      quarter: repQuarter,
      generatedAt: new Date().toISOString().split('T')[0],
      executiveSummary: `Fund I performance remains resilient with total portfolio ARR reaching $184M across 15 active companies. Portfolio health score averages 79/100.`,
      portfolioHighlights: [
        'Apex Cloud Solutions and HyperScale Data delivered +25% YoY ARR expansion.',
        'EcoFlow Systems hardware V3 deployment achieved positive operating cash flow.',
        'Capital efficiency across top 8 portfolio companies improved gross margins to 72%.',
      ],
      riskAnalysis: 'Nexus Tech and QuantumPay present critical runway risks (<4 months). Interventions focused on bridge financing and headcount rationalization.',
      recommendedActions: [
        'Execute debt restructure and bridge round for Nexus Tech.',
        'Assist Lumina Health and Overture AI in AI inference cloud cost optimization.',
        'Standardize monthly financial update pipelines across all Series A founders.',
      ],
      metricsOverview: {
        totalActiveCos: companiesStore.length,
        capitalDeployed: '$450M',
        avgHealthScore: 79,
      },
    };
    reportsStore.unshift(fallbackReport);
    res.json(fallbackReport);
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PortfolioPilot AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
