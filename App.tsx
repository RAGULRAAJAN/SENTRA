import React, { useState, useEffect, useCallback } from 'react';
import { Packet, FirewallRule, Attack, ThreatHistoryPoint, RuleAction, PacketAction, AttackType } from './types';
import StatusIndicator from './components/StatusIndicator';
import FirewallRules from './components/FirewallRules';
import TrafficLog from './components/TrafficLog';
import ThreatLevelChart from './components/ThreatLevelChart';
import RuleManager from './components/RuleManager';
import AttackAnalyticsChart from './components/AttackAnalyticsChart';
import IpLookupModal from './components/IpLookupModal';

const YOUR_SIMULATED_IP = '192.168.1.50';

const generateRealisticPayload = (protocol: 'TCP' | 'UDP' | 'ICMP', destPort: number, attackType?: AttackType): string => {
    const randomHex = () => Math.random().toString(16).substring(2, 10).toUpperCase();

    if (attackType) {
        switch (attackType) {
            case AttackType.SYN_FLOOD:
                return `[TCP SYN] SEQ=${Math.floor(Math.random() * 999999)}, ACK=0, Win=8192`;
            case AttackType.PORT_SCAN:
                return `[TCP Connection Attempt] SEQ=${Math.floor(Math.random() * 999999)}`;
            case AttackType.DDOS_FLOOD:
                return `[Fragmented Data] id=0x${randomHex()} offset=0 MF`;
        }
    }

    if (protocol === 'TCP' && (destPort === 80 || destPort === 443)) {
        return `GET /api/data HTTP/1.1\nHost: api.service.com\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\nAccept: application/json`;
    }
    if (protocol === 'UDP' && destPort === 53) {
        return `DNS Standard query 0x${randomHex()} A IN www.example-site.com`;
    }
    if (protocol === 'ICMP') {
        return `ICMP Echo (ping) request id=0x${randomHex().substring(0,4)}, seq=1, ttl=64`;
    }
    return `[DATA] len=${Math.floor(Math.random() * 128)} 0x${randomHex()} 0x${randomHex()}`;
};

// Helper function for matching IPs to rule targets
const ipMatchesTarget = (ip: string, target: string): boolean => {
    if (target === '0.0.0.0/0') { // Catch-all rule
        return true;
    }
    if (target.includes('/')) { // Simple CIDR check
        const [targetPrefix, mask] = target.split('/');
        // Only implementing /24 for this simulation
        if (mask === '24') {
            const ipPrefix = ip.split('.').slice(0, 3).join('.');
            const rulePrefix = targetPrefix.split('.').slice(0, 3).join('.');
            return ipPrefix === rulePrefix;
        }
        return false;
    }
    return ip === target; // Exact IP match
};


