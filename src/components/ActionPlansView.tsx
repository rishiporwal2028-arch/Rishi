import React, { useState } from 'react';
import { ActionTask, PortfolioCompany, Priority, TaskStatus } from '../types';

interface ActionPlansViewProps {
  tasks: ActionTask[];
  companies: PortfolioCompany[];
  onCreateTask: (task: Partial<ActionTask>) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

export const ActionPlansView: React.FC<ActionPlansViewProps> = ({
  tasks,
  companies,
  onCreateTask,
  onUpdateTaskStatus,
  onDeleteTask,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCompany, setNewTaskCompany] = useState(companies[0]?.id || 'comp-1');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('high');
  const [newTaskDueDate, setNewTaskDueDate] = useState('Next Week');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const companyObj = companies.find((c) => c.id === newTaskCompany) || companies[0];

    onCreateTask({
      companyId: companyObj.id,
      companyName: companyObj.name,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      status: 'todo',
      dueDate: newTaskDueDate,
      assignees: [{ name: 'Alex Morgan', avatarUrl: '' }],
      aiGenerated: false,
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsModalOpen(false);
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">Action Plans & Strategic Execution</h1>
          <p className="text-xs text-outline mt-0.5">
            Partner recommendations, board execution items, and company operational tasks.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-secondary text-on-secondary px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-secondary/90 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add_task</span>
          Create Action Task
        </button>
      </div>

      {/* AI Strategic Recommendations Cards */}
      <div className="bg-secondary-container/10 border border-secondary/30 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">auto_awesome</span>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">AI Suggested Partner Recommendations</span>
          </div>
          <span className="text-[11px] text-outline">Updated daily based on company vitals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface">
              <span>EcoFlow Systems</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.2 rounded">+15% TAM</span>
            </div>
            <p className="text-xs font-semibold text-on-surface">Expand EU Commercial Battery Sales</p>
            <p className="text-[11px] text-outline">Demand surge in Germany for smart grid storage creates immediate market expansion window.</p>
            <button
              onClick={() =>
                onCreateTask({
                  companyId: 'comp-5',
                  companyName: 'EcoFlow Systems',
                  title: 'Draft EU Commercial Sales Expansion Plan',
                  description: 'Research German market distributors and regulatory certification requirements.',
                  priority: 'high',
                  status: 'todo',
                  dueDate: 'In 2 Weeks',
                  aiGenerated: true,
                })
              }
              className="text-xs text-secondary font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              + Add to Execution Board
            </button>
          </div>

          <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface">
              <span>Lumina Health</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-mono px-1.5 py-0.2 rounded">Save $40k/mo</span>
            </div>
            <p className="text-xs font-semibold text-on-surface">Cloud GPU Infrastructure Optimization</p>
            <p className="text-[11px] text-outline">Consolidate inference workloads onto reserved AWS EC2 instances to restore +4% gross margin.</p>
            <button
              onClick={() =>
                onCreateTask({
                  companyId: 'comp-6',
                  companyName: 'Lumina Health',
                  title: 'AWS GPU Instance Optimization Audit',
                  description: 'Audit model inference throughput and negotiate reserved instance pricing with AWS.',
                  priority: 'high',
                  status: 'todo',
                  dueDate: 'Next Week',
                  aiGenerated: true,
                })
              }
              className="text-xs text-secondary font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              + Add to Execution Board
            </button>
          </div>

          <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface">
              <span>Nexus Tech</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-mono px-1.5 py-0.2 rounded">Critical</span>
            </div>
            <p className="text-xs font-semibold text-on-surface">Emergency Bridge Capital Round</p>
            <p className="text-[11px] text-outline">Prepare $2.5M pro-rata bridge note term sheet before runway exhausts in 2.5 months.</p>
            <button
              onClick={() =>
                onCreateTask({
                  companyId: 'comp-3',
                  companyName: 'Nexus Tech',
                  title: 'Draft Pro-Rata Bridge Term Sheet',
                  description: 'Structure $2.5M convertible note terms with syndicate co-investors.',
                  priority: 'high',
                  status: 'todo',
                  dueDate: 'Immediate',
                  aiGenerated: true,
                })
              }
              className="text-xs text-secondary font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              + Add to Execution Board
            </button>
          </div>
        </div>
      </div>

      {/* Execution Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: To Do */}
        <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider">To Do ({todoTasks.length})</h2>
            </div>
          </div>

          <div className="space-y-3">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMoveStatus={onUpdateTaskStatus}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider">In Progress ({inProgressTasks.length})</h2>
            </div>
          </div>

          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMoveStatus={onUpdateTaskStatus}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </div>

        {/* Column 3: Done */}
        <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider">Done ({doneTasks.length})</h2>
            </div>
          </div>

          <div className="space-y-3">
            {doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMoveStatus={onUpdateTaskStatus}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant/40 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="text-sm font-bold text-on-surface">Create New Execution Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-outline font-semibold mb-1">Company</label>
                <select
                  value={newTaskCompany}
                  onChange={(e) => setNewTaskCompany(e.target.value)}
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
                <label className="block text-outline font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Audit Q4 engineering headcount additions"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Additional context or expectations..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-outline font-semibold mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-outline font-semibold mb-1">Due Date</label>
                  <input
                    type="text"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-outline hover:text-on-surface rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-secondary text-on-secondary rounded-lg font-bold shadow-xs hover:bg-secondary/90 cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskCardProps {
  task: ActionTask;
  onMoveStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onMoveStatus, onDelete }) => {
  return (
    <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold text-outline">{task.taskCode}</span>
          <span className="text-[10px] bg-surface-container-high font-semibold text-on-surface px-1.5 py-0.2 rounded">
            {task.companyName}
          </span>
          {task.aiGenerated && (
            <span className="text-[10px] bg-secondary/10 text-secondary font-bold px-1 rounded flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI
            </span>
          )}
        </div>

        <button onClick={() => onDelete(task.id)} className="text-outline hover:text-error text-xs cursor-pointer">
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>

      <div className="text-xs font-bold text-on-surface">{task.title}</div>
      <p className="text-[11px] text-outline line-clamp-2">{task.description}</p>

      <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
        <span className="font-mono text-outline">{task.dueDate}</span>

        {/* Move status buttons */}
        <div className="flex items-center gap-1">
          {task.status !== 'todo' && (
            <button
              onClick={() => onMoveStatus(task.id, task.status === 'done' ? 'in_progress' : 'todo')}
              className="p-1 hover:bg-surface-container-high rounded text-outline hover:text-on-surface"
              title="Move Back"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </button>
          )}
          {task.status !== 'done' && (
            <button
              onClick={() => onMoveStatus(task.id, task.status === 'todo' ? 'in_progress' : 'done')}
              className="p-1 hover:bg-surface-container-high rounded text-outline hover:text-on-surface"
              title="Move Forward"
            >
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
