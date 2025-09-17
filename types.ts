export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SystemStatus = 'ACTIVE' | 'ANALYZING' | 'ERROR' | 'INITIALIZING';
export type Protocol = 'TCP' | 'UDP' | 'ICMP';
export type RuleAction = 'ALLOW' | 'BLOCK';
export type AttackType = 'Port Scan' | 'DDoS Flood' | 'Data Exfiltration';

export interface Packet {
  id: string;
  timestamp: string;
  sourceIp: string;
  destIp: string;
  sourcePort: number;
  destPort: number;
  protocol: Protocol;
  action: 'Permitted' | 'Blocked'; // For display purposes
  payload: string;
  isAttack?: boolean;
}

export interface FirewallRule {
  id: string;
  action: RuleAction;
  target: string; // e.g., IP address '192.168.1.1' or port 'PORT:8080'
  description: string;
  source: 'AI' | 'USER';
}

export interface AnomalyDataPoint {
  ip: string;
  score: number; // 0 to 1
  reason: string;
}

export interface GeminiAnalysisResult {
  threatLevel: ThreatLevel;
  analysisSummary: string;
  ruleSuggestions: Pick<FirewallRule, 'action' | 'target' | 'description'>[];
  anomalyHotspots: AnomalyDataPoint[];
}

export interface ProtocolDataPoint {
    name: string;
    value: number;
}

// FIX: Add missing ThreatDataPoint type for the ThreatHistoryChart component.
export interface ThreatDataPoint {
  timestamp: string;
  level: number;
  levelName: ThreatLevel;
}