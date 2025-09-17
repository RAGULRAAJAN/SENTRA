
import React from 'react';
import type { Packet } from '../types';
import { ShieldExclamationIcon } from './Icons';

interface TrafficLogProps {
  packets: Packet[];
  selectedPacketId: string | null;
  onPacketSelect: (id: string) => void;
}

const ProtocolPill: React.FC<{ protocol: string }> = ({ protocol }) => {
  const color =
    protocol === 'TCP' ? 'bg-primary/20 text-primary' :
    protocol === 'UDP' ? 'bg-warning/20 text-warning' :
    'bg-success/20 text-success';
  return (
    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${color}`}>
      {protocol}
    </span>
  );
};

export const TrafficLog: React.FC<TrafficLogProps> = ({ packets, selectedPacketId, onPacketSelect }) => {
  return (
    <div className="flex-grow overflow-y-auto pr-2 text-xs">
      <div className="grid grid-cols-[auto,1fr,1fr,auto,auto] gap-x-4 gap-y-2 font-mono text-muted sticky top-0 bg-surface/95 backdrop-blur-sm pb-2">
        <span />
        <span>SOURCE</span>
        <span>DESTINATION</span>
        <span>PORT</span>
        <span className="text-center">PROTO</span>
      </div>
      <div className="space-y-1">
        {packets.map((p, index) => {
          const isSelected = p.id === selectedPacketId;
          
          const containerClasses = [
            'rounded',
            'transition-all',
            'duration-300',
            isSelected ? 'bg-overlay' : '',
            index === 0 && !isSelected && !p.isAttack ? 'bg-primary/10' : '',
            p.isAttack ? 'bg-danger/10 ring-1 ring-danger/50' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={p.id}
              className={containerClasses}
              style={{ animation: index === 0 && !isSelected ? 'slide-in 0.5s ease-out forwards' : 'none' }}
            >
              <div
                className="grid grid-cols-[auto,1fr,1fr,auto,auto] gap-x-4 items-center p-1 cursor-pointer hover:bg-overlay/50 rounded"
                onClick={() => onPacketSelect(p.id)}
                aria-expanded={isSelected}
                aria-controls={`packet-details-${p.id}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPacketSelect(p.id)}}
              >
                <div className="w-4 h-4 text-center">
                    {p.isAttack && <ShieldExclamationIcon className="text-danger w-4 h-4" />}
                </div>
                <span className="truncate text-subtle">{p.sourceIp}</span>
                <span className="truncate text-subtle">{p.destIp}</span>
                <span className="text-muted">{p.destPort}</span>
                <div className="text-center">
                    <ProtocolPill protocol={p.protocol} />
                </div>
              </div>
              
              <div
                id={`packet-details-${p.id}`}
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isSelected ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className="p-3 pt-2 text-subtle border-t border-overlay/50">
                  <div className="grid grid-cols-[max-content,1fr] gap-x-4 gap-y-1 text-xs">
                    <strong className="text-muted font-normal">Timestamp:</strong>
                    <span>{new Date(p.timestamp).toLocaleString()}</span>
                    
                    <strong className="text-muted font-normal">Source:</strong>
                    <span>{p.sourceIp}:{p.sourcePort}</span>
                    
                    <strong className="text-muted font-normal">Destination:</strong>
                    <span>{p.destIp}:{p.destPort}</span>
                    
                    <strong className="text-muted font-normal col-span-2 pt-2">Payload:</strong>
                    <pre className="col-span-2 whitespace-pre-wrap break-all bg-base p-2 rounded text-muted font-mono">{p.payload}</pre>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};