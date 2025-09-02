
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ThreatHistoryPoint } from '../types';

interface ThreatLevelChartProps {
    data: ThreatHistoryPoint[];
}

const ThreatLevelChart: React.FC<ThreatLevelChartProps> = ({ data }) => {
    return (
        <div className="bg-gray-850 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Threat Level Trend</h2>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <LineChart
                        data={data}
                        margin={{
                            top: 5, right: 20, left: -10, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey="time" stroke="#A0AEC0" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#A0AEC0" domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1A202C', 
                            border: '1px solid #4A5568',
                            borderRadius: '0.5rem'
                          }}
                          labelStyle={{ color: '#E2E8F0' }}
                        />
                        <Legend wrapperStyle={{fontSize: "14px"}}/>
                        <Line type="monotone" dataKey="level" name="Threat Level" stroke="#C084FC" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#C084FC', stroke: '#fff' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ThreatLevelChart;
