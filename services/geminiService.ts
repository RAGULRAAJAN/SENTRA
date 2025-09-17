import { GoogleGenAI, Type } from "@google/genai";
import type { Packet, GeminiAnalysisResult } from '../types';

// FIX: Per @google/genai guidelines, API key must be read directly from process.env.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = "gemini-2.5-flash";

const systemInstruction = `You are an advanced, autonomous AI firewall security analyst. 
Your task is to analyze network traffic logs, identify threats, suggest adaptive firewall rule changes, and detect anomalous activity.
Prioritize identifying coordinated attacks, anomalies, and potential data exfiltration.
- Analyze the provided list of recent network packets.
- Determine the overall threat level.
- Provide a brief summary of your analysis.
- Suggest specific, actionable firewall rules to mitigate identified threats. A rule target can be an IP address or a port (e.g., 'PORT:1234'). Only suggest a few of the most critical rules (max 3).
- Identify up to 10 suspicious source IP addresses exhibiting anomalous patterns (e.g., multiple connection attempts to various ports, unusual data payloads, connections from known malicious ranges). For each, provide the IP, an anomaly score from 0 (normal) to 1 (highly anomalous), and a brief reason.
- If no specific threat is found, classify the threat level as 'LOW' and provide a summary like 'Normal traffic patterns observed.' without suggesting new rules or anomalies.
Respond ONLY with the specified JSON format.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    threatLevel: {
      type: Type.STRING,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      description: 'The assessed threat level.',
    },
    analysisSummary: {
      type: Type.STRING,
      description: 'A brief text explanation of the findings.',
    },
    ruleSuggestions: {
      type: Type.ARRAY,
      description: 'A list of suggested firewall rule modifications.',
      items: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            enum: ['ALLOW', 'BLOCK'],
            description: 'The action for the rule.',
          },
          target: {
            type: Type.STRING,
            description: "The rule's target, e.g., an IP or 'PORT:number'.",
          },
          description: {
            type: Type.STRING,
            description: 'A brief description of why the rule is suggested.',
          },
        },
        required: ['action', 'target', 'description'],
      },
    },
    anomalyHotspots: {
      type: Type.ARRAY,
      description: 'A list of IP addresses with anomalous activity.',
      items: {
        type: Type.OBJECT,
        properties: {
          ip: {
            type: Type.STRING,
            description: 'The suspicious source IP address.'
          },
          score: {
            type: Type.NUMBER,
            description: 'Anomaly score from 0 (normal) to 1 (highly anomalous).'
          },
          reason: {
            type: Type.STRING,
            description: 'Brief reason for the anomaly score.'
          }
        },
        required: ['ip', 'score', 'reason']
      }
    }
  },
  required: ['threatLevel', 'analysisSummary', 'ruleSuggestions', 'anomalyHotspots'],
};

export async function analyzeTraffic(packets: Packet[]): Promise<GeminiAnalysisResult | null> {
  if (!packets || packets.length === 0) {
    return null;
  }

  const prompt = `Analyze the following network traffic packets: ${JSON.stringify(packets.map(p => ({ src: p.sourceIp, dst: p.destIp, dport: p.destPort, proto: p.protocol, payload: p.payload.substring(0, 30) })))}`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });
    
    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    
    // Basic validation
    if (result && result.threatLevel && result.analysisSummary && Array.isArray(result.ruleSuggestions) && Array.isArray(result.anomalyHotspots)) {
      return result as GeminiAnalysisResult;
    } else {
      console.error("Parsed Gemini response is missing required fields:", result);
      return null;
    }
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze traffic with Gemini API.");
  }
}