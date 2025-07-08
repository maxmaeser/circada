import { HealthDataParser, ParsedHealthData, HealthRecord, SleepRecord } from './healthDataParser';

export interface RealDataCircadianPhase {
  name: string;
  description: string;
  start: number;
  end: number;
  color: string;
  intensity: number;
  heartRateAvg?: number;
  activityLevel?: number;
  sleepQuality?: number;
}

export interface CircadianAnalysis {
  currentPhase: RealDataCircadianPhase;
  nextPhase: RealDataCircadianPhase;
  phases: RealDataCircadianPhase[];
  personalizedWakeTime: number;
  personalizedSleepTime: number;
  energyPeaks: number[];
  energyTroughs: number[];
  sleepEfficiency: number;
  avgHeartRateByHour: { hour: number; rate: number }[];
  recommendedSchedule: {
    optimalWorkHours: { start: number; end: number }[];
    exerciseWindows: { start: number; end: number }[];
    restPeriods: { start: number; end: number }[];
  };
}

export class RealDataCircadianEngine {
  private healthData: ParsedHealthData;
  private basePhases: RealDataCircadianPhase[] = [
    { name: 'Deep Rest', description: 'Deep sleep and recovery', start: 0, end: 6, color: '#1e1b4b', intensity: 0.1 },
    { name: 'Dawn Awakening', description: 'Natural wake-up period', start: 6, end: 8, color: '#3730a3', intensity: 0.3 },
    { name: 'Morning Peak', description: 'High alertness and energy', start: 8, end: 12, color: '#2563eb', intensity: 0.9 },
    { name: 'Afternoon Dip', description: 'Natural energy decline', start: 12, end: 14, color: '#1d4ed8', intensity: 0.5 },
    { name: 'Second Peak', description: 'Renewed energy and focus', start: 14, end: 18, color: '#2563eb', intensity: 0.8 },
    { name: 'Evening Wind-down', description: 'Preparing for rest', start: 18, end: 22, color: '#3730a3', intensity: 0.4 },
    { name: 'Sleep Preparation', description: 'Natural sleep onset', start: 22, end: 24, color: '#1e1b4b', intensity: 0.2 }
  ];

  constructor(healthData: ParsedHealthData) {
    this.healthData = healthData;
  }

  async analyzePersonalCircadianRhythm(): Promise<CircadianAnalysis> {
    const personalizedWakeTime = await this.calculatePersonalWakeTime();
    const personalizedSleepTime = await this.calculatePersonalSleepTime();
    const avgHeartRateByHour = await this.calculateHourlyHeartRatePattern();
    const energyPeaks = await this.identifyEnergyPeaks(avgHeartRateByHour);
    const energyTroughs = await this.identifyEnergyTroughs(avgHeartRateByHour);
    const sleepEfficiency = await this.calculateSleepEfficiency();
    
    const personalizedPhases = this.createPersonalizedPhases(
      personalizedWakeTime,
      personalizedSleepTime,
      avgHeartRateByHour,
      energyPeaks,
      energyTroughs
    );

    const currentTime = new Date();
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    
    const currentPhase = this.getCurrentPhase(personalizedPhases, currentHour);
    const nextPhase = this.getNextPhase(personalizedPhases, currentPhase);

    const recommendedSchedule = this.generateRecommendedSchedule(personalizedPhases, energyPeaks, energyTroughs);

    return {
      currentPhase,
      nextPhase,
      phases: personalizedPhases,
      personalizedWakeTime,
      personalizedSleepTime,
      energyPeaks,
      energyTroughs,
      sleepEfficiency,
      avgHeartRateByHour,
      recommendedSchedule
    };
  }

  private async calculatePersonalWakeTime(): Promise<number> {
    // Analyze last 30 days of sleep data to find average wake time
    const recentSleep = this.getRecentSleepData(30);
    const wakeTimes: number[] = [];

    recentSleep.forEach(sleepRecord => {
      if (sleepRecord.sleepState === 'asleep') {
        // End of sleep = wake time
        const wakeHour = sleepRecord.endDate.getHours() + sleepRecord.endDate.getMinutes() / 60;
        if (wakeHour >= 5 && wakeHour <= 11) { // Reasonable wake time range
          wakeTimes.push(wakeHour);
        }
      }
    });

    if (wakeTimes.length === 0) return 7; // Default wake time
    
    // Calculate median wake time for stability
    wakeTimes.sort((a, b) => a - b);
    const median = wakeTimes[Math.floor(wakeTimes.length / 2)];
    return median;
  }

