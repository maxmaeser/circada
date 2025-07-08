import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Activity, Clock, Zap } from 'lucide-react';

interface UltradianDashboardProps {
  currentTime: Date;
  heartRate?: number;
  realDataAnalysis?: any;
}

interface CycleState {
  cyclePosition: number; // 0-90 minutes
  energyPhase: 'high' | 'low' | 'transition';
  energyIntensity: number; // 0-1
  timeRemaining: number; // minutes
  nextPhaseTime: string;
  cycleNumber: number; // 1-16
  confidence: number; // 0-1 for predictions
}

export default function UltradianDashboard({ currentTime, heartRate, realDataAnalysis }: UltradianDashboardProps) {
  const [cycleState, setCycleState] = useState<CycleState>({
    cyclePosition: 0,
    energyPhase: 'high',
    energyIntensity: 0.8,
    timeRemaining: 45,
    nextPhaseTime: '2:30 PM',
    cycleNumber: 8,
    confidence: 0.85
  });

  useEffect(() => {
    const calculateCycleState = () => {
      const totalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
      const cyclePosition = totalMinutes % 90;
      const cycleNumber = Math.floor(totalMinutes / 90) + 1;
      
      // Energy phase logic
      let energyPhase: 'high' | 'low' | 'transition' = 'high';
      let energyIntensity = 0.8;
      
      if (cyclePosition <= 5) {
        energyPhase = 'transition';
        energyIntensity = 0.4 + (cyclePosition / 5) * 0.4; // 0.4 to 0.8
      } else if (cyclePosition <= 60) {
        energyPhase = 'high';
        // Sine wave for smooth energy curve
        const progress = (cyclePosition - 5) / 55; // 0 to 1
        energyIntensity = 0.5 + 0.4 * Math.sin(progress * Math.PI); // 0.5 to 0.9
      } else if (cyclePosition <= 65) {
        energyPhase = 'transition';
        energyIntensity = 0.8 - ((cyclePosition - 60) / 5) * 0.4; // 0.8 to 0.4
      } else {
        energyPhase = 'low';
        energyIntensity = 0.2 + 0.2 * Math.sin((cyclePosition - 65) / 25 * Math.PI); // 0.2 to 0.4
      }

      // Adjust with heart rate if available
      let confidence = 0.75; // Base confidence
      if (heartRate && realDataAnalysis) {
        const expectedHR = getExpectedHeartRate(currentTime.getHours(), realDataAnalysis);
        const hrDiff = Math.abs(heartRate - expectedHR) / expectedHR;
        
        if (hrDiff < 0.1) {
          confidence = 0.95;
          // Adjust energy intensity based on heart rate
          if (heartRate > expectedHR * 1.1) {
            energyIntensity = Math.min(1, energyIntensity * 1.2);
          } else if (heartRate < expectedHR * 0.9) {
            energyIntensity = Math.max(0.1, energyIntensity * 0.8);
          }
        } else if (hrDiff < 0.2) {
          confidence = 0.85;
        } else {
          confidence = 0.65;
        }
      }

      const timeRemaining = energyPhase === 'high' || energyPhase === 'transition' && cyclePosition <= 60 
        ? 60 - cyclePosition 
        : 90 - cyclePosition;

      const nextPhaseMinutes = totalMinutes + timeRemaining;
      const nextPhaseHour = Math.floor(nextPhaseMinutes / 60) % 24;
      const nextPhaseMin = nextPhaseMinutes % 60;
      const nextPhaseTime = `${nextPhaseHour}:${String(nextPhaseMin).padStart(2, '0')}`;

      setCycleState({
        cyclePosition,
        energyPhase,
        energyIntensity,
        timeRemaining,
        nextPhaseTime,
        cycleNumber,
        confidence
      });
    };

    calculateCycleState();
    const interval = setInterval(calculateCycleState, 1000);
    return () => clearInterval(interval);
  }, [currentTime, heartRate, realDataAnalysis]);

  const getExpectedHeartRate = (hour: number, analysis: any): number => {
    if (!analysis?.avgHeartRateByHour) return 70;
    const hrData = analysis.avgHeartRateByHour.find((d: any) => d.hour === hour);
    return hrData?.rate || 70;
  };

  const getEnergyColor = (phase: string, intensity: number) => {
    if (phase === 'high') return `hsl(${120 + intensity * 60}, 70%, ${50 + intensity * 20}%)`;
    if (phase === 'low') return `hsl(${220}, 70%, ${30 + intensity * 30}%)`;
    return `hsl(${170}, 70%, ${40 + intensity * 20}%)`;
  };

  const getPhaseIcon = (phase: string) => {
    if (phase === 'high') return <TrendingUp className="w-5 h-5" />;
    if (phase === 'low') return <TrendingDown className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  const getRecommendation = (phase: string, intensity: number) => {
    if (phase === 'high' && intensity > 0.7) return 'Optimal for: Focus work, creative tasks';
    if (phase === 'high') return 'Good for: Problem solving, learning';
    if (phase === 'low') return 'Best for: Rest, light tasks, reflection';
    return 'Transition period: Prepare for next phase';
  };

  return (
    <div className="space-y-6">
      {/* Main Ultradian Dashboard */}
      <Card className="!bg-gradient-to-br from-zinc-800 to-zinc-900 !border-zinc-700 overflow-hidden">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold !text-white">Ultradian Cycle</h2>
              <p className="text-sm !text-zinc-400">90-minute energy rhythm</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono !text-white">Cycle {cycleState.cycleNumber}/16</div>
              <div className="text-sm !text-zinc-400">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          {/* Current State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Energy Phase */}
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white"
                style={{ backgroundColor: getEnergyColor(cycleState.energyPhase, cycleState.energyIntensity) }}
              >
                {getPhaseIcon(cycleState.energyPhase)}
              </div>
              <div className="text-lg font-semibold !text-white capitalize">{cycleState.energyPhase} Energy</div>
              <div className="text-sm !text-zinc-400">{Math.round(cycleState.energyIntensity * 100)}% intensity</div>
            </div>

            {/* Time Remaining */}
            <div className="text-center">
              <div className="text-4xl font-bold !text-white font-mono mb-2">
                {String(Math.floor(cycleState.timeRemaining)).padStart(2, '0')}:{String(Math.floor(((cycleState.timeRemaining % 1) * 60))).padStart(2, '0')}
              </div>
              <div className="text-sm !text-zinc-400">until next phase</div>
              <div className="text-sm !text-zinc-500">at {cycleState.nextPhaseTime}</div>
            </div>

            {/* Live Adjustments */}
            <div className="text-center">
              {heartRate ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-red-400" />
                    <span className="text-lg font-semibold !text-white">{heartRate} bpm</span>
                  </div>
                  <Badge 
                    className={`${cycleState.confidence > 0.8 ? '!bg-green-500/20 !text-green-300' : '!bg-yellow-500/20 !text-yellow-300'}`}
                  >
                    {Math.round(cycleState.confidence * 100)}% confidence
                  </Badge>
                </>
              ) : (
                <>
                  <div className="text-lg !text-zinc-500 mb-2">No live data</div>
                  <div className="text-sm !text-zinc-600">Using predicted rhythm</div>
                </>
              )}
            </div>
          </div>

          {/* Wave Visualization */}
          <div className="relative h-32 mb-6">
            <svg width="100%" height="100%" viewBox="0 0 800 120" className="overflow-visible">
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="80" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Energy wave */}
              <path
                d={generateWavePath(800, 100)}
                fill="none"
                stroke={getEnergyColor(cycleState.energyPhase, cycleState.energyIntensity)}
                strokeWidth="3"
                className="drop-shadow-sm"
              />
              
              {/* Phase backgrounds */}
              <rect x="0" y="0" width="533" height="100" fill="rgba(34, 197, 94, 0.1)" />
              <rect x="533" y="0" width="267" height="100" fill="rgba(59, 130, 246, 0.1)" />
              
              {/* Current position indicator */}
              <line
                x1={cycleState.cyclePosition * (800/90)}
                y1="0"
                x2={cycleState.cyclePosition * (800/90)}
                y2="100"
                stroke="white"
                strokeWidth="2"
                className="drop-shadow-lg"
              />
              <circle
                cx={cycleState.cyclePosition * (800/90)}
                cy={50 - (cycleState.energyIntensity - 0.5) * 40}
                r="6"
                fill="white"
                className="drop-shadow-lg animate-pulse"
              />
              
              {/* 24-hour time axis */}
              {(() => {
                const currentCycleStart = Math.floor((currentTime.getHours() * 60 + currentTime.getMinutes()) / 90) * 90;
                const startHour = Math.floor(currentCycleStart / 60);
                const startMin = currentCycleStart % 60;
                
                return Array.from({ length: 7 }, (_, i) => {
                  const minuteOffset = i * 15; // Every 15 minutes
                  const totalMinutes = currentCycleStart + minuteOffset;
                  const hour = Math.floor(totalMinutes / 60) % 24;
                  const min = totalMinutes % 60;
                  const x = (minuteOffset / 90) * 800;
                  
                  return (
                    <g key={i}>
                      <line x1={x} y1="100" x2={x} y2="105" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                      <text x={x} y="115" textAnchor="middle" className="fill-zinc-400 text-xs font-mono">
                        {String(hour).padStart(2, '0')}:{String(min).padStart(2, '0')}
                      </text>
                    </g>
                  );
                });
              })()}
              
              {/* Phase labels */}
              <text x="267" y="90" textAnchor="middle" className="fill-green-300 text-xs font-medium">High Energy</text>
              <text x="667" y="90" textAnchor="middle" className="fill-blue-300 text-xs font-medium">Low Energy</text>
            </svg>
          </div>

          {/* Recommendation */}
          <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium !text-white">Recommendation</span>
            </div>
            <p className="text-sm !text-zinc-300">{getRecommendation(cycleState.energyPhase, cycleState.energyIntensity)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to generate smooth wave path
function generateWavePath(width: number, height: number): string {
  const points: string[] = [];
  const segments = 90; // 90 minutes
  
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    let y = height / 2;
    
    // High energy phase (0-60 min)
    if (i <= 60) {
      const progress = i / 60;
      y = height / 2 - (height * 0.3) * Math.sin(progress * Math.PI);
    } 
    // Low energy phase (60-90 min)
    else {
      const progress = (i - 60) / 30;
      y = height / 2 + (height * 0.2) * Math.sin(progress * Math.PI);
    }
    
    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }
  
  return points.join(' ');
}