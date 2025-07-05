import { useState } from "react";
import { Copy } from "lucide-react";
import { MockDataProvider } from "@/lib/dataProvider";
import { CircadianAnalysisEngine } from "@/lib/analysisEngine";
import UltradianSparkline from "./UltradianSparkline";
import type { UltradianCycle } from "@/lib/types";

export default function AnalysisDebug() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    setCopied(false);
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

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 p-4 border rounded-md text-sm bg-muted/20">
      <div className="flex items-center gap-2">
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
          onClick={runAnalysis}
          disabled={loading}
        >
          {loading ? "Running…" : "Run Mock Analysis"}
        </button>
        {result && (
          <button
            className="p-2 border rounded hover:bg-muted"
            onClick={handleCopy}
            title="Copy JSON"
          >
            <Copy className="h-4 w-4" />
          </button>
        )}
      </div>
      {copied && <p className="text-xs text-muted-foreground mt-2">Copied to clipboard!</p>}
      {result && (
        <>
          <pre className="mt-4 whitespace-pre-wrap break-all max-h-96 overflow-auto text-left">
            {JSON.stringify(result, (key, value) => key.startsWith('_') ? undefined : value, 2)}
          </pre>
          {result.ultradian?.value && <UltradianSparkline analysis={result.ultradian.value} />}
          {result.ultradian?.value?.cycles?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">Ultradian Cycles</h4>
              <table className="w-full text-left text-xs mt-2">
                <thead>
                  <tr>
                    <th className="p-2 border-b">Start</th>
                    <th className="p-2 border-b">End</th>
                    <th className="p-2 border-b">Peak Time</th>
                    <th className="p-2 border-b">Duration (min)</th>
                    <th className="p-2 border-b">Amplitude</th>
                  </tr>
                </thead>
                <tbody>
                  {result.ultradian.value.cycles.map((cycle: UltradianCycle, i: number) => (
                    <tr key={i}>
                      <td className="p-2 border-b">{new Date(cycle.start).toLocaleTimeString()}</td>
                      <td className="p-2 border-b">{new Date(cycle.end).toLocaleTimeString()}</td>
                      <td className="p-2 border-b">{new Date(cycle.peakTime).toLocaleTimeString()}</td>
                      <td className="p-2 border-b">{((cycle.end - cycle.start) / 60000).toFixed(1)}</td>
                      <td className="p-2 border-b">{cycle.amplitude.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
} 