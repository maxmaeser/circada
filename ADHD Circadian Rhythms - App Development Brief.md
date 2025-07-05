---
Area: Circada
tags:
  - ai-context
  - healthkit-sync
---
# ADHD Circadian Rhythms - App Development Brief

## Executive Summary
This brief outlines the circadian rhythm patterns specific to ADHD adults to enhance your existing circadian rhythm app. The goal is to expand beyond basic phase display to provide ADHD-specific insights, interventions, and micro-rhythm tracking.

## Core Circadian Phases (24-Hour Cycle)

### Phase 1: Morning Awakening (6-10 AM)
**Normal Pattern:**
- Cortisol surge (awakening response)
- Body temperature rising from nightly low (~3-5 AM)
- Melatonin suppression via light exposure
- Peak alertness building

**ADHD Pattern:**
- **Delayed/blunted cortisol response** - lower morning cortisol
- **Extended low alertness period** - difficulty achieving morning wakefulness
- **Phase delay** - internal clock runs 1-3 hours behind
- **Reduced morning motivation** - executive function impairment

**App Integration:**
- Flag when user consistently shows delayed awakening patterns
- Suggest morning light therapy timing (10,000 lux within 1 hour of wake)
- Track cortisol proxy metrics (HRV, activity onset)

### Phase 2: Daytime Active (10 AM - 6 PM)
**Normal Pattern:**
- Sustained cortisol elevation (peak around noon)
- Stable body temperature plateau
- Consistent activity levels
- Low melatonin

**ADHD Pattern:**
- **Later cortisol peak** - often delayed 2-4 hours
- **Irregular activity patterns** - fragmented attention cycles
- **Hyperactivity episodes** - bursts of excessive movement
- **Inconsistent energy levels** - boom/bust cycles

**App Integration:**
- Track activity fragmentation (intradaily variability)
- Identify optimal focus windows (90-120 min ultradian cycles)
- Monitor for excessive daytime restlessness
- Correlate with medication timing if applicable

### Phase 3: Evening Wind-down (6-10 PM)  
**Normal Pattern:**
- Cortisol declining steadily
- Body temperature peak then gradual decline
- Dim Light Melatonin Onset (DLMO) around 8-9 PM
- Natural sleepiness building

**ADHD Pattern:**
- **Elevated evening cortisol** - stays high when should decline
- **Delayed DLMO** - average 11:43 PM (vs 8-9 PM normal)
- **Evening hyperarousal** - "second wind" phenomenon
- **Difficulty with transitions** - hyperfocus overriding sleep signals

**App Integration:**
- Critical alert if activity remains high after 9 PM
- Track DLMO proxy (temperature decline, HRV shift)
- Suggest intervention timing (blue light filtering, melatonin)
- Monitor for "time blindness" episodes

### Phase 4: Night Sleep (10 PM - 6 AM)
**Normal Pattern:**
- High melatonin levels
- Core body temperature minimum (3-5 AM)
- Parasympathetic nervous system dominance
- Consolidated sleep periods

**ADHD Pattern:**
- **Delayed sleep onset** - often 1-3 hours later than intended
- **Sleep fragmentation** - frequent awakenings, restless movements
- **Excessive nocturnal activity** - including on stimulant medications
- **Reduced sleep efficiency** - less restorative sleep per hour in bed

**App Integration:**
- Flag sleep onset delays >30 minutes consistently
- Track nocturnal movement/restlessness
- Monitor sleep efficiency trends
- Correlate with daytime symptom severity

## HealthKit Data Inventory & Permissions

| Identifier | Why we need it |
|------------|----------------|
| `sleepAnalysis` | Primary sleep timing and quality metrics for circadian phase detection |
| `stepCount` | Activity level patterns and intradaily variability calculation |
| `heartRate` | Autonomic nervous system status and circadian rhythm strength |
| `heartRateVariabilitySDNN` | Parasympathetic/sympathetic balance and sleep quality assessment |
| `appleSleepingWristTemperature` | Core body temperature rhythm for precise circadian phase estimation |
| `timeInDaylight` | Light exposure tracking for zeitgeber analysis |
| `activeEnergyBurned` | Metabolic activity patterns and energy expenditure rhythms |
| `basalEnergyBurned` | Baseline metabolic rate variations throughout circadian cycle |
| `distanceWalkingRunning` | Mobility patterns and exercise timing effects |
| `flightsClimbed` | Physical activity intensity and timing patterns |
| `environmentalAudioExposure` | Sleep environment quality and noise disruption detection |
| `headphoneAudioExposure` | Evening audio exposure affecting sleep onset |

## Key Biomarkers for App Tracking

### Primary Trackable Metrics
| Biomarker | Normal Pattern | ADHD Pattern | Tracking Method |
|-----------|----------------|--------------|-----------------|
| **Sleep-Wake Timing** | Consistent ±30 min | Highly variable, delayed | Actigraphy, user input |
| **Core Body Temperature** | 1-2°C daily oscillation | Blunted amplitude, delayed nadir | Wearable skin temperature |
| **Heart Rate Variability** | High at night, lower day | Reduced amplitude, irregular | HR monitors, smartwatch |
| **Activity Patterns** | High day, low night | Fragmented, excessive nocturnal | Accelerometer data |
| **Light Exposure** | Morning bright, evening dim | Irregular, excessive evening | Light sensors |

