import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
// import { Badge } from './ui/badge';
// import { Activity, Zap } from 'lucide-react';

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

  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    svgX: number;
    time: string;
    circadianIntensity: number;
    ultradianIntensity: number;
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    svgX: 0,
    time: '',
    circadianIntensity: 0,
    ultradianIntensity: 0,
    visible: false
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

  const getColorLightness = (phase: string, intensity: number) => {
    // Extract lightness percentage from HSL color
    if (phase === 'high') return 50 + intensity * 20; // 50-70%
    if (phase === 'low') return 30 + intensity * 30; // 30-60%
    return 40 + intensity * 20; // 40-60%
  };

  const getPhaseIcon = (phase: string) => {
    // Get current cycle position for 6-phase icon system
    const totalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
    const cyclePosition = totalMinutes % 90;
    
    // Check if background is bright (lightness > 55%)
    const lightness = getColorLightness(cycleState.energyPhase, cycleState.energyIntensity);
    const isDarkIcon = lightness > 55;
    const iconColor = isDarkIcon ? 'text-gray-800' : 'text-white';
    
    // Return icon based on 6-phase system with adaptive coloring
    if (cyclePosition <= 15) {
      return <span className={`text-xl font-bold ${iconColor} drop-shadow-sm`}>↗</span>; // Rising (0-15 min) - Building energy
    } else if (cyclePosition <= 30) {
      return <span className={`text-xl font-bold ${iconColor} drop-shadow-sm`}>↑</span>; // Climbing (15-30 min) - Strong ascent
    } else if (cyclePosition <= 45) {
      return <span className="text-xl drop-shadow-sm">🔥</span>; // Peak (30-45 min) - Maximum energy
    } else if (cyclePosition <= 60) {
      return <span className="text-xl drop-shadow-sm">⚡</span>; // Flow (45-60 min) - Optimal performance
    } else if (cyclePosition <= 75) {
      return <span className={`text-xl font-bold ${iconColor} drop-shadow-sm`}>↘</span>; // Declining (60-75 min) - Energy decreasing
    } else {
      return <span className="text-xl drop-shadow-sm">😴</span>; // Resting (75-90 min) - Recovery phase
    }
  };

  const getRecommendation = (phase: string, intensity: number) => {
    if (phase === 'high' && intensity > 0.7) return 'Optimal for: Focus work, creative tasks';
    if (phase === 'high') return 'Good for: Problem solving, learning';
    if (phase === 'low') return 'Best for: Rest, light tasks, reflection';
    return 'Transition period: Prepare for next phase';
  };

  const get6HourPredictions = () => {
    const predictions = [];
    const now = new Date();
    
    // Generate predictions for next 6 hours
    for (let hour = 1; hour <= 6; hour++) {
      const futureTime = new Date(now.getTime() + hour * 60 * 60 * 1000);
      const totalMinutes = futureTime.getHours() * 60 + futureTime.getMinutes();
      const cyclePosition = totalMinutes % 90;
      
      let phase = 'high';
      let intensity = 0.8;
      
      if (cyclePosition <= 5) {
        phase = 'transition';
        intensity = 0.4 + (cyclePosition / 5) * 0.4;
      } else if (cyclePosition <= 60) {
        phase = 'high';
        const progress = (cyclePosition - 5) / 55;
        intensity = 0.5 + 0.4 * Math.sin(progress * Math.PI);
      } else if (cyclePosition <= 65) {
        phase = 'transition';
        intensity = 0.8 - ((cyclePosition - 60) / 5) * 0.4;
      } else {
        phase = 'low';
        intensity = 0.2 + 0.2 * Math.sin((cyclePosition - 65) / 25 * Math.PI);
      }
      
      // Get phase icon
      let icon = '↗';
      if (cyclePosition <= 15) {
        icon = '↗';
      } else if (cyclePosition <= 30) {
        icon = '↑';
      } else if (cyclePosition <= 45) {
        icon = '🔥';
      } else if (cyclePosition <= 60) {
        icon = '⚡';
      } else if (cyclePosition <= 75) {
        icon = '↘';
      } else {
        icon = '😴';
      }
      
      // Get more specific description based on icon
      let description = '';
      if (icon === '↗') description = 'Rising Energy';
      else if (icon === '↑') description = 'Building Energy';
      else if (icon === '🔥') description = 'Peak Energy';
      else if (icon === '⚡') description = 'Peak Flow';
      else if (icon === '↘') description = 'Winding Down';
      else if (icon === '😴') description = 'Rest Phase';
      
      predictions.push({
        time: futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        phase,
        intensity,
        icon,
        description
      });
    }
    
    return predictions;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Ultradian Dashboard */}
      <Card className="!bg-gradient-to-br from-zinc-800 to-zinc-900 !border-zinc-700 overflow-hidden">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold !text-white">Ultradian Cycle</h2>
              <p className="text-xs sm:text-sm !text-zinc-400">90-minute energy rhythm</p>
            </div>
            <div className="sm:text-right">
              <div className="text-base sm:text-lg font-mono !text-white">Cycle {cycleState.cycleNumber}/16</div>
              <div className="text-xs sm:text-sm !text-zinc-400">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          {/* Current State */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {/* Energy Phase */}
            <div className="text-center">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center text-white"
                style={{ backgroundColor: getEnergyColor(cycleState.energyPhase, cycleState.energyIntensity) }}
              >
                {getPhaseIcon(cycleState.energyPhase)}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <span className="text-sm sm:text-lg font-semibold !text-white capitalize">{cycleState.energyPhase}</span>
                <span className="text-xs sm:text-sm !text-zinc-400">{Math.round(cycleState.energyIntensity * 100)}%</span>
              </div>
              <div className="text-xs !text-zinc-500 hidden sm:block">
                {(() => {
                  const totalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
                  const cyclePosition = totalMinutes % 90;

                  if (cyclePosition <= 15) {
                    return 'Warm up: Light tasks, planning, prepare for focus';
                  } else if (cyclePosition <= 30) {
                    return 'Building momentum: Start challenging work';
                  } else if (cyclePosition <= 45) {
                    return 'Peak time: Complex projects, creative work';
                  } else if (cyclePosition <= 60) {
                    return 'Prime focus: Deep work, important decisions';
                  } else if (cyclePosition <= 75) {
                    return 'Wind down: Finish tasks, review, organize';
                  } else {
                    return 'Rest time: Breaks, reflection, light admin';
                  }
                })()}
              </div>
            </div>

            {/* Time Remaining */}
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold !text-white font-mono mb-1 sm:mb-2">
                {String(Math.floor(cycleState.timeRemaining)).padStart(2, '0')}:{String(Math.floor(((cycleState.timeRemaining % 1) * 60))).padStart(2, '0')}
              </div>
              <div className="text-xs sm:text-sm !text-zinc-400">next phase</div>
              <div className="text-xs sm:text-sm !text-zinc-500">{cycleState.nextPhaseTime}</div>
            </div>
          </div>

          {/* Wave Visualization */}
          <div className="relative h-20 sm:h-32 mb-4 sm:mb-6">
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

          {/* Recommendation & 6-Hour Predictions - Hidden for now */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium !text-white">Recommendation</span>
              </div>
              <p className="text-sm !text-zinc-300">{getRecommendation(cycleState.energyPhase, cycleState.energyIntensity)}</p>
            </div>

            <div className="space-y-3">
              {get6HourPredictions().slice(0, 2).map((prediction, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                  <div className="flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: getEnergyColor(prediction.phase, prediction.intensity) }}
                    >
                      {prediction.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium !text-white">{prediction.time}</span>
                      <span className="text-xs !text-zinc-400">{prediction.description}</span>
                    </div>
                    <div className="text-xs !text-zinc-500 mt-1">
                      {prediction.icon === '↗' ? 'Warm up: Light tasks, planning, prepare for focus' :
                       prediction.icon === '↑' ? 'Building momentum: Start challenging work' :
                       prediction.icon === '🔥' ? 'Peak time: Complex projects, creative work' :
                       prediction.icon === '⚡' ? 'Prime focus: Deep work, important decisions' :
                       prediction.icon === '↘' ? 'Wind down: Finish tasks, review, organize' :
                       prediction.icon === '😴' ? 'Rest time: Breaks, reflection, light admin' :
                       'Energy transition period'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Circadian Rhythm Bar */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <h3 className="text-base sm:text-lg font-semibold !text-white">Circadian Rhythm</h3>
                <p className="text-xs sm:text-sm !text-zinc-400">24-hour cycle</p>
              </div>
              <div className="sm:text-right">
                <div className="text-xs sm:text-sm font-mono !text-white">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-xs !text-zinc-400 hidden sm:block">Current time</div>
              </div>
            </div>

            <div className="relative h-24 sm:h-32 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700/50 shadow-2xl">
              {/* SVG Wave Visualization */}
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 1000 128" 
                className="absolute inset-0 cursor-crosshair"
                preserveAspectRatio="none"
                onMouseMove={(e) => {
                  const svgRect = e.currentTarget.getBoundingClientRect();
                  const mouseX = e.clientX - svgRect.left;
                  const mouseY = e.clientY - svgRect.top;
                  
                  // Convert to SVG coordinates
                  const svgX = (mouseX / svgRect.width) * 1000;
                  
                  // Calculate time from x position
                  const hourFloat = (svgX / 1000) * 24;
                  const hour = Math.floor(hourFloat);
                  const minute = Math.floor((hourFloat - hour) * 60);
                  const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                  
                  // Create a temporary date object for this time
                  const hoverTime = new Date(currentTime);
                  hoverTime.setHours(hour, minute, 0, 0);
                  
                  // Calculate energy intensities at this time using raw energy values
                  const circadianEnergy = getCircadianEnergyValue(hoverTime, realDataAnalysis);
                  const ultradianEnergy = getUltradianEnergyValue(hoverTime);
                  
                  setHoverData({
                    x: mouseX,
                    y: mouseY,
                    svgX: svgX,
                    time: timeString,
                    circadianIntensity: circadianEnergy * 100,
                    ultradianIntensity: ultradianEnergy * 100,
                    visible: true
                  });
                }}
                onMouseLeave={() => {
                  setHoverData(prev => ({ ...prev, visible: false }));
                }}
              >
                {/* Energy-based space background */}
                <defs>
                  <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    {/* Night (sleep) - higher opacity purple/indigo */}
                    <stop offset="0%" stopColor="rgba(99, 102, 241, 0.15)" />
                    <stop offset="4%" stopColor="rgba(99, 102, 241, 0.15)" />
                    
                    {/* Early morning - slight decrease */}
                    <stop offset="20%" stopColor="rgba(139, 92, 246, 0.12)" />
                    <stop offset="25%" stopColor="rgba(139, 92, 246, 0.08)" />
                    
                    {/* Morning/day - minimal opacity (high energy) */}
                    <stop offset="30%" stopColor="rgba(99, 102, 241, 0.04)" />
                    <stop offset="35%" stopColor="rgba(99, 102, 241, 0.03)" />
                    <stop offset="50%" stopColor="rgba(99, 102, 241, 0.03)" />
                    <stop offset="60%" stopColor="rgba(99, 102, 241, 0.04)" />
                    
                    {/* Evening wind down - increasing opacity */}
                    <stop offset="70%" stopColor="rgba(139, 92, 246, 0.06)" />
                    <stop offset="80%" stopColor="rgba(139, 92, 246, 0.10)" />
                    
                    {/* Night (sleep) - higher opacity */}
                    <stop offset="90%" stopColor="rgba(99, 102, 241, 0.13)" />
                    <stop offset="100%" stopColor="rgba(99, 102, 241, 0.15)" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#energyGradient)" />
                
                {/* Circadian rhythm wave (main wave) */}
                <path
                  d={generateCircadianWave(1000, 128, currentTime, realDataAnalysis)}
                  fill="none"
                  stroke="rgba(34, 197, 94, 0.9)"
                  strokeWidth="2.5"
                  className="drop-shadow-lg"
                />
                
                {/* Ultradian rhythm wave (secondary wave with reduced opacity) */}
                <path
                  d={generateUltradianWave(1000, 128, currentTime)}
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.5)"
                  strokeWidth="2"
                  className="drop-shadow-md"
                />
                
                {/* Hour markers */}
                {Array.from({ length: 24 }, (_, i) => {
                  const x = (i / 24) * 1000;
                  
                  return (
                    <line 
                      key={i}
                      x1={x} 
                      y1="0" 
                      x2={x} 
                      y2="128" 
                      stroke="rgba(255,255,255,0.08)" 
                      strokeWidth="1" 
                    />
                  );
                })}
                
                {/* Current time indicator */}
                <line
                  x1={((currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60)) * 1000}
                  y1="-2"
                  x2={((currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60)) * 1000}
                  y2="130"
                  stroke="white"
                  strokeWidth="2"
                  className="drop-shadow-lg"
                />
                <circle
                  cx={((currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60)) * 1000}
                  cy={getCircadianEnergyAtTime(currentTime, realDataAnalysis, 128)}
                  r="5"
                  fill="white"
                  stroke="rgba(34, 197, 94, 0.5)"
                  strokeWidth="2"
                  className="drop-shadow-lg animate-pulse"
                />
                
                {/* Hover vertical line */}
                {hoverData.visible && (
                  <line
                    x1={hoverData.svgX}
                    y1="-2"
                    x2={hoverData.svgX}
                    y2="130"
                    stroke="rgba(156, 163, 175, 0.7)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    className="pointer-events-none drop-shadow-sm"
                  />
                )}
              </svg>
              
              {/* Hour labels positioned outside SVG to prevent stretching */}
              <div className="absolute bottom-1 sm:bottom-2 left-0 right-0 flex justify-between px-0.5 sm:px-1">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i;
                  const isCurrentHour = hour === currentTime.getHours();

                  // Show every other hour on very small screens
                  if (typeof window !== 'undefined' && window.innerWidth < 500 && i % 2 !== 0) {
                    return <div key={i} style={{ flex: '1' }} />;
                  }

                  return (
                    <div
                      key={i}
                      className={`text-xs font-mono ${isCurrentHour ? 'text-white font-bold' : 'text-zinc-300'}`}
                      style={{
                        fontSize: window.innerWidth < 500 ? '9px' : '11px',
                        width: '100%',
                        textAlign: 'center',
                        flex: '1'
                      }}
                    >
                      {String(hour).padStart(2, '0')}
                    </div>
                  );
                })}
              </div>
              
              {/* Hover tooltip - positioned inside the container but above content */}
              {hoverData.visible && (
                <div 
                  className="absolute z-10 bg-zinc-800/90 backdrop-blur-sm border border-zinc-600/80 rounded-lg p-3 shadow-2xl pointer-events-none whitespace-nowrap"
                  style={{
                    left: hoverData.x > 300 ? hoverData.x - 140 : hoverData.x + 10,
                    top: Math.max(10, hoverData.y - 90),
                  }}
                >
                  <div className="text-white text-sm font-medium mb-2">
                    {hoverData.time}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-green-400 rounded"></div>
                      <span className="text-zinc-300">Circadian:</span>
                      <span className="text-white font-mono">{Math.round(hoverData.circadianIntensity)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-blue-400 opacity-60 rounded"></div>
                      <span className="text-zinc-300">Ultradian:</span>
                      <span className="text-white font-mono">{Math.round(hoverData.ultradianIntensity)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Legend below the bar */}
            <div className="flex justify-center gap-3 sm:gap-6 text-xs mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 sm:w-3 h-0.5 bg-green-400 rounded"></div>
                <span className="text-zinc-400 text-xs">Circadian</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 sm:w-3 h-0.5 bg-blue-400 opacity-40 rounded"></div>
                <span className="text-zinc-400 text-xs">Ultradian</span>
              </div>
            </div>
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

// Helper function to generate circadian wave based on health data and ADHD patterns
function generateCircadianWave(width: number, height: number, currentTime: Date, realDataAnalysis?: any): string {
  const points: string[] = [];
  const segments = 240; // 24 hours in 6-minute segments for smooth curve
  const energyLevels: number[] = [];
  
  // Personal wake/sleep times from health data or defaults
  const personalWakeTime = realDataAnalysis?.personalizedWakeTime || 7; // 7 AM default
  const personalSleepTime = realDataAnalysis?.personalizedSleepTime || 23; // 11 PM default
  
  // First pass: calculate raw energy levels
  for (let i = 0; i <= segments; i++) {
    const hour = (i / segments) * 24; // 0-24 hour representation
    
    // Calculate energy level based on circadian rhythm
    let energyLevel = 0.5; // baseline
    
    // Morning rise (wake time to wake+4 hours)
    if (hour >= personalWakeTime && hour <= personalWakeTime + 4) {
      const progress = (hour - personalWakeTime) / 4;
      energyLevel = 0.3 + 0.6 * Math.sin(progress * Math.PI / 2); // 0.3 to 0.9
    }
    // Day peak (wake+4 to wake+8 hours)
    else if (hour > personalWakeTime + 4 && hour <= personalWakeTime + 8) {
      energyLevel = 0.8 + 0.1 * Math.sin((hour - personalWakeTime - 4) * Math.PI / 2); // 0.8 to 0.9
    }
    // Afternoon dip (wake+8 to wake+10 hours)
    else if (hour > personalWakeTime + 8 && hour <= personalWakeTime + 10) {
      const progress = (hour - personalWakeTime - 8) / 2;
      energyLevel = 0.9 - 0.2 * Math.sin(progress * Math.PI); // 0.9 to 0.7
    }
    // Evening recovery (wake+10 to sleep-2 hours)
    else if (hour > personalWakeTime + 10 && hour <= personalSleepTime - 2) {
      energyLevel = 0.7 + 0.1 * Math.sin((hour - personalWakeTime - 10) * Math.PI / 4); // 0.7 to 0.8
    }
    // Evening decline (sleep-2 to sleep)
    else if (hour > personalSleepTime - 2 && hour <= personalSleepTime) {
      const progress = (hour - (personalSleepTime - 2)) / 2;
      energyLevel = 0.8 - 0.5 * Math.sin(progress * Math.PI / 2); // 0.8 to 0.3
    }
    // Night/sleep (sleep to wake)
    else {
      // Handle wrap-around for sleep period
      let sleepProgress = 0;
      if (hour > personalSleepTime) {
        sleepProgress = (hour - personalSleepTime) / (24 - personalSleepTime + personalWakeTime);
      } else {
        sleepProgress = (24 - personalSleepTime + hour) / (24 - personalSleepTime + personalWakeTime);
      }
      energyLevel = 0.1 + 0.2 * Math.sin(sleepProgress * Math.PI); // 0.1 to 0.3
    }
    
    // ADHD adjustments if available (reduced impact for smoother curve)
    if (realDataAnalysis?.adhdRiskScore) {
      const adhdImpact = realDataAnalysis.adhdRiskScore / 100;
      // Higher ADHD risk = more energy variability (reduced from 0.5 to 0.3)
      const variability = 0.05 + adhdImpact * 0.1;
      energyLevel *= (1 + variability * Math.sin(hour * Math.PI * 2) * 0.3);
    }
    
    energyLevels.push(energyLevel);
  }
  
  // Second pass: apply smoothing
  const smoothedLevels = smoothArray(energyLevels, 3);
  
  // Third pass: generate path
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const energyLevel = smoothedLevels[i];
    
    // Convert to y-coordinate (flip because SVG y=0 is top)
    const y = height - (energyLevel * height * 0.8) - height * 0.1;
    
    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }
  
  return points.join(' ');
}

// Helper function to generate ultradian wave pattern
function generateUltradianWave(width: number, height: number, currentTime: Date): string {
  const points: string[] = [];
  const segments = 240; // 24 hours in 6-minute segments
  const energyLevels: number[] = [];
  
  // First pass: calculate raw energy levels
  for (let i = 0; i <= segments; i++) {
    const hour = (i / segments) * 24; // 0-24 hour representation
    const totalMinutes = hour * 60;
    
    // Calculate multiple overlapping ultradian cycles
    const primaryCycle = totalMinutes % 90; // 90-minute cycles
    const secondaryCycle = totalMinutes % 120; // 120-minute cycles for variation
    
    // Primary 90-minute cycle
    let primaryEnergy = 0.5;
    if (primaryCycle <= 60) {
      const progress = primaryCycle / 60;
      primaryEnergy = 0.3 + 0.4 * Math.sin(progress * Math.PI);
    } else {
      const progress = (primaryCycle - 60) / 30;
      primaryEnergy = 0.7 - 0.2 * Math.sin(progress * Math.PI);
    }
    
    // Secondary 120-minute cycle for complexity
    const secondaryEnergy = 0.5 + 0.1 * Math.sin((secondaryCycle / 120) * Math.PI * 2);
    
    // Combine cycles
    const combinedEnergy = (primaryEnergy * 0.8 + secondaryEnergy * 0.2);
    
    energyLevels.push(combinedEnergy);
  }
  
  // Second pass: apply smoothing
  const smoothedLevels = smoothArray(energyLevels, 2);
  
  // Third pass: generate path
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const energyLevel = smoothedLevels[i];
    
    // Convert to y-coordinate with reduced amplitude for secondary wave
    const y = height/2 + (energyLevel - 0.5) * height * 0.4;
    
    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }
  
  return points.join(' ');
}

// Helper function to smooth an array of numbers
function smoothArray(data: number[], windowSize: number): number[] {
  const smoothed: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
      sum += data[j];
      count++;
    }
    
    smoothed.push(sum / count);
  }
  
  return smoothed;
}

// Helper function to get circadian energy level at specific time
function getCircadianEnergyAtTime(currentTime: Date, realDataAnalysis?: any, height: number = 128): number {
  const hour = currentTime.getHours() + currentTime.getMinutes() / 60;
  
  // Personal wake/sleep times from health data or defaults
  const personalWakeTime = realDataAnalysis?.personalizedWakeTime || 7; // 7 AM default
  const personalSleepTime = realDataAnalysis?.personalizedSleepTime || 23; // 11 PM default
  
  // Calculate energy level based on circadian rhythm
  let energyLevel = 0.5; // baseline
  
  // Morning rise (wake time to wake+4 hours)
  if (hour >= personalWakeTime && hour <= personalWakeTime + 4) {
    const progress = (hour - personalWakeTime) / 4;
    energyLevel = 0.3 + 0.6 * Math.sin(progress * Math.PI / 2); // 0.3 to 0.9
  }
  // Day peak (wake+4 to wake+8 hours)
  else if (hour > personalWakeTime + 4 && hour <= personalWakeTime + 8) {
    energyLevel = 0.8 + 0.1 * Math.sin((hour - personalWakeTime - 4) * Math.PI / 2); // 0.8 to 0.9
  }
  // Afternoon dip (wake+8 to wake+10 hours)
  else if (hour > personalWakeTime + 8 && hour <= personalWakeTime + 10) {
    const progress = (hour - personalWakeTime - 8) / 2;
    energyLevel = 0.9 - 0.2 * Math.sin(progress * Math.PI); // 0.9 to 0.7
  }
  // Evening recovery (wake+10 to sleep-2 hours)
  else if (hour > personalWakeTime + 10 && hour <= personalSleepTime - 2) {
    energyLevel = 0.7 + 0.1 * Math.sin((hour - personalWakeTime - 10) * Math.PI / 4); // 0.7 to 0.8
  }
  // Evening decline (sleep-2 to sleep)
  else if (hour > personalSleepTime - 2 && hour <= personalSleepTime) {
    const progress = (hour - (personalSleepTime - 2)) / 2;
    energyLevel = 0.8 - 0.5 * Math.sin(progress * Math.PI / 2); // 0.8 to 0.3
  }
  // Night/sleep (sleep to wake)
  else {
    // Handle wrap-around for sleep period
    let sleepProgress = 0;
    if (hour > personalSleepTime) {
      sleepProgress = (hour - personalSleepTime) / (24 - personalSleepTime + personalWakeTime);
    } else {
      sleepProgress = (24 - personalSleepTime + hour) / (24 - personalSleepTime + personalWakeTime);
    }
    energyLevel = 0.1 + 0.2 * Math.sin(sleepProgress * Math.PI); // 0.1 to 0.3
  }
  
  // ADHD adjustments if available (reduced impact for smoother curve)
  if (realDataAnalysis?.adhdRiskScore) {
    const adhdImpact = realDataAnalysis.adhdRiskScore / 100;
    // Higher ADHD risk = more energy variability (reduced from 0.5 to 0.3)
    const variability = 0.05 + adhdImpact * 0.1;
    energyLevel *= (1 + variability * Math.sin(hour * Math.PI * 2) * 0.3);
  }
  
  // Convert to y-coordinate (flip because SVG y=0 is top)
  return height - (energyLevel * height * 0.8) - height * 0.1;
}

// Helper function to get ultradian energy level at specific time
function getUltradianEnergyAtTime(currentTime: Date, height: number = 128): number {
  const hour = currentTime.getHours() + currentTime.getMinutes() / 60;
  const totalMinutes = hour * 60;
  
  // Calculate multiple overlapping ultradian cycles
  const primaryCycle = totalMinutes % 90; // 90-minute cycles
  const secondaryCycle = totalMinutes % 120; // 120-minute cycles for variation
  
  // Primary 90-minute cycle
  let primaryEnergy = 0.5;
  if (primaryCycle <= 60) {
    const progress = primaryCycle / 60;
    primaryEnergy = 0.3 + 0.4 * Math.sin(progress * Math.PI);
  } else {
    const progress = (primaryCycle - 60) / 30;
    primaryEnergy = 0.7 - 0.2 * Math.sin(progress * Math.PI);
  }
  
  // Secondary 120-minute cycle for complexity
  const secondaryEnergy = 0.5 + 0.1 * Math.sin((secondaryCycle / 120) * Math.PI * 2);
  
  // Combine cycles
  const combinedEnergy = (primaryEnergy * 0.8 + secondaryEnergy * 0.2);
  
  // Convert to y-coordinate with reduced amplitude for secondary wave
  return height/2 + (combinedEnergy - 0.5) * height * 0.4;
}

// Helper function to get circadian energy value (0-1) for percentage calculation
function getCircadianEnergyValue(currentTime: Date, realDataAnalysis?: any): number {
  const hour = currentTime.getHours() + currentTime.getMinutes() / 60;
  
  // Personal wake/sleep times from health data or defaults
  const personalWakeTime = realDataAnalysis?.personalizedWakeTime || 7; // 7 AM default
  const personalSleepTime = realDataAnalysis?.personalizedSleepTime || 23; // 11 PM default
  
  // Calculate energy level based on circadian rhythm
  let energyLevel = 0.5; // baseline
  
  // Morning rise (wake time to wake+4 hours)
  if (hour >= personalWakeTime && hour <= personalWakeTime + 4) {
    const progress = (hour - personalWakeTime) / 4;
    energyLevel = 0.3 + 0.6 * Math.sin(progress * Math.PI / 2); // 0.3 to 0.9
  }
  // Day peak (wake+4 to wake+8 hours)
  else if (hour > personalWakeTime + 4 && hour <= personalWakeTime + 8) {
    energyLevel = 0.8 + 0.1 * Math.sin((hour - personalWakeTime - 4) * Math.PI / 2); // 0.8 to 0.9
  }
  // Afternoon dip (wake+8 to wake+10 hours)
  else if (hour > personalWakeTime + 8 && hour <= personalWakeTime + 10) {
    const progress = (hour - personalWakeTime - 8) / 2;
    energyLevel = 0.9 - 0.2 * Math.sin(progress * Math.PI); // 0.9 to 0.7
  }
  // Evening recovery (wake+10 to sleep-2 hours)
  else if (hour > personalWakeTime + 10 && hour <= personalSleepTime - 2) {
    energyLevel = 0.7 + 0.1 * Math.sin((hour - personalWakeTime - 10) * Math.PI / 4); // 0.7 to 0.8
  }
  // Evening decline (sleep-2 to sleep)
  else if (hour > personalSleepTime - 2 && hour <= personalSleepTime) {
    const progress = (hour - (personalSleepTime - 2)) / 2;
    energyLevel = 0.8 - 0.5 * Math.sin(progress * Math.PI / 2); // 0.8 to 0.3
  }
  // Night/sleep (sleep to wake)
  else {
    // Handle wrap-around for sleep period
    let sleepProgress = 0;
    if (hour > personalSleepTime) {
      sleepProgress = (hour - personalSleepTime) / (24 - personalSleepTime + personalWakeTime);
    } else {
      sleepProgress = (24 - personalSleepTime + hour) / (24 - personalSleepTime + personalWakeTime);
    }
    energyLevel = 0.1 + 0.2 * Math.sin(sleepProgress * Math.PI); // 0.1 to 0.3
  }
  
  // ADHD adjustments if available (reduced impact for smoother curve)
  if (realDataAnalysis?.adhdRiskScore) {
    const adhdImpact = realDataAnalysis.adhdRiskScore / 100;
    // Higher ADHD risk = more energy variability (reduced from 0.5 to 0.3)
    const variability = 0.05 + adhdImpact * 0.1;
    energyLevel *= (1 + variability * Math.sin(hour * Math.PI * 2) * 0.3);
  }
  
  return Math.max(0, Math.min(1, energyLevel));
}

// Helper function to get ultradian energy value (0-1) for percentage calculation
function getUltradianEnergyValue(currentTime: Date): number {
  const hour = currentTime.getHours() + currentTime.getMinutes() / 60;
  const totalMinutes = hour * 60;
  
  // Calculate multiple overlapping ultradian cycles
  const primaryCycle = totalMinutes % 90; // 90-minute cycles
  const secondaryCycle = totalMinutes % 120; // 120-minute cycles for variation
  
  // Primary 90-minute cycle
  let primaryEnergy = 0.5;
  if (primaryCycle <= 60) {
    const progress = primaryCycle / 60;
    primaryEnergy = 0.3 + 0.4 * Math.sin(progress * Math.PI);
  } else {
    const progress = (primaryCycle - 60) / 30;
    primaryEnergy = 0.7 - 0.2 * Math.sin(progress * Math.PI);
  }
  
  // Secondary 120-minute cycle for complexity
  const secondaryEnergy = 0.5 + 0.1 * Math.sin((secondaryCycle / 120) * Math.PI * 2);
  
  // Combine cycles
  const combinedEnergy = (primaryEnergy * 0.8 + secondaryEnergy * 0.2);
  
  return Math.max(0, Math.min(1, combinedEnergy));
}