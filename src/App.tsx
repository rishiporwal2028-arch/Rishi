import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CompanyDetailView } from './components/CompanyDetailView';
import { InsightsView } from './components/InsightsView';
import { ActionPlansView } from './components/ActionPlansView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { AddCompanyModal } from './components/AddCompanyModal';
import { api } from './services/api';
import { User, PortfolioCompany, AlertItem, ActionTask, DocumentItem, FounderUpdate, NotificationItem, WorkspaceSettings, LPReport, TaskStatus } from './types';

export function App() {
  const [user, setUser] = useState<User | null>({
    id: 'usr-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@alphacapital.vc',
    role: 'Partner',
    organizationId: 'org-1',
    avatarUrl: '',
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // App State Stores
  const [companies, setCompanies] = useState<PortfolioCompany[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [tasks, setTasks] = useState<ActionTask[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [updates, setUpdates] = useState<FounderUpdate[]>([]);
  const [reports, setReports] = useState<LPReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);

  // UI Modals State
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  // Initial Data Fetching from Express REST API
  const loadData = async () => {
    try {
      const [comps, alrts, tsks, docs, upds, reps, notifs, stgs] = await Promise.all([
        api.getCompanies(),
        api.getAlerts(),
        api.getTasks(),
        api.getDocuments(),
        api.getUpdates(),
        api.getReports(),
        api.getNotifications(),
        api.getSettings(),
      ]);

      setCompanies(comps);
      setAlerts(alrts);
      setTasks(tsks);
      setDocuments(docs);
      setUpdates(upds);
      setReports(reps);
      setNotifications(notifs);
      setSettings(stgs);
    } catch (err) {
      console.error('Failed to load initial workspace data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleSelectCompany = (id: string) => {
    setSelectedCompanyId(id);
    setActiveTab('portfolio');
  };

  const handleRunAIAudit = async (companyId: string) => {
    setIsAILoading(true);
    try {
      const { company: updatedCompany } = await api.analyzeCompany(companyId);
      setCompanies((prev) => prev.map((c) => (c.id === updatedCompany.id ? updatedCompany : c)));
      alert(`AI Diagnostic Audit complete for ${updatedCompany.name}. Health score updated to ${updatedCompany.healthScore}/100.`);
    } catch (err) {
      console.error('AI Audit failed:', err);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAddCompany = async (data: Partial<PortfolioCompany>) => {
    try {
      const created = await api.createCompany(data);
      setCompanies((prev) => [created, ...prev]);
      handleSelectCompany(created.id);
    } catch (err) {
      console.error('Failed to onboard company:', err);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const updated = await api.resolveAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    } catch (err) {
      console.error('Resolve alert error:', err);
    }
  };

  const handleArchiveAlert = async (alertId: string) => {
    try {
      const updated = await api.archiveAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    } catch (err) {
      console.error('Archive alert error:', err);
    }
  };

  const handleAddAlertNote = async (alertId: string, note: string) => {
    try {
      const updated = await api.addAlertNote(alertId, note);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    } catch (err) {
      console.error('Add note error:', err);
    }
  };

  const handleCreateTask = async (taskData: Partial<ActionTask>) => {
    try {
      const created = await api.createTask(taskData);
      setTasks((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Create task error:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updated = await api.updateTask(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.error('Update task status error:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const handleUploadDocument = async (data: Partial<DocumentItem>) => {
    try {
      const uploaded = await api.uploadDocument(data);
      setDocuments((prev) => [uploaded, ...prev]);
    } catch (err) {
      console.error('Upload document error:', err);
    }
  };

  const handleCreateUpdate = async (companyId: string) => {
    const title = prompt('Enter Founder Update Title:', 'Monthly Progress Update');
    const content = prompt('Enter Update Content / Notes:');
    if (!content) return;

    const comp = companies.find((c) => c.id === companyId) || companies[0];

    try {
      const created = await api.createUpdate({
        companyId: comp.id,
        companyName: comp.name,
        title: title || 'Monthly Progress Update',
        content,
      });
      setUpdates((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Create update error:', err);
    }
  };

  const handleGenerateReport = async (type: string, quarter: string) => {
    const rep = await api.generateReport(type, quarter);
    setReports((prev) => [rep, ...prev]);
    return rep;
  };

  const handleAskAIChat = async (companyId: string, query: string) => {
    const res = await api.askAIChat(companyId, query, []);
    return res.text;
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const updated = await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];
  const criticalAlertsCount = alerts.filter((a) => a.status === 'active' && a.severity === 'critical').length;

  // Unauthenticated view
  if (!user) {
    return <AuthModal onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogout={() => setUser(null)}
        onOpenAddCompany={() => setIsAddCompanyOpen(true)}
        onOpenSettings={() => setActiveTab('settings')}
        onSelectCompany={handleSelectCompany}
        companies={companies}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'portfolio' && !selectedCompanyId && companies.length > 0) {
              setSelectedCompanyId(companies[0].id);
            }
          }}
          criticalAlertCount={criticalAlertsCount}
        />

        {/* Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              companies={companies}
              alerts={alerts}
              onSelectCompany={handleSelectCompany}
              onNavigateToInsights={() => setActiveTab('insights')}
              onNavigateToActionPlans={() => setActiveTab('action_plans')}
              onRunAIAudit={handleRunAIAudit}
              onResolveAlert={handleResolveAlert}
              onCreateTaskForCompany={(c) => {
                handleCreateTask({
                  companyId: c.id,
                  companyName: c.name,
                  title: `Audit ${c.name} Unit Economics`,
                  description: 'Partner review item for upcoming board meeting.',
                  priority: 'high',
                  status: 'todo',
                  dueDate: 'Next Week',
                });
                setActiveTab('action_plans');
              }}
            />
          )}

          {activeTab === 'portfolio' && selectedCompany && (
            <CompanyDetailView
              company={selectedCompany}
              onBack={() => setActiveTab('dashboard')}
              onRunAIAudit={handleRunAIAudit}
              documents={documents}
              updates={updates}
              tasks={tasks}
              onUploadDocument={(compVal) => {
                const title = prompt('Enter File Title:', 'Financial_Audit_2024.pdf');
                if (title) {
                  handleUploadDocument({
                    companyId: compVal,
                    companyName: selectedCompany.name,
                    title,
                    category: 'Financials',
                    fileType: 'pdf',
                    fileSize: '1.2 MB',
                  });
                }
              }}
              onCreateUpdate={handleCreateUpdate}
              onCreateTask={(compVal) => {
                handleCreateTask({
                  companyId: compVal,
                  companyName: selectedCompany.name,
                  title: `Board Action Item for ${selectedCompany.name}`,
                  description: 'Strategic review item.',
                  priority: 'high',
                  status: 'todo',
                  dueDate: 'Next Week',
                });
                setActiveTab('action_plans');
              }}
              onAskAIChat={handleAskAIChat}
              isAILoading={isAILoading}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsView
              alerts={alerts}
              companies={companies}
              onSelectCompany={handleSelectCompany}
              onResolveAlert={handleResolveAlert}
              onArchiveAlert={handleArchiveAlert}
              onAddAlertNote={handleAddAlertNote}
            />
          )}

          {activeTab === 'action_plans' && (
            <ActionPlansView
              tasks={tasks}
              companies={companies}
              onCreateTask={handleCreateTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              reports={reports}
              documents={documents}
              companies={companies}
              onGenerateReport={handleGenerateReport}
              onUploadDocument={handleUploadDocument}
            />
          )}

          {activeTab === 'settings' && settings && (
            <SettingsView
              settings={settings}
              onUpdateSettings={async (newSet) => {
                try {
                  const updated = await api.updateSettings(newSet);
                  setSettings(updated);
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Global Add Company Modal */}
      <AddCompanyModal
        isOpen={isAddCompanyOpen}
        onClose={() => setIsAddCompanyOpen(false)}
        onAddCompany={handleAddCompany}
      />
    </div>
  );
}

export default App;
