import React from 'react';
import { Attack } from '../types';

interface StatusIndicatorProps {
    threatLevel: number;
    currentAttack: Attack | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ threatLevel, currentAttack }) => {
    const getThreatColor = () => {
        if (threatLevel > 75 || currentAttack) return 'bg-red-500';
        if (threatLevel > 50) return 'bg-orange-500';
        if (threatLevel > 25) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-gray-850 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Firewall Status</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="font-medium">System Status:</span>
                    <span className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-full">ACTIVE</span>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">Current Threat Level:</span>
                      <span className={`font-bold text-lg ${getThreatColor().replace('bg-','text-')}`}>{threatLevel.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${getThreatColor()}`}
                            style={{ width: `${threatLevel}%` }}
                        ></div>
                    </div>
                </div>
                {currentAttack && (
                     <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4 mt-4 animate-pulse">
                        <h3 className="text-2xl font-black text-red-400 text-center tracking-widest">ATTACK DETECTED</h3>
                        <div className="mt-3 text-center space-y-1 text-base">
                            <div>
                                <span className="font-semibold text-gray-300">Type: </span>
                                <span className="font-mono text-red-300">{currentAttack.type}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-300">Target: </span>
                                <span className="font-mono text-red-300">{currentAttack.targetIp}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusIndicator;
