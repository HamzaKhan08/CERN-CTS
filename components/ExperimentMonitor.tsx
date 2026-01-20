import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Cpu, Thermometer, Wind, Activity, Download, BrainCircuit, Info } from 'lucide-react';
import { SensorData } from '../types';
import { analyzeBeamStability } from '../services/geminiService';

const MOCK_INTERVAL = 1500;

// Reusable Tooltip Component
const InfoTooltip = ({ text, title, children }: { text: string, title?: string, children?: React.ReactNode }) => (
  <div className="group relative inline-flex items-center cursor-help">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 border border-slate-500 rounded-lg text-xs text-slate-200 shadow-xl z-50 pointer-events-none">
      {title && <div className="font-bold text-white mb-1">{title}</div>}
      {text}
      {/* Triangle pointer */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-500"></div>
    </div>
  </div>
);

const ExperimentMonitor: React.FC = () => {
  const [data, setData] = useState<SensorData[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initial Data Seed
  useEffect(() => {
    const initialData: SensorData[] = Array.from({ length: 50 }, (_, i) => ({
      timestamp: Date.now() - (50 - i) * MOCK_INTERVAL,
      beamIntensity: 1.2 + Math.random() * 0.1,
      magnetTemperature: 1.9 + Math.random() * 0.05,
      vacuumPressure: 0.00001 + Math.random() * 0.000005,
      inputVoltage: 400 + Math.random() * 2
    }));
    setData(initialData);
  }, []);

  // WebSocket Simulation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1] || { timestamp: Date.now() };
        const newPoint: SensorData = {
          timestamp: Date.now(),
          beamIntensity: 1.2 + Math.random() * 0.15 - 0.05, // Slight drift
          magnetTemperature: 1.9 + (Math.random() * 0.1 - 0.02),
          vacuumPressure: 0.00001 + Math.random() * 0.00001,
          inputVoltage: 400 + (Math.sin(Date.now() / 10000) * 5) + Math.random()
        };
        const newData = [...prev, newPoint];
        if (newData.length > 100) newData.shift();
        return newData;
      });
    }, MOCK_INTERVAL);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeBeamStability(data);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "experiment_data_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const formatTime = (time: number) => new Date(time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });

  const StatCard = ({ title, value, unit, icon: Icon, color, tooltipTitle, tooltipText }: any) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-start justify-between hover:border-slate-600 transition-colors">
      <div>
        <div className="flex items-center space-x-1 mb-1">
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <InfoTooltip title={tooltipTitle} text={tooltipText}>
                <Info size={12} className="text-slate-500 hover:text-cyan-400" />
            </InfoTooltip>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">{value}</span>
          <span className="text-xs text-slate-500 font-mono">{unit}</span>
        </div>
      </div>
      <div className={`p-2 rounded-lg bg-opacity-20 ${color.bg}`}>
        <Icon size={20} className={color.text} />
      </div>
    </div>
  );

  const lastReading = data[data.length - 1] || { beamIntensity: 0, magnetTemperature: 0, vacuumPressure: 0, inputVoltage: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
             Experiment Monitor
             <InfoTooltip title="Real-time Telemetry" text="Live data stream from LHC Sector 4-5 sensors. Updates every 1.5 seconds.">
                <div className="bg-slate-800 p-1 rounded-full"><Info size={14} className="text-slate-400" /></div>
             </InfoTooltip>
          </h1>
          <p className="text-slate-400 text-sm">Real-time telemetry from Sector 4-5</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${isLive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}
          >
            {isLive ? 'Pause Stream' : 'Resume Stream'}
          </button>
          <button onClick={exportData} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md text-sm font-medium hover:bg-slate-700 flex items-center space-x-2">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md text-sm font-medium hover:from-purple-500 hover:to-indigo-500 flex items-center space-x-2 shadow-lg shadow-purple-900/20 disabled:opacity-50"
          >
            <BrainCircuit size={16} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Gemini Analysis'}</span>
          </button>
        </div>
      </div>

      {aiAnalysis && (
        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 animate-fadeIn">
          <div className="flex items-start space-x-3">
            <BrainCircuit className="text-indigo-400 mt-1" size={20} />
            <div>
              <h3 className="text-indigo-300 font-medium mb-1">AI Anomaly Report</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{aiAnalysis}</p>
            </div>
            <button onClick={() => setAiAnalysis(null)} className="text-slate-500 hover:text-white ml-auto">×</button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Beam Intensity" 
          value={lastReading.beamIntensity.toFixed(3)} 
          unit="e11 p" 
          icon={Activity} 
          color={{ bg: 'bg-cyan-500', text: 'text-cyan-400' }}
          tooltipTitle="Proton Bunch Intensity"
          tooltipText="The number of protons packed into each beam bunch. Higher intensity increases collision probability (luminosity)." 
        />
        <StatCard 
          title="Magnet Temp" 
          value={lastReading.magnetTemperature.toFixed(4)} 
          unit="K" 
          icon={Thermometer} 
          color={{ bg: 'bg-blue-500', text: 'text-blue-400' }}
          tooltipTitle="Superconducting Temp"
          tooltipText="Temperature of the main dipole magnets. Must remain below 1.9 Kelvin (superfluid helium temp) to maintain superconductivity." 
        />
        <StatCard 
          title="Vacuum Pressure" 
          value={lastReading.vacuumPressure.toExponential(2)} 
          unit="mbar" 
          icon={Wind} 
          color={{ bg: 'bg-green-500', text: 'text-green-400' }}
          tooltipTitle="Beam Pipe Vacuum"
          tooltipText="Pressure inside the particle tube. An ultra-high vacuum is required to prevent protons from colliding with gas molecules." 
        />
        <StatCard 
          title="Input Voltage" 
          value={lastReading.inputVoltage.toFixed(1)} 
          unit="kV" 
          icon={Cpu} 
          color={{ bg: 'bg-amber-500', text: 'text-amber-400' }}
          tooltipTitle="Power Supply Voltage"
          tooltipText="Input voltage to the sector's power distribution. Fluctuations can destabilize magnetic fields." 
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center mb-4">
              <h3 className="text-white font-medium flex items-center mr-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                Beam Intensity & Voltage Correlation
              </h3>
              <InfoTooltip title="Data Correlation" text="Visualizes relationship between power supply stability (Gold) and beam particle retention (Cyan). Drops in voltage often precede beam loss.">
                <Info size={14} className="text-slate-500 hover:text-white" />
              </InfoTooltip>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorBeam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#94a3b8" fontSize={12} tick={{dy: 10}} />
                <YAxis yAxisId="left" stroke="#06b6d4" fontSize={12} domain={['auto', 'auto']} />
                <YAxis yAxisId="right" orientation="right" stroke="#fbbf24" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                  itemStyle={{ color: '#f8fafc' }}
                  labelFormatter={(label) => formatTime(label)}
                />
                <Area yAxisId="left" type="monotone" dataKey="beamIntensity" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBeam)" strokeWidth={2} name="Intensity" />
                <Line yAxisId="right" type="monotone" dataKey="inputVoltage" stroke="#fbbf24" strokeWidth={2} dot={false} name="Voltage" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center mb-4">
              <h3 className="text-white font-medium flex items-center mr-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Magnet Temperature (Cryogenics)
              </h3>
              <InfoTooltip title="Cryogenic Stability" text="Tracks temperature fluctuations in the superfluid helium cooling system. Spikes above 2.17K (Lambda point) risk quenching the magnets.">
                <Info size={14} className="text-slate-500 hover:text-white" />
              </InfoTooltip>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#94a3b8" fontSize={12} tick={{dy: 10}} />
                <YAxis stroke="#60a5fa" fontSize={12} domain={[1.8, 2.1]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  labelFormatter={(label) => formatTime(label)}
                />
                <Line type="stepAfter" dataKey="magnetTemperature" stroke="#60a5fa" strokeWidth={2} dot={false} name="Temp (K)" />
                <Line type="monotone" dataKey="magnetTemperature" stroke="#60a5fa" strokeWidth={0} strokeOpacity={0.1} dot={{r: 4, fill: '#60a5fa'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentMonitor;