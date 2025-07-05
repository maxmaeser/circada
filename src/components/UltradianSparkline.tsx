import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import type { UltradianAnalysis } from '../lib/types';

interface UltradianSparklineProps {
  analysis: UltradianAnalysis;
}

const UltradianSparkline: React.FC<UltradianSparklineProps> = ({ analysis }) => {
  if (!analysis._debug?.smoothedActivity) {
    return <div>No debug data available for sparkline.</div>;
  }

  const chartData = analysis._debug.smoothedActivity.map((value, index) => ({
    index,
    value,
  }));

  return (
    <div className="w-full h-64 bg-gray-800 p-4 rounded-lg mt-4">
      <h3 className="text-lg font-semibold text-white mb-2">Ultradian Activity Cycle</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="index" stroke="#A0AEC0" />
          <YAxis stroke="#A0AEC0" />
          <Tooltip
            contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }}
            labelStyle={{ color: '#E2E8F0' }}
          />
          <Legend wrapperStyle={{ color: '#E2E8F0' }} />
          <Line type="monotone" dataKey="value" name="Smoothed Activity" stroke="#38B2AC" strokeWidth={2} dot={false} />

          {analysis._debug.reducedPeaks?.map(peakIndex => (
            <ReferenceLine key={`peak-${peakIndex}`} x={peakIndex} stroke="#F56565" strokeDasharray="3 3" />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UltradianSparkline; 