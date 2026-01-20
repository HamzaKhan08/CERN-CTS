import React, { useState, useEffect, useRef } from 'react';
import { SystemLog } from '../types';
import { Terminal, Filter, Download, Pause, Play, Search, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

interface SystemLogsProps {
  logs: SystemLog[];
}

const InfoTooltip = ({ text, title, children }: { text: string, title?: string, children?: React.ReactNode }) => (
  <div className="group relative inline-flex items-center cursor-help">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 border border-slate-600 rounded-lg text-xs text-slate-200 shadow-xl z-50 pointer-events-none text-center">
      {title && <div className="font-bold text-white mb-1 border-b border-slate-700 pb-1">{title}</div>}
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-600"></div>
    </div>
  </div>
);

const SystemLogs: React.FC<SystemLogsProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'ALL' || log.level === filter;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.module.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (isAutoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isAutoScroll]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'text-blue-400';
      case 'WARN': return 'text-amber-400';
      case 'ERROR': return 'text-red-400';
      case 'SUCCESS': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'INFO': return <Info size={14} />;
      case 'WARN': return <AlertCircle size={14} />;
      case 'ERROR': return <XCircle size={14} />;
      case 'SUCCESS': return <CheckCircle size={14} />;
      default: return <Terminal size={14} />;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toISOString().split('T')[1].slice(0, -1);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            System Logs
            <InfoTooltip title="Live Audit Trail" text="Real-time aggregation of system events, user actions, and hardware alerts." >
                <Info size={16} className="text-slate-500 ml-2 hover:text-white" />
            </InfoTooltip>
          </h1>
          <p className="text-slate-400 text-sm">Real-time event monitoring and audit trail</p>
        </div>
        <div className="flex items-center space-x-2">
            <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                    type="text" 
                    placeholder="Search logs..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-md py-1.5 pl-8 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500 w-48"
                />
            </div>
            <button 
                onClick={() => setIsAutoScroll(!isAutoScroll)}
                className={`p-2 rounded-md border ${isAutoScroll ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-600 text-slate-400'}`}
                title={isAutoScroll ? "Pause Scrolling" : "Resume Auto-scroll"}
            >
                {isAutoScroll ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button className="p-2 bg-slate-800 text-slate-300 rounded-md border border-slate-700 hover:bg-slate-700">
                <Download size={16} />
            </button>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col flex-1 shadow-2xl font-mono text-sm relative">
        {/* Terminal Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center space-x-2">
            <div className="flex space-x-1.5 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <span className="text-slate-500 text-xs">root@cern-cts:~# tail -f /var/log/syslog</span>
            <div className="ml-auto flex space-x-2">
                {['ALL', 'INFO', 'WARN', 'ERROR'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`text-[10px] px-2 py-0.5 rounded uppercase ${
                            filter === f 
                            ? 'bg-slate-700 text-white' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        {/* Log Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar bg-slate-950/95">
            {filteredLogs.length === 0 && (
                <div className="text-slate-600 italic text-center py-10">-- No logs match current filter --</div>
            )}
            {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 hover:bg-white/5 p-0.5 rounded transition-colors group">
                    <span className="text-slate-600 w-24 flex-shrink-0 select-none">{formatTime(log.timestamp)}</span>
                    <span className={`w-16 flex-shrink-0 font-bold flex items-center gap-1 ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        {log.level}
                    </span>
                    <span className="text-cyan-600/70 w-24 flex-shrink-0 hidden md:block">[{log.module}]</span>
                    <span className="text-slate-300 flex-1 break-all">
                        {log.message}
                        {log.user && <span className="text-slate-500 ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">user: {log.user}</span>}
                    </span>
                </div>
            ))}
            <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;