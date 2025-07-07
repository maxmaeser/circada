import { useCircadianPhase } from './hooks/useCircadianPhase';
import WaveVisualization from './components/WaveVisualization';
import './App.css';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { formatTimeRemaining, formatTime, getPhaseProgress, getTimeUntilHour } from './utils/time';
import { Badge } from './components/ui/badge';
import { ArrowDown, Clock } from 'lucide-react';

function App() {
  const { currentPhase } = useCircadianPhase();

  if (!currentPhase) {
    return (
      <div className="min-h-screen !bg-zinc-900 flex items-center justify-center">
        <div className="!text-zinc-400">Loading phase...</div>
      </div>
    );
  }

  const progress = getPhaseProgress(currentPhase.start, currentPhase.end);
  const timeRemaining = getTimeUntilHour(currentPhase.end);

  return (
    <div className="min-h-screen !bg-zinc-900 p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-5xl font-extrabold tracking-tighter !text-white">Circada</h1>
          <p className="text-lg !text-zinc-400">
            Stay in sync with your natural energy cycles
          </p>
        </header>

        <div className="space-y-6">
          {/* Current Phase Card */}
          <Card className="!bg-zinc-800 !border-zinc-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold !text-white">Current</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phase Info */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">
                    {currentPhase.name === 'Sleep Zone' || currentPhase.name === 'Night' ? '🌙' : '☀️'}
                  </span>
                  <span className="!text-white font-medium text-lg">{currentPhase.description}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <ArrowDown className="w-4 h-4 !text-purple-400" />
                  <span className="!text-purple-400 font-medium">{currentPhase.name}</span>
                  <Badge className="!bg-purple-500/20 !text-purple-300 !border-purple-500/30">
                    Progress {Math.round(progress)}%
                  </Badge>
                </div>
              </div>

              {/* Time Remaining Section */}
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm !text-zinc-400 mb-1">Time Remaining</p>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 !text-purple-400" />
                    <span className="text-3xl font-bold !text-white font-mono">
                      {formatTimeRemaining(timeRemaining)}
                    </span>
                  </div>
                </div>

                {/* Enhanced Progress Timeline */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-mono !text-zinc-400">
                    <span>{formatTime(currentPhase.start)}</span>
                    <span>{formatTime(currentPhase.end)}</span>
                  </div>
                  
                  {/* 24-Hour Phase Timeline */}
                  <div className="relative w-full h-4 bg-zinc-700 rounded-full overflow-hidden">
                    {/* Phase Background Colors */}
                    <div className="absolute inset-0 flex">
                      <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-700" style={{ width: `${(5/24) * 100}%` }} />
                      <div className="h-full bg-gradient-to-r from-purple-500 to-blue-600" style={{ width: `${(1/24) * 100}%` }} />
                      <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500" style={{ width: `${(2/24) * 100}%` }} />
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-sky-500" style={{ width: `${(4/24) * 100}%` }} />
                      <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600" style={{ width: `${(4/24) * 100}%` }} />
                      <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-700" style={{ width: `${(6/24) * 100}%` }} />
                      <div className="h-full bg-gradient-to-r from-indigo-700 to-purple-800" style={{ width: `${(2/24) * 100}%` }} />
                    </div>
                    
                    {/* Current Time Indicator */}
                    <div 
                      className="absolute top-0 w-1 h-full bg-white shadow-lg z-10"
                      style={{ 
                        left: `${((new Date().getHours() + new Date().getMinutes() / 60) / 24) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                  
                  {/* Current Phase Progress */}
                  <Progress 
                    value={progress} 
                    className="h-2 !bg-zinc-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 24hr Rhythm Wave Card */}
          <Card className="!bg-zinc-800 !border-zinc-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold !text-white">24-Hour Rhythm Wave</CardTitle>
            </CardHeader>
            <CardContent>
              <WaveVisualization currentTime={new Date()} />
              <div className="mt-4 text-center">
                <p className="text-sm !text-zinc-500">
                  Wave shows natural energy levels throughout the day
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;