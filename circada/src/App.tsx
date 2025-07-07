import { useCircadianPhase } from './hooks/useCircadianPhase';
import WaveVisualization from './components/WaveVisualization';
import './App.css';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { formatTimeRemaining, formatTime, getPhaseProgress, getTimeUntilHour } from './utils/time';
import { Badge } from './components/ui/badge';
import { ArrowDown, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

function App() {
  const { currentPhase } = useCircadianPhase();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentPhase) {
    return (
      <div className="min-h-screen !bg-zinc-900 flex items-center justify-center">
        <div className="!text-zinc-400">Loading phase...</div>
      </div>
    );
  }

  const progress = getPhaseProgress(currentPhase.start, currentPhase.end);
  const timeRemaining = getTimeUntilHour(currentPhase.end);
  const currentTimePosition = ((currentTime.getHours() + currentTime.getMinutes() / 60) / 24) * 100;

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
                      {Math.floor(timeRemaining)}h {Math.floor((timeRemaining % 1) * 60)}m {Math.floor(((timeRemaining % 1) * 60 % 1) * 60)}s
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
                  <div className="relative w-full h-4 bg-zinc-700 rounded-full overflow-visible">
                    {/* Phase Background Colors */}
                    <div className="absolute inset-0 flex rounded-full overflow-hidden">
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
                      className="absolute -top-1 w-0.5 h-6 bg-white shadow-lg z-20 rounded-full"
                      style={{ 
                        left: `${currentTimePosition}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                    
                    {/* Floating Timer */}
                    <div 
                      className="absolute -top-8 transform -translate-x-1/2 z-30"
                      style={{ left: `${currentTimePosition}%` }}
                    >
                      <div className="bg-white text-black text-xs font-mono px-2 py-1 rounded shadow-lg">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
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

          {/* Ultradian Rhythm Wave Card */}
          <Card className="!bg-zinc-800 !border-zinc-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold !text-white">Ultradian Rhythm (90-min cycles)</CardTitle>
            </CardHeader>
            <CardContent>
              <WaveVisualization currentTime={currentTime} />
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm !text-zinc-400">Current Cycle:</span>
                  <span className="text-sm !text-white font-mono">
                    {Math.floor((currentTime.getHours() * 60 + currentTime.getMinutes()) / 90) + 1} of 16
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm !text-zinc-400">Next Cycle in:</span>
                  <span className="text-sm !text-white font-mono">
                    {90 - ((currentTime.getHours() * 60 + currentTime.getMinutes()) % 90)} min
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm !text-zinc-500">
                    90-minute energy cycles throughout the day
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;