import React from 'react';

interface WaveVisualizationProps {
  currentTime: Date;
}

const WaveVisualization: React.FC<WaveVisualizationProps> = ({ currentTime }) => {
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;

  // Generate wave points based on ultradian rhythms (90-minute cycles)
  const generateWavePoints = () => {
    const points = [];
    const width = 800;
    const height = 80;
    const centerY = height / 2;

    for (let x = 0; x <= width; x += 4) {
      const hour = (x / width) * 24;
      const minutes = hour * 60;
      
      // Create ultradian rhythm wave (90-minute cycles)
      // Each cycle: 60 min high energy + 30 min low energy
      const cyclePosition = (minutes % 90) / 90; // 0-1 within each 90-min cycle
      
      let energy = 0.5;
      if (cyclePosition < 0.67) {
        // High energy phase (60 minutes of 90-minute cycle)
        energy = 0.6 + Math.sin(cyclePosition * Math.PI * 1.5) * 0.3;
      } else {
        // Low energy phase (30 minutes of 90-minute cycle)  
        energy = 0.3 + Math.sin((cyclePosition - 0.67) * Math.PI * 3) * 0.2;
      }
      
      // Modulate by sleep/wake periods (reduce during sleep hours)
      if (hour >= 22 || hour < 6) {
        energy *= 0.3; // Reduce during sleep
      } else if (hour >= 6 && hour < 8) {
        energy *= (0.3 + (hour - 6) * 0.35); // Gradual wake up
      }
      const y = centerY - (energy - 0.5) * height * 0.8;
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  // Generate time markers
  const timeMarkers = [];
  for (let hour = 0; hour < 24; hour += 3) {
    const x = (hour / 24) * 800;
    const isCurrentHour = Math.abs(currentHour - hour) < 1.5;
    timeMarkers.push(
      <g key={hour}>
        <line
          x1={x}
          y1={0}
          x2={x}
          y2={80}
          stroke="rgb(82 82 91 / 0.3)"
          strokeWidth="1"
        />
        <text
          x={x}
          y={95}
          textAnchor="middle"
          className={`text-xs font-mono transition-colors ${
            isCurrentHour ? 'fill-purple-400 font-medium' : 'fill-zinc-500'
          }`}
        >
          {hour.toString().padStart(2, '0')}:00
        </text>
      </g>
    );
  }

  // Current time indicator
  const currentX = (currentHour / 24) * 800;

  return (
    <div className="w-full">
      <div className="relative overflow-x-auto">
        <svg
          width="800"
          height="110"
          viewBox="0 0 800 110"
          className="w-full h-auto"
        >
          {/* Grid lines */}
          {timeMarkers}
          {/* Wave path */}
          <path
            d={`M ${generateWavePoints()}`}
            fill="none"
            stroke="url(#wave-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Current time indicator */}
          <line
            x1={currentX}
            y1={0}
            x2={currentX}
            y2={80}
            stroke="rgb(168 85 247)"
            strokeWidth="2"
            strokeDasharray="2,2"
          />
          <circle
            cx={currentX}
            cy={40}
            r="4"
            fill="rgb(168 85 247)"
            className="animate-pulse"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(168 85 247 / 0.6)" />
              <stop offset="25%" stopColor="rgb(192 132 252 / 0.8)" />
              <stop offset="50%" stopColor="rgb(232 121 249 / 0.8)" />
              <stop offset="75%" stopColor="rgb(192 132 252 / 0.8)" />
              <stop offset="100%" stopColor="rgb(168 85 247 / 0.6)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default WaveVisualization; 