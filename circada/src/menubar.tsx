import React from 'react';
import ReactDOM from 'react-dom/client';
import { useCircadianPhase } from './hooks/useCircadianPhase';
import { formatTimeRemaining } from './utils/time';
import './index.css';

function MenubarApp() {
  const { currentPhase, timeRemaining } = useCircadianPhase();
  
  const phaseArrows = {
    wakeUp: '↑',
    active: '→',
    windDown: '↓',
    sleep: '•'
  };

  return (
    <div className="flex items-center justify-between p-2 bg-black text-white w-full h-full">
      <span className="text-lg font-bold">{phaseArrows[currentPhase]}</span>
      <span className="text-sm">{formatTimeRemaining(timeRemaining)}</span>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MenubarApp />
  </React.StrictMode>
); 