
import React from 'react';
import type { ThreatLevel } from '../types';

interface ThreatLevelGaugeProps {
  level: ThreatLevel;
}

const levelConfig = {
  LOW: { value: 20, color: '#28a745', shadow: 'shadow-success' },
  MEDIUM: { value: 50, color: '#ffc107', shadow: 'shadow-warning' },
  HIGH: { value: 75, color: '#ff7700', shadow: 'shadow-orange-500' },
  CRITICAL: { value: 100, color: '#ff4d4d', shadow: 'shadow-danger' },
};

export const ThreatLevelGauge: React.FC<ThreatLevelGaugeProps> = ({ level }) => {
  const { value, color, shadow } = levelConfig[level];
  const circumference = 2 * Math.PI * 52; // 2 * pi * radius
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-surface p-6 rounded-lg border border-overlay flex flex-col items-center justify-center">
      <h3 className="text-sm text-muted uppercase tracking-wider mb-4">Threat Level</h3>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            className="text-overlay"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="52"
            cx="60"
            cy="60"
          />
          <circle
            strokeWidth="8"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="52"
            cx="60"
            cy="60"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              stroke: color,
              transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: color, transition: 'color 0.5s' }}>
            {level}
          </span>
        </div>
      </div>
    </div>
  );
};
