import { useState, useEffect } from 'react';
import { getCurrentPhase, defaultPhases } from '../services/circadian';
import type { CircadianPhase } from '../services/circadian';

export const useCircadianPhase = () => {
  const [currentPhase, setCurrentPhase] = useState<CircadianPhase | undefined>(getCurrentPhase());

  useEffect(() => {
    const interval = setInterval(() => {
      const newPhase = getCurrentPhase();
      if (newPhase?.name !== currentPhase?.name) {
        setCurrentPhase(newPhase);
      }
    }, 1000 * 60); // Check every minute for phase change

    return () => clearInterval(interval);
  }, [currentPhase]);

  const getNextPhase = (): CircadianPhase | undefined => {
    if (!currentPhase) return defaultPhases[0];
    const currentIndex = defaultPhases.findIndex(p => p.name === currentPhase.name);
    return defaultPhases[(currentIndex + 1) % defaultPhases.length];
  };

  return {
    currentPhase,
    nextPhase: getNextPhase(),
    allPhases: defaultPhases,
  };
}; 