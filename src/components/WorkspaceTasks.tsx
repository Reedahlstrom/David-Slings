import { useState } from 'react';
import { ChevronDown, ListTodo, Plus, Trash2 } from 'lucide-react';
import type { Business, Task } from '../../shared/business';

type Props = {
  tasks: Task[];
  team: string[];
  milestones: Business['milestones'];
  milestone: string;
  onMilestoneChange: (id: string) => void;
  onChange: (tasks: Task[]) => void;
};

export default function WorkspaceTasks({ tasks, team, milestones, milestone, onMilestoneChange, onChange }: Props) {
  const [view, setView] = useState<'open' | 'done' | 'all'>('open');
  const [expanded, setExpanded] = useState<string | null>(null);
  const scoped = tasks.filter(task => milestone === 'all' || task.goalId === milestone);
  const counts = { open: scoped.filter(task => task.status !== 'done').length, done: scoped.filter(task => task.status === 'done').length, all: scoped.length };
  const visible = scoped.filter(task => view === 'all' || (view === 'done' ? task.status === 'done' : task.status !== 'done'));
  const now = new Date();
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  function update(taskId: string, patch: Partial<Task>) {
    onChange(tasks.map(task => task.id === taskId ? { ...task, ...patch } : task));
  }
  function add() {
    const taskId = crypto.randomUUID();
    onChange([{ id: taskId, goalId: milestone === 'all' ? '' : milestone, title: 'New to-do', assignee: '', status: 'todo', priority: 'normal', due: '', notes: '' }, ...tasks]);
    setView('open');
    setExpanded(taskId);
  }
  return <div className="ws-tasks">
    <div className="ws-task-toolbar">
      <div className="ws-task-views" role="group" aria-label="Show tasks">
        {(['open', 'done', 'all'] as const).map(key => <button key={key} aria-pressed={view === key} onClick={() => setView(key)}>
          {{ open: 'Open', done: 'Done', all: 'All' }[key]} <span>{counts[key]}</span>
        </button>)}
      </div>
      <select aria-label="Filter tasks by milestone" value={milestone} onChange={event => onMilestoneChange(event.target.value)}>
        <option value="all">All milestones</option>
        {milestones?.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
      </select>
      <button className="ws-primary" onClick={add}><Plus size={16} /> Add to-do</button>
    </div>
    <div className="ws-task-list">
      {!!visible.length && <div className="ws-task-columns" aria-hidden="true"><span>Task</span><span>Assigned to</span><span>Status</span><span>Due</span><span /></div>}
      {visible.map(task => {
        const isExpanded = expanded === task.id;
        const overdue = !!task.due && task.due < localDate && task.status !== 'done';
        const dueLabel = task.due ? new Date(`${task.due}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(task.due.slice(0, 4) !== String(now.getFullYear()) ? { year: 'numeric' } : {}) }) : 'No date';
        const toggle = () => setExpanded(isExpanded ? null : task.id);
        return <section className={`ws-task-item ${task.status === 'done' ? 'is-done' : ''} ${isExpanded ? 'is-expanded' : ''}`} key={task.id} aria-label={task.title}>
          <div className="ws-task-row">
            <div className="ws-task-name">
              <input type="checkbox" checked={task.status === 'done'} aria-label={`Mark ${task.title} ${task.status === 'done' ? 'not done' : 'done'}`} onChange={event => update(task.id, { status: event.target.checked ? 'done' : 'todo' })} />
              <button className="ws-task-open" onClick={toggle} aria-expanded={isExpanded} aria-controls={`task-details-${task.id}`}>
                <span>{task.title || 'Untitled to-do'}</span>
                {task.priority === 'high' && task.status !== 'done' && <small>High priority</small>}
              </button>
            </div>
            <select className="ws-task-assignee" aria-label={`Assigned to for ${task.title}`} value={task.assignee} onChange={event => update(task.id, { assignee: event.target.value })}>
              <option value="">Unassigned</option>{team.map(name => <option key={name}>{name}</option>)}
            </select>
            <select className={`ws-task-status ${task.status}`} aria-label={`Status for ${task.title}`} value={task.status} onChange={event => update(task.id, { status: event.target.value as Task['status'] })}>
              <option value="todo">To do</option><option value="doing">In progress</option><option value="done">Done</option>
            </select>
            <button className={`ws-task-date ${overdue ? 'is-overdue' : ''}`} onClick={toggle} aria-label={`Edit due date for ${task.title}: ${dueLabel}${overdue ? ', overdue' : ''}`}>{dueLabel}{overdue && <small>Overdue</small>}</button>
            <button className="ws-task-chevron" onClick={toggle} aria-expanded={isExpanded} aria-controls={`task-details-${task.id}`} aria-label={`${isExpanded ? 'Close' : 'Edit'} ${task.title}`}><ChevronDown size={16} /></button>
          </div>
          {isExpanded && <div className="ws-task-details" id={`task-details-${task.id}`}>
            <label className="ws-field">Task name<input autoFocus value={task.title} onFocus={event => event.target.select()} onChange={event => update(task.id, { title: event.target.value })} /></label>
            <div className="ws-task-detail-fields">
              <label className="ws-field">Milestone<select value={task.goalId || ''} onChange={event => update(task.id, { goalId: event.target.value })}>
                <option value="">No milestone</option>{milestones?.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
              </select></label>
              <label className="ws-field">Priority<select value={task.priority} onChange={event => update(task.id, { priority: event.target.value as Task['priority'] })}>
                <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
              </select></label>
              <label className="ws-field">Due date<input type="date" value={task.due} onChange={event => update(task.id, { due: event.target.value })} /></label>
            </div>
            <label className="ws-field">Notes<textarea rows={2} placeholder="Anything else to know?" value={task.notes} onChange={event => update(task.id, { notes: event.target.value })} /></label>
            <div className="ws-task-detail-actions">
              <button className="ws-task-remove" onClick={() => { onChange(tasks.filter(item => item.id !== task.id)); setExpanded(null); }}><Trash2 size={14} /> Delete task</button>
              <button className="ws-secondary" onClick={() => setExpanded(null)}>Close details</button>
            </div>
          </div>}
        </section>;
      })}
      {!visible.length && <div className="ws-task-empty"><ListTodo size={25} /><h2>{view === 'done' ? 'No completed tasks yet.' : view === 'open' ? 'Nothing left on this list.' : 'No tasks here yet.'}</h2><p>{milestone !== 'all' ? 'Try another milestone, or add a to-do here.' : view === 'done' ? 'Check off a task and it will appear here.' : 'Add a to-do when something comes up.'}</p></div>}
    </div>
  </div>;
}
