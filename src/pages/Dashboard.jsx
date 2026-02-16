import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, CheckCircle2, Clock, AlertTriangle, FolderKanban, Building2, LogOut, Moon, Sun, Plus, X } from 'lucide-react';
import { useAuth } from '../modules/context/AuthContext';

const API_BASE = import.meta.env.API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const { logout, token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : 'auto';
  }, [showModal]);

  const fetchStats = () => {
    if (!token) return;
    setLoading(true);
    axios.get(`${API_BASE}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setStats(res.data))
      .catch(() => {
        setStats({
          totalTasks: 0, completedTasks: 0, inProgressTasks: 0,
          overdueTasks: 0, totalProjects: 0, totalWorkspaces: 0,
          tasksByStatus: [], tasksByPriority: []
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const createTask = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await axios.post(`${API_BASE}/tasks`,
        { title, priority, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setTitle('');
      setPriority('medium');
      setStatus('todo');
      fetchStats();
    } catch {
      setError('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div><p>Loading dashboard...</p></div>;
  }

  const statCards = [
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: BarChart3, color: '#3B82F6' },
    { label: 'Completed', value: stats?.completedTasks || 0, icon: CheckCircle2, color: '#10B981' },
    { label: 'In Progress', value: stats?.inProgressTasks || 0, icon: Clock, color: '#F59E0B' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: AlertTriangle, color: '#EF4444' },
    { label: 'Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: '#8B5CF6' },
    { label: 'Workspaces', value: stats?.totalWorkspaces || 0, icon: Building2, color: '#06B6D4' },
  ];

  return (
    <div className="dashboard-page fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted">Welcome{user?.username ? `, ${user.username}` : ''}</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Task
          </button>

          <button onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))} className="glass">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>

          <button onClick={logout} className="glass">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card glass">
            <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
              <card.icon size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="glass" style={{
            width: 380,
            padding: 24,
            borderRadius: 12,
            position: 'relative',
            background: theme === 'dark' ? '#111827' : '#fff'
          }}>
            <button onClick={() => setShowModal(false)} style={{
              position: 'absolute',
              right: 12,
              top: 12,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}>
              <X size={18} />
            </button>

            <h3 style={{ marginBottom: 12 }}>Create Task</h3>

            {error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}

            <input
              placeholder="Task title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" disabled={submitting} onClick={createTask}>
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
