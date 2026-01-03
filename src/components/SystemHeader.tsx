import { useEffect, useState } from 'react';

interface SystemHeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const SystemHeader = ({ onNavigate, currentPage }: SystemHeaderProps) => {
  const [time, setTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<'NOMINAL' | 'ALERT' | 'CRITICAL'>('NOMINAL');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate random status changes
    const statusTimer = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.95) setSystemStatus('CRITICAL');
      else if (rand > 0.85) setSystemStatus('ALERT');
      else setSystemStatus('NOMINAL');
    }, 5000);
    return () => clearInterval(statusTimer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-primary bg-background">
      <div className="grid-bg diagonal-stripes">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="hexagon w-10 h-10 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display text-lg">U</span>
              </div>
              <div>
                <h1 className="font-display text-xl tracking-[0.15em] text-foreground leading-none">
                  UNIFIED ASTEROID DEFENSE
                </h1>
                <p className="text-[10px] text-muted-foreground tracking-[0.3em]">
                  PLANETARY PROTECTION COMMAND
                </p>
              </div>
            </button>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'MISSION CONTROL' },
              { id: 'strategies', label: 'DEFENSE SYSTEMS' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 font-display text-sm tracking-widest border-2 transition-all
                  ${currentPage === item.id 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-transparent hover:border-muted-foreground text-muted-foreground hover:text-foreground'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: Status and Clock */}
          <div className="flex items-center gap-6">
            {/* System Status */}
            <div className="hidden sm:flex items-center gap-2">
              <div 
                className={`status-diamond ${
                  systemStatus === 'NOMINAL' ? 'bg-terminal' : 
                  systemStatus === 'ALERT' ? 'bg-accent animate-blink' : 
                  'bg-primary animate-blink'
                }`}
              />
              <span className={`font-mono text-xs tracking-wider ${
                systemStatus === 'NOMINAL' ? 'text-terminal' : 
                systemStatus === 'ALERT' ? 'text-accent' : 
                'text-primary'
              }`}>
                SYS: {systemStatus}
              </span>
            </div>

            {/* Clock */}
            <div className="text-right">
              <div className="font-mono text-xs text-foreground countdown-display">
                {formatTime(time)}
              </div>
              <div className="text-[9px] text-muted-foreground tracking-widest">
                MISSION CLOCK
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SystemHeader;
