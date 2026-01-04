import { useState } from 'react';
import { Asteroid, DefenseStrategy, defenseStrategies, calculateImpactEnergy, calculateDamageRadius } from '@/data/asteroids';
import { Shield, Skull, CheckCircle, XCircle, Zap, Clock, DollarSign, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DefenseComparisonModalProps {
  asteroid: Asteroid;
  isVisible: boolean;
  onClose: () => void;
}

interface DamageEstimate {
  casualties: { min: number; max: number; label: string };
  destructionRadius: number;
  impactEnergy: number;
  equivalentNukes: number;
}

const calculateDamage = (asteroid: Asteroid): DamageEstimate => {
  const impactEnergy = calculateImpactEnergy(asteroid.mass, asteroid.velocity);
  const destructionRadius = calculateDamageRadius(impactEnergy);
  
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
  
  const equivalentNukes = Math.round((impactEnergy * 1000) / 0.015);
  
  return { casualties, destructionRadius, impactEnergy, equivalentNukes };
};

const getEffectivenessForSize = (strategy: DefenseStrategy, diameter: number): number => {
  if (diameter < 100) return strategy.effectiveness.small;
  if (diameter < 500) return strategy.effectiveness.medium;
  return strategy.effectiveness.large;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const DefenseComparisonModal = ({ asteroid, isVisible, onClose }: DefenseComparisonModalProps) => {
  const [selectedStrategy, setSelectedStrategy] = useState<DefenseStrategy>(defenseStrategies[0]);
  
  if (!isVisible) return null;
  
  const damage = calculateDamage(asteroid);
  const effectiveness = getEffectivenessForSize(selectedStrategy, asteroid.diameter);
  const successProbability = selectedStrategy.successRate * effectiveness;
  const reducedCasualties = {
    min: Math.round(damage.casualties.min * (1 - successProbability)),
    max: Math.round(damage.casualties.max * (1 - successProbability)),
  };
  const livesProtected = {
    min: damage.casualties.min - reducedCasualties.min,
    max: damage.casualties.max - reducedCasualties.max,
  };
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-black border border-white/20 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-white/20 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wider">DEFENSE COMPARISON</h2>
            <p className="text-gray-400 text-sm font-mono">
              Target: {asteroid.name} ({asteroid.diameter}m)
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        {/* Strategy Selector */}
        <div className="border-b border-white/20 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Select Defense Strategy</p>
          <div className="flex gap-2 flex-wrap">
            {defenseStrategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy)}
                className={`px-4 py-2 border transition-colors ${
                  selectedStrategy.id === strategy.id
                    ? 'bg-cyan-500 border-cyan-400 text-black font-bold'
                    : 'bg-transparent border-white/30 text-white hover:border-cyan-400'
                }`}
              >
                <span className="font-mono text-xs">{strategy.code}</span>
                <span className="ml-2 text-sm">{strategy.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 divide-x divide-white/20">
          {/* NO INTERVENTION */}
          <div className="p-6 bg-red-500/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-500">NO INTERVENTION</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Worst Case Scenario</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Impact Visualization */}
              <div className="relative h-32 bg-red-500/10 border border-red-500/30 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-blue-500/30 border border-blue-400/50 relative">
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">EARTH</span>
                  </div>
                  <div className="absolute w-4 h-4 bg-orange-500 rounded-full animate-pulse" style={{ right: '30%', top: '40%' }}>
                    <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-50" />
                  </div>
                  <div className="absolute text-red-500 font-bold text-2xl" style={{ right: '20%', top: '35%' }}>
                    💥
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <p className="text-red-400 text-xs font-mono">DIRECT IMPACT</p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Skull className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-gray-400 uppercase">Estimated Casualties</span>
                  </div>
                  <p className="text-2xl font-bold text-red-500 font-mono">
                    {formatNumber(damage.casualties.min)} - {formatNumber(damage.casualties.max)}
                  </p>
                  <p className="text-xs text-red-400">{damage.casualties.label}</p>
                </div>
                
                <div className="p-3 bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-gray-400 uppercase">Impact Energy</span>
                  </div>
                  <p className="text-xl font-bold text-orange-500 font-mono">
                    {damage.impactEnergy.toFixed(2)} MT
                  </p>
                  <p className="text-xs text-orange-400">≈ {formatNumber(damage.equivalentNukes)} Hiroshimas</p>
                </div>
                
                <div className="p-3 bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-gray-400 uppercase">Destruction Radius</span>
                  </div>
                  <p className="text-xl font-bold text-amber-500 font-mono">
                    {damage.destructionRadius.toFixed(1)} km
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-red-900/20 border border-red-500/50 text-center">
                <p className="text-red-400 text-sm font-bold">OUTCOME: CATASTROPHIC</p>
              </div>
            </div>
          </div>
          
          {/* WITH DEFENSE */}
          <div className="p-6 bg-green-500/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-500">WITH {selectedStrategy.code}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{selectedStrategy.name}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Deflection Visualization */}
              <div className="relative h-32 bg-green-500/10 border border-green-500/30 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-blue-500/30 border border-blue-400/50 relative">
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">EARTH</span>
                  </div>
                  {/* Original trajectory (dotted) */}
                  <div className="absolute w-24 h-0.5 bg-red-500/30 border-t border-dashed border-red-500/50" style={{ right: '25%', top: '50%', transform: 'rotate(-10deg)' }} />
                  {/* Deflected trajectory */}
                  <div className="absolute w-24 h-0.5 bg-green-500" style={{ right: '25%', top: '35%', transform: 'rotate(-30deg)' }} />
                  {/* Asteroid new position */}
                  <div className="absolute w-3 h-3 bg-gray-500 rounded-full" style={{ right: '15%', top: '25%' }} />
                  {/* Defense icon */}
                  <div className="absolute text-cyan-400" style={{ right: '40%', top: '45%' }}>
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <p className="text-green-400 text-xs font-mono">DEFLECTED TRAJECTORY</p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-400 uppercase">Success Probability</span>
                  </div>
                  <p className="text-2xl font-bold text-green-500 font-mono">
                    {(successProbability * 100).toFixed(1)}%
                  </p>
                  <div className="mt-2 h-2 bg-gray-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                      style={{ width: `${successProbability * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs text-gray-400 uppercase">Lives Protected</span>
                  </div>
                  <p className="text-xl font-bold text-cyan-500 font-mono">
                    {formatNumber(livesProtected.min)} - {formatNumber(livesProtected.max)}
                  </p>
                  <p className="text-xs text-cyan-400">Estimated lives saved</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-purple-500" />
                      <span className="text-[10px] text-gray-400 uppercase">Lead Time</span>
                    </div>
                    <p className="text-lg font-bold text-purple-500 font-mono">
                      {selectedStrategy.leadTime} yrs
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] text-gray-400 uppercase">Cost</span>
                    </div>
                    <p className="text-lg font-bold text-amber-500 font-mono">
                      ${selectedStrategy.costBillion}B
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-3 text-center ${
                successProbability > 0.7 
                  ? 'bg-green-900/20 border border-green-500/50' 
                  : successProbability > 0.4 
                    ? 'bg-amber-900/20 border border-amber-500/50'
                    : 'bg-red-900/20 border border-red-500/50'
              }`}>
                <p className={`text-sm font-bold ${
                  successProbability > 0.7 
                    ? 'text-green-400' 
                    : successProbability > 0.4 
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}>
                  OUTCOME: {successProbability > 0.7 ? 'FAVORABLE' : successProbability > 0.4 ? 'UNCERTAIN' : 'HIGH RISK'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-white/20 p-4 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Effectiveness based on asteroid size: {asteroid.diameter < 100 ? 'Small' : asteroid.diameter < 500 ? 'Medium' : 'Large'} ({asteroid.diameter}m)
          </p>
          <Button
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6"
          >
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DefenseComparisonModal;
