import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Attack, AttackType } from '../types';

interface AttackAnalyticsChartProps {
    attackHistory: Attack[];
    onIpClick: (ip: string) => void;
}

const AttackAnalyticsChart: React.FC<AttackAnalyticsChartProps> = ({ attackHistory, onIpClick }) => {
    const attackCounts = useMemo(() => {
        const counts: { [key in AttackType]: number } = {
            [AttackType.DDOS_FLOOD]: 0,
            [AttackType.PORT_SCAN]: 0,
            [AttackType.SYN_FLOOD]: 0,
        };

        attackHistory.forEach(attack => {
            if (counts[attack.type] !== undefined) {
                counts[attack.type]++;
            }
        });

        return Object.entries(counts).map(([name, count]) => ({
            name: name,
            count
        }));
    }, [attackHistory]);

    const frequentAttackers = useMemo(() => {
        const ipCounts: { [ip: string]: number } = {};
        
        attackHistory.forEach(attack => {
            if (attack.sourceIp) {
                ipCounts[attack.sourceIp] = (ipCounts[attack.sourceIp] || 0) + 1;
            }
        });

        return Object.entries(ipCounts)
            .map(([ip, count]) => ({ ip, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Display top 5
    }, [attackHistory]);

    return (
        <div className="bg-gray-850 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Attack Analytics</h2>
            
            <h3 className="text-lg font-medium text-gray-400 mb-2 text-center">Attack Type Frequency</h3>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={attackCounts}
                        margin={{
                            top: 5, right: 20, left: -10, bottom: 40,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey="name" stroke="#A0AEC0" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={50} />
                        <YAxis stroke="#A0AEC0" allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1A202C',
                            border: '1px solid #4A5568',
                            borderRadius: '0.5rem'
                          }}
                          labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                          cursor={{ fill: 'rgba(128, 90, 213, 0.1)' }}
                        />
                        <Legend wrapperStyle={{fontSize: "14px", paddingTop: "20px"}}/>
                        <Bar dataKey="count" name="Frequency" fill="#8B5CF6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {frequentAttackers.length > 0 && (
                <div className="mt-8 border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-medium text-gray-400 mb-3 text-center">Top Attacker IPs</h3>
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {frequentAttackers.map(({ ip, count }) => (
                            <li key={ip} className="flex justify-between items-center bg-gray-900/50 p-2 rounded-md">
                                <span 
                                    className="font-mono text-indigo-300 text-sm cursor-pointer hover:underline"
                                    onClick={() => onIpClick(ip)}
                                >
                                    {ip}
                                </span>
                                <span className="text-xs font-semibold text-gray-300 bg-gray-700 px-2 py-1 rounded-full">{count} {count > 1 ? 'hits' : 'hit'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AttackAnalyticsChart;