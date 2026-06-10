import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getTasks, createTask, deleteTask, updateStatus } from '../services/api';
import '../styles/dashboard-styles.css';

const priorityConfig = {
  high:   { class: 'high',   label: 'High',   icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="12 19 12 5"></polyline><polyline points="5 12 12 5 19 12"></polyline></svg> },
  medium: { class: 'medium', label: 'Med',    icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg> },
  low:    { class: 'low',    label: 'Low',    icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="12 5 12 19"></polyline><polyline points="19 12 12 19 5 12"></polyline></svg> },
};

const statusBadge = (status) => {
  if (status === 'done')        return <span className="badge badge-success">Done</span>;
  if (status === 'in-progress') return <span className="badge badge-warning">In Progress</span>;
  return <span className="badge badge-todo">To Do</span>;
};

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  const today = new Date();
  const diff  = Math.ceil((date - today) / 86400000);
  if (diff < 0)  return <span style={{ color: 'var(--danger)', fontWeight: 500 }}>Overdue</span>;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const MyTasks = () => {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = useCallback(async () => {
    try { setLoading(true); const { data } = await getTasks(); setTasks(data.tasks); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCheck = async (task) => {
    try { await updateStatus(task._id, task.status === 'done' ? 'todo' : 'done'); fetchTasks(); }
    catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await deleteTask(id); fetchTasks(); }
    catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setFormError('Title is required.');
    setSubmitting(true);
    try {
      await createTask({ ...form, status: 'todo' });
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
      fetchTasks();
    } catch (err) { setFormError(err.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search my tasks..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="content-scroll">
          <div className="tasks-container">
            <div className="page-header-row">
              <div className="title-group">
                <h1>My Tasks</h1>
                <span className="count-badge">{tasks.length} Total</span>
              </div>
              <div className="toolbar">
                <div className="toolbar-left">
               
                </div>
                <div className="toolbar-right">
                
                  <button className="btn btn-primary" onClick={() => { setFormError(''); setShowModal(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    New Task
                  </button>
                </div>
              </div>
            </div>

            <div className="task-list-wrapper">
              <div className="task-list-header">
                <div className="col-checkbox">
                 
                </div>
                <div className="col-title">Task Name</div>
                <div className="col-status">Status</div>
                <div className="col-priority">Priority</div>
                <div className="col-date">Due Date</div>
                <div className="col-actions"></div>
              </div>

              <div className="task-list-body">
                {loading && <p style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Loading…</p>}
                {!loading && filteredTasks.length === 0 && (
                  <p style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>No tasks found.</p>
                )}
                {filteredTasks.map((task) => {
                  const p = priorityConfig[task.priority] || priorityConfig.medium;
                  return (
                    <div key={task._id} className={`task-row${task.status === 'done' ? ' completed-row' : ''}`}>
                      <div className="col-checkbox">
                        
                      </div>
                      <div className="col-title">
                        <Link to={`/tasks/${task._id}`} className="task-link">{task.title}</Link>
                      </div>
                      <div className="col-status">{statusBadge(task.status)}</div>
                      <div className="col-priority">
                        <span className={`priority-badge ${p.class}`}>{p.icon} {p.label}</span>
                      </div>
                      <div className="col-date">{formatDate(task.dueDate)}</div>
                      <div className="col-actions">
                        <button className="icon-btn-small" onClick={() => handleDelete(task._id)} title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>New Task</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.5rem' }}>×</button>
            </div>
            {formError && <div className="error-banner" style={{ marginBottom: '1rem' }}>{formError}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label>Title *</label>
                <input type="text" placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea placeholder="Describe the task..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  style={{ padding: '0.6rem 1rem', border: '1px solid var(--border-light)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ padding: '0.6rem 1rem', border: '1px solid var(--border-light)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none', background: '#fff' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
const modalStyle   = { background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' };

export default MyTasks;
