import React, { useState } from 'react';
import { PowerConverter, ConverterStatus } from '../types';
import { AlertTriangle, CheckCircle, XCircle, Wrench, Filter, ClipboardList, Zap, Info, X, Activity, Thermometer, Cpu, BrainCircuit } from 'lucide-react';
import { generateMaintenanceReport, runConverterDiagnostics } from '../services/geminiService';

const MOCK_CONVERTERS: PowerConverter[] = [
  { id: 'PC-LHC-001', name: 'Main Dipole Circuit A', sector: 'S1-2', status: ConverterStatus.HEALTHY, outputCurrent: 11850, temperature: 42, lastMaintenance: '2023-11-15', efficiency: 98.5 },
  { id: 'PC-LHC-002', name: 'Quadrupole Focus L', sector: 'S1-2', status: ConverterStatus.WARNING, outputCurrent: 5400, temperature: 65, lastMaintenance: '2023-09-10', efficiency: 92.1 },
  { id: 'PC-LHC-003', name: 'Corrector Dipole V', sector: 'S2-3', status: ConverterStatus.CRITICAL, outputCurrent: 0, temperature: 22, lastMaintenance: '2023-12-01', efficiency: 0 },
  { id: 'PC-SPS-104', name: 'Injection Kicker', sector: 'S4-5', status: ConverterStatus.HEALTHY, outputCurrent: 2500, temperature: 38, lastMaintenance: '2024-01-20', efficiency: 99.1 },
  { id: 'PC-SPS-105', name: 'Extraction Septum', sector: 'S4-5', status: ConverterStatus.MAINTENANCE, outputCurrent: 0, temperature: 20, lastMaintenance: '2024-05-18', efficiency: 0 },
  { id: 'PC-LIN-009', name: 'RF Power Source', sector: 'S3-4', status: ConverterStatus.WARNING, outputCurrent: 800, temperature: 58, lastMaintenance: '2023-10-30', efficiency: 89.4 },
];

const InfoTooltip = ({ text, children }: { text: string, children?: React.ReactNode }) => (
  <div className="group relative inline-flex items-center cursor-help ml-1">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 border border-slate-600 rounded-md text-xs text-slate-300 shadow-xl z-50 text-center">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-600"></div>
    </div>
  </div>
);

