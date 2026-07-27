import React, { useEffect, useState } from 'react';
import { Cpu, Sparkles, Database, Wifi, RefreshCw, Home, Mail, Bell, Command, Search } from 'lucide-react';
import { seedDemoData } from '../api/client';

export default function Header({ onRefreshStats, activeTab, setActiveTab }) {
  const [wsConnected, setWsConnected] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/monitor`;

    let ws;
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);
      ws.onmessage = () => setNotifications(n => n + 1);
    } catch (e) {
      setWsConnected(false);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          setShowPalette(p => !p);
        }
        if (e.key === '1') { e.preventDefault(); setActiveTab('studio'); }
        if (e.key === '2') { e.preventDefault(); setActiveTab('heatmap'); }
        if (e.key === '3') { e.preventDefault(); setActiveTab('compare'); }
        if (e.key === '4') { e.preventDefault(); setActiveTab('medical'); }
        if (e.key === '5') { e.preventDefault(); setActiveTab('analytics'); }
        if (e.key === '6') { e.preventDefault(); setActiveTab('dataset'); }
      }
      if (e.key === 'Escape') setShowPalette(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDemoData();
      if (onRefreshStats) onRefreshStats();
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const paletteItems = [
    { id: 'home', label: 'Overview', shortcut: '⌘H' },
    { id: 'studio', label: 'Hallucination Studio', shortcut: '⌘1' },
    { id: 'puzzles', label: 'Unknown Visual Puzzles', shortcut: '⌘P' },
    { id: 'heatmap', label: 'Attention Heatmap', shortcut: '⌘2' },
    { id: 'compare', label: 'Model Comparison', shortcut: '⌘3' },
    { id: 'medical', label: 'Medical Safety Guard', shortcut: '⌘4' },
    { id: 'analytics', label: 'Analytics & DB', shortcut: '⌘5' },
    { id: 'dataset', label: 'Dataset Exporter', shortcut: '⌘6' },
    { id: 'finetune', label: 'Fine-Tuning Guide', shortcut: '' },
  ];


  const filteredPalette = paletteItems.filter(item =>
    item.label.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '60px',
        background: 'rgba(7, 10, 20, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '16px'
      }}>
        {/* Logo & Title */}
        <button
          onClick={() => setActiveTab && setActiveTab('home')}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0', textAlign: 'left'
          }}
        >
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(0, 242, 254, 0.35)',
            flexShrink: 0
          }}>
            <Cpu size={20} color="#040914" />
          </div>
          <div>
            <div style={{
              fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: 800,
              color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px',
              lineHeight: 1.2
            }}>
              VLM <span className="text-gradient">Hallucination Studio</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', lineHeight: 1 }}>
              Real-Time VLM Extraction & Fine-Tuning Engine
            </div>
          </div>
        </button>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setShowPalette(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer', color: 'var(--text-dim)',
              fontSize: '0.72rem', fontFamily: 'var(--font-body)',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,242,254,0.3)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
          >
            <Search size={12} />
            Search...
            <span style={{
              padding: '1px 5px', borderRadius: '4px',
              background: 'rgba(255,255,255,0.08)',
              fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)', marginLeft: '8px'
            }}>
              Ctrl+K
            </span>
          </button>

          {/* Model Badge */}
          <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
            <Sparkles size={10} /> Gemma-4 VLM
          </span>

          {/* Notification Bell */}
          <button
            onClick={() => setNotifications(0)}
            style={{
              position: 'relative',
              background: 'none', border: 'none', cursor: 'pointer',
              color: notifications > 0 ? 'var(--accent-amber)' : 'var(--text-dim)',
              padding: '6px',
              transition: 'var(--transition-fast)'
            }}
          >
            <Bell size={17} />
            {notifications > 0 && (
              <span style={{
                position: 'absolute', top: '1px', right: '1px',
                width: '14px', height: '14px',
                background: 'var(--accent-rose)',
                borderRadius: '50%',
                fontSize: '0.55rem',
                fontWeight: 800,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse-glow 1.5s ease-in-out infinite',
                boxShadow: '0 0 8px rgba(255,42,133,0.5)'
              }}>
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>

          {/* WS Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '0.75rem',
            color: wsConnected ? 'var(--accent-emerald)' : 'var(--text-dim)'
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: wsConnected ? 'var(--accent-emerald)' : 'var(--text-dim)',
              animation: wsConnected ? 'blink 1.5s ease-in-out infinite' : 'none'
            }} />
            {wsConnected ? 'Live' : 'Polling'}
          </div>

          {/* Seed Button */}
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '5px' }}
          >
            <Database size={13} />
            {seeding ? 'Seeding...' : 'Seed Demo'}
          </button>
        </div>
      </header>

      {/* Command Palette Overlay */}
      {showPalette && (
        <div
          onClick={() => setShowPalette(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 200,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '15vh',
            animation: 'fade-in 0.15s ease'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '520px',
              background: 'rgba(12, 18, 34, 0.95)',
              border: '1px solid rgba(0,242,254,0.2)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,242,254,0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <Search size={16} color="var(--accent-cyan)" />
              <input
                autoFocus
                placeholder="Search modules..."
                value={paletteQuery}
                onChange={e => setPaletteQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && filteredPalette.length > 0) {
                    setActiveTab(filteredPalette[0].id);
                    setShowPalette(false);
                    setPaletteQuery('');
                  }
                }}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-bright)', fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)'
                }}
              />
              <span style={{
                padding: '2px 8px', borderRadius: '4px',
                background: 'rgba(255,255,255,0.08)',
                fontSize: '0.65rem', color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)'
              }}>ESC</span>
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {filteredPalette.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowPalette(false);
                    setPaletteQuery('');
                  }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px', border: 'none',
                    background: activeTab === item.id ? 'rgba(0,242,254,0.08)' : 'transparent',
                    color: activeTab === item.id ? 'var(--accent-cyan)' : 'var(--text-main)',
                    cursor: 'pointer', fontSize: '0.88rem',
                    fontFamily: 'var(--font-body)',
                    transition: 'var(--transition-fast)',
                    borderLeft: activeTab === item.id ? '3px solid var(--accent-cyan)' : '3px solid transparent'
                  }}
                  onMouseEnter={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span style={{
                      fontSize: '0.68rem', color: 'var(--text-dim)',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 6px', borderRadius: '4px',
                      background: 'rgba(255,255,255,0.06)'
                    }}>{item.shortcut}</span>
                  )}
                </button>
              ))}
              {filteredPalette.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  No modules found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
