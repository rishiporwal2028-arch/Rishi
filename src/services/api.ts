import { PortfolioCompany, AlertItem, ActionTask, DocumentItem, FounderUpdate, NotificationItem, WorkspaceSettings, LPReport } from '../types';

export const api = {
  // Auth
  async login(email?: string, password?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async signup(data: { email: string; name: string; firmName: string; role: string }) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async forgotPassword(email: string) {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  // Companies
  async getCompanies(params?: { search?: string; sector?: string; health?: string; sort?: string }): Promise<PortfolioCompany[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/companies?${query}`);
    return res.json();
  },

  async getCompany(id: string): Promise<PortfolioCompany> {
    const res = await fetch(`/api/companies/${id}`);
    if (!res.ok) throw new Error('Company not found');
    return res.json();
  },

  async createCompany(data: Partial<PortfolioCompany>): Promise<PortfolioCompany> {
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCompany(id: string, data: Partial<PortfolioCompany>): Promise<PortfolioCompany> {
    const res = await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteCompany(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Alerts
  async getAlerts(): Promise<AlertItem[]> {
    const res = await fetch('/api/alerts');
    return res.json();
  },

  async resolveAlert(id: string): Promise<AlertItem> {
    const res = await fetch(`/api/alerts/${id}/resolve`, { method: 'PUT' });
    return res.json();
  },

  async archiveAlert(id: string): Promise<AlertItem> {
    const res = await fetch(`/api/alerts/${id}/archive`, { method: 'PUT' });
    return res.json();
  },

  async addAlertNote(id: string, note: string): Promise<AlertItem> {
    const res = await fetch(`/api/alerts/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    return res.json();
  },

  // Tasks
  async getTasks(): Promise<ActionTask[]> {
    const res = await fetch('/api/tasks');
    return res.json();
  },

  async createTask(data: Partial<ActionTask>): Promise<ActionTask> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateTask(id: string, data: Partial<ActionTask>): Promise<ActionTask> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Documents & Updates
  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch('/api/documents');
    return res.json();
  },

  async uploadDocument(data: Partial<DocumentItem>): Promise<DocumentItem> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getUpdates(): Promise<FounderUpdate[]> {
    const res = await fetch('/api/updates');
    return res.json();
  },

  async createUpdate(data: Partial<FounderUpdate>): Promise<FounderUpdate> {
    const res = await fetch('/api/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Reports
  async getReports(): Promise<LPReport[]> {
    const res = await fetch('/api/reports');
    return res.json();
  },

  async generateReport(type: string, quarter: string, focusCompanyId?: string): Promise<LPReport> {
    const res = await fetch('/api/ai/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, quarter, focusCompanyId }),
    });
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<NotificationItem> {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
  },

  // Settings
  async getSettings(): Promise<WorkspaceSettings> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(data: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // AI Workflows
  async analyzeCompany(companyId: string): Promise<{ company: PortfolioCompany; analysis: any }> {
    const res = await fetch('/api/ai/analyze-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId }),
    });
    return res.json();
  },

  async askAIChat(companyId: string, message: string, history: any[]): Promise<{ text: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, message, history }),
    });
    return res.json();
  },
};
