import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProtocolDataPoint } from '../types';
import { ChartPieIcon } from './Icons';

interface ProtocolRadarChartProps {
  data: ProtocolDataPoint[];
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-overlay p-2 border border-surface rounded-md text-xs">
        <p className="font-bold text-primary">{`${payload[0].payload.name}`}</p>
        <p className="text-subtle">{`Packets: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export const ProtocolRadarChart: React.FC<ProtocolRadarChartProps> = ({ data }) => {
  const hasData = data.some(d => d.value > 0);

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <ChartPieIcon className="w-5 h-5 text-primary" />
        <h2 className="text-lg text-primary">Protocol & Port Activity</h2>
      </div>
      {!hasData ? (
        <div className="flex-grow flex items-center justify-center h-full text-muted text-sm -mt-6">
            Awaiting traffic data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#2c2c2c" />
            <PolarAngleAxis dataKey="name" stroke="#a4a4a4" fontSize={11} tick={{ dy: 4 }} />
            <Radar name="Packets" dataKey="value" stroke="#00ddff" fill="#00ddff" fillOpacity={0.6} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 221, 255, 0.1)' }}/>
            </RadarChart>
        </ResponsiveContainer>
      )}
    </>
  );
};
