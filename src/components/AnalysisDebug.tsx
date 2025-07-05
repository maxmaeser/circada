import { useState } from "react";
import { MockDataProvider } from "@/lib/dataProvider";
import { CircadianAnalysisEngine } from "@/lib/analysisEngine";

export default function AnalysisDebug() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const engine = new CircadianAnalysisEngine(new MockDataProvider());
      const res = await engine.run();
      setResult(res);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border rounded-md text-sm bg-muted/20">
      <button
        className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
        onClick={runAnalysis}
        disabled={loading}
      >
        {loading ? "Running…" : "Run Mock Analysis"}
      </button>
      {result && (
        <pre className="mt-4 whitespace-pre-wrap break-all max-h-96 overflow-auto text-left">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
} 