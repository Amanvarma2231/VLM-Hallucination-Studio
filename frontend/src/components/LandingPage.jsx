import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, Zap, ShieldCheck, BarChart3, Database, Eye, Scale,
  ArrowRight, Code2,
  Cpu, Sparkles, Activity, FlaskConical, Layers, Globe, Star,
  ChevronRight, Play, BookOpen, Award
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  const [stats, setStats] = useState({ sessions: 0, tokens: 0, samples: 0 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats({
        sessions: d.total_sessions || 0,
        tokens: d.total_hallucinated_tokens || 0,
        samples: d.total_training_samples || 0,
      }))
      .catch(() => {});
  }, []);

  // 1. Particle Background Canvas
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    const particles = [];
    const PARTICLE_COUNT = 60;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 254, ${p.opacity})`;
        ctx.fill();
        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 242, 254, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // 2. Count-Up Animation for Metrics
  const [animatedValues, setAnimatedValues] = useState({});
  useEffect(() => {
    const targets = { sessions: stats.sessions, tokens: stats.tokens, samples: stats.samples, models: 4 };
    const duration = 1500;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      
      setAnimatedValues({
        sessions: Math.round(targets.sessions * eased),
        tokens: Math.round(targets.tokens * eased),
        samples: Math.round(targets.samples * eased),
        models: Math.round(targets.models * eased)
      });
      
      if (progress >= 1) clearInterval(interval);
    }, 16);
    
    return () => clearInterval(interval);
  }, [stats]);

  // 3. Typing Effect on Subtitle
  const fullText = 'Production-ready platform for extracting, analyzing, and mitigating Vision-Language Model hallucinations.';
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [fullText]);

  // 4. Scroll-Reveal on Feature Cards
  const [visibleCards, setVisibleCards] = useState(new Set());
  const cardRefs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.index);
            setTimeout(() => {
              setVisibleCards(prev => new Set([...prev, idx]));
            }, idx * 100);
          }
        });
      },
      { threshold: 0.1 }
    );
    cardRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Brain,
      color: 'var(--accent-cyan)',
      title: 'Hallucination Studio',
      desc: 'Real-time VLM token-level hallucination extraction with Shannon Entropy scoring, logit distribution analysis, and visual grounding metrics.',
      tab: 'studio',
      badge: 'Realtime'
    },
    {
      icon: Eye,
      color: 'var(--accent-purple)',
      title: 'Attention Heatmap',
      desc: 'Interactive 2D canvas rendering of spatial attention vectors. Visualize hallucination hotspots overlaid on uploaded images.',
      tab: 'heatmap',
      badge: 'Visual'
    },
    {
      icon: Scale,
      color: 'var(--accent-blue)',
      title: 'Model Comparison',
      desc: 'Side-by-side benchmark suite: Gemma-4, PaliGemma-3B, LLaVA-1.6 & Qwen-VL. DoLa Contrastive Decoding with tunable α parameter.',
      tab: 'compare',
      badge: 'DoLa α'
    },
    {
      icon: ShieldCheck,
      color: '#ef4444',
      title: 'Medical Safety Guard',
      desc: 'Clinical AI hallucination auditing for radiology VLM outputs. Anatomical grounding scoring and risk-level flags for patient safety.',
      tab: 'medical',
      badge: 'Clinical'
    },
    {
      icon: BarChart3,
      color: 'var(--accent-emerald)',
      title: 'Analytics Dashboard',
      desc: 'Full SQLite session log with search, record inspection, deletion, and real-time stat cards. Monitor hallucination trends over time.',
      tab: 'analytics',
      badge: 'SQL'
    },
    {
      icon: Database,
      color: 'var(--accent-amber)',
      title: 'Dataset Exporter',
      desc: 'Export curated hallucination pairs as JSONL in SFT, DPO, and Alpaca formats — ready for Gemma / LLaVA fine-tuning pipelines.',
      tab: 'dataset',
      badge: 'JSONL'
    },
  ];

  const techStack = [
    { label: 'FastAPI', color: '#00c7b7', icon: '⚡' },
    { label: 'React 18', color: '#61dafb', icon: '⚛️' },
    { label: 'Vite 5', color: '#a78bfa', icon: '⚡' },
    { label: 'SQLite', color: '#4facfe', icon: '🗄️' },
    { label: 'Gemma-4 VLM', color: '#00f2fe', icon: '🧠' },
    { label: 'PaliGemma-3B', color: '#f472b6', icon: '🔬' },
    { label: 'LLaVA-1.6', color: '#10b981', icon: '👁️' },
    { label: 'DoLa Decoding', color: '#f59e0b', icon: '🎯' },
  ];

  const metrics = [
    { label: 'Prompt Sessions', value: animatedValues.sessions || 0, suffix: '', color: 'var(--accent-cyan)', icon: Activity },
    { label: 'Hallucinated Tokens', value: animatedValues.tokens || 0, suffix: '', color: 'var(--accent-rose)', icon: Zap },
    { label: 'Training Samples', value: animatedValues.samples || 0, suffix: '', color: 'var(--accent-purple)', icon: Database },
    { label: 'Models Benchmarked', value: animatedValues.models || 0, suffix: '', color: 'var(--accent-emerald)', icon: Cpu },
  ];

  return (
    <div style={{ padding: '0', animation: 'fade-in 0.4s ease' }}>

      {/* ─── HERO ─── */}
      <section style={{
        position: 'relative',
        padding: '72px 48px 64px',
        textAlign: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-color)',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,242,254,0.06) 0%, transparent 60%)'
      }}>
        {/* Particle Canvas */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

        {/* Animated background orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '8%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(0,242,254,0.06) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '8%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <span className="gradient-badge" style={{ fontSize: '0.78rem' }}>
              <Sparkles size={13} /> Production-Grade AI Safety Platform
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '20px',
            fontFamily: 'var(--font-display)'
          }}>
            Enterprise{' '}
            <span className="text-gradient">VLM Hallucination</span>
            <br />Intelligence Studio
          </h1>

          <p style={{
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            color: 'var(--text-muted)',
            maxWidth: 680,
            margin: '0 auto 36px',
            lineHeight: 1.75
          }}>
            {typedText}
            {showCursor && <span style={{ borderRight: '2px solid var(--accent-cyan)', animation: 'blink 1s step-end infinite' }}>&nbsp;</span>}
            <br />
            Powered by <span style={{ color: 'var(--accent-cyan)' }}>DoLa Contrastive Decoding</span>,{' '}
            <span style={{ color: 'var(--accent-purple)' }}>POPE/CHAIR benchmarks</span>, and a{' '}
            <span style={{ color: 'var(--accent-rose)' }}>Medical Clinical Safety Guard</span>.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="gradient-btn"
              onClick={() => setActiveTab('studio')}
              style={{ padding: '14px 32px', fontSize: '0.95rem' }}
            >
              <Play size={18} /> Launch Studio
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setActiveTab('finetune')}
              style={{ padding: '14px 24px' }}
            >
              <BookOpen size={17} /> Fine-Tuning Guide
            </button>
          </div>

          {/* Live metric strip */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '32px',
            marginTop: '48px', flexWrap: 'wrap'
          }}>
            {metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.8rem', fontWeight: 900,
                    color: m.color, fontFamily: 'var(--font-display)',
                    lineHeight: 1
                  }}>
                    {m.value}{m.suffix}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {m.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURE GRID ─── */}
      <section style={{ padding: '56px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>
            Six-Module <span className="text-gradient">AI Safety Engine</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Each module is independently operational with full backend persistence.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                ref={el => cardRefs.current[i] = el}
                data-index={i}
                className="feature-card"
                onClick={() => setActiveTab(f.tab)}
                style={{ 
                  cursor: 'pointer',
                  opacity: visibleCards.has(i) ? 1 : 0,
                  transform: visibleCards.has(i) ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="feature-icon" style={{
                  background: `linear-gradient(135deg, ${f.color}22, ${f.color}11)`,
                  border: `1px solid ${f.color}33`
                }}>
                  <Icon size={22} color={f.color} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{f.title}</h3>
                  <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>{f.badge}</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>

                <div style={{
                  marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px',
                  color: f.color, fontSize: '0.8rem', fontWeight: 600
                }}>
                  Open Module <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{
        padding: '56px 40px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="gradient-badge" style={{ marginBottom: '14px', display: 'inline-flex' }}>
              <FlaskConical size={13} /> How It Works
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              VLM Hallucination{' '}
              <span className="text-pink-gradient">Detection Pipeline</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              {
                step: '01',
                title: 'Multimodal Prompt Input',
                desc: 'Submit a text prompt with optional image upload. Configure entropy threshold (H) and visual grounding bias. Select target VLM architecture.',
                color: 'var(--accent-cyan)'
              },
              {
                step: '02',
                title: 'Token-Level Entropy Scoring',
                desc: 'The engine computes Shannon Entropy H(x) = -Σ p(x) log p(x) per token. Tokens exceeding the entropy threshold are flagged as hallucinated.',
                color: 'var(--accent-purple)'
              },
              {
                step: '03',
                title: 'Visual Grounding & Drift Analysis',
                desc: 'Visual Drift Index V_drift measures semantic deviation from the image context. 2D spatial attention coordinates (x, y) are mapped for each token.',
                color: 'var(--accent-blue)'
              },
              {
                step: '04',
                title: 'DoLa Contrastive Decoding',
                desc: 'Applies DoLa mitigation: Logits_DoLa = Logits_L − α · Logits_M, subtracting premature-layer noise to reduce factual hallucinations.',
                color: 'var(--accent-amber)'
              },
              {
                step: '05',
                title: 'Dataset Extraction & Export',
                desc: 'Flagged hallucinated segments are saved as training pairs (SFT/DPO/Alpaca JSONL) for fine-tuning Gemma, LLaVA, and other multimodal models.',
                color: 'var(--accent-rose)'
              },
            ].map((item, i) => (
              <div key={i} className="timeline-item" style={{ gap: '20px' }}>
                <div className="timeline-dot" style={{
                  borderColor: item.color,
                  background: `${item.color}18`,
                  color: item.color
                }}>
                  {item.step}
                </div>
                <div className="glass-panel" style={{ flex: 1, padding: '18px 20px' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '6px', color: item.color }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section style={{ padding: '48px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '28px' }}>
            Technology <span className="text-gradient">Stack</span>
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {techStack.map((t, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 18px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${t.color}30`,
                borderRadius: '999px',
                fontSize: '0.82rem', fontWeight: 600,
                color: t.color,
                transition: 'var(--transition-base)'
              }}>
                <span>{t.icon}</span> {t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RESEARCH CITATION ─── */}
      <section style={{
        padding: '48px 40px',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span className="gradient-badge"><Award size={13} /> Research Foundation</span>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              📄 Based on Latest VLM Research
            </div>
            <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>
              Mitigating Hallucinations in Vision-Language Models via Contrastive Decoding & Entropy-Based Token Analysis
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
              This platform implements state-of-the-art techniques from recent research including DoLa Contrastive Decoding (ICLR 2024), POPE Benchmark (EMNLP 2023), and CHAIR Evaluation metrics for systematic VLM hallucination detection and mitigation.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-cyan">DoLa · ICLR 2024</span>
              <span className="badge badge-purple">POPE · EMNLP 2023</span>
              <span className="badge badge-pink">CHAIR Metrics</span>
              <span className="badge badge-amber">Shannon Entropy</span>
              <span className="badge badge-emerald">Visual Grounding</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section style={{
        padding: '48px 40px',
        background: 'rgba(0,0,0,0.15)',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '28px' }}>
            Enterprise <span className="text-gradient">Use Cases</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {[
              { icon: '🏥', title: 'Clinical Radiology AI', desc: 'Audit VLM outputs in medical imaging to prevent misdiagnosis from hallucinated findings.', color: '#ef4444' },
              { icon: '🛰️', title: 'Satellite Image Analysis', desc: 'Validate VLM descriptions of aerial imagery for defense and environmental monitoring.', color: 'var(--accent-cyan)' },
              { icon: '🚗', title: 'Autonomous Driving', desc: 'Ensure VLM perception modules do not hallucinate non-existent objects on roadways.', color: 'var(--accent-amber)' },
              { icon: '📄', title: 'Document AI & OCR', desc: 'Detect hallucinated text in VLM-based document extraction pipelines.', color: 'var(--accent-purple)' },
            ].map((uc, i) => (
              <div key={i} className="glass-panel" style={{ padding: '20px', textAlign: 'left' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{uc.icon}</div>
                <h4 style={{ fontSize: '0.95rem', color: uc.color, marginBottom: '6px' }}>{uc.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GET STARTED CTA ─── */}
      <section style={{
        padding: '48px 40px',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'linear-gradient(135deg, rgba(0,242,254,0.1), rgba(168,85,247,0.1))',
            border: '1px solid rgba(0,242,254,0.2)',
            borderRadius: '20px',
            padding: '24px 36px',
            marginBottom: '24px',
            width: '100%',
            flexDirection: 'column'
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', marginBottom: '8px',
              boxShadow: '0 0 24px rgba(0,242,254,0.3)'
            }}>
              🚀
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Ready to Mitigate VLM Hallucinations?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Explore real-time entropy scoring, DoLa contrastive decoding, and fine-tuning dataset export.
            </p>
          </div>

          <button
            className="gradient-btn"
            onClick={() => setActiveTab('studio')}
            style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
          >
            <Zap size={19} /> Get Started with Hallucination Studio
          </button>
        </div>
      </section>

    </div>
  );
}
