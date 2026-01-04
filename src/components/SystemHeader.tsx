import { useEffect, useState } from 'react';

interface SystemHeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const SystemHeader = ({ onNavigate, currentPage }: SystemHeaderProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 hover:opacity-70 transition-opacity"
          >
            <div className="w-8 h-8 border border-foreground flex items-center justify-center">
              <span className="font-display text-lg">A</span>
            </div>
            <div>
              <h1 className="font-display text-xl text-foreground leading-none">
                A.S.T.R.A.
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-0.5">
                Asteroid Simulation & Threat Response Authority
              </p>
            </div>
          </button>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { id: 'dashboard', label: 'Mission Control' },
            { id: 'strategies', label: 'Defense Systems' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2 font-mono text-xs tracking-wide transition-colors
                ${currentPage === item.id 
                  ? 'bg-foreground text-background' 
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Clock */}
        <div className="text-right">
          <div className="font-mono text-xs text-foreground countdown-display">
            {formatTime(time)}
          </div>
          <div className="text-[9px] text-muted-foreground tracking-wider">
            Mission Clock
          </div>
        </div>
      </div>
    </header>
  );
};

export default SystemHeader;