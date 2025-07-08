export interface HealthRecord {
  type: string;
  value: number;
  unit: string;
  sourceName: string;
  startDate: Date;
  endDate: Date;
  creationDate: Date;
}

export interface SleepRecord {
  type: string;
  value: string;
  sourceName: string;
  startDate: Date;
  endDate: Date;
  sleepState: 'asleep' | 'inBed' | 'awake';
}

export interface ActivitySummary {
  dateComponents: string;
  activeEnergyBurned: number;
  activeEnergyBurnedGoal: number;
  exerciseTime: number;
  exerciseTimeGoal: number;
  standHours: number;
  standHoursGoal: number;
}

export interface ParsedHealthData {
  heartRate: HealthRecord[];
  sleep: SleepRecord[];
  steps: HealthRecord[];
  activitySummaries: ActivitySummary[];
  activeEnergyBurned: HealthRecord[];
  basalEnergyBurned: HealthRecord[];
  walkingSpeed: HealthRecord[];
  workouts: any[];
  dataRange: {
    start: Date;
    end: Date;
  };
}

export class HealthDataParser {
  static parseHealthKitXML(xmlContent: string): ParsedHealthData {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');
    
    const heartRate: HealthRecord[] = [];
    const sleep: SleepRecord[] = [];
    const steps: HealthRecord[] = [];
    const activitySummaries: ActivitySummary[] = [];
    const activeEnergyBurned: HealthRecord[] = [];
    const basalEnergyBurned: HealthRecord[] = [];
    const walkingSpeed: HealthRecord[] = [];
    const workouts: any[] = [];

    let minDate = new Date();
    let maxDate = new Date(0);

    // Parse Records
    const records = doc.querySelectorAll('Record');
    records.forEach((record) => {
      const type = record.getAttribute('type');
      const value = record.getAttribute('value');
      const unit = record.getAttribute('unit');
      const sourceName = record.getAttribute('sourceName');
      const startDate = new Date(record.getAttribute('startDate') || '');
      const endDate = new Date(record.getAttribute('endDate') || '');
      const creationDate = new Date(record.getAttribute('creationDate') || '');

      // Update date range
      if (startDate < minDate) minDate = startDate;
      if (endDate > maxDate) maxDate = endDate;

      const healthRecord: HealthRecord = {
        type: type || '',
        value: parseFloat(value || '0'),
        unit: unit || '',
        sourceName: sourceName || '',
        startDate,
        endDate,
        creationDate
      };

      switch (type) {
        case 'HKQuantityTypeIdentifierHeartRate':
          heartRate.push(healthRecord);
          break;
        case 'HKQuantityTypeIdentifierStepCount':
          steps.push(healthRecord);
          break;
        case 'HKQuantityTypeIdentifierActiveEnergyBurned':
          activeEnergyBurned.push(healthRecord);
          break;
        case 'HKQuantityTypeIdentifierBasalEnergyBurned':
          basalEnergyBurned.push(healthRecord);
          break;
        case 'HKQuantityTypeIdentifierWalkingSpeed':
          walkingSpeed.push(healthRecord);
          break;
        case 'HKCategoryTypeIdentifierSleepAnalysis':
          const sleepState = this.parseSleepState(value || '');
          sleep.push({
            type: type || '',
            value: value || '',
            sourceName: sourceName || '',
            startDate,
            endDate,
            sleepState
          });
          break;
      }
    });

    // Parse Activity Summaries
    const summaries = doc.querySelectorAll('ActivitySummary');
    summaries.forEach((summary) => {
      const dateComponents = summary.getAttribute('dateComponents') || '';
      const activeEnergyBurned = parseFloat(summary.getAttribute('activeEnergyBurned') || '0');
      const activeEnergyBurnedGoal = parseFloat(summary.getAttribute('activeEnergyBurnedGoal') || '0');
      const exerciseTime = parseFloat(summary.getAttribute('exerciseTime') || '0');
      const exerciseTimeGoal = parseFloat(summary.getAttribute('exerciseTimeGoal') || '0');
      const standHours = parseFloat(summary.getAttribute('standHours') || '0');
      const standHoursGoal = parseFloat(summary.getAttribute('standHoursGoal') || '0');

      activitySummaries.push({
        dateComponents,
        activeEnergyBurned,
        activeEnergyBurnedGoal,
        exerciseTime,
        exerciseTimeGoal,
        standHours,
        standHoursGoal
      });
    });

    // Parse Workouts
    const workoutElements = doc.querySelectorAll('Workout');
    workoutElements.forEach((workout) => {
      const workoutData = {
        activityType: workout.getAttribute('workoutActivityType'),
        duration: parseFloat(workout.getAttribute('duration') || '0'),
        totalEnergyBurned: parseFloat(workout.getAttribute('totalEnergyBurned') || '0'),
        startDate: new Date(workout.getAttribute('startDate') || ''),
        endDate: new Date(workout.getAttribute('endDate') || ''),
        sourceName: workout.getAttribute('sourceName')
      };
      workouts.push(workoutData);
    });

    // Sort all arrays by date
    heartRate.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    sleep.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    steps.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    activeEnergyBurned.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return {
      heartRate,
      sleep,
      steps,
      activitySummaries,
      activeEnergyBurned,
      basalEnergyBurned,
      walkingSpeed,
      workouts,
      dataRange: {
        start: minDate,
        end: maxDate
      }
    };
  }

  private static parseSleepState(value: string): 'asleep' | 'inBed' | 'awake' {
    if (value.includes('Asleep')) return 'asleep';
    if (value.includes('InBed')) return 'inBed';
    if (value.includes('Awake')) return 'awake';
    return 'asleep';
  }

  static async loadHealthData(filePath: string): Promise<ParsedHealthData> {
    try {
      const response = await fetch(filePath);
      const xmlContent = await response.text();
      return this.parseHealthKitXML(xmlContent);
    } catch (error) {
      console.error('Error loading health data:', error);
      throw error;
    }
  }

  // Helper methods for analysis
  static getHeartRateForPeriod(data: ParsedHealthData, startDate: Date, endDate: Date): HealthRecord[] {
    return data.heartRate.filter(record => 
      record.startDate >= startDate && record.endDate <= endDate
    );
  }

  static getSleepForDate(data: ParsedHealthData, date: Date): SleepRecord[] {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return data.sleep.filter(record => 
      record.startDate >= dayStart && record.endDate <= dayEnd
    );
  }

  static getActivitySummaryForDate(data: ParsedHealthData, date: Date): ActivitySummary | null {
    const dateString = date.toISOString().split('T')[0];
    return data.activitySummaries.find(summary => 
      summary.dateComponents.includes(dateString)
    ) || null;
  }

  static calculateDailyHeartRatePattern(data: ParsedHealthData, date: Date): { hour: number; avgHeartRate: number }[] {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayData = data.heartRate.filter(record => 
      record.startDate >= dayStart && record.endDate <= dayEnd
    );

    const hourlyData: { [hour: number]: number[] } = {};
    
    dayData.forEach(record => {
      const hour = record.startDate.getHours();
      if (!hourlyData[hour]) hourlyData[hour] = [];
      hourlyData[hour].push(record.value);
    });

    return Object.entries(hourlyData).map(([hour, values]) => ({
      hour: parseInt(hour),
      avgHeartRate: values.reduce((sum, val) => sum + val, 0) / values.length
    })).sort((a, b) => a.hour - b.hour);
  }
}