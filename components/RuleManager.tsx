
import React, { useState, useEffect } from 'react';
import { FirewallRule, RuleAction } from '../types';

interface RuleManagerProps {
    onAddRule: (rule: Omit<FirewallRule, 'id' | 'isAuto'>) => void;
    onUpdateRule: (rule: FirewallRule) => void;
    onDeleteRule: (ruleId: string) => void;
    selectedRule: FirewallRule | null;
    clearSelection: () => void;
}

const RuleManager: React.FC<RuleManagerProps> = ({ onAddRule, onUpdateRule, onDeleteRule, selectedRule, clearSelection }) => {
    const [action, setAction] = useState<RuleAction>(RuleAction.DENY);
    const [target, setTarget] = useState('');
    const [description, setDescription] = useState('');
    const isEditing = selectedRule !== null;

    useEffect(() => {
        if (selectedRule) {
            setAction(selectedRule.action);
            setTarget(selectedRule.target);
            setDescription(selectedRule.description);
        } else {
            resetForm();
        }
    }, [selectedRule]);
    
    const resetForm = () => {
        setAction(RuleAction.DENY);
        setTarget('');
        setDescription('');
        clearSelection();
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!target || !description) return;
        
        if (isEditing && selectedRule) {
            onUpdateRule({ ...selectedRule, action, target, description });
        } else {
            onAddRule({ action, target, description });
        }
        resetForm();
    };
    
    const handleDelete = () => {
        if (isEditing && selectedRule) {
            onDeleteRule(selectedRule.id);
            resetForm();
        }
    }

    return (
        <div className="bg-gray-850 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">{isEditing ? 'Edit Manual Rule' : 'Add Manual Rule'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="action" className="block text-sm font-medium text-gray-400">Action</label>
                    <select
                        id="action"
                        value={action}
                        onChange={(e) => setAction(e.target.value as RuleAction)}
                        className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value={RuleAction.DENY}>DENY</option>
                        <option value={RuleAction.ALLOW}>ALLOW</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="target" className="block text-sm font-medium text-gray-400">Target (IP/CIDR)</label>
                    <input
                        type="text"
                        id="target"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="e.g., 198.51.100.14"
                        className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Block malicious actor"
                        className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button type="submit" className="flex-grow w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800">
                        {isEditing ? 'Update Rule' : 'Add Rule'}
                    </button>
                    {isEditing && (
                         <>
                            <button type="button" onClick={handleDelete} className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800">
                                Delete
                            </button>
                             <button type="button" onClick={resetForm} className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800">
                                Clear
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default RuleManager;
