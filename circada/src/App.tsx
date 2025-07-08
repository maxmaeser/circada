import { useCircadianPhase } from './hooks/useCircadianPhase';
import UltradianDashboard from './components/UltradianDashboard';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import HealthDataImporter from './components/HealthDataImporter';
import './App.css';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Database, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CircadianAnalysis } from './services/realDataCircadian';

function App() {
  const { currentPhase } = useCircadianPhase();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realDataAnalysis, setRealDataAnalysis] = useState<CircadianAnalysis | null>(null);
  const [showRealData, setShowRealData] = useState(false);
  const [simulatedHeartRate, setSimulatedHeartRate] = useState<number>(75);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate heart rate variations for demo (remove when real data is available)
      if (!realDataAnalysis) {
        const baseHR = 70;
        const cyclePosition = (currentTime.getHours() * 60 + currentTime.getMinutes()) % 90;
        const cycleIntensity = cyclePosition <= 60 ? 
          Math.sin((cyclePosition / 60) * Math.PI) : 
          0.3 + 0.2 * Math.sin(((cyclePosition - 60) / 30) * Math.PI);
        
        const variation = (Math.random() - 0.5) * 10;
        setSimulatedHeartRate(Math.round(baseHR + cycleIntensity * 20 + variation));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentTime, realDataAnalysis]);

  const handleHealthDataLoaded = (analysis: CircadianAnalysis) => {
    setRealDataAnalysis(analysis);
    setShowRealData(true);
  };

  if (!currentPhase) {
    return (
      <div className="min-h-screen !bg-zinc-900 flex items-center justify-center">
        <div className="!text-zinc-400">Loading phase...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen !bg-zinc-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Minimal Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter !text-white">Circada</h1>
          <p className="text-sm md:text-lg !text-zinc-400">
            Your ultradian rhythm at a glance
          </p>
        </header>

        {/* Health Data Import Section */}
        {!showRealData && (
          <HealthDataImporter onDataLoaded={handleHealthDataLoaded} />
        )}

        {/* Main Ultradian Dashboard - Clean & Minimal */}
        <UltradianDashboard 
          currentTime={currentTime} 
          heartRate={realDataAnalysis ? undefined : simulatedHeartRate}
          realDataAnalysis={realDataAnalysis}
        />

        {/* Real Data Summary (when loaded) */}
        {showRealData && realDataAnalysis && (
          <Card className="!bg-gradient-to-r from-blue-900/30 to-purple-900/30 !border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold !text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Personal Data Active
                </div>
                <Badge className="!bg-green-500/20 !text-green-300 !border-green-500/30">
                  Live Analysis
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold !text-blue-300">
                    {Math.floor(realDataAnalysis.personalizedWakeTime)}:{String(Math.round((realDataAnalysis.personalizedWakeTime % 1) * 60)).padStart(2, '0')}
                  </div>
                  <div className="text-xs !text-zinc-400">Your Wake Time</div>
                </div>
                <div>
                  <div className="text-lg font-bold !text-purple-300">
                    {Math.floor(realDataAnalysis.personalizedSleepTime)}:{String(Math.round((realDataAnalysis.personalizedSleepTime % 1) * 60)).padStart(2, '0')}
                  </div>
                  <div className="text-xs !text-zinc-400">Your Sleep Time</div>
                </div>
                <div>
                  <div className="text-lg font-bold !text-green-300">{Math.round(realDataAnalysis.sleepEfficiency * 100)}%</div>
                  <div className="text-xs !text-zinc-400">Sleep Efficiency</div>
                </div>
                <div>
                  <div className="text-lg font-bold !text-yellow-300">{realDataAnalysis.energyPeaks?.length || 0}</div>
                  <div className="text-xs !text-zinc-400">Energy Peaks Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Predictive Analytics - Data Rich Section */}
        <PredictiveAnalytics 
          currentTime={currentTime}
          heartRate={realDataAnalysis ? undefined : simulatedHeartRate}
          realDataAnalysis={realDataAnalysis}
        />
      </div>
    </div>
  );
}

export default App;