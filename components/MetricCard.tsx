
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value }) => {
  return (
    <div className="bg-surface p-4 rounded-lg border border-overlay">
      <h3 className="text-sm text-muted uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-primary">{value}</p>
    </div>
  );
};
