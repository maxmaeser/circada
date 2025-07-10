"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { liveHealthKit, LiveCycleAdjustment } from "@/services/liveHealthKit"
import { trayUpdater } from "@/services/trayUpdater"
import { widgetDataProvider } from "@/services/widgetDataProvider"
import UltradianDashboard from "@/components/UltradianDashboard"
import PredictiveAnalytics from "@/components/PredictiveAnalytics"
import BurgerMenu from "@/components/BurgerMenu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database } from "lucide-react"

export default function App() {
  const setCurrentTime = useAppStore((state) => state.setCurrentTime)
  const currentTime = useAppStore((state) => state.currentTime)
  const [heartRate, setHeartRate] = useState<number>(75)
  const [realDataAnalysis] = useState<any>(null)
  const [showRealData, setShowRealData] = useState(false) // Switch to true to enable real data
  const [isLiveHealthKit, setIsLiveHealthKit] = useState(false)
  const [liveAdjustment] = useState(new LiveCycleAdjustment())

  useEffect(() => {
    // Set initial time immediately
    setCurrentTime(new Date())
    
    // Initialize live HealthKit
    const initLiveHealthKit = async () => {
      try {
        const isAvailable = await liveHealthKit.isAvailable();
        if (isAvailable) {
          const hasPermissions = await liveHealthKit.requestPermissions();
          if (hasPermissions) {
            await liveHealthKit.startMonitoring();
            setIsLiveHealthKit(true);
            
            // Set up live heart rate listener
            const unlistenHeartRate = await liveHealthKit.onHeartRateUpdate((data) => {
              setHeartRate(Math.round(data.rate));
              liveAdjustment.updateBaseline(data.rate);
            });
            
            return () => {
              unlistenHeartRate();
              liveHealthKit.stopMonitoring();
            };
          }
        }
      } catch (error) {
        console.error('Failed to initialize live HealthKit:', error);
      }
    };
    
    initLiveHealthKit();
    
    // Start tray updater and widget data provider
    trayUpdater.start();
    widgetDataProvider.start();
    
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      
      // Only simulate heart rate if not using live data
      if (!isLiveHealthKit) {
        const baseHR = 70;
        const cyclePosition = (now.getHours() * 60 + now.getMinutes()) % 90;
        const cycleIntensity = cyclePosition <= 60 ? 
          Math.sin((cyclePosition / 60) * Math.PI) : 
          0.3 + 0.2 * Math.sin(((cyclePosition - 60) / 30) * Math.PI);
        
        const variation = (Math.random() - 0.5) * 10;
        setHeartRate(Math.round(baseHR + cycleIntensity * 20 + variation));
      }
    }, 1000)
    return () => {
      clearInterval(timer);
      trayUpdater.stop();
      widgetDataProvider.stop();
    };
  }, [setCurrentTime, isLiveHealthKit, liveAdjustment])

  // const handleHealthDataLoaded = (analysis: any) => {
  //   setRealDataAnalysis(analysis);
  //   setShowRealData(true); // Enable real data mode when analysis is loaded
  // };

  // Don't render until we have a valid current time
  if (!currentTime) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      {/* Burger Menu */}
      <BurgerMenu 
        showTestData={showRealData}
        onTestDataToggle={() => setShowRealData(!showRealData)}
      />
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="/circada-logo.png" 
              alt="Circada Logo" 
              className="w-16 h-16 md:w-20 md:h-20 rounded-xl"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">Circada</h1>
                {isLiveHealthKit && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Live
                  </div>
                )}
              </div>
              <p className="text-sm md:text-lg text-muted-foreground">
                Your ultradian rhythm at a glance
              </p>
            </div>
          </div>
        </header>

        {/* Main Ultradian Dashboard */}
        <UltradianDashboard 
          currentTime={currentTime} 
          heartRate={heartRate}
          realDataAnalysis={realDataAnalysis}
        />

        {/* Real Data Summary (when loaded) */}
        {showRealData && realDataAnalysis && (
          <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Personal Data Active
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Live Analysis
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-300">
                    {Math.floor(realDataAnalysis.personalizedWakeTime)}:{String(Math.round((realDataAnalysis.personalizedWakeTime % 1) * 60)).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground">Your Wake Time</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-300">
                    {Math.floor(realDataAnalysis.personalizedSleepTime)}:{String(Math.round((realDataAnalysis.personalizedSleepTime % 1) * 60)).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground">Your Sleep Time</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-300">{Math.round(realDataAnalysis.sleepEfficiency * 100)}%</div>
                  <div className="text-xs text-muted-foreground">Sleep Efficiency</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-300">{realDataAnalysis.energyPeaks?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Energy Peaks Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Predictive Analytics */}
        <PredictiveAnalytics 
          currentTime={currentTime}
          heartRate={heartRate}
          realDataAnalysis={realDataAnalysis}
        />
      </div>
    </div>
  )
}