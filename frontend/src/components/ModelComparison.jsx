import React, { useState } from 'react';
import { Scale, Zap, ShieldCheck, AlertTriangle, Cpu, Sparkles } from 'lucide-react';
import { compareModels } from '../api/client';

export default function ModelComparison() {
  const [prompt, setPrompt] = useState(
    'A hyper-detailed portrait of a robotic astronaut on a glowing red crater with transparent crystal towers.'
  );
  const [dolaAlpha, setDolaAlpha] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState(null);

  const presets = [
    'A cybernetic cat sitting on a neon rooftop under a giant crescent moon.',
    'An ancient temple carved inside a floating water droplet with lightning arcs.',
    'A steampunk laboratory with glowing copper vacuum tubes and holographic gear blueprints.'
  ];

  const handleRunComparison = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await compareModels(prompt, dolaAlpha);
      setComparisonData(data);
    } catch (err) {
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score < 0.3) return '#10b981';
    if (score < 0.55) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div className="gradient-badge">
            <Scale size={16} /> Benchmark Suite
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
            DoLa Contrastive Decoding Active
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-bright)' }}>
          Multi-VLM Side-by-Side Model Comparison
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Evaluate hallucination rates, Shannon Entropy ($H$), POPE benchmark accuracy, and CHAIR metrics across Google Gemma-4, PaliGemma-3B, LLaVA-1.6, and Qwen-VL.
        </p>
      </div>

      {/* Control Panel */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <form onSubmit={handleRunComparison} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Evaluation Prompt
            </label>
            <input
              type="text"
              className="glass-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter multimodal query prompt for benchmark comparison..."
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', alignSelf: 'center' }}>Presets:</span>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {p.substring(0, 35)}...
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-bright)' }}>
                  DoLa Contrastive Decoding (α)
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {dolaAlpha.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={dolaAlpha}
                onChange={(e) => setDolaAlpha(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Formula: Logits_DoLa = Logits_L - α * Logits_M (subtracts premature layer high-entropy noise)
              </span>
            </div>

            <button
              type="submit"
              className="gradient-btn"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px' }}
            >
              {loading ? <Zap className="spin" size={18} /> : <Sparkles size={18} />}
              {loading ? 'Evaluating Models...' : 'Execute Benchmark Comparison'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparisonData && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {comparisonData.results.map((item, idx) => {
              const scoreColor = getScoreColor(item.overall_hallucination_score);
              const isTopModel = idx === 0;
              return (
                <div
                  key={idx}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    position: 'relative',
                    border: isTopModel ? '1px solid rgba(0, 242, 254, 0.5)' : '1px solid var(--border-color)',
                    background: isTopModel ? 'rgba(0, 242, 254, 0.04)' : 'rgba(15, 23, 42, 0.4)'
                  }}
                >
                  {isTopModel && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px' }} className="badge badge-cyan">
                      Primary Model
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <Cpu size={20} color={isTopModel ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                      {item.model_name}
                    </h3>
                  </div>

                  {/* Hallucination Score Meter */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overall Hallucination Score</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: scoreColor }}>
                        {(item.overall_hallucination_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.overall_hallucination_score * 100}%`,
                          background: scoreColor,
                          borderRadius: '4px',
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>POPE Accuracy</span>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                        {(item.pope_accuracy * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>Mean Entropy (H)</span>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                        {item.mean_entropy.toFixed(3)}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>CHAIR_s (Sentence)</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                        {(item.chair_s * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>CHAIR_i (Instance)</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                        {(item.chair_i * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* DoLa Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', pt: '12px' }}>
                    <span>DoLa Mitigation Active:</span>
                    <span style={{ color: item.dola_mitigated ? 'var(--accent-cyan)' : 'var(--text-dim)', fontWeight: 600 }}>
                      {item.dola_mitigated ? `Yes (α=${dolaAlpha})` : 'Disabled (α=0)'}
                    </span>
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, background: 'rgba(0, 0, 0, 0.2)', padding: '10px', borderRadius: '8px' }}>
                    <em>"{item.generated_text}"</em>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
