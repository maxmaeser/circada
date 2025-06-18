import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CircadianPhase } from "@/services/circadian";
import { getPhaseProgress, getTimeUntilHour, formatTimeRemaining } from "@/utils/time";
import { Separator } from "@/components/ui/separator";

interface PhaseWidgetProps {
  currentPhase: CircadianPhase;
  nextPhase?: CircadianPhase;
}

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader data-slot="card-header" className="pb-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold">Current Phase</CardTitle>
          <Badge className={`${getPhaseColor(currentPhase.name)} font-medium px-3 py-1`}>
            {currentPhase.name}
          </Badge>
        </div>
        <CardDescription className="pt-1 text-sm text-muted-foreground">
          {currentPhase.description}
        </CardDescription>
      </CardHeader>

      <Separator className="my-4" />

      <CardContent className="space-y-4 pt-0">
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm font-medium">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Time remaining */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Time remaining</span>
          <span className="font-medium">{formatTimeRemaining(timeRemaining)}</span>
        </div>

        {/* Next phase */}
        {nextPhase && (
          <div className="flex justify-between items-center text-sm pt-1">
            <span className="text-muted-foreground">Next phase</span>
            <Badge variant="outline" className={`${getPhaseColor(nextPhase.name)} font-medium px-3 py-1`}>
              {nextPhase.name}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 