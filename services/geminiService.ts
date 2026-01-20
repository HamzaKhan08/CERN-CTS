import { GoogleGenAI } from "@google/genai";
import { SensorData, PowerConverter, User, Role } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBeamStability = async (dataHistory: SensorData[]): Promise<string> => {
  try {
    const recentReadings = dataHistory.slice(-20); // Analyze last 20 readings
    const prompt = `
      Act as a CERN particle physicist. Analyze the following time-series sensor data from the Large Hadron Collider (LHC) beam monitors.
      
      Data (JSON):
      ${JSON.stringify(recentReadings)}
      
      Metrics explained:
      - beamIntensity: Protons per bunch (should be stable high).
      - magnetTemperature: Superconducting magnet temp (must stay near 1.9K - 4K).
      - vacuumPressure: Beam pipe vacuum (lower is better).
      - inputVoltage: Power supply stability.

      Provide a concise status report (max 3 sentences) focusing on anomalies, stability trends, and safety recommendations.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis complete. No text returned.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI Analysis unavailable due to connection error.";
  }
};

export const generateMaintenanceReport = async (converters: PowerConverter[]): Promise<string> => {
    try {
        const criticalConverters = converters.filter(c => c.status === 'CRITICAL' || c.status === 'WARNING');
        
        const prompt = `
            Act as a Senior Electrical Engineer. Review the following list of Power Converters currently showing faults or warnings.
            
            Faulty Equipment:
            ${JSON.stringify(criticalConverters)}

            Generate a prioritized maintenance action plan (bullet points). Suggest potential root causes based on standard high-voltage DC power supply failure modes (IGBT failure, cooling system, control loop oscillation).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Report generation failed.";
    } catch (error) {
        return "Unable to generate maintenance report.";
    }
}

export const runConverterDiagnostics = async (converter: PowerConverter): Promise<string> => {
    try {
        const prompt = `
            Act as a Power Electronics Specialist. Perform a diagnostic assessment on the following Power Converter unit:
            ${JSON.stringify(converter)}

            The user has requested a deep-dive diagnostic. 
            1. Assess the severity based on Status, Temp, and Efficiency.
            2. Hypothesize the component failure (e.g., Capacitor Bank C4 degradation, Thyristor misfiring).
            3. Recommend immediate control room action (e.g., Remote Reset, Dispatch Team, Emergency Stop).
            
            Keep it technical and concise.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Diagnostics failed.";
    } catch (error) {
        return "Unable to run diagnostics.";
    }
};

export const chatWithCernAI = async (message: string, userRole: Role, contextData: any): Promise<string> => {
    try {
        const prompt = `
            You are "CERN-AI", an advanced mission support assistant for the Large Hadron Collider.
            
            Current User Role: ${userRole}
            Current System Context: ${JSON.stringify(contextData)}
            
            Instructions:
            - If the user is a SCIENTIST: Focus on physics, beam quality, and collisions.
            - If the user is an ENGINEER: Focus on hardware, voltage, temperatures, and maintenance.
            - If the user is an ADMIN: Focus on security, user logs, and system uptime.
            - Keep responses professional, scientific, and concise (under 100 words unless asked for more).
            - You have access to the context data provided above. Use it to answer questions about the current state.

            User Query: "${message}"
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "I didn't catch that.";
    } catch (error) {
        return "Connection to AI Core interrupted.";
    }
};