  private async calculatePersonalSleepTime(): Promise<number> {
    // Analyze last 30 days of sleep data to find average sleep time
    const recentSleep = this.getRecentSleepData(30);
    const sleepTimes: number[] = [];

    recentSleep.forEach(sleepRecord => {
      if (sleepRecord.sleepState === 'asleep') {
        // Start of sleep = sleep time
        let sleepHour = sleepRecord.startDate.getHours() + sleepRecord.startDate.getMinutes() / 60;
        // Handle sleep times after midnight
        if (sleepHour < 12) sleepHour += 24;
        if (sleepHour >= 20 && sleepHour <= 28) { // Reasonable sleep time range (8 PM - 4 AM)
          sleepTimes.push(sleepHour > 24 ? sleepHour - 24 : sleepHour);
        }
      }
    });

    if (sleepTimes.length === 0) return 23; // Default sleep time
    
    sleepTimes.sort((a, b) => a - b);
    const median = sleepTimes[Math.floor(sleepTimes.length / 2)];
    return median;
  }

  private async calculateHourlyHeartRatePattern(): Promise<{ hour: number; rate: number }[]> {
    // Analyze last 7 days of heart rate data
    const recentData = this.getRecentHeartRateData(7);
    const hourlyData: { [hour: number]: number[] } = {};

    recentData.forEach(record => {
      const hour = record.startDate.getHours();
      if (!hourlyData[hour]) hourlyData[hour] = [];
      hourlyData[hour].push(record.value);
    });

    const hourlyAverages: { hour: number; rate: number }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      if (hourlyData[hour] && hourlyData[hour].length > 0) {
        const avgRate = hourlyData[hour].reduce((sum, val) => sum + val, 0) / hourlyData[hour].length;
        hourlyAverages.push({ hour, rate: avgRate });
      }
    }

