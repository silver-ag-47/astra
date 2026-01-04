import { useState, useEffect } from 'react';
import { Asteroid, DefenseStrategy } from '@/data/asteroids';
import CRTOverlay from '@/components/CRTOverlay';
import SystemHeader from '@/components/SystemHeader';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import StrategiesPage from '@/components/StrategiesPage';
import MissionSimulation from '@/components/MissionSimulation';
import ResultsPage from '@/components/ResultsPage';
import Tutorial from '@/components/Tutorial';

type Page = 'landing' | 'dashboard' | 'strategies' | 'simulation' | 'results';

const TUTORIAL_COMPLETED_KEY = 'astra_tutorial_completed';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedAsteroid, setSelectedAsteroid] = useState<Asteroid | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<DefenseStrategy | null>(null);
  const [missionSuccess, setMissionSuccess] = useState(false);
  const [deflectionAmount, setDeflectionAmount] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleEnterCommand = () => {
    const tutorialCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
    setCurrentPage('dashboard');
  };

  const handleTutorialComplete = () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    setShowTutorial(false);
  };

  const handleStartMission = (asteroid: Asteroid) => {
    setSelectedAsteroid(asteroid);
    setCurrentPage('strategies');
  };

  const handleSelectStrategy = (strategy: DefenseStrategy) => {
    setSelectedStrategy(strategy);
    setCurrentPage('simulation');
  };

  const handleMissionComplete = (success: boolean, deflection: number) => {
    setMissionSuccess(success);
    setDeflectionAmount(deflection);
    setCurrentPage('results');
  };

  const handleNewMission = () => {
    setSelectedAsteroid(null);
    setSelectedStrategy(null);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    if (page === 'landing') {
      setCurrentPage('landing');
    } else if (page === 'dashboard') {
      setCurrentPage('dashboard');
    } else if (page === 'strategies') {
      setCurrentPage('strategies');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onEnter={handleEnterCommand} />;
      
      case 'dashboard':
        return <Dashboard onStartMission={handleStartMission} />;
      
      case 'strategies':
        return (
          <StrategiesPage
            asteroid={selectedAsteroid}
            onSelectStrategy={handleSelectStrategy}
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      
      case 'simulation':
        if (!selectedAsteroid || !selectedStrategy) {
          setCurrentPage('dashboard');
          return null;
        }
        return (
          <MissionSimulation
            asteroid={selectedAsteroid}
            strategy={selectedStrategy}
            onComplete={handleMissionComplete}
            onBack={() => setCurrentPage('strategies')}
          />
        );
      
      case 'results':
        if (!selectedAsteroid || !selectedStrategy) {
          setCurrentPage('dashboard');
          return null;
        }
        return (
          <ResultsPage
            asteroid={selectedAsteroid}
            strategy={selectedStrategy}
            success={missionSuccess}
            deflectionAmount={deflectionAmount}
            onNewMission={handleNewMission}
            onHome={() => setCurrentPage('dashboard')}
          />
        );
      
      default:
        return <LandingPage onEnter={handleEnterCommand} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CRTOverlay />
      
      {showTutorial && (
        <Tutorial 
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
      
      {currentPage !== 'landing' && (
        <SystemHeader 
          onNavigate={handleNavigate} 
          currentPage={currentPage}
        />
      )}
      
      <main className={currentPage !== 'landing' ? 'animate-flash' : ''}>
        {renderPage()}
      </main>
    </div>
  );
};

export default Index;
