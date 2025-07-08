import type { JSX } from 'react';
import { ArrowUp, ArrowRight, ArrowDown, Circle } from 'lucide-react';
import type { CircadianPhase } from '@/services/circadian';
import { formatTimeRemaining, getTimeUntilHour } from '@/utils/time';

interface MenubarViewProps {
  currentPhase: CircadianPhase;
}

const getPhaseDirection = (phaseName: string) => {
  const directions: Record<string, JSX.Element> = {
    "Morning Peak": <ArrowUp className="w-4 h-4" />,
    "Mid-Day Trough": <ArrowRight className="w-4 h-4" />,
    "Afternoon Peak": <ArrowRight className="w-4 h-4" />,
    "Evening Dip": <ArrowDown className="w-4 h-4" />,
    "Sleep Zone": <ArrowDown className="w-4 h-4" />,
    "Night": <Circle className="w-4 h-4" />
  };
  return directions[phaseName] || <Circle className="w-4 h-4" />;
};

export const MenubarView = ({ currentPhase }: MenubarViewProps) => {
  const timeRemaining = getTimeUntilHour(currentPhase.end);
  const formattedTime = formatTimeRemaining(timeRemaining);
  
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <span className="text-base" title={currentPhase.name}>
        {getPhaseDirection(currentPhase.name)}
      </span>
      <span className="text-sm font-medium">
        {formattedTime}
      </span>
    </div>
  );
}; 