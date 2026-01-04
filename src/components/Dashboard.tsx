import { useState, useEffect } from 'react';
import { Asteroid, asteroids } from '@/data/asteroids';
import AsteroidCard from './AsteroidCard';
import OrbitalVisualization from './OrbitalVisualization';
import MissionControlPanel from './MissionControlPanel';
import ThreatAssessmentModal from './ThreatAssessmentModal';
import CreateAsteroidModal from './CreateAsteroidModal';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  onStartMission: (asteroid: Asteroid) => void;
}

const Dashboard = ({ onStartMission }: DashboardProps) => {
  const [selectedAsteroid, setSelectedAsteroid] = useState<Asteroid | null>(null);
  const [showThreatModal, setShowThreatModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customAsteroids, setCustomAsteroids] = useState<Asteroid[]>(() => {
    const saved = localStorage.getItem('customAsteroids');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist custom asteroids to localStorage
  useEffect(() => {
    localStorage.setItem('customAsteroids', JSON.stringify(customAsteroids));
  }, [customAsteroids]);

  const handleCreateAsteroid = (asteroid: Asteroid) => {
    setCustomAsteroids(prev => [...prev, asteroid]);
  };

  const handleDeleteCustomAsteroid = (id: string) => {
    setCustomAsteroids(prev => prev.filter(a => a.id !== id));
    if (selectedAsteroid?.id === id) {
      setSelectedAsteroid(null);
    }
  };

  // Combine default and custom asteroids
  const allAsteroids = [...asteroids, ...customAsteroids];

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
  const sortedAsteroids = [...allAsteroids].sort((a, b) => b.torinoScale - a.torinoScale);

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="gap-1 h-7 text-xs"
              >
                <Plus className="w-3 h-3" />
                Create
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground tracking-wider">
              {allAsteroids.length} Near-Earth Objects Tracked
              {customAsteroids.length > 0 && ` (${customAsteroids.length} custom)`}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sortedAsteroids.map((asteroid) => (
              <div key={asteroid.id} className="relative group">
                <AsteroidCard
                  asteroid={asteroid}
                  onClick={() => handleAsteroidClick(asteroid)}
                  onViewThreat={() => {
                    setSelectedAsteroid(asteroid);
                    setShowThreatModal(true);
                  }}
                  onInitiateMission={() => {
                    setSelectedAsteroid(asteroid);
                    onStartMission(asteroid);
                  }}
                  isSelected={selectedAsteroid?.id === asteroid.id}
                />
                {asteroid.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustomAsteroid(asteroid.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    title="Delete custom asteroid"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {asteroid.isCustom && (
                  <span className="absolute bottom-2 right-2 text-[8px] uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    Custom
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Orbital Visualization */}
        <div className="p-3 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0">
            <OrbitalVisualization
              selectedAsteroid={selectedAsteroid}
              onSelectAsteroid={setSelectedAsteroid}
              customAsteroids={customAsteroids}
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

      {/* Create Asteroid Modal */}
      <CreateAsteroidModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateAsteroid={handleCreateAsteroid}
      />
    </div>
  );
};

export default Dashboard;