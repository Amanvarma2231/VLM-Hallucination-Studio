import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import HallucinationStudio from './components/HallucinationStudio';
import UnknownPuzzlesStudio from './components/UnknownPuzzlesStudio';
import AttentionHeatmap from './components/AttentionHeatmap';
import ModelComparison from './components/ModelComparison';
import MedicalGuard from './components/MedicalGuard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DatasetStudio from './components/DatasetStudio';
import FineTuningGuide from './components/FineTuningGuide';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentSession, setCurrentSession] = useState(null);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleRefreshStats = () => {
    setStatsRefreshKey((prev) => prev + 1);
  };

  const handleSelectSessionFromDashboard = (session) => {
    setCurrentSession(session);
    setActiveTab('studio');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onRefreshStats={handleRefreshStats} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ flex: 1, display: 'flex' }}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        />

        <main style={{
          flex: 1,
          background: 'transparent',
          overflowY: 'auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: 1 }}>
            {activeTab === 'home' && (
              <LandingPage setActiveTab={setActiveTab} />
            )}

            {activeTab === 'studio' && (
              <HallucinationStudio
                currentSession={currentSession}
                setCurrentSession={setCurrentSession}
                onAnalysisComplete={handleRefreshStats}
              />
            )}

            {activeTab === 'puzzles' && (
              <UnknownPuzzlesStudio />
            )}

            {activeTab === 'heatmap' && (
              <AttentionHeatmap currentSession={currentSession} />
            )}


            {activeTab === 'compare' && (
              <ModelComparison />
            )}

            {activeTab === 'medical' && (
              <MedicalGuard />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard
                key={statsRefreshKey}
                onSelectSession={handleSelectSessionFromDashboard}
              />
            )}

            {activeTab === 'dataset' && (
              <DatasetStudio key={statsRefreshKey} />
            )}

            {activeTab === 'finetune' && (
              <FineTuningGuide />
            )}
          </div>

          {/* Professional Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
