import React, { useState } from 'react';
import { Play, Upload, Image as ImageIcon, Sliders, AlertTriangle, CheckCircle, Flame, Layers, Search, HelpCircle, X, ShieldAlert } from 'lucide-react';
import { analyzePrompt, explainToken } from '../api/client';

export default function HallucinationStudio({ currentSession, setCurrentSession, onAnalysisComplete }) {
  const [prompt, setPrompt] = useState(
    'A futuristic cyberpunk floating city with neon bioluminescent towers under a dark purple storm sky.'
  );
  const [modelName, setModelName] = useState('Gemma-4 VLM (Multimodal)');
  const [entropyThreshold, setEntropyThreshold] = useState(0.65);
  const [groundingBias, setGroundingBias] = useState(0.5);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredToken, setHoveredToken] = useState(null);
  
  // Explainability Modal State
  const [selectedTokenForExplain, setSelectedTokenForExplain] = useState(null);
  const [explainData, setExplainData] = useState(null);
  const [explainingLoading, setExplainingLoading] = useState(false);

  const handleOpenExplainModal = async (tok) => {
    setSelectedTokenForExplain(tok);
    setExplainingLoading(true);
    try {
      const data = await explainToken({
        token_text: tok.token_text,
        logit_entropy: tok.logit_entropy,
        visual_grounding_score: tok.visual_grounding_score,
        attention_x: tok.attention_x,
        attention_y: tok.attention_y,
        context_prompt: prompt
      });
      setExplainData(data);
    } catch (err) {
      console.error('Failed to explain token:', err);
    } finally {
      setExplainingLoading(false);
    }
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('model_name', modelName);
      formData.append('entropy_threshold', entropyThreshold);
      formData.append('grounding_bias', groundingBias);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const sessionData = await analyzePrompt(formData);
      setCurrentSession(sessionData);
      if (onAnalysisComplete) onAnalysisComplete(sessionData);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', padding: '24px' }}>
      {/* Left Column: Input Form & Token Extractor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Input Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} className="text-gradient" /> Multimodal Prompt Input
            </h2>
            <span className="badge badge-cyan">VLM Realtime Hook</span>
          </div>

          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Text Prompt / Image Caption Context
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter vision-language prompt to test hallucination probability..."
              />
            </div>

            {/* Image Upload Row */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <label style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px',
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                <Upload size={18} />
                {imageFile ? imageFile.name : 'Upload Input Image (Optional)'}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>

              {imagePreview && (
                <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--accent-cyan)' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            {/* Model & Sliders */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '4px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target VLM Model</label>
                <select
                  className="input-field"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  style={{ marginTop: '4px', padding: '8px' }}
                >
                  <option value="Gemma-4 VLM (Multimodal)">Gemma-4 VLM (Multimodal)</option>
                  <option value="PaliGemma-3B">PaliGemma-3B</option>
                  <option value="LLaVA-1.6 Vision">LLaVA-1.6 Vision</option>
                  <option value="Custom Vision Transformer">Custom Vision Transformer</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Entropy Threshold ($H$): <strong style={{ color: 'var(--accent-cyan)' }}>{entropyThreshold}</strong>
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="0.95"
                  step="0.05"
                  value={entropyThreshold}
                  onChange={(e) => setEntropyThreshold(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '8px', accentColor: 'var(--accent-cyan)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Visual Grounding Bias: <strong style={{ color: 'var(--accent-purple)' }}>{groundingBias}</strong>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={groundingBias}
                  onChange={(e) => setGroundingBias(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '8px', accentColor: 'var(--accent-purple)' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '8px', width: '100%', padding: '14px' }}>
              {loading ? (
                <>Analyzing Token Attention & Logits...</>
              ) : (
                <>
                  <Play size={18} /> Extract & Quantify Hallucinations
                </>
              )}
            </button>
          </form>
        </div>

        {/* Extracted Token Stream & Inspector */}
        {currentSession && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} color="var(--accent-pink)" /> Extracted Hallucination Token Sequence
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-emerald"><CheckCircle size={12} /> Grounded</span>
                <span className="badge badge-pink"><AlertTriangle size={12} /> Hallucinated</span>
              </div>
            </div>

            {/* Explainability Notice Banner */}
            <div style={{
              marginBottom: '16px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08), rgba(168, 85, 247, 0.05))',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.82rem'
            }}>
              <HelpCircle size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--accent-cyan)' }}>Answering: "How do I know something is hallucinated?"</strong>
                {' '}— Click any <span style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>red token</span> to open the full <strong>Hallucination Proof Inspector</strong> with entropy analysis, visual grounding score, spatial region proof, and plain-English reasoning.
              </span>
            </div>

            {/* Token Chips Render */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(5, 8, 15, 0.9)',
              border: '1px solid var(--border-color)',
              minHeight: '120px',
              lineHeight: '2.4'
            }}>
              {currentSession.extracted_tokens?.map((tok) => (
                <span
                  key={tok.token_index}
                  className={`token-chip ${tok.is_hallucinated ? 'token-hallucinated' : 'token-grounded'}`}
                  onMouseEnter={() => setHoveredToken(tok)}
                  onMouseLeave={() => setHoveredToken(null)}
                  onClick={() => handleOpenExplainModal(tok)}
                  title={tok.is_hallucinated ? "⚠️ HALLUCINATED — Click for full evidence-based proof!" : "✅ GROUNDED — Click to verify visual alignment."}
                  style={{ cursor: 'pointer' }}
                >
                  {tok.token_text}
                </span>
              ))}
            </div>

            {/* Hovered Token Inspector Panel */}
            {hoveredToken ? (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(0, 242, 254, 0.05)',
                border: '1px solid var(--accent-cyan)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem'
              }}>
                <div>
                  <strong>Token:</strong> <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>"{hoveredToken.token_text}"</span>
                  <span style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>Index #{hoveredToken.token_index}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span>Entropy ($H$): <strong style={{ color: 'var(--accent-pink)' }}>{hoveredToken.logit_entropy}</strong></span>
                  <span>Grounding ($G$): <strong style={{ color: 'var(--accent-emerald)' }}>{hoveredToken.visual_grounding_score}</strong></span>
                  <button
                    onClick={() => handleOpenExplainModal(hoveredToken)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Search size={12} /> Why Hallucinated? (Evidence Proof)
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                👆 Click any <span style={{ color: 'var(--accent-pink)' }}>red token</span> → full diagnostic evidence with entropy, grounding score &amp; spatial proof.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Explainability Proof Inspector Modal */}
      {selectedTokenForExplain && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 150,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '650px',
            width: '100%',
            padding: '28px',
            border: '1px solid var(--accent-cyan)',
            boxShadow: '0 0 40px rgba(0, 242, 254, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={22} color="var(--accent-pink)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Hallucination Proof & Diagnostic Inspector
                </h3>
              </div>
              <button
                onClick={() => { setSelectedTokenForExplain(null); setExplainData(null); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Direct answer to user question: <em>"How do I know something is hallucinated?"</em>
            </p>

            {explainingLoading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--accent-cyan)' }}>
                Computing token entropy distribution & visual feature alignment proof...
              </div>
            ) : explainData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Verdict Box */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: explainData.is_hallucinated ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  border: `1px solid ${explainData.is_hallucinated ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Token</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                      "{explainData.token_text}"
                    </div>
                  </div>

                  <span className={`badge ${explainData.is_hallucinated ? 'badge-pink' : 'badge-emerald'}`} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    {explainData.confidence_verdict}
                  </span>
                </div>

                {/* Classification Category */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.86rem' }}>
                  <strong style={{ color: 'var(--accent-purple)' }}>Hallucination Category:</strong>
                  <div style={{ marginTop: '2px', color: 'var(--text-main)', fontWeight: 600 }}>
                    {explainData.hallucination_category}
                  </div>
                </div>

                {/* Plain-English Why Explanation */}
                <div style={{ background: 'rgba(0, 242, 254, 0.05)', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(0, 242, 254, 0.2)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                  <strong style={{ color: 'var(--accent-cyan)', display: 'block', marginBottom: '4px' }}>
                    Visual Grounding Rationale:
                  </strong>
                  {explainData.why_hallucinated_explanation}
                </div>

                {/* Metrics Breakdown Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entropy Analysis</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>
                      {explainData.entropy_analysis}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spatial Region Bounding Proof</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>
                      {explainData.spatial_region_proof}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    onClick={() => { setSelectedTokenForExplain(null); setExplainData(null); }}
                    className="btn btn-primary"
                    style={{ padding: '8px 20px' }}
                  >
                    Done Inspecting
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}


      {/* Right Column: Score Summary & Diagnostics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {currentSession ? (
          <>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Session Diagnostics
              </h3>

              {/* Overall Score Meter */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: currentSession.overall_hallucination_score > 0.5 ? 'var(--accent-pink)' : 'var(--accent-cyan)',
                  lineHeight: 1
                }}>
                  {(currentSession.overall_hallucination_score * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Overall Hallucination Index
                </div>
                <span className={`badge ${currentSession.overall_hallucination_score > 0.5 ? 'badge-pink' : 'badge-cyan'}`} style={{ marginTop: '8px' }}>
                  {currentSession.hallucination_intensity}
                </span>
              </div>

              {/* Key Metrics Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Visual Drift ($V_{'{drift}'}$):</span>
                  <strong style={{ color: 'var(--accent-purple)' }}>{currentSession.visual_drift_index}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mean Logit Entropy ($H$):</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{currentSession.mean_entropy}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Model Architecture:</span>
                  <strong style={{ fontSize: '0.8rem' }}>{currentSession.model_name}</strong>
                </div>
              </div>
            </div>

            {/* Generated Output Preview */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Synthesized VLM Response
              </h3>
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                lineHeight: '1.6',
                fontFamily: 'var(--font-mono)',
                background: 'rgba(5, 8, 15, 0.8)',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                "{currentSession.generated_text}"
              </p>
            </div>
          </>
        ) : (
          <div className="glass-panel" style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Layers size={36} color="var(--accent-cyan)" style={{ marginBottom: '12px', opacity: 0.6 }} />
            <h4 style={{ color: 'var(--text-main)', marginBottom: '6px' }}>No Active Analysis</h4>
            <p style={{ fontSize: '0.8rem' }}>
              Submit a prompt above or click "Seed Demo Data" in the header to populate real-time VLM hallucination metrics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
