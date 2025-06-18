import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CircadianPhase } from "@/services/circadian";
import { getPhaseProgress, getTimeUntilHour, formatTimeRemaining, formatTime } from "@/utils/time";
import { Separator } from "@/components/ui/separator";
import { TimerDisplay } from "./TimerDisplay";
import { ArrowUp, ArrowRight, ArrowDown, Circle, Sun, Sunrise, Sunset, Moon } from 'lucide-react';

interface PhaseWidgetProps {
  currentPhase: CircadianPhase;
  nextPhase?: CircadianPhase;
}

const getPhaseIcon = (phaseName: string) => {
  const icons: Record<string, JSX.Element> = {
    "Morning Peak": <Sunrise className="w-6 h-6 text-amber-500" />,
    "Mid-Day Trough": <Sun className="w-6 h-6 text-blue-500" />,
    "Afternoon Peak": <Sun className="w-6 h-6 text-green-500" />,
    "Evening Dip": <Sunset className="w-6 h-6 text-purple-500" />,
    "Sleep Zone": <Moon className="w-6 h-6 text-indigo-500" />,
    "Night": <Moon className="w-6 h-6 text-slate-500" />
  };
  return icons[phaseName] || <Circle className="w-6 h-6" />;
};

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

const getPhaseColor = (phaseName: string): string => {
  const colors: Record<string, string> = {
    "Morning Peak": "bg-amber-100 text-amber-800 border-amber-200",
    "Mid-Day Trough": "bg-blue-100 text-blue-800 border-blue-200", 
    "Afternoon Peak": "bg-green-100 text-green-800 border-green-200",
    "Evening Dip": "bg-purple-100 text-purple-800 border-purple-200",
    "Sleep Zone": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Night": "bg-slate-100 text-slate-800 border-slate-200"
  };
  return colors[phaseName] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const PhaseWidget = ({ currentPhase, nextPhase }: PhaseWidgetProps) => {
  const progress = getPhaseProgress(currentPhase.start, currentPhase.end);
  const timeRemaining = getTimeUntilHour(currentPhase.end);
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPhaseIcon(currentPhase.name)}
            <div>
              <CardTitle className="text-xl font-semibold">Current Phase</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {currentPhase.description}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${getPhaseColor(currentPhase.name)} font-medium px-3 py-1.5 flex items-center gap-2`}>
            {getPhaseDirection(currentPhase.name)}
            {currentPhase.name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Timer Display */}
        <TimerDisplay 
          timeLeft={formatTimeRemaining(timeRemaining)}
          endTime={formatTime(currentPhase.end)}
        />

        {/* Next phase */}
        {nextPhase && (
          <>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Next phase</span>
              <div className="flex items-center gap-2">
                {getPhaseIcon(nextPhase.name)}
                <Badge variant="outline" className={`${getPhaseColor(nextPhase.name)} font-medium px-3 py-1.5 flex items-center gap-2`}>
                  {getPhaseDirection(nextPhase.name)}
                  {nextPhase.name}
                </Badge>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 