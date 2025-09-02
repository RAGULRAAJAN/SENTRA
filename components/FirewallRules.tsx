
import React from 'react';
import { FirewallRule, RuleAction } from '../types';

interface FirewallRulesProps {
    rules: FirewallRule[];
    onSelectRule: (rule: FirewallRule) => void;
    selectedRuleId?: string;
}

const FirewallRules: React.FC<FirewallRulesProps> = ({ rules, onSelectRule, selectedRuleId }) => {
    return (
        <div className="bg-gray-850 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Current Firewall Rules</h2>
            <div className="overflow-y-auto max-h-72 pr-2">
                <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-gray-850">
                        <tr>
                            <th className="p-2">Action</th>
                            <th className="p-2">Target</th>
                            <th className="p-2">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.map((rule) => (
                            <tr 
                                key={rule.id}
                                onClick={() => !rule.isAuto && onSelectRule(rule)}
                                className={`border-b border-gray-700/50 ${!rule.isAuto ? 'cursor-pointer hover:bg-gray-800' : 'opacity-60'} ${selectedRuleId === rule.id ? 'bg-indigo-900/50' : ''}`}
                            >
                                <td className={`p-2 font-bold ${rule.action === RuleAction.DENY ? 'text-red-400' : 'text-green-400'}`}>
                                    {rule.action}
                                </td>
                                <td className="p-2 font-mono">{rule.target}</td>
                                <td className="p-2 text-gray-400">
                                    {rule.isAuto && <span className="text-xs font-semibold mr-2 px-2 py-0.5 bg-blue-600 text-blue-100 rounded-full">AUTO</span>}
                                    {rule.description}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FirewallRules;
