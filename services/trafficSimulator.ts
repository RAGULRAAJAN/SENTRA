
import type { Packet, Protocol, AttackType } from '../types';

const randomIp = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
const randomPort = () => Math.floor(Math.random() * 65535) + 1;
const randomProtocol = (): Protocol => {
  const protocols: Protocol[] = ['TCP', 'UDP', 'ICMP'];
  return protocols[Math.floor(Math.random() * protocols.length)];
};
const randomPayload = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const generateTrafficPacket = (): Packet => {
  const protocol = randomProtocol();
  let destPort = randomPort();
  
  // Make some traffic more common
  if (Math.random() < 0.5) {
    destPort = [80, 443, 53, 22][Math.floor(Math.random() * 4)];
  }

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    sourceIp: randomIp(),
    destIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
    sourcePort: randomPort(),
    destPort: destPort,
    protocol,
    action: 'Permitted',
    payload: randomPayload(),
    isAttack: false,
  };
};

export const getAttackTraffic = (type: AttackType): Packet[] => {
    const packets: Packet[] = [];
    const targetIp = `192.168.1.100`;

    switch (type) {
        case 'Port Scan': {
            const scanningIp = randomIp();
            for (let i = 0; i < 10; i++) {
                packets.push({
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    sourceIp: scanningIp,
                    destIp: targetIp,
                    sourcePort: randomPort(),
                    destPort: Math.floor(Math.random() * 1024) + 1, // Scan well-known ports
                    protocol: 'TCP',
                    action: 'Permitted',
                    payload: 'SYN_PACKET',
                    isAttack: true,
                });
            }
            break;
        }
        case 'DDoS Flood': {
            for (let i = 0; i < 15; i++) {
                packets.push({
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    sourceIp: randomIp(), // Spoofed IPs
                    destIp: targetIp,
                    sourcePort: randomPort(),
                    destPort: 80, // Target port 80
                    protocol: 'UDP',
                    action: 'Permitted',
                    payload: 'FLOOD_DATA_'.repeat(3),
                    isAttack: true,
                });
            }
            break;
        }
        case 'Data Exfiltration': {
            const internalIp = `192.168.1.${Math.floor(Math.random() * 50) + 10}`;
            const externalIp = randomIp();
            for (let i = 0; i < 8; i++) {
                packets.push({
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    sourceIp: internalIp,
                    destIp: externalIp,
                    sourcePort: randomPort(),
                    destPort: 443, // Disguised as HTTPS
                    protocol: 'TCP',
                    action: 'Permitted',
                    payload: `ENCRYPTED_CHUNK_${i}_${randomPayload()}`,
                    isAttack: true,
                });
            }
            break;
        }
    }
    return packets;
};