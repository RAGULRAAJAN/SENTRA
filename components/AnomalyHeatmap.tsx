import React from 'react';
import type { AnomalyDataPoint } from '../types';

interface AnomalyHeatmapProps {
  data: AnomalyDataPoint[];
}

const GRID_SIZE = 100; // 10x10 grid

const ipToGridIndex = (ip: string): number => {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % GRID_SIZE;
};

const scoreToColor = (score: number): string => {
  if (score === 0) return 'bg-overlay/30 hover:bg-overlay/50';
  if (score <= 0.4) return 'bg-success/50 hover:bg-success/70';
  if (score <= 0.7) return 'bg-warning/60 hover:bg-warning/80';
  return 'bg-danger/70 hover:bg-danger/90';
};

export const AnomalyHeatmap: React.FC<AnomalyHeatmapProps> = ({ data }) => {
  const cells = React.useMemo(() => {
    const gridCells: { score: number; hotspots: AnomalyDataPoint[] }[] = Array.from({ length: GRID_SIZE }, () => ({
      score: 0,
      hotspots: [],
    }));

    data.forEach(hotspot => {
      const index = ipToGridIndex(hotspot.ip);
      if (hotspot.score > gridCells[index].score) {
        gridCells[index].score = hotspot.score;
      }
      gridCells[index].hotspots.push(hotspot);
    });
    return gridCells;
  }, [data]);

  return (
    <>
      <h2 className="text-lg text-primary mb-4">Anomaly Detection Heatmap</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted text-sm">
          No anomalous activity detected.
        </div>
      ) : (
        <div className="flex flex-col flex-grow">
            <div className="flex-grow grid grid-cols-10 grid-rows-10 gap-1" aria-label="Anomaly heatmap">
                {cells.map((cell, index) => (
                <div key={index} className="relative group" role="gridcell" aria-label={`Network segment ${index + 1}, anomaly score ${cell.score.toFixed(2)}`}>
                    <div
                    className={`w-full h-full rounded-sm transition-colors ${scoreToColor(cell.score)}`}
                    />
                    {cell.hotspots.length > 0 && (
                    <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 w-max max-w-xs bg-base border border-overlay rounded-lg shadow-lg z-10 text-xs pointer-events-none" role="tooltip">
                        <h4 className="font-bold text-subtle mb-1">Anomalous IPs in Segment</h4>
                        <ul className="space-y-1">
                        {cell.hotspots.slice(0, 3).map(h => (
                            <li key={h.ip}>
                            <span className="font-mono text-primary">{h.ip}</span>
                            <span className="text-muted"> (Score: {h.score.toFixed(2)})</span>
                            <p className="text-subtle italic">"{h.reason}"</p>
                            </li>
                        ))}
                        {cell.hotspots.length > 3 && (
                            <li className="text-muted italic mt-1">...and {cell.hotspots.length - 3} more</li>
                        )}
                        </ul>
                    </div>
                    )}
                </div>
                ))}
            </div>
            <div className="flex justify-end items-center gap-2 text-xs mt-2 text-muted">
                <span>Low</span>
                <div className="flex h-3 rounded-full overflow-hidden">
                    <div className="w-8 bg-success/50" />
                    <div className="w-8 bg-warning/60" />
                    <div className="w-8 bg-danger/70" />
                </div>
                <span>High</span>
            </div>
        </div>
      )}
    </>
  );
};
