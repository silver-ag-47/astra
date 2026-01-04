import { useEffect, useState } from 'react';
import { Asteroid, calculateImpactEnergy, calculateDamageRadius } from '@/data/asteroids';
import { Skull, Flame, CloudRain, Thermometer, Wind, AlertTriangle } from 'lucide-react';

interface DamageAssessmentOverlayProps {
  asteroid: Asteroid;
  isVisible: boolean;
  onClose: () => void;
}

interface DamageData {
  casualties: { min: number; max: number; label: string };
  destructionRadius: number;
  craterDiameter: number;
  tsunamiHeight: number | null;
  fireballRadius: number;
  thermalRadius: number;
  shockwaveRadius: number;
  environmentalEffects: string[];
  impactEnergy: number;
  equivalentNukes: number;
}

const calculateDamageData = (asteroid: Asteroid): DamageData => {
  const impactEnergy = calculateImpactEnergy(asteroid.mass, asteroid.velocity);
  const baseRadius = calculateDamageRadius(impactEnergy);
  
  // Crater diameter approximation (in km)
  const craterDiameter = Math.pow(impactEnergy, 0.3) * 1.5;
  
  // Fireball radius (km)
  const fireballRadius = Math.pow(impactEnergy, 0.4) * 0.5;
  
  // Thermal radiation radius (km) - 3rd degree burns
  const thermalRadius = Math.pow(impactEnergy, 0.4) * 2;
  
  // Shockwave radius (km) - structural damage
  const shockwaveRadius = Math.pow(impactEnergy, 0.33) * 4;
  
  // Tsunami height (meters) - only for ocean impacts
  const tsunamiHeight = impactEnergy > 10 ? Math.pow(impactEnergy, 0.5) * 5 : null;
  
  // Casualty estimates based on impact energy and population density
  let casualties: { min: number; max: number; label: string };
  if (impactEnergy > 10000) {
    casualties = { min: 1000000000, max: 8000000000, label: 'Extinction Event' };
  } else if (impactEnergy > 1000) {
    casualties = { min: 100000000, max: 1000000000, label: 'Global Catastrophe' };
  } else if (impactEnergy > 100) {
    casualties = { min: 10000000, max: 100000000, label: 'Continental Devastation' };
  } else if (impactEnergy > 10) {
    casualties = { min: 1000000, max: 10000000, label: 'Regional Disaster' };
  } else if (impactEnergy > 1) {
    casualties = { min: 100000, max: 1000000, label: 'City Destroyer' };
  } else if (impactEnergy > 0.01) {
    casualties = { min: 1000, max: 100000, label: 'Local Impact' };
  } else {
    casualties = { min: 0, max: 1000, label: 'Minor Event' };
  }
  
  // Environmental effects
  const environmentalEffects: string[] = [];
  if (impactEnergy > 0.01) environmentalEffects.push('Local seismic activity');
  if (impactEnergy > 0.1) environmentalEffects.push('Widespread fires');
  if (impactEnergy > 1) environmentalEffects.push('Regional dust cloud');
  if (impactEnergy > 10) environmentalEffects.push('Atmospheric shockwave');
  if (impactEnergy > 100) environmentalEffects.push('Global temperature drop');
  if (impactEnergy > 1000) environmentalEffects.push('Impact winter (years)');
  if (impactEnergy > 10000) environmentalEffects.push('Mass extinction event');
  if (tsunamiHeight) environmentalEffects.push(`Mega-tsunami (${tsunamiHeight.toFixed(0)}m waves)`);
  
  // Equivalent nuclear weapons (15 kiloton = Hiroshima)
  const equivalentNukes = Math.round((impactEnergy * 1000) / 0.015);
  
  return {
    casualties,
    destructionRadius: baseRadius,
    craterDiameter,
    tsunamiHeight,
    fireballRadius,
    thermalRadius,
    shockwaveRadius,
    environmentalEffects,
    impactEnergy,
    equivalentNukes,
  };
};

