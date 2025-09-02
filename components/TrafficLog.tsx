
import React, { useState } from 'react';
import { Packet, PacketAction, Attack } from '../types';
import { WarningIcon } from './icons/WarningIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';

interface TrafficLogProps {
    trafficLog: Packet[];
    currentAttack: Attack | null;
    yourSimulatedIp: string;
    onIpClick: (ip: string) => void;
}

const TrafficLogRow: React.FC<{ packet: Packet, isExpanded: boolean, onToggle: () => void, yourSimulatedIp: string, onIpClick: (ip: string) => void }> = ({ packet, isExpanded, onToggle, yourSimulatedIp, onIpClick }) => {
    const isAttack = packet.isAttackPacket;
    const isFromYou = packet.sourceIp === yourSimulatedIp;
    const rowColor = isAttack 
        ? 'bg-red-900/40 hover:bg-red-900/60' 
        : (isFromYou ? 'bg-blue-900/20 hover:bg-blue-900/40' : 'hover:bg-gray-800');
    
    const handleIpClick = (e: React.MouseEvent, ip: string) => {
        e.stopPropagation(); // Prevent row from toggling when clicking IP
        onIpClick(ip);
    };

    return (
        <>
            <tr onClick={onToggle} className={`cursor-pointer border-b border-gray-700/50 ${rowColor} transition-colors`}>
                <td className="p-3 text-xs text-gray-400 font-mono">{packet.timestamp.toLocaleTimeString()}</td>
                <td className="p-3 font-mono">
                    {isFromYou && <span className="text-blue-400 font-bold" title={`This is your simulated IP: ${yourSimulatedIp}`}>(You) </span>}
                    <span className="cursor-pointer hover:underline" onClick={(e) => handleIpClick(e, packet.sourceIp)}>{packet.sourceIp}</span>
                    :{packet.sourcePort}
                </td>
                <td className="p-3 font-mono">
                    <span className="cursor-pointer hover:underline" onClick={(e) => handleIpClick(e, packet.destIp)}>{packet.destIp}</span>
                    :{packet.destPort}
                </td>
                <td className="p-3">{packet.protocol}</td>
                <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${packet.action === PacketAction.ALLOWED ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'}`}>
                        {packet.action}
                    </span>
                </td>
                <td className="p-3 text-center">
                    {isAttack && <WarningIcon className="w-5 h-5 inline-block text-red-400" />}
                    <span className="ml-2 inline-block align-middle">
                        {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                    </span>
                </td>
            </tr>
            {isExpanded && (
                 <tr className={`${isAttack ? 'bg-red-900/20' : isFromYou ? 'bg-blue-900/10' : 'bg-gray-800/50'}`}>
                    <td colSpan={6} className="p-0">
                        <div className="p-4 bg-gray-900 m-2 rounded-md border border-gray-700">
                            <h4 className="font-bold text-md text-indigo-300 mb-2">Packet Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                <p><strong className="text-gray-400">Full Timestamp:</strong> {packet.timestamp.toISOString()}</p>
                                <p><strong className="text-gray-400">Protocol:</strong> {packet.protocol}</p>
                                <p><strong className="text-gray-400">Source:</strong> {packet.sourceIp}:{packet.sourcePort}</p>
                                <p><strong className="text-gray-400">Destination:</strong> {packet.destIp}:{packet.destPort}</p>
                            </div>
                            <div className="mt-3">
                                <p className="font-bold text-gray-400 mb-1">Payload:</p>
                                <pre className="bg-black/50 p-3 rounded-md text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                                    <code>{packet.payload}</code>
                                </pre>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};


const TrafficLog: React.FC<TrafficLogProps> = ({ trafficLog, yourSimulatedIp, onIpClick }) => {
    const [expandedPacketId, setExpandedPacketId] = useState<string | null>(null);

    const togglePacket = (id: string) => {
        setExpandedPacketId(prevId => (prevId === id ? null : id));
    };

    return (
        <div className="bg-gray-850 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Live Traffic Log</h2>
            <div className="overflow-y-auto max-h-96 pr-2 text-sm">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-gray-850">
                        <tr>
                            <th className="p-3">Time</th>
                            <th className="p-3">Source</th>
                            <th className="p-3">Destination</th>
                            <th className="p-3">Protocol</th>
                            <th className="p-3">Action</th>
                            <th className="p-3 text-center">Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trafficLog.map((packet) => (
                           <TrafficLogRow 
                                key={packet.id} 
                                packet={packet} 
                                isExpanded={expandedPacketId === packet.id}
                                onToggle={() => togglePacket(packet.id)}
                                yourSimulatedIp={yourSimulatedIp}
                                onIpClick={onIpClick}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TrafficLog;
