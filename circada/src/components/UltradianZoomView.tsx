import React from 'react';
import UltradianZoomedGraph from './UltradianZoomedGraph';

interface UltradianZoomViewProps {
  currentTime: Date;
}

const UltradianZoomView: React.FC<UltradianZoomViewProps> = ({ currentTime }) => {
  // Calculate current ultradian cycle (90 minutes each)
  const getCurrentCycle = () => {
    const totalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const cycleNumber = Math.floor(totalMinutes / 90);
    const minutesIntoCycle = totalMinutes % 90;
    
    // Calculate cycle start and end times
    const cycleStartMinutes = cycleNumber * 90;
    const cycleEndMinutes = (cycleNumber + 1) * 90;
    
    const cycleStart = new Date(currentTime);
    cycleStart.setHours(Math.floor(cycleStartMinutes / 60), cycleStartMinutes % 60, 0, 0);
    
    const cycleEnd = new Date(currentTime);
    cycleEnd.setHours(Math.floor(cycleEndMinutes / 60), cycleEndMinutes % 60, 0, 0);
    
    return {
      cycleNumber: cycleNumber + 1,
      minutesIntoCycle,
      cycleStart,
      cycleEnd,
      progressPercent: (minutesIntoCycle / 90) * 100
    };
  };

  const cycle = getCurrentCycle();

  // Generate time markers for the 90-minute timeline
  const generateTimeMarkers = () => {
    const markers = [];
    for (let i = 0; i <= 90; i += 15) {
      const markerTime = new Date(cycle.cycleStart);
      markerTime.setMinutes(markerTime.getMinutes() + i);
      const position = (i / 90) * 100;
      
      markers.push({
        position,
        time: markerTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNow: Math.abs(i - cycle.minutesIntoCycle) < 1
      });
    }
    return markers;
  };

  const timeMarkers = generateTimeMarkers();

  // Determine current energy phase
  const getEnergyPhase = () => {
    if (cycle.minutesIntoCycle < 60) {
      return {
        phase: 'High Energy',
        description: 'Peak focus and alertness period',
        color: 'from-green-500 to-emerald-600',
        intensity: 0.7 + (Math.sin((cycle.minutesIntoCycle / 60) * Math.PI) * 0.3)
      };
    } else {
      return {
        phase: 'Low Energy', 
        description: 'Rest and recovery period',
        color: 'from-blue-500 to-indigo-600',
        intensity: 0.3 + (Math.sin(((cycle.minutesIntoCycle - 60) / 30) * Math.PI) * 0.2)
      };
    }
  };

  const energyPhase = getEnergyPhase();

  return (
    <div className="space-y-4">
      {/* Energy Phase Header */}
      <div className={`p-4 rounded-lg bg-gradient-to-br ${energyPhase.color} bg-opacity-20 border border-opacity-30`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-semibold !text-white">
              {energyPhase.phase}
            </h3>
            <div className="text-4xl font-mono !text-white mt-2">
              {Math.round(energyPhase.intensity * 100)}%
            </div>
            <div className="text-sm !text-zinc-300">{energyPhase.description}</div>
          </div>
          <div className="text-right">
            <div className="text-sm !text-zinc-400">
              {cycle.cycleStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
              {cycle.cycleEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-lg font-mono !text-white mt-1">
              {cycle.minutesIntoCycle}min into cycle
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Graph */}
      <div className="mt-8">
        <div className="text-sm !text-zinc-400 mb-3">90-Minute Cycle Energy Wave</div>
        <UltradianZoomedGraph 
          currentTime={currentTime}
          cycleStart={cycle.cycleStart}
          minutesIntoCycle={cycle.minutesIntoCycle}
        />
      </div>


      {/* Cycle Statistics */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
          <div className="text-lg font-mono !text-white">{90 - cycle.minutesIntoCycle}</div>
          <div className="text-xs !text-zinc-400">min remaining</div>
        </div>
        <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
          <div className="text-lg font-mono !text-white">{Math.round(cycle.progressPercent)}%</div>
          <div className="text-xs !text-zinc-400">complete</div>
        </div>
        <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
          <div className="text-lg font-mono !text-white">{16 - cycle.cycleNumber}</div>
          <div className="text-xs !text-zinc-400">cycles left today</div>
        </div>
      </div>
    </div>
  );
};

export default UltradianZoomView;