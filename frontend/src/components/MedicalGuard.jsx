import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, AlertOctagon, CheckCircle2, Stethoscope, Search, RefreshCw } from 'lucide-react';
import { checkMedicalGuard, fetchMedicalReviews } from '../api/client';

export default function MedicalGuard() {
  const [patientId, setPatientId] = useState('PX-9042');
  const [modality, setModality] = useState('Chest X-Ray (PA View)');
  const [findingPrompt, setFindingPrompt] = useState(
    'Bilateral lung fields show mild linear opacities. Check for pleural effusion, cardiomegaly, or pneumothorax.'
  );
  const [loading, setLoading] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const medicalPresets = [
    {
      title: 'Chest X-Ray Normal Audit',
      patientId: 'PX-1049',
      modality: 'Chest X-Ray (PA View)',
      prompt: 'Bilateral lung fields clear. Heart size normal. No pleural effusion or pneumothorax.'
    },
    {
      title: 'Potential Unsubstantiated Pathology',
      patientId: 'PX-8832',
      modality: 'Chest X-Ray (Lateral View)',
      prompt: 'Retrocardiac opacity detected. Evaluate for cardiomegaly, hilar lymphadenopathy, or pulmonary nodule.'
    },
    {
      title: 'Brain MRI Sequence Check',
      patientId: 'PX-3912',
      modality: 'Brain MRI (T2 FLAIR)',
      prompt: 'Periventricular white matter hyperintensities. No midline shift or acute hemorrhage.'
    }
  ];

  const loadHistory = async () => {
    try {
      const data = await fetchMedicalReviews();
      setHistory(data || []);
    } catch (err) {
      console.error('Failed to load medical history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleEvaluate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await checkMedicalGuard(patientId, modality, findingPrompt);
      setCurrentReview(result);
      loadHistory();
    } catch (err) {
      setError(err.message || 'Medical guard evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level) => {
    if (level === 'Low') {
      return (
        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Low Risk (Grounded)
        </span>
      );
    }
    if (level === 'Warning') {
      return (
        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
          <Activity size={12} style={{ marginRight: '4px' }} /> Warning (Moderate Risk)
        </span>
      );
    }
    return (
      <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
        <AlertOctagon size={12} style={{ marginRight: '4px' }} /> CRITICAL RISK FLAG
      </span>
    );
  };

  const filteredHistory = history.filter(
    (item) =>
      item.patient_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.modality.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.finding_prompt.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div className="gradient-badge">
            <ShieldAlert size={16} /> Clinical Guard
          </div>
          <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
            Radiology & Anatomical Safety Inspector
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-bright)' }}>
          Medical VLM Safety Guard & Clinical Audit
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Detect ungrounded medical pathology hallucinations, verify anatomical visual evidence, and enforce critical clinical risk safety thresholds.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '32px' }}>
        {/* Form Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Stethoscope size={18} color="var(--accent-cyan)" /> Radiology Finding Audit Input
          </h2>

          <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Patient Identifier
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Imaging Modality
                </label>
                <select
                  className="glass-input"
                  value={modality}
                  onChange={(e) => setModality(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)' }}
                >
                  <option value="Chest X-Ray (PA View)">Chest X-Ray (PA View)</option>
                  <option value="Chest X-Ray (Lateral View)">Chest X-Ray (Lateral View)</option>
                  <option value="Brain MRI (T2 FLAIR)">Brain MRI (T2 FLAIR)</option>
                  <option value="Abdominal CT (Contrast)">Abdominal CT (Contrast)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Radiological Query / VLM Finding Prompt
              </label>
              <textarea
                className="glass-input"
                rows={4}
                value={findingPrompt}
                onChange={(e) => setFindingPrompt(e.target.value)}
                placeholder="Enter radiological finding prompt..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                Clinical Presets:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {medicalPresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPatientId(p.patientId);
                      setModality(p.modality);
                      setFindingPrompt(p.prompt);
                    }}
                    style={{
                      textAlign: 'left',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <strong>{p.title}:</strong> {p.prompt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="gradient-btn"
              disabled={loading}
              style={{ padding: '12px', marginTop: '8px' }}
            >
              {loading ? 'Running Anatomical Audit...' : 'Execute Clinical Safety Guard'}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>
          )}
        </div>

        {/* Results Inspection Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px' }}>
            Clinical Safety Guard Evaluation
          </h2>

          {currentReview ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Patient ID</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {currentReview.patient_id}
                  </div>
                </div>
                <div>{getRiskBadge(currentReview.hallucination_risk_level)}</div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Anatomical Grounding Score</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: currentReview.anatomical_grounding_score > 0.75 ? '#10b981' : '#ef4444' }}>
                    {(currentReview.anatomical_grounding_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${currentReview.anatomical_grounding_score * 100}%`,
                      background: currentReview.anatomical_grounding_score > 0.75 ? '#10b981' : '#ef4444',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>

              {currentReview.flagged_entities && currentReview.flagged_entities.length > 0 && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    UNGROUNDED MEDICAL ENTITIES DETECTED:
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {currentReview.flagged_entities.map((e, i) => (
                      <span key={i} className="badge" style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                        ⚠️ {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                  AI Clinical Impression & Safety Recommendation:
                </span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {currentReview.ai_generated_diagnosis}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-dim)' }}>
              <ShieldAlert size={48} color="rgba(255, 255, 255, 0.2)" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '0.9rem' }}>Submit radiological prompt to trigger clinical safety audit.</p>
            </div>
          )}
        </div>
      </div>

      {/* Medical History Audit Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)' }}>
            Historical Medical Audits ({filteredHistory.length})
          </h2>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="glass-input"
                placeholder="Search patient or modality..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '0.8rem', width: '220px' }}
              />
            </div>
            <button
              onClick={loadHistory}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Patient ID</th>
                <th style={{ padding: '10px' }}>Modality</th>
                <th style={{ padding: '10px' }}>Grounding Score</th>
                <th style={{ padding: '10px' }}>Risk Level</th>
                <th style={{ padding: '10px' }}>Flagged Entities</th>
                <th style={{ padding: '10px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                  <td style={{ padding: '10px', fontWeight: 600, color: 'var(--accent-cyan)' }}>{row.patient_id}</td>
                  <td style={{ padding: '10px' }}>{row.modality}</td>
                  <td style={{ padding: '10px', fontWeight: 700 }}>{(row.anatomical_grounding_score * 100).toFixed(1)}%</td>
                  <td style={{ padding: '10px' }}>{getRiskBadge(row.hallucination_risk_level)}</td>
                  <td style={{ padding: '10px' }}>
                    {row.flagged_entities && row.flagged_entities.length > 0 ? (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>{row.flagged_entities.join(', ')}</span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '10px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(row.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}

              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No medical audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
