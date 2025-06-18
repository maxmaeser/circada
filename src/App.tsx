import { useCircadianPhase } from './hooks/useCircadianPhase';
import { PhaseWidget } from './components/PhaseWidget';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
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
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Circadian Rhythm Tracker</h1>
          <p className="text-muted-foreground">
            Stay in sync with your natural energy cycles
          </p>
        </div>
        
        <Card className="p-6">
          <PhaseWidget currentPhase={currentPhase} nextPhase={nextPhase} />
          <div className="mt-4 flex gap-2 justify-center">
            <Badge>Current Phase</Badge>
            <Badge variant="secondary">Next Phase</Badge>
          </div>
        </Card>

        <div className="bg-red-500 text-white p-4 rounded-xl shadow-lg">
          Tailwind test – should be red, rounded, and shadowed
        </div>
      </div>
    </div>
  );
}

export default App;