export type HealthStatus = 'Optimal' | 'Healthy' | 'At Risk' | 'Critical';
export type Sector = 'SaaS / Enterprise' | 'Deep Tech' | 'Fintech' | 'Supply Chain' | 'Cleantech Hardware' | 'HealthTech' | 'Cybersecurity' | 'Digital Health' | 'AgTech' | 'BioTech' | 'DevOps' | 'Clean Energy';
export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'resolved' | 'archived';
export type UserRole = 'Partner' | 'Principal' | 'Associate' | 'Analyst';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  avatarUrl: string;
}

export interface Organization {
  id: string;
  name: string;
  fundName: string;
  logoUrl: string;
  plan: 'Growth' | 'Enterprise' | 'Scale';
  activeCompaniesCount: number;
  totalDeployed: string;
  apiKeysCount: number;
}

export interface QuarterlyFinancial {
  quarter: string; // e.g., 'Q1 2024'
  revenue: number; // e.g., 5200000
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netIncome: number;
  cashBalance: number;
  burnRate: number; // e.g. 1200000
  runwayMonths: number;
}

export interface PortfolioCompany {
  id: string;
  code: string; // e.g. 'AC'
  name: string;
  sector: Sector;
  stage: string; // e.g. 'Series B'
  acquiredDate: string;
  healthScore: number; // 0 - 100
  healthStatus: HealthStatus;
  revenueTTM: number; // in USD
  arr: number; // in USD
  burnRateMoM: number; // monthly in USD
  runwayMonths: number;
  grossMargin: number; // % e.g. 68
  cacPaybackMonths: number;
  employeeCount: number;
  engHires: number;
  salesHires: number;
  hiringStatus: 'Active' | 'Paused' | 'Selective';
  description: string;
  keyRisks: string[];
  aiSummary: string;
  financials: QuarterlyFinancial[];
  lastUpdated: string;
}

export interface AlertItem {
  id: string;
  companyId: string;
  companyCode: string;
  companyName: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  impact: string; // e.g. '-$142k / mo'
  dataSource: string; // e.g. 'Hubspot / Stripe'
  timestamp: string;
  type: 'revenue_drop' | 'runway_low' | 'high_burn' | 'churn_spike' | 'hiring_freeze' | 'missed_kpi' | 'margin_contraction';
  notes?: string[];
}

export interface ActionTask {
  id: string;
  companyId: string;
  companyName: string;
  taskCode: string; // e.g. 'TSK-104'
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  assignees: { name: string; avatarUrl: string }[];
  aiGenerated: boolean;
  tagColor?: string;
}

export interface DocumentItem {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  category: 'Financials' | 'Legal & HR' | 'Board Decks' | 'Cap Table' | 'Marketing';
  dept: string;
  fileSize: string;
  fileType: 'pdf' | 'pptx' | 'docx' | 'xlsx' | 'image';
  uploadDate: string;
  summary?: string;
  extractedText?: string;
}

export interface FounderUpdate {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
}

export interface LPReport {
  id: string;
  title: string;
  type: 'weekly' | 'monthly' | 'quarterly_lp' | 'board';
  companyId?: string;
  companyName?: string;
  quarter: string;
  generatedAt: string;
  executiveSummary: string;
  portfolioHighlights: string[];
  riskAnalysis: string;
  recommendedActions: string[];
  metricsOverview: {
    totalActiveCos: number;
    capitalDeployed: string;
    avgHealthScore: number;
  };
}

export interface AIChatMessage {
  id: string;
  companyId: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'report' | 'document' | 'recommendation';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface WorkspaceSettings {
  organizationName: string;
  fundName: string;
  currency: string;
  users: { id: string; name: string; email: string; role: UserRole; status: 'Active' | 'Pending' }[];
  connectedIntegrations: { name: string; icon: string; status: 'Connected' | 'Disconnected'; lastSync: string }[];
  apiKeys: { id: string; name: string; keyMasked: string; createdDate: string }[];
  billing: { plan: string; price: string; nextInvoice: string; cardLast4: string };
}
