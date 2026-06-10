import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getTasks, createTask, updateTask, deleteTask, updateStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard-styles.css';

const Dashboard = () => {
  const { user }                          = useAuth();
  const [tasks, setTasks]                 = useState([]);
  const [filter, setFilter]               = useState('all');
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editTask, setEditTask]           = useState(null);
  const [form, setForm]                   = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [submitting, setSubmitting]       = useState(false);
  const [formError, setFormError]         = useState('');
  const [searchQuery, setSearchQuery]     = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getTasks();
      setTasks(data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filtered = (filter === 'all' ? tasks
    : filter === 'pending' ? tasks.filter(t => t.status !== 'done')
    : tasks.filter(t => t.status === 'done')
  ).filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const total     = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const completed  = tasks.filter(t => t.status === 'done').length;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setFormError('Title is required.');
    setSubmitting(true);
    try {
      if (editTask) {
        await updateTask(editTask._id, form);
      } else {
        await createTask({ ...form, status: 'todo' });
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (task) => {
    try {
      await updateStatus(task._id, task.status === 'done' ? 'todo' : 'done');
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  const statusBadge = (status) => {
    if (status === 'done')        return <span className="badge badge-success">Completed</span>;
    if (status === 'in-progress') return <span className="badge badge-warning">In Progress</span>;
    return <span className="badge badge-todo">To Do</span>;
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {}
        <header className="top-header">
          <div className="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search tasks, projects..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={openCreate}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Task
            </button>
          </div>
        </header>

        <div className="content-scroll">
          {}
          <div className="page-header">
            <div>
              <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'there'}</h1>
              <p>Here is what's happening with your projects today.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Total Tasks</span>
                <div className="stat-icon" style={{ color: 'var(--primary)', background: '#e0e7ff' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
              </div>
              <h2 className="stat-value">{total}</h2>
              <p className="stat-trend">All your tasks</p>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">In Progress</span>
                <div className="stat-icon" style={{ color: 'var(--warning)', background: '#fef3c7' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
              </div>
              <h2 className="stat-value">{inProgress}</h2>
              <p className="stat-trend">Requires your attention</p>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Completed</span>
                <div className="stat-icon" style={{ color: 'var(--success)', background: '#d1fae5' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              </div>
              <h2 className="stat-value">{completed}</h2>
              <p className="stat-trend trend-up">↑ Keep it up!</p>
            </div>
          </div>

          {/* Task Board */}
          <div className="task-board-header">
            <h2>Recent Tasks</h2>
            <div className="filter-group">
              {['all', 'pending', 'completed'].map(f => (
                <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading tasks…</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No tasks yet!</p>
              <button className="btn btn-primary" onClick={openCreate}>Create your first task</button>
            </div>
          ) : (
            <div className="task-grid">
              {filtered.map((task, i) => (
                <div key={task._id} className={`task-card fade-in${task.status === 'done' ? ' completed' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="task-card-header">
                    {statusBadge(task.status)}
                    <button className="menu-btn" onClick={() => openEdit(task)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </div>
                  <Link to={`/tasks/${task._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="task-title">{task.title}</h3>
                    <p className="task-desc">{task.description || 'No description.'}</p>
                  </Link>
                  <div className="task-footer">
                    <div className="task-date">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                    </div>
                    <div className="task-actions-group">
                      <button className="action-btn text-success" title={task.status === 'done' ? 'Revert' : 'Complete'} onClick={() => handleComplete(task)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button className="action-btn text-danger" title="Delete" onClick={() => handleDelete(task._id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editTask ? 'Edit Task' : 'New Task'}</h2>
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
                <textarea
                  placeholder="Describe the task..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{ padding: '0.6rem 1rem', border: '1px solid var(--border-light)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ padding: '0.6rem 1rem', border: '1px solid var(--border-light)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none', background: 'var(--surface)' }}>
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
              {editTask && (
                <div className="input-group">
                  <label>Status</label>
                  <select value={form.status || editTask.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ padding: '0.6rem 1rem', border: '1px solid var(--border-light)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none', background: 'var(--surface)' }}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : editTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
};
const modalStyle = {
  background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 520,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto',
};

export default Dashboard;
