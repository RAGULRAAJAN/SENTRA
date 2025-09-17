import type { FirewallRule, AttackType } from './types';

export const INITIAL_RULES: FirewallRule[] = [
  { id: crypto.randomUUID(), action: 'ALLOW', target: 'PORT:80', description: 'Allow standard HTTP traffic', source: 'USER' },
  { id: crypto.randomUUID(), action: 'ALLOW', target: 'PORT:443', description: 'Allow standard HTTPS traffic', source: 'USER' },
  { id: crypto.randomUUID(), action: 'ALLOW', target: 'PORT:53', description: 'Allow DNS queries', source: 'USER' },
  { id: crypto.randomUUID(), action: 'BLOCK', target: '0.0.0.0/0', description: 'Default deny all inbound', source: 'USER' },
];

export const THREAT_LEVEL_CONFIG: { [key: string]: { color: string; label: string } } = {
  LOW: { color: 'text-success', label: 'LOW' },
  MEDIUM: { color: 'text-warning', label: 'MEDIUM' },
  HIGH: { color: 'text-orange-500', label: 'HIGH' },
  CRITICAL: { color: 'text-danger', label: 'CRITICAL' },
};

export const ATTACK_TYPES: AttackType[] = ['Port Scan', 'DDoS Flood', 'Data Exfiltration'];
