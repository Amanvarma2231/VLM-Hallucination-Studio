import React from 'react';
import { Cpu, Heart, Globe, Layers, Shield, Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(5, 8, 16, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-color)',
      padding: '40px 40px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top gradient line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--accent-cyan), var(--accent-purple), var(--accent-rose), transparent)',
        opacity: 0.6
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Main Footer Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 14px rgba(0, 242, 254, 0.3)'
              }}>
                <Cpu size={17} color="#040914" />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  VLM <span className="text-gradient">Hallucination Studio</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.7, maxWidth: '280px' }}>
              Enterprise-grade Vision-Language Model hallucination detection, analysis, and mitigation platform.
            </p>
          </div>

          {/* Tech Stack Column */}
          <div>
            <h4 style={{
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px'
            }}>
              <Code2 size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Technology Stack
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['FastAPI · Python 3.10+', 'React 18 · Vite 5', 'SQLAlchemy · SQLite', 'Gemma-4 · PaliGemma · LLaVA'].map((t, i) => (
                <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Capabilities Column */}
          <div>
            <h4 style={{
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px'
            }}>
              <Shield size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Core Capabilities
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['Shannon Entropy Scoring', 'DoLa Contrastive Decoding', 'Medical Safety Guard', 'SFT/DPO Dataset Export'].map((c, i) => (
                <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c}</span>
              ))}
            </div>
          </div>

          {/* Resources & Open Source Column */}
          <div>
            <h4 style={{
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px'
            }}>
              <Globe size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Platform Info
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Open Source AI Safety</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>MIT License</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>FastAPI & React Architecture</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Built with <Heart size={11} color="var(--accent-rose)" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} /> for VLM Safety Research
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>
              <Layers size={9} /> v1.0.0
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              © {new Date().getFullYear()} VLM Hallucination Studio. MIT License.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
