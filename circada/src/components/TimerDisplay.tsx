import { Card } from "./ui/card"
import { Clock } from "lucide-react"

interface TimerDisplayProps {
  timeLeft: string
  endTime: string
}

export function TimerDisplay({ timeLeft, endTime }: TimerDisplayProps) {
  return (
    <Card className="p-4 bg-primary/5">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Time Remaining</p>
          </div>
          <p className="text-3xl font-bold tracking-tight">{timeLeft}</p>
        </div>
        <div className="space-y-2 text-right">
          <p className="text-sm font-medium text-muted-foreground">Ends At</p>
          <p className="text-xl font-semibold">{endTime}</p>
        </div>
      </div>
    </Card>
  )
} 