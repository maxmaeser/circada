import React from 'react';

interface UltradianZoomedGraphProps {
  currentTime: Date;
  cycleStart: Date;
  minutesIntoCycle: number;
}

const UltradianZoomedGraph: React.FC<UltradianZoomedGraphProps> = ({ 
  currentTime, 
  cycleStart, 
  minutesIntoCycle 
}) => {
  const generateZoomedWavePoints = () => {
    const points = [];
    const width = 800;
    const height = 120; // Increased from 60 to 120
    const centerY = height / 2;

    for (let x = 0; x <= width; x += 2) {
      const minutes = (x / width) * 90; // 0-90 minutes
      
      // Create detailed ultradian wave for this specific 90-minute cycle
      let energy = 0.5;
      
      if (minutes < 60) {
        // High energy phase (0-60 minutes)
        // Peak around 30 minutes, with some variation
        const peakPosition = minutes / 60; // 0-1
        energy = 0.6 + Math.sin(peakPosition * Math.PI) * 0.3;
        
        // Add some micro-variations for realism
        energy += Math.sin(peakPosition * Math.PI * 4) * 0.05;
      } else {
        // Low energy phase (60-90 minutes)
        const lowPhasePosition = (minutes - 60) / 30; // 0-1
        energy = 0.35 - Math.sin(lowPhasePosition * Math.PI) * 0.2;
        
        // Add micro-variations
        energy += Math.sin(lowPhasePosition * Math.PI * 3) * 0.03;
      }
      
      const y = centerY - (energy - 0.5) * height * 0.8;
      points.push(`${x},${y}`);
    }
    
    return points.join(' ');
  };

  const wavePoints = generateZoomedWavePoints();
  const currentPosition = (minutesIntoCycle / 90) * 100;

  // Generate detailed time markers (every 10 minutes)
  const timeMarkers = [];
  for (let i = 0; i <= 90; i += 10) {
    const markerTime = new Date(cycleStart);
    markerTime.setMinutes(markerTime.getMinutes() + i);
    const position = (i / 90) * 100;
    
    timeMarkers.push({
      position,
      time: markerTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isNow: Math.abs(i - minutesIntoCycle) < 2,
      isMainMarker: i % 30 === 0 // Every 30 minutes
    });
  }

  // Calculate time remaining in current cycle with precise seconds
  const totalSecondsIntoCycle = (currentTime.getHours() * 3600) + (currentTime.getMinutes() * 60) + currentTime.getSeconds();
  const cycleStartSeconds = Math.floor(totalSecondsIntoCycle / (90 * 60)) * (90 * 60);
  const secondsIntoCycle = totalSecondsIntoCycle - cycleStartSeconds;
  const totalSecondsRemaining = (90 * 60) - secondsIntoCycle;
  
  const wholeMinutesRemaining = Math.floor(totalSecondsRemaining / 60);
  const secondsRemaining = totalSecondsRemaining % 60;

  return (
    <div className="relative w-full">
      {/* Floating Timer Above Graph */}
      <div 
        className="absolute -top-16 transform -translate-x-1/2 z-40"
        style={{ left: `${currentPosition}%` }}
      >
        <div className="bg-white text-black text-2xl font-mono font-bold px-4 py-3 rounded-xl shadow-2xl whitespace-nowrap border-2 border-gray-200">
          {wholeMinutesRemaining}m {secondsRemaining}s
        </div>
      </div>
      
      <svg width="100%" height="140" viewBox="0 0 800 140" className="overflow-visible">
        {/* Energy Phase Backgrounds */}
        <defs>
          <linearGradient id="highEnergyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(34 197 94 / 0.3)" />
            <stop offset="100%" stopColor="rgb(5 150 105 / 0.3)" />
          </linearGradient>
          <linearGradient id="lowEnergyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(59 130 246 / 0.3)" />
            <stop offset="100%" stopColor="rgb(79 70 229 / 0.3)" />
          </linearGradient>
        </defs>
        
        {/* High Energy Background (0-60 min = 66.67% of width) */}
        <rect 
          x="0" 
          y="0" 
          width="533.33" 
          height="140" 
          fill="url(#highEnergyGradient)"
          rx="8"
        />
        
        {/* Low Energy Background (60-90 min = 33.33% of width) */}
        <rect 
          x="533.33" 
          y="0" 
          width="266.67" 
          height="140" 
          fill="url(#lowEnergyGradient)"
          rx="8"
        />

        {/* Time Grid Lines */}
        {timeMarkers.map((marker, index) => (
          <line
            key={index}
            x1={(marker.position / 100) * 800}
            y1="10"
            x2={(marker.position / 100) * 800}
            y2="130"
            stroke={marker.isMainMarker ? "rgb(156 163 175 / 0.4)" : "rgb(156 163 175 / 0.2)"}
            strokeWidth={marker.isMainMarker ? "1" : "0.5"}
            strokeDasharray={marker.isMainMarker ? "none" : "2,2"}
          />
        ))}

        {/* Energy Wave Line */}
        <polyline
          points={wavePoints}
          fill="none"
          stroke="rgb(255 255 255 / 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Current Position Indicator */}
        <line
          x1={(currentPosition / 100) * 800}
          y1="0"
          x2={(currentPosition / 100) * 800}
          y2="140"
          stroke="white"
          strokeWidth="3"
          className="drop-shadow-lg"
        />
        
        {/* Current Position Dot */}
        <circle
          cx={(currentPosition / 100) * 800}
          cy="70"
          r="5"
          fill="white"
          className="drop-shadow-lg"
        />

      </svg>

      {/* Time Labels */}
      <div className="flex justify-between mt-1 px-2">
        {timeMarkers.filter(marker => marker.isMainMarker).map((marker, index) => (
          <div
            key={index}
            className={`text-xs ${marker.isNow ? '!text-white font-bold' : '!text-zinc-400'}`}
          >
            {marker.time}
          </div>
        ))}
      </div>

      {/* Phase Labels */}
      <div className="flex mt-2">
        <div className="w-2/3 text-center">
          <div className="text-xs font-semibold !text-green-400">High Energy Phase</div>
        </div>
        <div className="w-1/3 text-center">
          <div className="text-xs font-semibold !text-blue-400">Low Energy Phase</div>
        </div>
      </div>
    </div>
  );
};

export default UltradianZoomedGraph;