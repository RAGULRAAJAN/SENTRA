
import React from 'react';
import type { SystemStatus } from '../types';
import { ShieldCheckIcon, ShieldExclamationIcon, CogIcon, GlobeAltIcon } from './Icons';

interface HeaderProps {
  status: SystemStatus;
}

const statusConfig = {
  ACTIVE: { text: 'System Active', color: 'text-success', Icon: ShieldCheckIcon },
  ANALYZING: { text: 'Analyzing Traffic...', color: 'text-primary', Icon: CogIcon },
  INITIALIZING: { text: 'Initializing...', color: 'text-muted', Icon: GlobeAltIcon },
  ERROR: { text: 'System Error', color: 'text-danger', Icon: ShieldExclamationIcon },
};

export const Header: React.FC<HeaderProps> = ({ status }) => {
  const { text, color, Icon } = statusConfig[status];
  
  return (
    <header className="flex justify-between items-center bg-surface p-4 rounded-lg border border-overlay">
      <div className="flex items-center gap-3">
        <div className="text-primary h-8 w-8">
            <ShieldCheckIcon />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-subtle">
          Autonomous & Adaptive Firewall
        </h1>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${status === 'ANALYZING' ? 'animate-pulse-fast' : ''}`}>
        <Icon className={`h-5 w-5 ${color}`} />
        <span className={color}>{text}</span>
      </div>
    </header>
  );
};
