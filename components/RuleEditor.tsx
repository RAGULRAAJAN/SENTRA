import React, { useState, useEffect } from 'react';
import type { FirewallRule, RuleAction } from '../types';

interface RuleEditorProps {
  rule?: FirewallRule | null;
  onSave: (rule: Omit<FirewallRule, 'id' | 'source'> & { id?: string }) => void;
  onCancel: () => void;
}

export const RuleEditor: React.FC<RuleEditorProps> = ({ rule, onSave, onCancel }) => {
  const [action, setAction] = useState<RuleAction>('BLOCK');
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (rule) {
      setAction(rule.action);
      setTarget(rule.target);
      setDescription(rule.description);
    }
  }, [rule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim() || !description.trim()) {
      alert("Target and Description cannot be empty.");
      return;
    }
    onSave({ id: rule?.id, action, target, description });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-slide-in"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rule-editor-title"
    >
      <div 
        className="bg-surface p-6 rounded-lg border border-overlay w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="rule-editor-title" className="text-xl text-primary mb-4">{rule ? 'Edit Rule' : 'Add New Rule'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="action" className="block text-sm font-medium text-muted mb-1">Action</label>
            <select
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value as RuleAction)}
              className="w-full bg-base border border-overlay rounded-md p-2 text-subtle focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="BLOCK">BLOCK</option>
              <option value="ALLOW">ALLOW</option>
            </select>
          </div>
          <div>
            <label htmlFor="target" className="block text-sm font-medium text-muted mb-1">Target</label>
            <input
              type="text"
              id="target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 192.168.1.100 or PORT:8080"
              className="w-full bg-base border border-overlay rounded-md p-2 text-subtle focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-muted mb-1">Description</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reason for this rule"
              className="w-full bg-base border border-overlay rounded-md p-2 text-subtle focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md bg-overlay text-subtle hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary text-base font-bold hover:bg-primary-hover transition-colors"
            >
              {rule ? 'Save Changes' : 'Add Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
