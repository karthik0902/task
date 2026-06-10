import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateProfile, updatePassword, deleteAccount } from '../services/api';
import '../styles/dashboard-styles.css';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({
    fullName: user?.name || '',
    role: user?.role || '',
    email: user?.email || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saved, setSaved]   = useState(false);
  const [pwMsg, setPwMsg]   = useState('');
  const [stats, setStats]   = useState({ total: 0, completed: 0, rate: 0 });

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getTasks();
        const total = data.tasks.length;
        const completed = data.tasks.filter(t => t.status === 'done').length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        setStats({ total, completed, rate });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateProfile({ name: form.fullName, role: form.role });
      updateUser({ name: data.name, role: data.role });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwMsg('error:Passwords do not match.');
    }
    if (pwForm.newPassword.length < 6) {
      return setPwMsg('error:Password must be at least 6 characters.');
    }
    try {
      await updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('success:Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err) {
      setPwMsg(`error:${err.response?.data?.message || 'Password update failed.'}`);
      setTimeout(() => setPwMsg(''), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to delete your account? This will permanently delete all your tasks and account info. This action cannot be undone.')) {
      return;
    }
    try {
      await deleteAccount();
      logout();
    } catch (err) {
      console.error(err);
      alert('Failed to delete account.');
    }
  };

  const [pwType, pwText] = pwMsg.startsWith('error:')
    ? ['error', pwMsg.replace('error:', '')]
    : pwMsg.startsWith('success:')
    ? ['success', pwMsg.replace('success:', '')]
    : ['', ''];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="breadcrumb">
            <span className="text-muted">TaskMaster</span>
            <span className="separator">/</span>
            <span className="current">Account Settings</span>
          </div>
        </header>

        <div className="content-scroll">
          <div className="settings-container">
            <div className="page-header">
              <h1>Account Settings</h1>
              <p>Manage your profile, security preferences, and view your stats.</p>
            </div>

            {}
            <div className="settings-tabs">
              {['general', 'security'].map(tab => (
                <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {}
            {activeTab === 'general' && (
              <>
                <section className="settings-card">
                  <div className="card-body">
                    <h2 className="card-title">Profile Information</h2>
                    <p className="card-desc">Update your personal details and public profile.</p>

                    <div className="avatar-section">
                      <div className="avatar-large">{initial}</div>
                      <div className="avatar-actions">
                  
                      </div>
                    </div>

                    {saved && (
                      <div style={{ background: '#d1fae5', color: '#047857', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>
                        ✓ Changes saved successfully!
                      </div>
                    )}

                    <form className="settings-form" onSubmit={handleSave}>
                      <div className="form-row">
                        <div className="input-group">
                          <label htmlFor="fullName">Full Name</label>
                          <input type="text" id="fullName" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                        </div>
                        <div className="input-group">
                          <label htmlFor="role">Role / Job Title</label>
                          <input type="text" id="role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                        </div>
                      </div>
                      <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" value={form.email} disabled />
                        <span className="input-hint">Email addresses cannot be changed directly. Please contact support.</span>
                      </div>
                    </form>
                  </div>
                  <div className="card-footer">
                    <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                  </div>
                </section>

                <section className="settings-card">
                  <div className="card-body">
                    <h2 className="card-title">Your Activity</h2>
                    <p className="card-desc">A quick overview of your productivity.</p>
                    <div className="stats-mini-grid">
                      <div className="stat-box">
                        <span className="stat-label">Total Tasks Created</span>
                        <span className="stat-number">{stats.total}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">Tasks Completed</span>
                        <span className="stat-number text-success">{stats.completed}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">Completion Rate</span>
                        <span className="stat-number">{stats.rate}%</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="settings-card danger-zone">
                  <div className="card-body">
                    <h2 className="card-title text-danger">Danger Zone</h2>
                    <p className="card-desc">Permanently delete your account and all of your data.</p>
                    <div className="danger-box">
                      <div>
                        <h4>Delete Account</h4>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                      </div>
                      <button className="btn btn-danger" onClick={handleDeleteAccount}>Delete Account</button>
                    </div>
                  </div>
                </section>
              </>
            )}

            {}
            {activeTab === 'security' && (
              <section className="settings-card">
                <div className="card-body">
                  <h2 className="card-title">Change Password</h2>
                  <p className="card-desc">Ensure your account is using a long, random password to stay secure.</p>

                  {pwText && (
                    <div style={{ background: pwType === 'success' ? '#d1fae5' : '#fef2f2', color: pwType === 'success' ? '#047857' : '#dc2626', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>
                      {pwText}
                    </div>
                  )}

                  <form className="settings-form" onSubmit={handlePasswordUpdate}>
                    <div className="input-group max-w-md">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input type="password" id="currentPassword" placeholder="Enter current password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
                    </div>
                    <div className="input-group max-w-md">
                      <label htmlFor="newPassword">New Password</label>
                      <input type="password" id="newPassword" placeholder="Enter new password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                    </div>
                    <div className="input-group max-w-md">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input type="password" id="confirmPassword" placeholder="Confirm new password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
                    </div>
                  </form>
                </div>
                <div className="card-footer">
                  <button className="btn btn-primary" onClick={handlePasswordUpdate}>Update Password</button>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
