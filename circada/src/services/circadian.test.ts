import { describe, it, expect } from 'vitest';
import { getCurrentPhase, defaultPhases, CircadianPhase } from './circadian';

describe('getCurrentPhase', () => {
  it('should return the correct phase for a specific hour', () => {
    const date = new Date();
    date.setHours(7);
    expect(getCurrentPhase(date)).toEqual(defaultPhases[0]); // Morning Peak
  });

  it('should return the correct phase at the start of a phase', () => {
    const date = new Date();
    date.setHours(12);
    expect(getCurrentPhase(date)).toEqual(defaultPhases[2]); // Afternoon Peak
  });

  it('should return undefined for an hour not in any phase', () => {
    const customPhases: CircadianPhase[] = [
      { name: 'Test', start: 10, end: 12, description: 'test' },
    ];
    const date = new Date();
    date.setHours(9);
    expect(getCurrentPhase(date, customPhases)).toBeUndefined();
  });

  it('should return the correct phase when using custom phases', () => {
    const customPhases: CircadianPhase[] = [
      { name: 'Custom Phase', start: 8, end: 10, description: 'custom' },
    ];
    const date = new Date();
    date.setHours(9);
    expect(getCurrentPhase(date, customPhases)).toEqual(customPhases[0]);
  });

  it('should handle midnight correctly', () => {
    const date = new Date();
    date.setHours(0);
    expect(getCurrentPhase(date)).toEqual(defaultPhases[5]); // Night
  });

  it('should handle the last hour of the day correctly', () => {
    const date = new Date();
    date.setHours(23);
    expect(getCurrentPhase(date)).toEqual(defaultPhases[4]); // Sleep Zone
  });
}); 