const PowerConverterHealth: React.FC = () => {
  const [converters, setConverters] = useState<PowerConverter[]>(MOCK_CONVERTERS);
  const [filter, setFilter] = useState<string>('ALL');
  const [report, setReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Details Modal State
  const [selectedConverter, setSelectedConverter] = useState<PowerConverter | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [runningDiag, setRunningDiag] = useState(false);

  const getStatusColor = (status: ConverterStatus) => {
    switch (status) {
      case ConverterStatus.HEALTHY: return 'text-green-400 bg-green-500/10 border-green-500/20';
      case ConverterStatus.WARNING: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case ConverterStatus.CRITICAL: return 'text-red-400 bg-red-500/10 border-red-500/20';
      case ConverterStatus.MAINTENANCE: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: ConverterStatus) => {
    switch (status) {
      case ConverterStatus.HEALTHY: return <CheckCircle size={16} />;
      case ConverterStatus.WARNING: return <AlertTriangle size={16} />;
      case ConverterStatus.CRITICAL: return <XCircle size={16} />;
      case ConverterStatus.MAINTENANCE: return <Wrench size={16} />;
    }
  };

  const filteredConverters = filter === 'ALL' 
    ? converters 
    : converters.filter(c => c.status === filter);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    const result = await generateMaintenanceReport(converters);
    setReport(result);
    setGeneratingReport(false);
  };

  const handleRunDiagnostics = async (converter: PowerConverter) => {
    setRunningDiag(true);
    setDiagnosticResult(null);
    const result = await runConverterDiagnostics(converter);
    setDiagnosticResult(result);
    setRunningDiag(false);
  };

  const openDetails = (converter: PowerConverter) => {
    setSelectedConverter(converter);
    setDiagnosticResult(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            Power Converter Health
            <InfoTooltip text="High-precision AC/DC converters powering magnets and RF systems.">
                <Info size={16} className="text-slate-500 ml-2 hover:text-white" />
            </InfoTooltip>
          </h1>
          <p className="text-slate-400 text-sm">Status tracking and predictive maintenance</p>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-500 disabled:opacity-50 flex items-center space-x-2"
            >
                <ClipboardList size={16} />
                <span>{generatingReport ? 'Generating Plan...' : 'AI Maintenance Plan'}</span>
            </button>
        </div>
      </div>

      {report && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <Zap className="mr-2 text-yellow-400" size={20}/> 
                    AI Generated Action Plan
                </h3>
                <button onClick={() => setReport(null)} className="text-slate-500 hover:text-white">Close</button>
            </div>
            <div className="prose prose-invert max-w-none prose-sm font-mono whitespace-pre-line text-slate-300">
                {report}
            </div>
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700 flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-2 text-sm text-slate-400 mr-4">
            <Filter size={16} />
            <span>Filter Status:</span>
          </div>
          {['ALL', 'HEALTHY', 'WARNING', 'CRITICAL', 'MAINTENANCE'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                filter === status 
                  ? 'bg-slate-600 text-white border-slate-500' 
                  : 'bg-slate-900/50 text-slate-400 border-transparent hover:border-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider font-mono">
                <th className="p-4 font-medium border-b border-slate-700">ID</th>
                <th className="p-4 font-medium border-b border-slate-700">Name</th>
                <th className="p-4 font-medium border-b border-slate-700">Sector</th>
                <th className="p-4 font-medium border-b border-slate-700">Status</th>
                <th className="p-4 font-medium border-b border-slate-700 text-right">
                    <span className="flex items-center justify-end">
                        Output (A)
                        <InfoTooltip text="DC current output in Amperes. Critical for magnet field strength." >
                            <Info size={12} className="text-slate-500 ml-1 hover:text-white" />
                        </InfoTooltip>
                    </span>
                </th>
                <th className="p-4 font-medium border-b border-slate-700 text-right">Temp (°C)</th>
                <th className="p-4 font-medium border-b border-slate-700 text-right">
                    <span className="flex items-center justify-end">
                        Efficiency
                        <InfoTooltip text="Power conversion efficiency ratio. Lower values indicate potential component degradation." >
                            <Info size={12} className="text-slate-500 ml-1 hover:text-white" />
                        </InfoTooltip>
                    </span>
                </th>
                <th className="p-4 font-medium border-b border-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredConverters.map((converter) => (
                <tr key={converter.id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="p-4 font-mono text-sm text-cyan-400">{converter.id}</td>
                  <td className="p-4 text-sm font-medium text-white">{converter.name}</td>
                  <td className="p-4 text-sm text-slate-400">{converter.sector}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(converter.status)}`}>
                      {getStatusIcon(converter.status)}
                      <span>{converter.status}</span>
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right font-mono text-slate-300">{converter.outputCurrent.toLocaleString()}</td>
                  <td className="p-4 text-sm text-right font-mono text-slate-300">
                    <span className={converter.temperature > 60 ? 'text-red-400 font-bold' : ''}>
                      {converter.temperature}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right font-mono text-slate-300">{converter.efficiency}%</td>
                  <td className="p-4">
                    <button 
                        onClick={() => openDetails(converter)}
                        className="text-cyan-500 hover:text-cyan-300 transition-colors text-sm underline opacity-0 group-hover:opacity-100 font-medium"
                    >
                        Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedConverter && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-end">
            <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-700 h-full p-6 overflow-y-auto shadow-2xl animate-slideLeft">
                <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <h2 className="text-2xl font-bold text-white">{selectedConverter.id}</h2>
                             <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(selectedConverter.status)}`}>
                                {selectedConverter.status}
                             </span>
                        </div>
                        <p className="text-slate-400">{selectedConverter.name} • Sector {selectedConverter.sector}</p>
                    </div>
                    <button onClick={() => setSelectedConverter(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                     <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center text-slate-400 text-xs mb-1"><Activity size={12} className="mr-1"/> Output Current</div>
                        <div className="text-xl font-mono text-white">{selectedConverter.outputCurrent} <span className="text-xs text-slate-500">A</span></div>
                     </div>
                     <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center text-slate-400 text-xs mb-1"><Thermometer size={12} className="mr-1"/> Temperature</div>
                        <div className={`text-xl font-mono ${selectedConverter.temperature > 60 ? 'text-red-400' : 'text-white'}`}>{selectedConverter.temperature} <span className="text-xs text-slate-500">°C</span></div>
                     </div>
                     <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                         <div className="flex items-center text-slate-400 text-xs mb-1"><Cpu size={12} className="mr-1"/> Efficiency</div>
                        <div className="text-xl font-mono text-white">{selectedConverter.efficiency} <span className="text-xs text-slate-500">%</span></div>
                     </div>
                </div>

                {/* Sub Components Status (Mock) */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Sub-Component Status</h3>
                    <div className="space-y-2">
                         <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                             <span className="text-sm text-slate-300">IGBT Gate Drivers</span>
                             <div className="flex items-center space-x-2">
                                 <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                     <div className="h-full bg-green-500 w-[95%]"></div>
                                 </div>
                                 <span className="text-xs text-green-400">OK</span>
                             </div>
                         </div>
                         <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                             <span className="text-sm text-slate-300">DC Link Capacitors</span>
                             <div className="flex items-center space-x-2">
                                 <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                     <div className={`h-full w-[80%] ${selectedConverter.status === 'CRITICAL' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                 </div>
                                 <span className={`text-xs ${selectedConverter.status === 'CRITICAL' ? 'text-red-400' : 'text-green-400'}`}>
                                     {selectedConverter.status === 'CRITICAL' ? 'DEGRADED' : 'NOMINAL'}
                                 </span>
                             </div>
                         </div>
                         <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                             <span className="text-sm text-slate-300">Water Cooling Flux</span>
                             <div className="flex items-center space-x-2">
                                 <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                     <div className={`h-full w-[100%] ${selectedConverter.temperature > 50 ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                                 </div>
                                 <span className="text-xs text-slate-400">12.5 L/min</span>
                             </div>
                         </div>
                    </div>
                </div>

                {/* AI Diagnostics Section */}
                <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="text-indigo-400" size={20}/>
                            <h3 className="text-indigo-100 font-medium">AI Diagnostics Module</h3>
                        </div>
                        <button 
                            onClick={() => handleRunDiagnostics(selectedConverter)}
                            disabled={runningDiag}
                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                        >
                            {runningDiag ? 'Running Analysis...' : 'Run Diagnostics'}
                        </button>
                    </div>

                    {diagnosticResult ? (
                        <div className="text-sm text-indigo-200 font-mono leading-relaxed bg-indigo-950/30 p-4 rounded-lg border border-indigo-500/10 whitespace-pre-line animate-fadeIn">
                            {diagnosticResult}
                        </div>
                    ) : (
                        <p className="text-xs text-indigo-300/50 italic">Click run to perform deep-level telemetry analysis on this unit.</p>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Maintenance History</h3>
                    <div className="text-xs font-mono text-slate-500">
                        <p>2024-01-20: Routine Filter Replacement (Tech: H. Weber)</p>
                        <p>2023-11-15: Annual Calibration - PASSED</p>
                        <p>2023-08-02: Firmware Update v4.5.2</p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PowerConverterHealth;