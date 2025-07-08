import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, FileText, Heart, Activity, Moon, AlertCircle } from 'lucide-react';
import { HealthDataParser, ParsedHealthData } from '../services/healthDataParser';
import { RealDataCircadianEngine, CircadianAnalysis } from '../services/realDataCircadian';

interface HealthDataImporterProps {
  onDataLoaded: (analysis: CircadianAnalysis) => void;
}

export default function HealthDataImporter({ onDataLoaded }: HealthDataImporterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [healthData, setHealthData] = useState<ParsedHealthData | null>(null);
  const [analysis, setAnalysis] = useState<CircadianAnalysis | null>(null);
  const [error, setError] = useState<string>('');

  const loadExistingData = useCallback(async () => {
    setIsLoading(true);
    setProgress(0);
    setError('');
    
    try {
      setStatus('Loading health data...');
      setProgress(20);
      
      // Load the XML files from the public directory
      const data = await HealthDataParser.loadHealthData('/export.xml');
      setHealthData(data);
      setProgress(50);
      
      setStatus('Analyzing circadian patterns...');
      const engine = new RealDataCircadianEngine(data);
      const circadianAnalysis = await engine.analyzePersonalCircadianRhythm();
      setAnalysis(circadianAnalysis);
      setProgress(80);
      
      setStatus('Analysis complete!');
      setProgress(100);
      
      // Pass analysis to parent component
      onDataLoaded(circadianAnalysis);
      
    } catch (err) {
      setError(`Failed to load health data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Health data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setProgress(0);
    setError('');

    try {
      setStatus('Reading file...');
      setProgress(10);

      const text = await file.text();
      setProgress(30);

      setStatus('Parsing health data...');
      const data = HealthDataParser.parseHealthKitXML(text);
      setHealthData(data);
      setProgress(60);

      setStatus('Analyzing circadian patterns...');
      const engine = new RealDataCircadianEngine(data);
      const circadianAnalysis = await engine.analyzePersonalCircadianRhythm();
      setAnalysis(circadianAnalysis);
      setProgress(90);

      setStatus('Analysis complete!');
      setProgress(100);

      onDataLoaded(circadianAnalysis);

    } catch (err) {
      setError(`Failed to process file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('File processing error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  if (healthData && analysis) {
    return (
      <Card className="!bg-zinc-800 !border-zinc-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold !text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Health Data Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold !text-white">{healthData.heartRate.length.toLocaleString()}</div>
              <div className="text-sm !text-zinc-400">Heart Rate Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold !text-white">{healthData.sleep.length.toLocaleString()}</div>
              <div className="text-sm !text-zinc-400">Sleep Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold !text-white">{healthData.steps.length.toLocaleString()}</div>
              <div className="text-sm !text-zinc-400">Step Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold !text-white">{Math.round(analysis.sleepEfficiency * 100)}%</div>
              <div className="text-sm !text-zinc-400">Sleep Efficiency</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm !text-zinc-400">Data Range</div>
            <div className="text-sm !text-white">
              {healthData.dataRange.start.toLocaleDateString()} - {healthData.dataRange.end.toLocaleDateString()}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm !text-zinc-400">Personal Schedule</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="!text-zinc-400">Wake Time: </span>
                <span className="!text-white font-mono">
                  {Math.floor(analysis.personalizedWakeTime)}:{String(Math.round((analysis.personalizedWakeTime % 1) * 60)).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="!text-zinc-400">Sleep Time: </span>
                <span className="!text-white font-mono">
                  {Math.floor(analysis.personalizedSleepTime)}:{String(Math.round((analysis.personalizedSleepTime % 1) * 60)).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm !text-zinc-400">Energy Peaks</div>
            <div className="flex gap-2 flex-wrap">
              {analysis.energyPeaks.map((peak, index) => (
                <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-mono">
                  {Math.floor(peak)}:{String(Math.round((peak % 1) * 60)).padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => window.location.reload()} 
            className="w-full bg-zinc-700 hover:bg-zinc-600 !text-white"
          >
            Load Different Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="!bg-zinc-800 !border-zinc-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold !text-white flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Your Health Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isLoading && (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <p className="!text-zinc-400">
                Load your HealthKit export to see personalized circadian rhythms based on your real data
              </p>
              
              <Button 
                onClick={loadExistingData}
                className="w-full bg-blue-600 hover:bg-blue-700 !text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Load Your Data (export.xml)
              </Button>
              
              <div className="text-sm !text-zinc-500">or</div>
              
              <div>
                <input
                  type="file"
                  accept=".xml"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="health-file-upload"
                />
                <label 
                  htmlFor="health-file-upload"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 !text-white rounded cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Different File
                </label>
              </div>
            </div>

            <div className="space-y-2 text-sm !text-zinc-400">
              <div className="font-medium !text-zinc-300">What this will analyze:</div>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center gap-2">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span>Heart rate patterns throughout the day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="w-3 h-3 text-blue-400" />
                  <span>Sleep timing and quality patterns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-green-400" />
                  <span>Activity levels and energy cycles</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-medium !text-white mb-2">{status}</div>
              <Progress value={progress} className="h-2" />
              <div className="text-sm !text-zinc-400 mt-2">{progress}% complete</div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}