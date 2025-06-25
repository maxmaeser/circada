import React from 'react';

interface WaveVisualizationProps {
  currentTime: Date;
}

const WaveVisualization: React.FC<WaveVisualizationProps> = ({ currentTime }) => {
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;

  // Generate wave points based on circadian rhythm
  const generateWavePoints = () => {
    const points = [];
    const width = 800;
    const height = 80;
    const centerY = height / 2;

    for (let x = 0; x <= width; x += 4) {
      const hour = (x / width) * 24;
      // Create a circadian rhythm wave
      // High energy: 8-14h, Low energy: 14-16h, Medium: 16-22h, Very low: 22-6h
      let energy = 0.5;
      if (hour >= 6 && hour < 8) {
        // Wake up - rising energy
        energy = 0.3 + (hour - 6) * 0.2;
      } else if (hour >= 8 && hour < 14) {
        // Peak alertness
        energy = 0.7 + Math.sin((hour - 8) / 6 * Math.PI) * 0.2;
      } else if (hour >= 14 && hour < 16) {
        // Afternoon dip
        energy = 0.4 - Math.sin((hour - 14) / 2 * Math.PI) * 0.2;
      } else if (hour >= 16 && hour < 22) {
        // Evening recovery
        energy = 0.5;
      } else {
        // Night time - low energy
        energy = 0.2;
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