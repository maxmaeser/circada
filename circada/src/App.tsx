import { useCircadianPhase } from './hooks/useCircadianPhase';
import { PhaseWidget } from './components/PhaseWidget';
import './App.css';

function App() {
  const { currentPhase, nextPhase } = useCircadianPhase();

  if (!currentPhase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading phase...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter">Circadian Rhythm Tracker</h1>
          <p className="text-lg text-muted-foreground">
            Stay in sync with your natural energy cycles
          </p>
        </div>
        
        <PhaseWidget currentPhase={currentPhase} nextPhase={nextPhase} />
      </div>
    </div>
  );
}

export default App;