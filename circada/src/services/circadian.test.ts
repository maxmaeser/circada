import { getCurrentPhase, defaultPhases, CircadianPhase } from './circadian';

describe('getCurrentPhase', () => {
  it('returns the correct phase for each hour of the day', () => {
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(2023, 0, 1, hour, 0, 0, 0);
      const phase = getCurrentPhase(date);
      // Find expected phase manually
      const expected = defaultPhases.find(
        p => hour >= p.start && hour < p.end
      );
      expect(phase).toEqual(expected);
    }
  });

  it('returns the correct phase at phase boundaries', () => {
    defaultPhases.forEach(phase => {
      const date = new Date(2023, 0, 1, phase.start, 0, 0, 0);
      const result = getCurrentPhase(date);
      expect(result).toEqual(phase);
    });
  });

  it('returns undefined if no phase matches (should not happen)', () => {
    // Use a phase config that leaves a gap
    const customPhases: CircadianPhase[] = [
      { name: 'Test', start: 10, end: 12, description: 'test' }
    ];
    // Patch defaultPhases for this test
    const original = [...defaultPhases];
    (defaultPhases as CircadianPhase[]).splice(0, defaultPhases.length, ...customPhases);
    const date = new Date(2023, 0, 1, 9, 0, 0, 0);
    const result = getCurrentPhase(date);
    expect(result).toBeUndefined();
    // Restore
    (defaultPhases as CircadianPhase[]).splice(0, defaultPhases.length, ...original);
  });
}); 