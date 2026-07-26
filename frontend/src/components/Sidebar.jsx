import React, { useState, useEffect } from 'react';
import { Home, Sliders, Eye, Scale, ShieldAlert, BarChart3, Database, BookOpen, Layers, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, collapsed, onToggleCollapse }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [sessionCounts, setSessionCounts] = useState({});

  // Fetch module progress counts
  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setSessionCounts({
        studio: d.total_sessions || 0,
        analytics: d.total_sessions || 0,
        dataset: d.total_training_samples || 0,
      }))
      .catch(() => {});
  }, []);

  const menuItems = [
    { id: 'home', label: 'Overview', icon: Home },
    { divider: 'Core Modules' },
    { id: 'studio', label: 'Hallucination Studio', icon: Sliders, badge: 'Realtime', color: 'var(--accent-cyan)' },
    { id: 'heatmap', label: 'Attention Heatmap', icon: Eye, badge: 'Visual', color: 'var(--accent-purple)' },
    { id: 'compare', label: 'Model Comparison', icon: Scale, badge: 'DoLa α', color: 'var(--accent-blue)' },
    { id: 'medical', label: 'Medical Safety Guard', icon: ShieldAlert, badge: 'Clinical', color: '#ef4444' },
    { divider: 'Data & Analytics' },
    { id: 'analytics', label: 'Analytics & DB', icon: BarChart3, badge: 'SQL', color: 'var(--accent-emerald)' },
    { id: 'dataset', label: 'Dataset Exporter', icon: Database, badge: 'JSONL', color: 'var(--accent-amber)' },
    { divider: 'Documentation' },
    { id: 'finetune', label: 'Fine-Tuning Guide', icon: BookOpen, badge: 'Docs', color: 'var(--accent-pink)' },
  ];

  const sidebarWidth = collapsed ? '64px' : '256px';

  return (
    <aside style={{
      width: sidebarWidth,
      minWidth: sidebarWidth,
      background: 'rgba(8, 13, 25, 0.7)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-color)',
      padding: collapsed ? '20px 6px' : '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      overflowY: 'auto',
      overflowX: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative'
    }}>

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        style={{
          position: 'absolute',
          top: '24px',
          right: collapsed ? '50%' : '8px',
          transform: collapsed ? 'translateX(50%)' : 'none',
          width: '24px', height: '24px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--text-dim)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'var(--transition-fast)',
          zIndex: 5
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,242,254,0.3)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      <div style={{ height: '36px' }} /> {/* Spacer for toggle */}

      {menuItems.map((item, idx) => {
        if (item.divider) {
          if (collapsed) return null;
          return (
            <div key={`div-${idx}`} style={{
              padding: '14px 10px 6px',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}>
              {item.divider}
            </div>
          );
        }

        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const accentColor = item.color || 'var(--accent-cyan)';
        const isHovered = hoveredItem === item.id;
        const count = sessionCounts[item.id];

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            title={collapsed ? item.label : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              width: '100%',
              padding: collapsed ? '10px 0' : '10px 12px',
              borderRadius: '10px',
              border: isActive
                ? `1px solid ${accentColor}40`
                : '1px solid transparent',
              background: isActive
                ? `${accentColor}12`
                : isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
              color: isActive ? accentColor : isHovered ? 'var(--text-main)' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              marginBottom: '2px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Active glow line */}
            {isActive && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: '15%',
                bottom: '15%',
                width: '3px',
                borderRadius: '0 4px 4px 0',
                background: accentColor,
                boxShadow: `0 0 10px ${accentColor}`,
                transition: 'all 0.3s ease'
              }} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '9px' }}>
              <Icon
                size={16}
                color={isActive ? accentColor : isHovered ? 'var(--text-main)' : 'var(--text-dim)'}
                style={{ flexShrink: 0 }}
              />
              {!collapsed && (
                <span style={{ fontSize: '0.84rem', whiteSpace: 'nowrap' }}>{item.label}</span>
              )}
            </div>

            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Progress count */}
                {count !== undefined && count > 0 && (
                  <span style={{
                    padding: '1px 5px',
                    borderRadius: '999px',
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-dim)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {count}
                  </span>
                )}
                {item.badge && (
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '999px',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    background: isActive ? `${accentColor}22` : 'rgba(255,255,255,0.05)',
                    color: isActive ? accentColor : 'var(--text-dim)',
                    border: `1px solid ${isActive ? `${accentColor}40` : 'var(--border-color)'}`,
                    flexShrink: 0
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}

      {/* Footer Info Card */}
      <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
        <div style={{
          padding: collapsed ? '10px 6px' : '14px',
          borderRadius: '12px',
          background: 'rgba(0, 242, 254, 0.04)',
          border: '1px solid rgba(0, 242, 254, 0.12)',
          textAlign: collapsed ? 'center' : 'left'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            fontSize: '0.75rem', color: 'var(--accent-purple)',
            fontWeight: 700, marginBottom: collapsed ? '0' : '4px'
          }}>
            <Layers size={13} style={{ animation: 'pulse-glow 3s ease-in-out infinite' }} />
            {!collapsed && 'VLM Engine v1.0'}
          </div>
          {!collapsed && (
            <>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                Gemma-4, PaliGemma-3B, LLaVA-1.6 & Qwen-VL with DoLa contrastive decoding.
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