    return hourlyAverages;
  }

  private async identifyEnergyPeaks(heartRateData: { hour: number; rate: number }[]): Promise<number[]> {
    if (heartRateData.length < 3) return [10, 16]; // Default peaks

    const peaks: number[] = [];
    const threshold = 0.1; // 10% above average

    const avgHeartRate = heartRateData.reduce((sum, data) => sum + data.rate, 0) / heartRateData.length;
    const peakThreshold = avgHeartRate * (1 + threshold);

    for (let i = 1; i < heartRateData.length - 1; i++) {
      const current = heartRateData[i];
      const prev = heartRateData[i - 1];
      const next = heartRateData[i + 1];

      if (current.rate > peakThreshold && 
          current.rate > prev.rate && 
          current.rate > next.rate) {
        peaks.push(current.hour);
      }
    }

    return peaks.length > 0 ? peaks : [10, 16]; // Default if no peaks found
  }

  private async identifyEnergyTroughs(heartRateData: { hour: number; rate: number }[]): Promise<number[]> {
    if (heartRateData.length < 3) return [3, 14]; // Default troughs

    const troughs: number[] = [];
    const threshold = 0.1; // 10% below average

    const avgHeartRate = heartRateData.reduce((sum, data) => sum + data.rate, 0) / heartRateData.length;
    const troughThreshold = avgHeartRate * (1 - threshold);

    for (let i = 1; i < heartRateData.length - 1; i++) {
      const current = heartRateData[i];
      const prev = heartRateData[i - 1];
      const next = heartRateData[i + 1];

      if (current.rate < troughThreshold && 
          current.rate < prev.rate && 
          current.rate < next.rate) {
        troughs.push(current.hour);
      }
    }

    return troughs.length > 0 ? troughs : [3, 14]; // Default if no troughs found
  }

  private async calculateSleepEfficiency(): Promise<number> {
    const recentSleep = this.getRecentSleepData(7);
    
    let totalSleepTime = 0;
    let totalTimeInBed = 0;

    recentSleep.forEach(record => {
      const duration = (record.endDate.getTime() - record.startDate.getTime()) / (1000 * 60 * 60); // hours
      
      if (record.sleepState === 'asleep') {
        totalSleepTime += duration;
      } else if (record.sleepState === 'inBed') {
        totalTimeInBed += duration;
      }
    });

    if (totalTimeInBed === 0) return 0.85; // Default efficiency
    
    return Math.min(totalSleepTime / totalTimeInBed, 1);
  }

  private createPersonalizedPhases(
    wakeTime: number,
    sleepTime: number,
    heartRateData: { hour: number; rate: number }[],
    energyPeaks: number[],
    energyTroughs: number[]
  ): RealDataCircadianPhase[] {
    const phases: RealDataCircadianPhase[] = [];

    // Create phases based on personal sleep/wake times and energy patterns
    const sleepDuration = sleepTime > wakeTime ? (24 - sleepTime) + wakeTime : wakeTime - sleepTime;
    
    // Sleep phase
    phases.push({
      name: 'Personal Sleep',
      description: 'Your natural sleep period',
      start: sleepTime,
      end: wakeTime,
      color: '#1e1b4b',
      intensity: 0.1,
      heartRateAvg: this.getHeartRateForHour(heartRateData, Math.floor((sleepTime + wakeTime) / 2))
    });

    // Wake-up phase
    phases.push({
      name: 'Personal Wake-up',
      description: 'Your natural wake-up period',
      start: wakeTime,
      end: wakeTime + 2,
      color: '#3730a3',
      intensity: 0.3,
      heartRateAvg: this.getHeartRateForHour(heartRateData, Math.floor(wakeTime + 1))
    });

    // Energy peaks become high-intensity phases
    energyPeaks.forEach((peak, index) => {
      phases.push({
        name: `Energy Peak ${index + 1}`,
        description: 'Your natural energy peak',
        start: peak - 1,
        end: peak + 2,
        color: '#2563eb',
        intensity: 0.9,
        heartRateAvg: this.getHeartRateForHour(heartRateData, peak)
      });
    });

    // Energy troughs become low-intensity phases
    energyTroughs.forEach((trough, index) => {
      phases.push({
        name: `Energy Dip ${index + 1}`,
        description: 'Your natural energy dip',
        start: trough - 1,
        end: trough + 1,
        color: '#1d4ed8',
        intensity: 0.4,
        heartRateAvg: this.getHeartRateForHour(heartRateData, trough)
      });
    });

    // Fill gaps with moderate phases
    const sortedPhases = phases.sort((a, b) => a.start - b.start);
    const filledPhases = this.fillPhaseGaps(sortedPhases, heartRateData);

    return filledPhases;
  }

  private fillPhaseGaps(phases: RealDataCircadianPhase[], heartRateData: { hour: number; rate: number }[]): RealDataCircadianPhase[] {
    const result: RealDataCircadianPhase[] = [];
    let currentHour = 0;

    phases.forEach(phase => {
      // Fill gap before this phase
      if (currentHour < phase.start) {
        result.push({
          name: 'Moderate Activity',
          description: 'Steady energy period',
          start: currentHour,
          end: phase.start,
          color: '#3730a3',
          intensity: 0.6,
          heartRateAvg: this.getHeartRateForHour(heartRateData, Math.floor((currentHour + phase.start) / 2))
        });
      }

      result.push(phase);
      currentHour = phase.end;
    });

    // Fill gap at end of day
    if (currentHour < 24) {
      result.push({
        name: 'Evening Activity',
        description: 'Evening wind-down',
        start: currentHour,
        end: 24,
        color: '#3730a3',
        intensity: 0.4,
        heartRateAvg: this.getHeartRateForHour(heartRateData, Math.floor((currentHour + 24) / 2))
      });
    }

    return result;
  }

  private getCurrentPhase(phases: RealDataCircadianPhase[], currentHour: number): RealDataCircadianPhase {
    const currentPhase = phases.find(phase => 
      currentHour >= phase.start && currentHour < phase.end
    );
    return currentPhase || phases[0];
  }

  private getNextPhase(phases: RealDataCircadianPhase[], currentPhase: RealDataCircadianPhase): RealDataCircadianPhase {
    const currentIndex = phases.indexOf(currentPhase);
    return phases[(currentIndex + 1) % phases.length];
  }

  private generateRecommendedSchedule(
    phases: RealDataCircadianPhase[],
    energyPeaks: number[],
    energyTroughs: number[]
  ) {
    const optimalWorkHours = energyPeaks.map(peak => ({
      start: peak - 1,
      end: peak + 2
    }));

    const exerciseWindows = energyPeaks.map(peak => ({
      start: peak - 0.5,
      end: peak + 0.5
    }));

    const restPeriods = energyTroughs.map(trough => ({
      start: trough - 0.5,
      end: trough + 0.5
    }));

    return {
      optimalWorkHours,
      exerciseWindows,
      restPeriods
    };
  }

  private getRecentSleepData(days: number): SleepRecord[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.healthData.sleep.filter(record => record.startDate >= cutoffDate);
  }

  private getRecentHeartRateData(days: number): HealthRecord[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.healthData.heartRate.filter(record => record.startDate >= cutoffDate);
  }

  private getHeartRateForHour(heartRateData: { hour: number; rate: number }[], hour: number): number {
    const data = heartRateData.find(d => d.hour === hour);
    return data ? data.rate : 70; // Default heart rate
  }
}