const App: React.FC = () => {
    const [threatLevel, setThreatLevel] = useState<number>(10);
    const [currentAttack, setCurrentAttack] = useState<Attack | null>(null);
    const [rules, setRules] = useState<FirewallRule[]>([
        { id: '1', action: RuleAction.ALLOW, target: '192.168.1.0/24', description: 'Allow local network traffic', isAuto: false },
        { id: '2', action: RuleAction.DENY, target: '0.0.0.0/0', description: 'Default deny all', isAuto: true },
    ]);
    const [trafficLog, setTrafficLog] = useState<Packet[]>([]);
    const [threatHistory, setThreatHistory] = useState<ThreatHistoryPoint[]>([]);
    const [attackHistory, setAttackHistory] = useState<Attack[]>([]);
    const [selectedRule, setSelectedRule] = useState<FirewallRule | null>(null);
    const [lookupIp, setLookupIp] = useState<string | null>(null);


    const generateRandomIp = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    const simulateFirewall = useCallback(() => {
        // Simulate threat level changes based on attack type
        setThreatLevel(prev => {
            let newLevel;
            if (currentAttack) {
                let increase = 0;
                switch (currentAttack.type) {
                    case AttackType.DDOS_FLOOD:
                        increase = Math.random() * 15;
                        break;
                    case AttackType.SYN_FLOOD:
                        increase = Math.random() * 10;
                        break;
                    case AttackType.PORT_SCAN:
                        increase = Math.random() * 5;
                        break;
                    default:
                        increase = Math.random() * 8;
                }
                newLevel = Math.min(100, prev + increase);
            } else {
                newLevel = Math.max(0, prev - Math.random() * 5);
            }
            const time = new Date().toLocaleTimeString();
            setThreatHistory(prevHistory => [...prevHistory.slice(-59), { time, level: newLevel }]);
            return newLevel;
        });

        // Simulate various types of attacks
        if (!currentAttack && Math.random() < 0.05) {
            const attackTarget = YOUR_SIMULATED_IP;
            const attackTypes: AttackType[] = [AttackType.DDOS_FLOOD, AttackType.PORT_SCAN, AttackType.SYN_FLOOD];
            const selectedAttackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
            
            let attackerIp: string | undefined;
            if (selectedAttackType === AttackType.PORT_SCAN || selectedAttackType === AttackType.SYN_FLOOD) {
                attackerIp = generateRandomIp(); // A single source is identified
            }

            const newAttack: Attack = { type: selectedAttackType, targetIp: attackTarget, sourceIp: attackerIp };
            setCurrentAttack(newAttack);
            setAttackHistory(prev => [...prev, newAttack]);

            // Automatically add a rule to block the source of simpler attacks
            if (attackerIp) {
                setRules(prev => [...prev, { id: `auto-${Date.now()}`, action: RuleAction.DENY, target: attackerIp, description: `AUTO: Block suspicious ${selectedAttackType} source`, isAuto: true }]);
            }
        } else if (currentAttack && Math.random() < 0.1) {
            setCurrentAttack(null);
        }
        
        // Generate new traffic packet based on current state (attack or normal)
        const isAttackPacket = currentAttack ? Math.random() < 0.7 : false;

        let protocol: 'TCP' | 'UDP' | 'ICMP' = 'TCP';
        let sourceIp = '0.0.0.0';
        let destIp = '0.0.0.0';
        let destPort = 80;
        let sourcePort = 12345;

        if (isAttackPacket && currentAttack) {
            destIp = currentAttack.targetIp;
            sourceIp = currentAttack.sourceIp || generateRandomIp(); // Use stored IP for some attacks, or random for DDoS

            switch (currentAttack.type) {
                case AttackType.DDOS_FLOOD:
                    protocol = Math.random() > 0.5 ? 'TCP' : 'UDP';
                    destPort = Math.random() > 0.7 ? 80 : 443;
                    break;
                case AttackType.PORT_SCAN:
                    protocol = 'TCP';
                    destPort = Math.floor(Math.random() * 1024); // Scan well-known ports
                    break;
                case AttackType.SYN_FLOOD:
                    protocol = 'TCP';
                    destPort = 80;
                    break;
            }
        } else {
            // Normal traffic generation
            const isFromYou = !isAttackPacket && Math.random() < 0.3;
            protocol = ['TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 3)] as 'TCP' | 'UDP' | 'ICMP';
            sourceIp = isFromYou ? YOUR_SIMULATED_IP : '192.168.1.' + Math.floor(Math.random() * 100 + 10);
            sourcePort = Math.floor(Math.random() * 65535);
            destIp = generateRandomIp();
            destPort = Math.floor(Math.random() * 65535);
        }

        const newPacket: Omit<Packet, 'action' | 'id'> = {
            timestamp: new Date(),
            sourceIp: sourceIp,
            sourcePort: sourcePort,
            destIp: destIp,
            destPort: destPort,
            protocol: protocol,
            payload: generateRealisticPayload(protocol, destPort, isAttackPacket ? currentAttack?.type : undefined),
            isAttackPacket,
        };
        
        // Process packet against rules, with DENY rules having priority.
        const sortedRules = [...rules].sort((a, b) => {
            if (a.target === '0.0.0.0/0') return 1; // Default rule should be last
            if (b.target === '0.0.0.0/0') return -1;
            if (a.action === RuleAction.DENY && b.action !== RuleAction.DENY) return -1;
            if (a.action !== RuleAction.DENY && b.action === RuleAction.DENY) return 1;
            return 0;
        });

        let action: PacketAction = PacketAction.DENIED; // Default to DENIED
        for (const rule of sortedRules) {
             // We primarily check the source IP for ingress filtering
            if (ipMatchesTarget(newPacket.sourceIp, rule.target)) {
                action = rule.action === RuleAction.ALLOW ? PacketAction.ALLOWED : PacketAction.DENIED;
                break; // First match wins
            }
        }

        const processedPacket: Packet = {
            ...newPacket,
            id: `pkt-${Date.now()}-${Math.random()}`,
            action: action
        };
        
        setTrafficLog(prevLog => [processedPacket, ...prevLog.slice(0, 99)]);
    }, [currentAttack, rules]);

    useEffect(() => {
        const interval = setInterval(simulateFirewall, 1500);
        return () => clearInterval(interval);
    }, [simulateFirewall]);
    
    const handleAddRule = (rule: Omit<FirewallRule, 'id' | 'isAuto'>) => {
        const newRule = { ...rule, id: `manual-${Date.now()}`, isAuto: false };
        setRules(prev => [...prev, newRule]);
    };
    
    const handleUpdateRule = (updatedRule: FirewallRule) => {
        setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
        setSelectedRule(null);
    };

    const handleDeleteRule = (ruleId: string) => {
        setRules(prev => prev.filter(r => r.id !== ruleId));
        setSelectedRule(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-center text-indigo-400">Autonomous & Adaptive Firewall</h1>
                <p className="text-center text-gray-400 mt-2">Monitoring network traffic and adapting to threats in real-time.</p>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <StatusIndicator threatLevel={threatLevel} currentAttack={currentAttack} />
                    <TrafficLog trafficLog={trafficLog} currentAttack={currentAttack} yourSimulatedIp={YOUR_SIMULATED_IP} onIpClick={setLookupIp} />
                </div>
                <div className="space-y-8">
                    <ThreatLevelChart data={threatHistory} />
                    <AttackAnalyticsChart attackHistory={attackHistory} onIpClick={setLookupIp} />
                    <FirewallRules rules={rules} onSelectRule={setSelectedRule} selectedRuleId={selectedRule?.id} />
                    <RuleManager 
                        onAddRule={handleAddRule} 
                        onUpdateRule={handleUpdateRule}
                        onDeleteRule={handleDeleteRule}
                        selectedRule={selectedRule}
                        clearSelection={() => setSelectedRule(null)}
                    />
                </div>
            </main>
            
            <IpLookupModal ip={lookupIp} onClose={() => setLookupIp(null)} />
        </div>
    );
};

export default App;