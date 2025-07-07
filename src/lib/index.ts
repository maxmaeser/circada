/**
 * Circadian Rhythm App - Core Library Index
 * 
 * This is the main entry point for the core library modules that power
 * the circadian rhythm tracking and analysis functionality.
 * 
 * Architecture:
 * - Data Layer: Types, constants, and data structures
 * - Analysis Layer: Circadian phase detection, ultradian cycles, HRV analysis
 * - UI Layer: Theme management, Tauri bridge, utility functions
 * - State Layer: Zustand store for global state management
 * 
 * @module lib
 */

// ============================================================================
// CORE DATA TYPES & CONSTANTS
// ============================================================================

export type {
  EpochMs,
  TimeSeries,
  CircadianInputData,
  DerivedMetric,
  CircadianAnalysis,
  UltradianCycle,
  UltradianAnalysis,
} from './types';

export type {
  ADHDThresholds,
} from './constants';

export {
  ADHD_THRESHOLDS,
} from './constants';

export type {
  CircadianPhase,
} from './circadian';

export {
  phases,
  getCircadianInfo,
  getTimeUntilNextPhase,
} from './circadian';

// ============================================================================
// ANALYSIS ENGINE
// ============================================================================

/**
 * Core analysis engine that processes circadian input data and generates
 * comprehensive analysis results including phase detection, ultradian cycles,
 * and ADHD-specific pattern analysis.
 */
export {
  analyzeCircadianData,
  type AnalysisResult,
} from './analysisEngine';

/**
 * Ultradian rhythm detection and analysis (90-120 minute cycles)
 * that helps identify basic rest-activity patterns throughout the day.
 */
export {
  detectUltradianCycles,
  type UltradianDetectionOptions,
} from './ultradian';

/**
 * Heart Rate Variability (HRV) analysis for stress and autonomic
 * nervous system assessment in relation to circadian rhythms.
 */
export {
  calculateHRV,
  type HRVMetrics,
} from './hrv';

/**
 * Advanced phase detection algorithms that identify circadian rhythm
 * patterns and potential disruptions or phase shifts.
 */
export {
  detectPhaseShifts,
  calculateIntradailyVariability,
} from './phaseDetection';

/**
 * Mathematical utilities for signal processing, statistical analysis,
 * and time-series operations used throughout the analysis pipeline.
 */
export {
  movingAverage,
  findPeaks,
  normalizeTimeSeries,
  calculateCosinorAnalysis,
} from './math';

// ============================================================================
// DATA PROVIDERS
// ============================================================================

/**
 * Data provider interface and mock implementation for testing and development.
 * Provides realistic circadian rhythm data for UI development and testing.
 */
export {
  MockDataProvider,
  type DataProvider,
} from './dataProvider';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Zustand-based global state store for managing application state,
 * analysis results, and user preferences across the entire app.
 */
export {
  useAppStore,
  type AppState,
} from './store';

/**
 * Theme management system with support for light, dark, and terminal themes.
 * Handles theme persistence and runtime switching.
 */
export {
  useThemeStore,
  type ThemeState,
} from './themeStore';

// ============================================================================
// PLATFORM INTEGRATION
// ============================================================================

/**
 * Tauri bridge for native desktop app integration including window management,
 * system tray operations, and native API access.
 */
export {
  tauriInvoke,
  isDesktop,
  showMainWindow,
  hideMainWindow,
  toggleMenubarMode,
} from './tauriBridge';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * General utility functions for common operations like class name merging,
 * value formatting, and type guards used throughout the application.
 */
export {
  cn,
  formatTime,
  formatDuration,
  formatPercentage,
  type ClassValue,
} from './utils';

// ============================================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================================

/**
 * Re-export commonly used external utilities to provide a consistent
 * import experience and reduce import verbosity in components.
 */
export { clsx } from 'clsx';
export { type ClassValue as ClsxClassValue } from 'clsx';