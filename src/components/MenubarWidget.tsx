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

    // Calculate current position in 90-minute ultradian cycle
    const totalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const cyclePosition = totalMinutes % 90; // 0-89 minutes in current cycle
    
    // Calculate time left in current cycle
    const minutesLeft = 89 - cyclePosition;
    const secondsLeft = 60 - currentTime.getSeconds();
    
    setTimeLeft({
      minutes: secondsLeft === 60 ? minutesLeft : minutesLeft - 1,
      seconds: secondsLeft === 60 ? 0 : secondsLeft
    });

    // Determine phase arrow based on position in cycle
    // 0-30min: Rising energy ↗
    // 30-60min: Peak energy →  
    // 60-90min: Declining energy ↘
    if (cyclePosition < 30) {
      setPhaseArrow('↗');
    } else if (cyclePosition < 60) {
      setPhaseArrow('→');
    } else {
      setPhaseArrow('↘');
    }
  }, [currentTime]);

  // Ultra-minimal styling for menubar
  return (
    <div className="flex items-center gap-1 px-2 py-1 text-sm font-mono text-white bg-black/80 rounded h-full">
      <span className="text-base">{phaseArrow}</span>
      <span className="tabular-nums">
        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

// Standalone menubar component with its own timer for performance
export default function MenubarStandalone() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update every second for countdown precision
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <MenubarWidget currentTime={currentTime} />;
}