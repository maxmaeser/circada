import { Card } from "./ui/card"

interface TimerDisplayProps {
  timeLeft: string
  endTime: string
}

export function TimerDisplay({ timeLeft, endTime }: TimerDisplayProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Time Remaining</p>
          <p className="text-2xl font-bold">{timeLeft}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-sm text-muted-foreground">Ends At</p>
          <p className="text-lg">{endTime}</p>
        </div>
      </div>
    </Card>
  )
} 