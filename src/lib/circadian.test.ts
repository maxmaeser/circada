import { getCircadianInfo, phases } from './circadian';

describe('getCircadianInfo', () => {
  it('should return "Morning Alert" phase for 10:00 AM', () => {
    const date = new Date('2023-01-01T10:00:00');
    const { currentPhase } = getCircadianInfo(date);
    expect(currentPhase.name).toBe('Morning Alert');
  });

  it('should return "Wake Up" phase at the beginning of the phase (6:00 AM)', () => {
    const date = new Date('2023-01-01T06:00:00');
    const { currentPhase } = getCircadianInfo(date);
    expect(currentPhase.name).toBe('Wake Up');
  });

  it('should return "Deep Sleep" phase at the end of the Deep Sleep phase (4:59:59 AM)', () => {
    const date = new Date('2023-01-01T04:59:59');
    const { currentPhase } = getCircadianInfo(date);
    expect(currentPhase.name).toBe('Deep Sleep');
  });
  
  it('should return "Light Sleep" at the beginning of the Light Sleep phase (5:00:00 AM)', () => {
    const date = new Date('2023-01-01T05:00:00');
    const { currentPhase } = getCircadianInfo(date);
    expect(currentPhase.name).toBe('Light Sleep');
  });

  it('should return "Sleep Onset" for a time in the evening (23:00)', () => {
    const date = new Date('2023-01-01T23:00:00');
    const { currentPhase } = getCircadianInfo(date);
    expect(currentPhase.name).toBe('Sleep Onset');
  });

  it('should calculate timePosition correctly for 12:00 PM (noon)', () => {
    const date = new Date('2023-01-01T12:00:00');
    const { timePosition } = getCircadianInfo(date);
    // 12 hours is 50% of the day
    expect(timePosition).toBe('calc(50% - 12px)');
  });
  
  it('should calculate timePosition correctly for 6:00 AM', () => {
    const date = new Date('2023-01-01T06:00:00');
    const { timePosition } = getCircadianInfo(date);
    // 6 hours is 25% of the day
    expect(timePosition).toBe('calc(25% - 12px)');
  });
}); 