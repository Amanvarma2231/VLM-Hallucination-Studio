import React, { useEffect, useState } from 'react';
import { Database, Download, Copy, Check, FileJson, Sparkles, Layers } from 'lucide-react';
import { fetchTrainingSamples, getExportDatasetUrl } from '../api/client';

export default function DatasetStudio() {
  const [samples, setSamples] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState('sft'); // 'sft', 'dpo', 'alpaca'

  useEffect(() => {
    async function loadSamples() {
      try {
        const data = await fetchTrainingSamples();
        setSamples(data || []);
      } catch (err) {
        console.error('Failed to load training samples:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSamples();
  }, []);

  const getFormattedJSONL = () => {
    if (exportFormat === 'dpo') {
      return samples.map(s => JSON.stringify({
        prompt: s.prompt,
        chosen: `Visually Grounded Output: ${s.ground_truth_context || s.prompt}`,
        rejected: `Unconstrained VLM Output: ${s.hallucinated_segment}`,
        sample_type: "DPO Preference Pair"
      })).join('\n');
    }

    if (exportFormat === 'alpaca') {
      return samples.map(s => JSON.stringify({
        instruction: `Analyze visual alignment for: ${s.prompt}`,
        input: "",
        output: s.hallucinated_segment
      })).join('\n');
    }

    // Default SFT format
    return samples.map(s => JSON.stringify({
      instruction: s.prompt,
      hallucinated_output: s.hallucinated_segment,
      ground_truth_context: s.ground_truth_context || "",
      sample_type: s.sample_type,
      created_at: s.created_at
    })).join('\n');
  };

  const jsonlString = getFormattedJSONL();

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonlString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonlString], { type: 'application/jsonlines' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vlm_hallucinations_${exportFormat}_dataset.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} className="text-pink-gradient" /> Isolated Hallucination Fine-Tuning Exporter
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '650px' }}>
            Extracts high-entropy VLM generation segments into SFT, DPO Preference Pairs, and Alpaca format JSONL datasets for Gemma 4 & multimodal fine-tuning.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Format Selector */}
          <div style={{ display: 'flex', background: 'rgba(5, 9, 18, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setExportFormat('sft')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: exportFormat === 'sft' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
                color: exportFormat === 'sft' ? 'var(--accent-cyan)' : 'var(--text-dim)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              SFT Format
            </button>
            <button
              onClick={() => setExportFormat('dpo')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: exportFormat === 'dpo' ? 'rgba(255, 42, 133, 0.2)' : 'transparent',
                color: exportFormat === 'dpo' ? 'var(--accent-pink)' : 'var(--text-dim)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              DPO Pairs
            </button>
            <button
              onClick={() => setExportFormat('alpaca')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: exportFormat === 'alpaca' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                color: exportFormat === 'alpaca' ? 'var(--accent-purple)' : 'var(--text-dim)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Alpaca
            </button>
          </div>

          <button onClick={handleCopy} className="btn btn-secondary">
            {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button onClick={handleDownload} className="btn btn-pink">
            <Download size={16} /> Export JSONL
          </button>
        </div>
      </div>

      {/* Grid View: Samples & JSONL Live Code View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Samples Table */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-pink)" /> Extracted Training Pairs ({samples.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
            {samples.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', padding: '16px', textAlign: 'center' }}>
                No training samples extracted yet. Run an analysis or click "Seed Demo Data".
              </p>
            ) : (
              samples.map((item) => (
                <div key={item.id} style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(5, 9, 18, 0.8)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ color: 'var(--accent-cyan)', marginBottom: '4px', fontWeight: 600 }}>
                    Prompt: "{item.prompt}"
                  </div>
                  <div style={{ color: 'var(--accent-pink)', fontFamily: 'var(--font-mono)' }}>
                    Segment: "{item.hallucinated_segment}"
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live JSONL Code Box */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileJson size={16} color="var(--accent-cyan)" /> Live JSONL Stream ({exportFormat.toUpperCase()})
            </h3>
            <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
              {samples.length} Records
            </span>
          </div>

          <pre style={{
            background: '#040710',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            color: '#a9b7c6',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            maxHeight: '420px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {jsonlString || '// JSONL output will stream here once prompt analysis is run...'}
          </pre>
        </div>
      </div>
    </div>
  );
}

