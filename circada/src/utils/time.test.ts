import {
  getPhaseProgress,
  getTimeUntilHour,
  formatTimeRemaining,
  formatTime
} from './time';

describe('getPhaseProgress', () => {
  it('calculates progress for normal phases', () => {
    // 8am in a 6-10am phase
    jest.spyOn(global, 'Date').mockImplementation(() => new Date(2023, 0, 1, 8, 0, 0, 0) as any);
    expect(Math.round(getPhaseProgress(6, 10))).toBe(50);
    jest.spyOn(global, 'Date').mockRestore();
  });

  it('calculates progress for overnight phases', () => {
    // 2am in a 22-4 phase
    jest.spyOn(global, 'Date').mockImplementation(() => new Date(2023, 0, 1, 2, 0, 0, 0) as any);
    expect(Math.round(getPhaseProgress(22, 4))).toBe(67); // 4 hours in, 6 total
    jest.spyOn(global, 'Date').mockRestore();
  });
});

describe('getTimeUntilHour', () => {
  it('returns hours until a later hour today', () => {
    jest.spyOn(global, 'Date').mockImplementation(() => new Date(2023, 0, 1, 8, 0, 0, 0) as any);
    expect(getTimeUntilHour(10)).toBeCloseTo(2);
    jest.spyOn(global, 'Date').mockRestore();
  });
  it('returns hours until a target hour tomorrow', () => {
    jest.spyOn(global, 'Date').mockImplementation(() => new Date(2023, 0, 1, 23, 0, 0, 0) as any);
    expect(getTimeUntilHour(2)).toBeCloseTo(3);
    jest.spyOn(global, 'Date').mockRestore();
  });
});

describe('formatTimeRemaining', () => {
  it('formats hours and minutes', () => {
    expect(formatTimeRemaining(2.5)).toBe('2h 30m');
    expect(formatTimeRemaining(0.75)).toBe('45m');
    expect(formatTimeRemaining(1)).toBe('1h 0m');
  });
});

describe('formatTime', () => {
  it('formats hour as 12-hour time', () => {
    // 8.5 -> 8:30 AM
    expect(formatTime(8.5)).toMatch(/8:30 AM/);
    // 15 -> 3:00 PM
    expect(formatTime(15)).toMatch(/3:00 PM/);
  });
}); 