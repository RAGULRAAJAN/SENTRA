import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { ThreatLevelGauge } from './components/ThreatLevelGauge';
import { TrafficLog } from './components/TrafficLog';
import { RulesTable } from './components/RulesTable';
import { RuleEditor } from './components/RuleEditor';
import { ProtocolRadarChart } from './components/ProtocolRadarChart';
import { AnomalyHeatmap } from './components/AnomalyHeatmap';
import { ShieldExclamationIcon, PlusIcon } from './components/Icons';
import { analyzeTraffic } from './services/geminiService';
import { generateTrafficPacket, getAttackTraffic } from './services/trafficSimulator';
import type { Packet, FirewallRule, ThreatLevel, SystemStatus, AttackType, AnomalyDataPoint, ProtocolDataPoint } from './types';
import { ATTACK_TYPES, INITIAL_RULES } from './constants';

const MAX_LOG_SIZE = 100;
const SIMULATION_INTERVAL = 6000;

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>('INITIALIZING');
  const [packets, setPackets] = useState<Packet[]>([]);
  const [rules, setRules] = useState<FirewallRule[]>(INITIAL_RULES);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('LOW');
  const [metrics, setMetrics] = useState({ analyzed: 0, blocked: 0, adapted: 0 });
  const [analysis, setAnalysis] = useState('System is initializing...');
  const [currentAttack, setCurrentAttack] = useState<AttackType | null>(null);
  const [anomalyHotspots, setAnomalyHotspots] = useState<AnomalyDataPoint[]>([]);
  const [protocolData, setProtocolData] = useState<ProtocolDataPoint[]>([]);
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(null);
  const [isRuleEditorOpen, setIsRuleEditorOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<FirewallRule | null>(null);

  const packetsRef = useRef(packets);
  packetsRef.current = packets;

  const handlePacketSelect = (packetId: string) => {
    setSelectedPacketId(prevId => (prevId === packetId ? null : packetId));
  };
  
  // Rule Management Handlers
  const handleOpenRuleEditor = (rule: FirewallRule | null) => {
      setRuleToEdit(rule);
      setIsRuleEditorOpen(true);
  }

  const handleCloseRuleEditor = () => {
      setRuleToEdit(null);
      setIsRuleEditorOpen(false);
  }

  const handleSaveRule = (ruleData: Omit<FirewallRule, 'id' | 'source'> & { id?: string }) => {
      if (ruleData.id) { // Editing existing rule
          setRules(prevRules => prevRules.map(r => r.id === ruleData.id ? { ...r, ...ruleData } : r));
      } else { // Adding new rule
          const newRule: FirewallRule = {
              ...ruleData,
              id: crypto.randomUUID(),
              source: 'USER',
          };
          setRules(prevRules => [newRule, ...prevRules]);
      }
      handleCloseRuleEditor();
  }

  const handleDeleteRule = (ruleId: string) => {
      setRules(prevRules => prevRules.filter(r => r.id !== ruleId));
  }
  
  const calculateProtocolDistribution = (currentPackets: Packet[]) => {
      const trackedSubjects = [
          { key: 'TCP', name: 'TCP', type: 'protocol' },
          { key: 'UDP', name: 'UDP', type: 'protocol' },
          { key: 'ICMP', name: 'ICMP', type: 'protocol' },
          { key: '80', name: 'HTTP (80)', type: 'port' },
          { key: '443', name: 'SSL (443)', type: 'port' },
          { key: '53', name: 'DNS (53)', type: 'port' },
          { key: '22', name: 'SSH (22)', type: 'port' },
      ];

      const counts = trackedSubjects.reduce((acc, subject) => ({ ...acc, [subject.name]: 0 }), {} as Record<string, number>);

      currentPackets.slice(0, 50).forEach(p => {
          trackedSubjects.forEach(subject => {
              if (subject.type === 'protocol' && p.protocol === subject.key) {
                  counts[subject.name]++;
              } else if (subject.type === 'port' && p.destPort.toString() === subject.key) {
                  counts[subject.name]++;
              }
          });
      });

      const chartData: ProtocolDataPoint[] = Object.entries(counts).map(([name, value]) => ({
          name,
          value,
      }));
      setProtocolData(chartData);
  }

  const runSimulationCycle = useCallback(async () => {
    setStatus('ANALYZING');
    
    // Decide if an attack should happen
    const isAttacking = Math.random() < 0.3; // 30% chance of attack traffic
    let newPackets: Packet[];
    let attackType: AttackType | null = null;
    if (isAttacking) {
      attackType = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
      newPackets = getAttackTraffic(attackType);
    } else {
      newPackets = Array.from({ length: Math.floor(Math.random() * 6) + 5 }, () => generateTrafficPacket());
    }
    setCurrentAttack(attackType);

    const latestPackets = [...newPackets, ...packetsRef.current].slice(0, MAX_LOG_SIZE);
    setPackets(latestPackets);
    calculateProtocolDistribution(latestPackets);

    try {
      const result = await analyzeTraffic(latestPackets.slice(0, 20)); // Analyze recent traffic
      if (result) {
        setThreatLevel(result.threatLevel);
        setAnalysis(result.analysisSummary);
        setAnomalyHotspots(result.anomalyHotspots || []);
        
        let adaptedCount = 0;
        let blockedCount = 0;
        const existingRuleTargets = new Set(rules.map(r => r.target));
        
        result.ruleSuggestions.forEach(suggestion => {
          if (!existingRuleTargets.has(suggestion.target)) {
            const newRule: FirewallRule = { ...suggestion, id: crypto.randomUUID(), source: 'AI' };
            setRules(prev => [newRule, ...prev].slice(0, 20));
            adaptedCount++;
            existingRuleTargets.add(suggestion.target);
          }
        });

        // Simple blocking simulation
        newPackets.forEach(p => {
          const isBlocked = rules.some(r => r.action === 'BLOCK' && (r.target === p.sourceIp || r.target === `PORT:${p.destPort}`));
          if(isBlocked) blockedCount++;
        });

        setMetrics(prev => ({
          analyzed: prev.analyzed + newPackets.length,
          blocked: prev.blocked + blockedCount,
          adapted: prev.adapted + adaptedCount
        }));
      }
      setStatus('ACTIVE');
    } catch (error) {
      console.error("Error during simulation cycle:", error);
      setStatus('ERROR');
      setAnalysis("An error occurred during threat analysis.");
    }
  }, [rules]);

  useEffect(() => {
    const intervalId = setInterval(runSimulationCycle, SIMULATION_INTERVAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    runSimulationCycle(); // Initial run
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-base p-4 lg:p-6 flex flex-col gap-4 lg:gap-6">
      <Header status={status} />
      
      <main className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 flex-grow">
        {/* Left Column */}
        <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-4 lg:gap-6">
          <ThreatLevelGauge level={threatLevel} />
          <MetricCard title="Packets Analyzed" value={metrics.analyzed.toLocaleString()} />
          <MetricCard title="Threats Blocked" value={metrics.blocked.toLocaleString()} />
          <MetricCard title="Rules Adapted" value={metrics.adapted.toLocaleString()} />
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-2 xl:col-span-2 flex flex-col gap-4 lg:gap-6 min-h-[500px]">
          <div className="bg-surface p-4 rounded-lg border border-overlay flex-grow flex flex-col">
            <h2 className="text-lg text-primary mb-2">Real-time Traffic Log</h2>
            <div className="text-xs text-muted mb-2">
              AI Analysis: <span className="text-subtle">{analysis}</span>
            </div>
            {currentAttack && (
              <div className="bg-danger/10 border border-danger text-danger p-3 rounded-lg mb-2 text-sm flex items-center gap-3 animate-pulse-fast">
                <ShieldExclamationIcon className="h-6 w-6 flex-shrink-0" />
                <div>
                  <strong className="font-bold block">ATTACK DETECTED: {currentAttack}</strong>
                  <span>Malicious traffic patterns identified. Packets are highlighted below.</span>
                </div>
              </div>
            )}
            <TrafficLog 
              packets={packets}
              selectedPacketId={selectedPacketId}
              onPacketSelect={handlePacketSelect}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-surface p-4 rounded-lg border border-overlay h-64 flex flex-col">
              <AnomalyHeatmap data={anomalyHotspots} />
            </div>
            <div className="bg-surface p-4 rounded-lg border border-overlay h-64 flex flex-col">
                <ProtocolRadarChart data={protocolData} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 xl:col-span-1 flex flex-col">
          <div className="bg-surface p-4 rounded-lg border border-overlay flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg text-primary">Adaptive Firewall Rules</h2>
                <button 
                    onClick={() => handleOpenRuleEditor(null)}
                    className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full hover:bg-primary/40 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>New Rule</span>
                </button>
            </div>
            <p className="text-xs text-muted mb-4">AI-managed and user-defined security policies.</p>
            <RulesTable rules={rules} onEdit={(rule) => handleOpenRuleEditor(rule)} onDelete={handleDeleteRule} />
          </div>
        </div>
      </main>

      {isRuleEditorOpen && (
          <RuleEditor 
            rule={ruleToEdit}
            onSave={handleSaveRule}
            onCancel={handleCloseRuleEditor}
          />
      )}
    </div>
  );
};

export default App;
