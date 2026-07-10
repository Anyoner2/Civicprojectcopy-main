
export function InfrastructureBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <svg
        viewBox="0 0 1200 800"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="neonBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky background */}
        <rect width="1200" height="800" fill="url(#skyGradient)" />

        {/* City skyline - left buildings */}
        <rect x="0" y="520" width="120" height="280" fill="#0f172a" />
        <rect x="10" y="480" width="100" height="40" fill="#1e293b" />
        <rect x="20" y="460" width="80" height="20" fill="#334155" />

        {/* Windows on left building */}
        <g fill="#fbbf24" opacity="0.8">
          <rect x="25" y="540" width="12" height="12" />
          <rect x="45" y="540" width="12" height="12" />
          <rect x="65" y="540" width="12" height="12" />
          <rect x="25" y="570" width="12" height="12" />
          <rect x="45" y="570" width="12" height="12" />
          <rect x="65" y="570" width="12" height="12" />
          <rect x="25" y="600" width="12" height="12" />
          <rect x="45" y="600" width="12" height="12" />
          <rect x="65" y="600" width="12" height="12" />
        </g>

        {/* Central tall building */}
        <rect x="400" y="350" width="150" height="450" fill="#0f0f23" />
        <rect x="410" y="330" width="130" height="20" fill="#1e1e3f" />

        {/* Windows on central building - grid pattern */}
        <g fill="#00ff88" opacity="0.9" filter="url(#glow)">
          <rect x="420" y="370" width="10" height="10" />
          <rect x="440" y="370" width="10" height="10" />
          <rect x="460" y="370" width="10" height="10" />
          <rect x="480" y="370" width="10" height="10" />
          <rect x="500" y="370" width="10" height="10" />
          <rect x="420" y="400" width="10" height="10" />
          <rect x="440" y="400" width="10" height="10" />
          <rect x="460" y="400" width="10" height="10" />
          <rect x="480" y="400" width="10" height="10" />
          <rect x="500" y="400" width="10" height="10" />
          <rect x="420" y="430" width="10" height="10" />
          <rect x="440" y="430" width="10" height="10" />
          <rect x="460" y="430" width="10" height="10" />
          <rect x="480" y="430" width="10" height="10" />
          <rect x="500" y="430" width="10" height="10" />
          <rect x="420" y="460" width="10" height="10" />
          <rect x="440" y="460" width="10" height="10" />
          <rect x="460" y="460" width="10" height="10" />
          <rect x="480" y="460" width="10" height="10" />
          <rect x="500" y="460" width="10" height="10" />
          <rect x="420" y="490" width="10" height="10" />
          <rect x="440" y="490" width="10" height="10" />
          <rect x="460" y="490" width="10" height="10" />
          <rect x="480" y="490" width="10" height="10" />
          <rect x="500" y="490" width="10" height="10" />
        </g>

        {/* Right building */}
        <rect x="1000" y="480" width="90" height="320" fill="#1a1a3e" />
        <g fill="#ff006e" opacity="0.7" filter="url(#glow)">
          <rect x="1010" y="510" width="10" height="10" />
          <rect x="1030" y="510" width="10" height="10" />
          <rect x="1050" y="510" width="10" height="10" />
          <rect x="1070" y="510" width="10" height="10" />
          <rect x="1010" y="540" width="10" height="10" />
          <rect x="1030" y="540" width="10" height="10" />
          <rect x="1050" y="540" width="10" height="10" />
          <rect x="1070" y="540" width="10" height="10" />
        </g>

        {/* Road infrastructure */}
        <rect x="0" y="650" width="1200" height="150" fill="#1e293b" />
        <line x1="0" y1="680" x2="1200" y2="680" stroke="#fbbf24" strokeWidth="3" strokeDasharray="40,20" opacity="0.6" />

        {/* Road markings */}
        <line x1="0" y1="730" x2="1200" y2="730" stroke="#64748b" strokeWidth="2" opacity="0.4" />

        {/* Power lines */}
        <line x1="50" y1="250" x2="1150" y2="350" stroke="#00d9ff" strokeWidth="2" opacity="0.5" filter="url(#glow)" />
        <line x1="100" y1="200" x2="1100" y2="300" stroke="#d946ef" strokeWidth="2" opacity="0.4" filter="url(#glow)" />

        {/* Power poles */}
        <line x1="200" y1="150" x2="200" y2="350" stroke="#64748b" strokeWidth="4" />
        <circle cx="200" cy="200" r="8" fill="#0ea5e9" filter="url(#glow)" />
        <line x1="600" y1="150" x2="600" y2="350" stroke="#64748b" strokeWidth="4" />
        <circle cx="600" cy="200" r="8" fill="#0ea5e9" filter="url(#glow)" />
        <line x1="1000" y1="150" x2="1000" y2="350" stroke="#64748b" strokeWidth="4" />
        <circle cx="1000" cy="200" r="8" fill="#0ea5e9" filter="url(#glow)" />

        {/* Infrastructure nodes */}
        <g filter="url(#glow)">
          <circle cx="300" cy="600" r="6" fill="#00ff88" opacity="0.8" />
          <circle cx="300" cy="600" r="10" fill="none" stroke="#00ff88" strokeWidth="1" opacity="0.5" />
          
          <circle cx="900" cy="620" r="6" fill="#ff006e" opacity="0.8" />
          <circle cx="900" cy="620" r="10" fill="none" stroke="#ff006e" strokeWidth="1" opacity="0.5" />

          <circle cx="150" cy="700" r="6" fill="#0ea5e9" opacity="0.8" />
          <circle cx="150" cy="700" r="10" fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Connecting networks */}
        <line x1="300" y1="600" x2="600" y2="620" stroke="#00ff88" strokeWidth="1.5" opacity="0.4" />
        <line x1="600" y1="620" x2="900" y2="600" stroke="#ff006e" strokeWidth="1.5" opacity="0.4" />
        <line x1="150" y1="700" x2="300" y2="600" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.4" />

        {/* Water infrastructure pipes */}
        <rect x="50" y="720" width="1100" height="8" fill="#none" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />

        {/* Underground grid pattern */}
        <g stroke="#475569" strokeWidth="1" opacity="0.2">
          <line x1="0" y1="750" x2="200" y2="750" />
          <line x1="300" y1="750" x2="500" y2="750" />
          <line x1="600" y1="750" x2="800" y2="750" />
          <line x1="900" y1="750" x2="1200" y2="750" />
        </g>
      </svg>
    </div>
  );
}
