import React from 'react';
import type { FirewallRule } from '../types';
import { CogIcon, TrashIcon, PencilIcon } from './Icons';

interface RulesTableProps {
  rules: FirewallRule[];
  onEdit: (rule: FirewallRule) => void;
  onDelete: (ruleId: string) => void;
}

export const RulesTable: React.FC<RulesTableProps> = ({ rules, onEdit, onDelete }) => {
  return (
    <div className="h-full overflow-y-auto text-xs pr-1">
      {rules.map((rule, index) => (
        <div key={rule.id} className={`p-2 border-b border-overlay last:border-b-0 group ${index === 0 ? 'bg-primary/5 rounded-t-md' : ''}`}>
          <div className="flex items-start gap-2 mb-1">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                    rule.action === 'BLOCK' ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'
                  }`}
                >
                  {rule.action}
                </span>
                <span className="font-bold text-subtle truncate">{rule.target}</span>
              </div>
              <p className="text-muted pl-1">{rule.description}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {rule.source === 'USER' && (
                    <button onClick={() => onEdit(rule)} className="p-1 text-muted hover:text-primary rounded-full" aria-label="Edit rule">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                )}
                <button onClick={() => onDelete(rule.id)} className="p-1 text-muted hover:text-danger rounded-full" aria-label="Delete rule">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
          </div>
           {rule.source === 'AI' && (
              <div className="flex items-center gap-1 text-primary/70 pl-1">
                  <CogIcon className="w-3 h-3" />
                  <span className="text-xs">AI Suggested</span>
              </div>
           )}
        </div>
      ))}
    </div>
  );
};
