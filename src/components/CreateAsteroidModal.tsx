import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Asteroid, calculateImpactEnergy } from '@/data/asteroids';
import { Plus, Rocket, Zap, AlertTriangle } from 'lucide-react';

interface CreateAsteroidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAsteroid: (asteroid: Asteroid) => void;
}

const calculateMass = (diameter: number): number => {
  const radius = diameter / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  return volume * 2000;
};

const getTorinoColor = (scale: number): string => {
  if (scale === 0) return 'bg-muted text-muted-foreground';
  if (scale <= 2) return 'bg-green-500/20 text-green-400 border-green-500/50';
  if (scale <= 4) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
  if (scale <= 7) return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
  return 'bg-red-500/20 text-red-400 border-red-500/50';
};

const presets = [
  { name: 'Small Rock', diameter: 10, velocity: 15, probability: 0.001, torino: 0 },
  { name: 'City Killer', diameter: 100, velocity: 20, probability: 0.005, torino: 4 },
  { name: 'Regional Threat', diameter: 300, velocity: 25, probability: 0.01, torino: 6 },
  { name: 'Extinction Event', diameter: 1000, velocity: 30, probability: 0.1, torino: 10 },
];

const CreateAsteroidModal = ({ open, onOpenChange, onCreateAsteroid }: CreateAsteroidModalProps) => {
  const [name, setName] = useState('');
  const [diameter, setDiameter] = useState(50);
  const [velocity, setVelocity] = useState(20);
  const [impactProbability, setImpactProbability] = useState(0.01);
  const [torinoScale, setTorinoScale] = useState(1);
  const [semiMajorAxis, setSemiMajorAxis] = useState(1.5);
  const [eccentricity, setEccentricity] = useState(0.3);
  const [inclination, setInclination] = useState(5);
  const [closeApproachDate, setCloseApproachDate] = useState('2030-01-01');

  const mass = calculateMass(diameter);
  const impactEnergy = calculateImpactEnergy(mass, velocity);

  const applyPreset = (preset: typeof presets[0]) => {
    setDiameter(preset.diameter);
    setVelocity(preset.velocity);
    setImpactProbability(preset.probability);
    setTorinoScale(preset.torino);
  };

  const handleCreate = () => {
    const customName = name.trim() || `Custom-${Date.now().toString(36).toUpperCase()}`;
    const newAsteroid: Asteroid = {
      id: `custom-${Date.now()}`,
      name: customName,
      designation: customName,
      diameter,
      velocity,
      distance: semiMajorAxis * 0.01,
      impactProbability,
      closeApproachDate,
      mass,
      discoveryDate: new Date().toISOString().split('T')[0],
      orbitalPeriod: Math.pow(semiMajorAxis, 1.5),
      semiMajorAxis,
      eccentricity,
      inclination,
      torinoScale,
      palermoScale: Math.log10(impactProbability) + 1,
      isCustom: true,
    };
    
    onCreateAsteroid(newAsteroid);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDiameter(50);
    setVelocity(20);
    setImpactProbability(0.01);
    setTorinoScale(1);
    setSemiMajorAxis(1.5);
    setEccentricity(0.3);
    setInclination(5);
    setCloseApproachDate('2030-01-01');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Create Custom Asteroid
          </DialogTitle>
          <DialogDescription>
            Design a hypothetical near-Earth object for simulation
          </DialogDescription>
        </DialogHeader>

        {/* Presets */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Close Approach Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={closeApproachDate}
                  onChange={(e) => setCloseApproachDate(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </div>
          </div>

          {/* Physical Properties */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Physical Properties
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Diameter: {diameter.toLocaleString()}m</Label>
                  <span className="text-xs text-muted-foreground">
                    {diameter < 100 ? 'Local damage' : diameter < 500 ? 'Regional' : 'Global threat'}
                  </span>
                </div>
                <Slider
                  value={[diameter]}
                  onValueChange={([v]) => setDiameter(v)}
                  min={1}
                  max={10000}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Mass: {mass.toExponential(2)} kg
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Velocity: {velocity} km/s</Label>
                  <span className="text-xs text-muted-foreground">
                    Typical NEO: 10-30 km/s
                  </span>
                </div>
                <Slider
                  value={[velocity]}
                  onValueChange={([v]) => setVelocity(v)}
                  min={1}
                  max={72}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Impact Probability: {(impactProbability * 100).toFixed(3)}%</Label>
                </div>
                <Slider
                  value={[impactProbability]}
                  onValueChange={([v]) => setImpactProbability(v)}
                  min={0.00001}
                  max={1}
                  step={0.00001}
                />
              </div>
            </div>
          </div>

          {/* Threat Assessment */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              Threat Assessment
            </h3>
            
            <div className="space-y-2">
              <Label>Torino Scale: {torinoScale}</Label>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => setTorinoScale(scale)}
                    className={`w-8 h-8 rounded text-xs font-medium border transition-all ${
                      torinoScale === scale 
                        ? getTorinoColor(scale) + ' ring-2 ring-primary'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>

            {/* Impact Energy Preview */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Estimated Impact Energy
              </p>
              <p className="text-2xl font-display text-foreground">
                {impactEnergy < 1 
                  ? `${(impactEnergy * 1000).toFixed(1)} Kilotons TNT`
                  : impactEnergy < 1000 
                    ? `${impactEnergy.toFixed(1)} Megatons TNT`
                    : `${(impactEnergy / 1000).toFixed(1)} Gigatons TNT`
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {impactEnergy < 0.015 ? 'Atmospheric burnup likely' :
                 impactEnergy < 10 ? 'Comparable to nuclear weapon' :
                 impactEnergy < 1000 ? 'City-destroying potential' :
                 'Extinction-level event'}
              </p>
            </div>
          </div>

          {/* Orbital Parameters */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Orbital Parameters</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Semi-Major Axis: {semiMajorAxis.toFixed(2)} AU</Label>
                <Slider
                  value={[semiMajorAxis]}
                  onValueChange={([v]) => setSemiMajorAxis(v)}
                  min={0.5}
                  max={5}
                  step={0.01}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Eccentricity: {eccentricity.toFixed(2)}</Label>
                <Slider
                  value={[eccentricity]}
                  onValueChange={([v]) => setEccentricity(v)}
                  min={0}
                  max={0.99}
                  step={0.01}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Inclination: {inclination.toFixed(1)}°</Label>
                <Slider
                  value={[inclination]}
                  onValueChange={([v]) => setInclination(v)}
                  min={0}
                  max={90}
                  step={0.1}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Asteroid
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAsteroidModal;
