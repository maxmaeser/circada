import { } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, Brain, Clock, Target, AlertTriangle, CheckCircle } from 'lucide-react';

interface PredictiveAnalyticsProps {
  currentTime: Date;
  heartRate?: number;
  realDataAnalysis?: any;
}

interface Prediction {
  time: string;
  type: 'peak' | 'trough' | 'optimal';
  confidence: number;
  description: string;
  recommendation: string;
}

export default function PredictiveAnalytics({ currentTime, heartRate, realDataAnalysis }: PredictiveAnalyticsProps) {
  const generatePredictions = (): Prediction[] => {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const predictions: Prediction[] = [];
    
    // Next 6 hours of predictions
    for (let i = 1; i <= 6; i++) {
      const futureHour = (currentHour + i) % 24;
      const futureTime = new Date(currentTime);
      futureTime.setHours(Math.floor(futureHour), (futureHour % 1) * 60);
      
      const cyclePosition = (futureTime.getHours() * 60 + futureTime.getMinutes()) % 90;
      
      let prediction: Prediction;
      
      if (cyclePosition >= 0 && cyclePosition <= 5) {
        prediction = {
          time: futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'peak',
          confidence: 0.85,
          description: 'Energy peak beginning',
          recommendation: 'Schedule important tasks'
        };
      } else if (cyclePosition >= 60 && cyclePosition <= 65) {
        prediction = {
          time: futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'trough',
          confidence: 0.80,
          description: 'Energy dip starting',
          recommendation: 'Take a break or do light tasks'
        };
      } else if (cyclePosition >= 20 && cyclePosition <= 40) {
        prediction = {
          time: futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'optimal',
          confidence: 0.90,
          description: 'Peak focus window',
          recommendation: 'Ideal for deep work'
        };
      } else {
        continue; // Skip non-significant times
      }
      
      // Adjust confidence based on real data
      if (realDataAnalysis && heartRate) {
        const expectedHR = getExpectedHeartRateForHour(Math.floor(futureHour), realDataAnalysis);
        if (expectedHR) {
          prediction.confidence = Math.min(0.95, prediction.confidence + 0.1);
        }
      }
      
      predictions.push(prediction);
    }
    
    return predictions.slice(0, 4); // Show next 4 significant events
  };

  const getExpectedHeartRateForHour = (hour: number, analysis: any): number | null => {
    if (!analysis?.avgHeartRateByHour) return null;
    const hrData = analysis.avgHeartRateByHour.find((d: any) => d.hour === hour);
    return hrData?.rate || null;
  };

  const calculateHeartRateVariance = (): { variance: number; trend: 'increasing' | 'decreasing' | 'stable' } => {
    if (!heartRate || !realDataAnalysis) {
      return { variance: 0, trend: 'stable' };
    }
    
    const currentHour = currentTime.getHours();
    const expectedHR = getExpectedHeartRateForHour(currentHour, realDataAnalysis);
    
    if (!expectedHR) return { variance: 0, trend: 'stable' };
    
    const variance = ((heartRate - expectedHR) / expectedHR) * 100;
    const trend = variance > 5 ? 'increasing' : variance < -5 ? 'decreasing' : 'stable';
    
    return { variance: Math.abs(variance), trend };
  };

  const getEnergyPredictionForNext2Hours = () => {
    const predictions = [];
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    for (let i = 0; i < 120; i += 15) { // Every 15 minutes for next 2 hours
      const futureMinutes = currentMinutes + i;
      const cyclePosition = futureMinutes % 90;
      
      let energy = 0.5;
      if (cyclePosition <= 60) {
        energy = 0.5 + 0.4 * Math.sin((cyclePosition / 60) * Math.PI);
      } else {
        energy = 0.3 + 0.2 * Math.sin(((cyclePosition - 60) / 30) * Math.PI);
      }
      
      predictions.push({
        time: i,
        energy: energy,
        label: i === 0 ? 'Now' : `+${Math.floor(i/60)}h${i%60 ? (i%60) + 'm' : ''}`
      });
    }
    
    return predictions;
  };

  const predictions = generatePredictions();
  const hrVariance = calculateHeartRateVariance();
  const energyPredictions = getEnergyPredictionForNext2Hours();

  return (
    <div className="space-y-6">
      {/* Live Data Analysis */}
      {heartRate && realDataAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Live Data Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{heartRate} bpm</div>
                <div className="text-sm text-muted-foreground">Current Heart Rate</div>
                <Badge className={`mt-2 ${hrVariance.trend === 'increasing' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 
                  hrVariance.trend === 'decreasing' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 
                  'bg-green-500/20 text-green-300 border-green-500/30'}`}>
                  {hrVariance.trend === 'increasing' && '↗️'} 
                  {hrVariance.trend === 'decreasing' && '↘️'} 
                  {hrVariance.trend === 'stable' && '➡️'} 
                  {Math.round(hrVariance.variance)}% vs expected
                </Badge>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {realDataAnalysis.energyPeaks?.length || 2}
                </div>
                <div className="text-sm text-muted-foreground">Predicted Peaks Today</div>
                <div className="text-xs text-muted-foreground/70 mt-1">Based on your pattern</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {Math.round((realDataAnalysis.sleepEfficiency || 0.85) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Sleep Efficiency</div>
                <div className="text-xs text-muted-foreground/70 mt-1">Last 7 days average</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Predictions */}
      <Card className="!bg-zinc-800 !border-zinc-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold !text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Next 6 Hours Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {predictions.map((prediction, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    prediction.type === 'peak' ? 'bg-green-500/20 text-green-400' :
                    prediction.type === 'trough' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {prediction.type === 'peak' && <TrendingUp className="w-4 h-4" />}
                    {prediction.type === 'trough' && <AlertTriangle className="w-4 h-4" />}
                    {prediction.type === 'optimal' && <Target className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-medium">{prediction.time} - {prediction.description}</div>
                    <div className="text-sm text-muted-foreground">{prediction.recommendation}</div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {Math.round(prediction.confidence * 100)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Energy Prediction Graph */}
      <Card className="!bg-zinc-800 !border-zinc-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold !text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            2-Hour Energy Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-32">
            <svg width="100%" height="100%" viewBox="0 0 400 120" className="overflow-visible">
              {/* Background grid */}
              <defs>
                <pattern id="forecastGrid" width="50" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#forecastGrid)" />
              
              {/* Energy prediction line */}
              <path
                d={energyPredictions.map((p, i) => 
                  `${i === 0 ? 'M' : 'L'} ${(i / (energyPredictions.length - 1)) * 400} ${120 - (p.energy * 100)}`
                ).join(' ')}
                fill="none"
                stroke="url(#energyGradient)"
                strokeWidth="3"
                className="drop-shadow-sm"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              
              {/* Current position marker */}
              <circle cx="0" cy={120 - (energyPredictions[0].energy * 100)} r="4" fill="#ffffff" className="drop-shadow-lg" />
              
              {/* Time labels */}
              {energyPredictions.filter((_, i) => i % 2 === 0).map((p, i) => (
                <text key={i} x={(i * 2) / (energyPredictions.length - 1) * 400} y="115" 
                      textAnchor="middle" className="fill-muted-foreground text-xs">
                  {p.label}
                </text>
              ))}
            </svg>
          </div>
          
          <div className="mt-4 flex justify-between text-xs text-muted-foreground">
            <span>Low Energy</span>
            <span>Moderate</span>
            <span>High Energy</span>
          </div>
        </CardContent>
      </Card>

      {/* Personal Insights */}
      {realDataAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Personal Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Your typical wake time: {Math.floor(realDataAnalysis.personalizedWakeTime)}:{String(Math.round((realDataAnalysis.personalizedWakeTime % 1) * 60)).padStart(2, '0')}</div>
                  <div className="text-muted-foreground">Based on your sleep pattern history</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Your energy peaks occur around: {realDataAnalysis.energyPeaks?.map((p: number) => `${Math.floor(p)}:${String(Math.round((p % 1) * 60)).padStart(2, '0')}`).join(', ')}</div>
                  <div className="text-muted-foreground">Schedule demanding tasks during these windows</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Your sleep efficiency is {Math.round(realDataAnalysis.sleepEfficiency * 100)}%</div>
                  <div className="text-muted-foreground">{realDataAnalysis.sleepEfficiency > 0.85 ? 'Excellent sleep quality' : 'Room for improvement in sleep optimization'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}