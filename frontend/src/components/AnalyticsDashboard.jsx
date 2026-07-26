import React, { useEffect, useState } from 'react';
import { BarChart3, Database, Layers, Flame, FileText, Search, Trash2, RefreshCw } from 'lucide-react';
import { fetchStats, fetchSessions, deleteSession, clearSessions } from '../api/client';

export default function AnalyticsDashboard({ onSelectSession }) {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, sessionsData] = await Promise.all([fetchStats(), fetchSessions()]);
      setStats(statsData);
      setSessions(sessionsData || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteSession(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all database sessions and training data?')) {
      try {
        await clearSessions();
        loadData();
      } catch (err) {
        console.error('Failed to clear sessions:', err);
      }
    }
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.model_name && s.model_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Real-Time Analytics & Database Records...</div>;
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Total Prompt Runs</span>
            <FileText size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {stats?.total_sessions || 0}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>Recorded in SQLite DB</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Avg Hallucination Score</span>
            <Flame size={16} color="var(--accent-pink)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-pink)' }}>
            {((stats?.avg_hallucination_score || 0) * 100).toFixed(1)}%
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>Across all prompt sessions</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Extracted Drift Tokens</span>
            <Layers size={16} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-purple)' }}>
            {stats?.total_hallucinated_tokens || 0}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>Isolated for training</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Training Dataset Pairs</span>
            <Database size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-emerald)' }}>
            {stats?.total_training_samples || 0}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>JSONL Exporter ready</p>
        </div>
      </div>

      {/* Database Session History Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} className="text-gradient" /> Session Log & Database Records
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Stored prompt executions, mean token entropy ($H$), and hallucination indices.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="glass-input"
                placeholder="Search prompt or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '0.8rem', width: '220px' }}
              />
            </div>

            <button
              onClick={loadData}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
              title="Refresh DB Logs"
            >
              <RefreshCw size={14} />
            </button>

            {sessions.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ef4444',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} /> Clear Database
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Prompt Context</th>
                <th style={{ padding: '12px' }}>Model</th>
                <th style={{ padding: '12px' }}>Hallucination Score</th>
                <th style={{ padding: '12px' }}>Mean Entropy</th>
                <th style={{ padding: '12px' }}>Intensity</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No sessions match filter. Run a prompt analysis or seed demo data.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((sess) => (
                  <tr key={sess.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sess.prompt}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {sess.model_name}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: sess.overall_hallucination_score > 0.5 ? 'var(--accent-pink)' : 'var(--accent-cyan)' }}>
                      {(sess.overall_hallucination_score * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>
                      {sess.mean_entropy}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${sess.overall_hallucination_score > 0.5 ? 'badge-pink' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                        {sess.hallucination_intensity}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => onSelectSession(sess)}
                      >
                        Inspect
                      </button>
                      <button
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        title="Delete Session"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

