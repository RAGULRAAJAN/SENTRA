import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { ThreatDataPoint, ThreatLevel } from '../types';

interface ThreatHistoryChartProps {
  data: ThreatDataPoint[];
}

const levelToColor = (level: ThreatLevel) => {
    switch (level) {
        case 'LOW': return '#28a745';
        case 'MEDIUM': return '#ffc107';
        case 'HIGH': return '#ff7700';
        case 'CRITICAL': return '#ff4d4d';
        default: return '#a4a4a4';
    }
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-overlay p-2 border border-surface rounded-md text-xs">
        <p className="text-muted">{new Date(data.timestamp).toLocaleTimeString()}</p>
        <p style={{ color: levelToColor(data.levelName) }}>Threat Level: {data.levelName}</p>
      </div>
    );
  }
  return null;
};

export const ThreatHistoryChart: React.FC<ThreatHistoryChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted text-sm">No historical data yet.</div>;
  }
  
  return (
    <>
      <h2 className="text-lg text-primary mb-4">Threat Level History</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -25, bottom: 20 }}>
          <CartesianGrid stroke="#2c2c2c" strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#a4a4a4" 
            fontSize={10}
            tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            dy={10}
          />
          <YAxis 
            stroke="#a4a4a4" 
            fontSize={10} 
            domain={[0, 5]} 
            ticks={[1, 2, 3, 4]} 
            tickFormatter={(value) => ['LOW', 'MED', 'HIGH', 'CRIT'][value-1]}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="level" 
            stroke="#00ddff" 
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              return <circle cx={cx} cy={cy} r={4} fill={levelToColor(payload.levelName)} stroke="#1a1a1a" strokeWidth={2} />
            }}
            activeDot={(props) => {
              const { cx, cy, payload } = props;
              return <circle cx={cx} cy={cy} r={6} fill={levelToColor(payload.levelName)} stroke="#fff" strokeWidth={2} />
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};