const formatNumber = (num: number): string => {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const DamageAssessmentOverlay = ({ asteroid, isVisible, onClose }: DamageAssessmentOverlayProps) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const damageData = calculateDamageData(asteroid);
  
  useEffect(() => {
    if (isVisible) {
      setAnimationPhase(0);
      const timers = [
        setTimeout(() => setAnimationPhase(1), 200),
        setTimeout(() => setAnimationPhase(2), 400),
        setTimeout(() => setAnimationPhase(3), 600),
        setTimeout(() => setAnimationPhase(4), 800),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  const getSeverityColor = () => {
    if (damageData.impactEnergy > 1000) return 'text-red-500 border-red-500/50 bg-red-500/10';
    if (damageData.impactEnergy > 100) return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
    if (damageData.impactEnergy > 10) return 'text-amber-500 border-amber-500/50 bg-amber-500/10';
    return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
  };
  
  return (
    <div className="absolute inset-0 z-50 pointer-events-auto flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Assessment Panel */}
      <div className={`relative bg-background/95 border-2 ${getSeverityColor()} rounded-lg p-6 max-w-2xl w-full mx-4 animate-scale-in shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
          <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-wider">DAMAGE ASSESSMENT</h2>
            <p className="text-muted-foreground text-sm font-mono">
              IMPACT: {asteroid.name} ({asteroid.diameter}m @ {asteroid.velocity} km/s)
            </p>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Casualties */}
          <div className={`p-4 rounded-lg border border-red-500/30 bg-red-500/5 transition-all duration-300 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Skull className="w-5 h-5 text-red-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Est. Casualties</span>
            </div>
            <p className="text-2xl font-bold text-red-500 font-mono">
              {formatNumber(damageData.casualties.min)} - {formatNumber(damageData.casualties.max)}
            </p>
            <p className="text-xs text-red-400 mt-1">{damageData.casualties.label}</p>
          </div>
          
          {/* Destruction Radius */}
          <div className={`p-4 rounded-lg border border-orange-500/30 bg-orange-500/5 transition-all duration-300 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Destruction Radius</span>
            </div>
            <p className="text-2xl font-bold text-orange-500 font-mono">
              {damageData.destructionRadius.toFixed(1)} km
            </p>
            <p className="text-xs text-orange-400 mt-1">Total devastation zone</p>
          </div>
          
          {/* Impact Energy */}
          <div className={`p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 transition-all duration-300 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5 text-amber-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Impact Energy</span>
            </div>
            <p className="text-2xl font-bold text-amber-500 font-mono">
              {damageData.impactEnergy.toFixed(2)} MT
            </p>
            <p className="text-xs text-amber-400 mt-1">≈ {formatNumber(damageData.equivalentNukes)} Hiroshimas</p>
          </div>
          
          {/* Crater */}
          <div className={`p-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5 transition-all duration-300 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-cyan-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Crater Diameter</span>
            </div>
            <p className="text-2xl font-bold text-cyan-500 font-mono">
              {damageData.craterDiameter.toFixed(1)} km
            </p>
          </div>
          
          {/* Fireball */}
          <div className={`p-4 rounded-lg border border-rose-500/30 bg-rose-500/5 transition-all duration-300 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Fireball Radius</span>
            </div>
            <p className="text-2xl font-bold text-rose-500 font-mono">
              {damageData.fireballRadius.toFixed(1)} km
            </p>
          </div>
          
          {/* Shockwave */}
          <div className={`p-4 rounded-lg border border-purple-500/30 bg-purple-500/5 transition-all duration-300 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Shockwave Radius</span>
            </div>
            <p className="text-2xl font-bold text-purple-500 font-mono">
              {damageData.shockwaveRadius.toFixed(1)} km
            </p>
          </div>
        </div>
        
        {/* Environmental Effects */}
        <div className={`transition-all duration-500 ${animationPhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2 mb-3">
            <CloudRain className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground uppercase tracking-wider">Environmental Effects</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {damageData.environmentalEffects.map((effect, i) => (
              <span 
                key={i}
                className="px-3 py-1.5 bg-muted/50 border border-border rounded-full text-xs text-foreground"
              >
                {effect}
              </span>
            ))}
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary font-semibold tracking-wider transition-colors"
        >
          ACKNOWLEDGE
        </button>
      </div>
    </div>
  );
};

export default DamageAssessmentOverlay;