### ADHD-Specific Metrics
- **Intradaily Variability (IV)** - fragmentation within 24h (higher in ADHD)
- **Interdaily Stability (IS)** - day-to-day consistency (lower in ADHD)  
- **Relative Amplitude** - day/night contrast (reduced in ADHD)
- **Acrophase** - timing of peak activity (delayed in ADHD)

## Rhythm Influencing Factors

### Positive Zeitgebers (Rhythm Synchronizers)
- **Bright morning light** (10,000 lux) - advances phase by 1-2 hours
- **Consistent sleep schedule** - stabilizes all rhythms
- **Morning exercise** - reinforces daytime activation
- **Regular meal timing** - supports metabolic rhythms
- **Melatonin supplementation** (0.5-3mg, 3h before desired bedtime)

### ADHD-Specific Disruptors
- **Stimulant medications** - often delay phase, increase nocturnal activity
- **Hyperfocus episodes** - override natural rhythm cues
- **Time blindness** - poor awareness of circadian timing
- **Screen exposure** - blue light suppresses melatonin
- **Irregular schedules** - weaken rhythm amplitude

## Micro-Rhythms for Enhanced Tracking

### Ultradian Cycles (Sub-daily)
- **90-minute basic rest-activity cycle** - natural focus/break alternation
- **4-6 hour arousal cycles** - energy peaks throughout day
- **Sleep cycle tracking** - REM/NREM alternation (90-120 min)
- **Medication response curves** - stimulant effectiveness windows

### Weekly/Seasonal Patterns
- **Social jetlag** - weekday vs weekend schedule misalignment
- **Seasonal amplitude changes** - stronger delays in winter
- **Medication holidays** - rhythm changes during breaks

## Therapeutic Integration Points

### Chronotherapy Protocols
1. **Phase Advance Protocol** (for delayed rhythms):
   - Morning bright light: 10,000 lux, 30-60 min upon waking
   - Evening melatonin: 0.5-3mg, 3 hours before desired bedtime
   - Gradual bedtime shifting: 15-30 min earlier per week

2. **Rhythm Stabilization** (for fragmented patterns):
   - Consistent wake time (±30 min) including weekends
   - Light therapy at same time daily
   - Activity scheduling during optimal windows

### App Intervention Triggers
- **Phase delay >2 hours**: Suggest morning light therapy
- **Sleep efficiency <85%**: Recommend sleep hygiene protocol
- **High evening activity**: Alert for blue light filtering, wind-down routine
- **Irregular sleep timing**: Emphasize schedule consistency
- **Low daytime activity**: Suggest strategic exercise timing

## Technical Implementation Considerations

### Data Processing Pipeline
- **Consent** → Request HealthKit permissions for circadian-relevant data types
- **Ingestion** → Pull raw streams at optimal sampling rates (1-min activity, 5-min temperature)
- **Normalization** → Clean artifacts, handle missing data, standardize units
- **Feature Extraction** → Calculate IV/IS metrics, phase detection, amplitude analysis
- **Pattern Recognition** → Identify ADHD-specific circadian disruptions
- **Intervention Triggers** → Generate personalized chronotherapy recommendations

> **Minimal Viable Bundle**
> sleepAnalysis · stepCount · heartRate · heartRateVariabilitySDNN (works on any Apple Watch)

### Algorithm Development
- **Circadian phase estimation** from temperature/HRV minima
- **DLMO prediction** from evening temperature decline
- **Sleep debt calculation** incorporating ADHD-specific needs
- **Optimal timing windows** for focus, exercise, meals
- **Intervention effectiveness tracking** 

### User Experience Elements
- **Visual rhythm display** - clear phase representation with ADHD patterns
- **Personalized recommendations** - based on individual rhythm analysis
- **Progress tracking** - chronotherapy intervention outcomes
- **Educational content** - ADHD-specific circadian rhythm education
- **Healthcare integration** - shareable reports for clinicians


## Next Steps for Development
1. Implement ADHD-specific rhythm analysis algorithms
2. Add chronotherapy intervention protocols
3. Enhance visualization for delayed/fragmented patterns
4. Integrate micro-rhythm detection capabilities
5. Develop personalized recommendation engine

This brief provides the scientific foundation for creating ADHD-aware circadian rhythm tracking and intervention capabilities in your app.

**See also:**
- Brief 1: Core Circadian Phases Technical Implementation
- Brief 2: Biomarkers & Tracking Metrics Technical Implementation

## Appendix: HealthKit Type Glossary

| HealthKit Identifier | Description |
|----------------------|-------------|
| `sleepAnalysis` | Sleep periods with in-bed/asleep states |
| `stepCount` | Step count data for activity patterns |
| `heartRate` | Heart rate measurements |
| `heartRateVariabilitySDNN` | Standard deviation of NN intervals |
| `appleSleepingWristTemperature` | Wrist temperature during sleep |
| `timeInDaylight` | Light exposure duration |
| `activeEnergyBurned` | Calories burned through activity |
| `basalEnergyBurned` | Basal metabolic rate |
| `distanceWalkingRunning` | Distance traveled on foot |
| `flightsClimbed` | Flights of stairs climbed |
| `environmentalAudioExposure` | Environmental noise levels |
| `headphoneAudioExposure` | Audio exposure through headphones |