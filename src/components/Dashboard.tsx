import { useState } from 'react';
import { Asteroid, asteroids } from '@/data/asteroids';
import AsteroidCard from './AsteroidCard';
import OrbitalVisualization from './OrbitalVisualization';
import MissionControlPanel from './MissionControlPanel';
import ThreatAssessmentModal from './ThreatAssessmentModal';

interface DashboardProps {
  onStartMission: (asteroid: Asteroid) => void;
}

const Dashboard = ({ onStartMission }: DashboardProps) => {
  const [selectedAsteroid, setSelectedAsteroid] = useState<Asteroid | null>(null);
  const [showThreatModal, setShowThreatModal] = useState(false);

  const handleAsteroidClick = (asteroid: Asteroid) => {
    setSelectedAsteroid(asteroid);
  };

  const handleViewThreat = () => {
    if (selectedAsteroid) {
      setShowThreatModal(true);
    }
  };

  const handleProceedToStrategy = () => {
    if (selectedAsteroid) {
      setShowThreatModal(false);
      onStartMission(selectedAsteroid);
    }
  };

  // Sort asteroids by Torino scale (highest first)
  const sortedAsteroids = [...asteroids].sort((a, b) => b.torinoScale - a.torinoScale);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-background">
      <div className="grid lg:grid-cols-[320px_1fr_320px] h-full">
        {/* Left Panel - Threats List */}
        <div className="border-r border-border bg-background overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border sticky top-0 z-10 bg-background">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display text-lg text-foreground">
                Active Threats
              </h2>
              <div className="status-dot bg-foreground status-dot-pulse" />
            </div>
            <p className="text-[10px] text-muted-foreground tracking-wider">
              {asteroids.length} Near-Earth Objects Tracked
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sortedAsteroids.map((asteroid) => (
              <AsteroidCard
                key={asteroid.id}
                asteroid={asteroid}
                onClick={() => handleAsteroidClick(asteroid)}
                onViewThreat={() => {
                  setSelectedAsteroid(asteroid);
                  setShowThreatModal(true);
                }}
                isSelected={selectedAsteroid?.id === asteroid.id}
              />
            ))}
          </div>
        </div>

        {/* Center Panel - Orbital Visualization */}
        <div className="p-3 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0">
            <OrbitalVisualization
              selectedAsteroid={selectedAsteroid}
              onSelectAsteroid={setSelectedAsteroid}
            />
          </div>
          
          {/* Quick Action Bar */}
          {selectedAsteroid && (
            <div className="mt-4 artifact-panel p-4 animate-fade-in">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="data-label">Selected Target</p>
                  <p className="font-display text-xl text-foreground">{selectedAsteroid.name}</p>
                </div>
                <button
                  onClick={handleViewThreat}
                  className="btn-artifact px-6 py-2"
                >
                  View Threat Assessment →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Mission Control */}
        <div className="border-l border-border bg-background p-4 overflow-y-auto">
          <MissionControlPanel
            selectedAsteroid={selectedAsteroid}
            onLaunchMission={handleViewThreat}
          />
        </div>
      </div>

      {/* Threat Assessment Modal */}
      {showThreatModal && selectedAsteroid && (
        <ThreatAssessmentModal
          asteroid={selectedAsteroid}
          onClose={() => setShowThreatModal(false)}
          onProceed={handleProceedToStrategy}
        />
      )}
    </div>
  );
};

export default Dashboard;