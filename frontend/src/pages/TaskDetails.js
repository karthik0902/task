import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getTask, updateTask, deleteTask, updateStatus, postComment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard-styles.css';

const TaskDetails = () => {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [form, setForm]           = useState({});
  const [saving, setSaving]       = useState(false);
  const [comment, setComment]     = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getTask(id);
        setTask(data);
        setForm({ title: data.title, description: data.description || '', status: data.status, priority: data.priority, dueDate: data.dueDate ? data.dueDate.slice(0,10) : '' });
      } catch {
        navigate('/my-tasks');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateTask(id, form);
      setTask(data);
      setEditing(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this task?')) return;
    try { await deleteTask(id); navigate('/my-tasks'); }
    catch (e) { console.error(e); }
  };

  const handleStatusChange = async (status) => {
    try { const { data } = await updateStatus(id, status); setTask(data); }
    catch (e) { console.error(e); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await postComment(id, comment);
      setTask(data);
      setComment('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter', color: '#64748b' }}>Loading…</div>;
  if (!task)   return null;

  const statusBadge = (s) => {
    if (s === 'done')        return <span className="badge badge-success">Done</span>;
    if (s === 'in-progress') return <span className="badge badge-warning">In Progress</span>;
    return <span className="badge badge-todo">To Do</span>;
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No due date';

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {}
        <header className="top-header">
          <div className="task-nav-left">
            <Link to="/my-tasks" className="btn-back">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Tasks
            </Link>
            <div className="breadcrumb" style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border-light)', paddingLeft: '1rem' }}>
              <span className="text-muted">My Tasks</span>
              <span className="separator">/</span>
              <span className="current">{task.title.slice(0, 30)}{task.title.length > 30 ? '…' : ''}</span>
            </div>
          </div>
        </header>

        <div className="content-scroll">
          <div className="task-details-layout">
            {}
            <div className="task-main-column">
              <div className="task-document">
                {editing ? (
                  <>
                    <input
                      className="task-h1"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: 8, padding: '0.5rem', marginBottom: '1.5rem', fontFamily: 'inherit', fontWeight: 800, fontSize: '1.75rem' }}
                    />
                    <div className="rich-text-content">
                      <textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows={8}
                        placeholder="Task description..."
                        style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: 8, fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1.7, resize: 'vertical', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                      <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="task-h1">{task.title}</h1>
                    <div className="rich-text-content">
                      {task.description
                        ? task.description.split('\n').map((p, i) => <p key={i}>{p}</p>)
                        : <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No description provided.</p>
                      }
                    </div>
                  </>
                )}

      

                {}
              
              </div>
            </div>

            {}
            <div className="task-sidebar">
              <div className="properties-panel">
                <h3>Properties</h3>
                <div className="property-row">
                  <span className="prop-label">Status</span>
                  {editing ? (
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid var(--border-light)', borderRadius: 6, fontSize: '0.85rem', fontFamily: 'inherit' }}>
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  ) : statusBadge(task.status)}
                </div>
                <div className="property-row">
                  <span className="prop-label">Assignee</span>
                  <div className="prop-value assignee">
                    <div className="avatar-micro">{initial}</div>
                    {user?.name?.split(' ')[0]}
                  </div>
                </div>
                <div className="property-row">
                  <span className="prop-label">Due Date</span>
                  {editing ? (
                    <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid var(--border-light)', borderRadius: 6, fontSize: '0.85rem', fontFamily: 'inherit' }} />
                  ) : (
                    <span className="prop-value date-value">{formatDate(task.dueDate)}</span>
                  )}
                </div>
                <div className="property-row">
                  <span className="prop-label">Priority</span>
                  {editing ? (
                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid var(--border-light)', borderRadius: 6, fontSize: '0.85rem', fontFamily: 'inherit' }}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : (
                    <span className={`prop-value${task.priority === 'high' ? ' priority-high' : ''}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  )}
                </div>
                <div className="property-row">
                  <span className="prop-label">Created</span>
                  <span className="prop-value" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {}
              {!editing && (
                <div className="properties-panel">
                  <h3>Quick Actions</h3>
                  {['todo', 'in-progress', 'done'].map(s => (
                    <button key={s} onClick={() => handleStatusChange(s)}
                      className="btn btn-outline btn-full"
                      style={{ marginBottom: '0.5rem', opacity: task.status === s ? 0.5 : 1, fontSize: '0.85rem' }}>
                      Mark as {s === 'todo' ? 'To Do' : s === 'in-progress' ? 'In Progress' : 'Done'}
                    </button>
                  ))}
                </div>
              )}

              <div className="actions-panel">
                <button className="btn btn-outline btn-full" style={{ marginBottom: '0.75rem' }} onClick={() => setEditing(!editing)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  {editing ? 'Cancel Edit' : 'Edit Task'}
                </button>
                <button className="btn-danger-ghost btn-full" onClick={handleDelete}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetails;
