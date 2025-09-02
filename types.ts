export enum PacketAction {
  ALLOWED = 'ALLOWED',
  DENIED = 'DENIED',
}

export interface Packet {
  id: string;
  timestamp: Date;
  sourceIp: string;
  sourcePort: number;
  destIp: string;
  destPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  payload: string;
  action: PacketAction;
  isAttackPacket: boolean;
}

export enum RuleAction {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
}

export interface FirewallRule {
  id: string;
  action: RuleAction;
  target: string; // IP address or CIDR block
  description: string;
  isAuto: boolean; // Differentiate between adaptive and manual rules
}

export enum AttackType {
  DDOS_FLOOD = 'DDoS Flood',
  PORT_SCAN = 'Port Scan',
  SYN_FLOOD = 'SYN Flood',
}

export interface Attack {
  type: AttackType;
  targetIp: string;
  sourceIp?: string;
}

export interface ThreatHistoryPoint {
  time: string;
  level: number;
}

export interface IpInfo {
  status: 'success' | 'fail';
  country?: string;
  city?: string;
  isp?: string;
  org?: string;
  query: string;
  message?: string;
}
