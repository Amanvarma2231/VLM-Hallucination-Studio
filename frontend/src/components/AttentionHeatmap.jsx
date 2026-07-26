import React, { useEffect, useRef, useState } from 'react';
import { Eye, Grid, Flame, RefreshCw } from 'lucide-react';

export default function AttentionHeatmap({ currentSession }) {
  const canvasRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'hallucinated', 'grounded'

  useEffect(() => {
    if (!canvasRef.current || !currentSession?.extracted_tokens) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Draw Background Image if available
    if (currentSession.image_filename) {
      const img = new Image();
      img.src = `/api/uploads/${currentSession.image_filename}`;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        // Add dark overlay for contrast
        ctx.fillStyle = 'rgba(6, 10, 18, 0.55)';
        ctx.fillRect(0, 0, width, height);
        drawHeatmapElements(ctx, width, height);
      };
      img.onerror = () => {
        drawDefaultBackgroundAndHeatmap(ctx, width, height);
      };
    } else {
      drawDefaultBackgroundAndHeatmap(ctx, width, height);
    }

    function drawDefaultBackgroundAndHeatmap(ctx, width, height) {
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);
      drawHeatmapElements(ctx, width, height);
    }

    function drawHeatmapElements(ctx, width, height) {
      // Draw Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Filter tokens
      const tokens = currentSession.extracted_tokens.filter(t => {
        if (activeFilter === 'hallucinated') return t.is_hallucinated;
        if (activeFilter === 'grounded') return !t.is_hallucinated;
        return true;
      });

      // Render Radial Heatmaps & Token Attention Pins
      tokens.forEach((tok) => {
        const px = tok.attention_x * width;
        const py = tok.attention_y * height;
        const radius = tok.is_hallucinated ? 45 : 30;

        // Create Radial Gradient Hotspot
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
        if (tok.is_hallucinated) {
          gradient.addColorStop(0, `rgba(255, 42, 133, ${tok.logit_entropy * 0.85})`);
          gradient.addColorStop(1, 'rgba(255, 42, 133, 0)');
        } else {
          gradient.addColorStop(0, `rgba(0, 242, 254, ${tok.visual_grounding_score * 0.7})`);
          gradient.addColorStop(1, 'rgba(0, 242, 254, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();

        // Pin Center Dot
        ctx.fillStyle = tok.is_hallucinated ? '#ff2a85' : '#00f2fe';
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();

        // Text Tag
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.font = 'bold 11px Fira Code, monospace';
        ctx.fillText(tok.token_text, px + 8, py + 4);
        ctx.shadowBlur = 0;
      });
    }
  }, [currentSession, activeFilter]);

  if (!currentSession) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Eye size={40} color="var(--accent-purple)" style={{ marginBottom: '12px', opacity: 0.5 }} />
        <h3>No Active Session to Visualize</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Run an analysis in the Hallucination Studio first.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={20} className="text-gradient" /> Spatial Attention & Drift Heatmap Canvas
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Visualizes 2D feature attention grid coordinates ($x, y$), entropy hotspots, and hallucination vectors.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            onClick={() => setActiveFilter('all')}
          >
            All Tokens
          </button>
          <button
            className={`btn ${activeFilter === 'hallucinated' ? 'btn-pink' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            onClick={() => setActiveFilter('hallucinated')}
          >
            <Flame size={12} /> Hallucinated Only
          </button>
          <button
            className={`btn ${activeFilter === 'grounded' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            onClick={() => setActiveFilter('grounded')}
          >
            Grounded Only
          </button>
        </div>
      </div>

      {/* Canvas Box */}
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <canvas
            ref={canvasRef}
            width={720}
            height={440}
            style={{ display: 'block', background: '#060a12' }}
          />

          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            padding: '8px 16px',
            background: 'rgba(5, 9, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <span>Legend: <strong style={{ color: '#00f2fe' }}>● Grounded Visual Attention</strong> | <strong style={{ color: '#ff2a85' }}>● Hallucination Entropy Vector</strong></span>
            <span>Session ID: {currentSession.id.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
