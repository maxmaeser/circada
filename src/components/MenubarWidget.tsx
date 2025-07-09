import { useState, useEffect } from 'react';

// Ultra-minimal menubar widget: Arrow + Timer
// Format: ↗ 23:45 (phase arrow + time left in current 90min cycle)

interface MenubarWidgetProps {
  currentTime?: Date;
}

export function MenubarWidget({ currentTime }: MenubarWidgetProps) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [phaseArrow, setPhaseArrow] = useState('→');

  useEffect(() => {
    if (!currentTime) return;

    // Use same calculation as main app: include seconds for precision
    const totalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
    const cyclePosition = totalMinutes % 90; // 0-90 minutes in current cycle
    
    // Determine energy phase (matching main app logic)
    let energyPhase: 'high' | 'low' | 'transition' = 'high';
    
    if (cyclePosition <= 5) {
      energyPhase = 'transition';
    } else if (cyclePosition <= 60) {
      energyPhase = 'high';
    } else if (cyclePosition <= 65) {
      energyPhase = 'transition';
    } else {
      energyPhase = 'low';
    }
    
    // Calculate time remaining using same logic as main app
    const timeRemaining = energyPhase === 'high' || (energyPhase === 'transition' && cyclePosition <= 60) 
      ? 60 - cyclePosition 
      : 90 - cyclePosition;
    
    const minutesLeft = Math.floor(timeRemaining);
    const secondsLeft = Math.floor((timeRemaining - minutesLeft) * 60);
    
    setTimeLeft({
      minutes: minutesLeft,
      seconds: secondsLeft
    });

    // Determine phase icon based on position in cycle (6-phase system)
    if (cyclePosition <= 15) {
      setPhaseArrow('↗'); // Rising (0-15 min) - Building energy
    } else if (cyclePosition <= 30) {
      setPhaseArrow('↑'); // Climbing (15-30 min) - Strong ascent
    } else if (cyclePosition <= 45) {
      setPhaseArrow('🔥'); // Peak (30-45 min) - Maximum energy
    } else if (cyclePosition <= 60) {
      setPhaseArrow('⚡'); // Flow (45-60 min) - Optimal performance
    } else if (cyclePosition <= 75) {
      setPhaseArrow('↘'); // Declining (60-75 min) - Energy decreasing
    } else {
      setPhaseArrow('😴'); // Resting (75-90 min) - Recovery phase
    }
    
    console.log('MenubarWidget update:', { cyclePosition, energyPhase, timeRemaining, timeLeft });
  }, [currentTime]);

  // Minimal text-only styling for menubar
  return (
    <div className="flex items-center gap-1 px-1 py-0 text-xs font-mono text-white h-full w-full">
      <span className="text-sm font-bold">{phaseArrow}</span>
      <span className="tabular-nums text-xs">
        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

// Standalone menubar component with its own timer for performance
export default function MenubarStandalone() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    console.log('MenubarStandalone mounted');
    // Update every second for countdown precision
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  console.log('MenubarStandalone rendering with time:', currentTime);
  return <MenubarWidget currentTime={currentTime} />;
}