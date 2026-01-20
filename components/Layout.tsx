import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Settings, 
  LogOut, 
  Menu,
  ShieldCheck,
  Search,
  Bell,
  Info,
  X,
  Check,
  Radio,
  Atom
} from 'lucide-react';
import { User, Role, Notification, ChatMessage } from '../types';
import CernAIAssistant from './CernAIAssistant';
import GlobalChat from './GlobalChat';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  notifications: Notification[];
  onClearNotifications: () => void;
  lhcMode: string;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onlineUsersCount: number;
}

// Internal reusable tooltip for Layout elements
const InfoTooltip = ({ text, title, children, className="" }: { text: string, title?: string, children?: React.ReactNode, className?: string }) => (
  <div className={`group relative inline-flex items-center cursor-help ${className}`}>
    {children || <Info size={16} className="text-slate-400" />}
    <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-200 shadow-xl z-[100] text-left">
      {title && <div className="font-bold text-white mb-1 border-b border-slate-700 pb-1">{title}</div>}
      {text}
    </div>
  </div>
);

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  currentView, 
  onNavigate, 
  onLogout,
  notifications,
  onClearNotifications,
  lhcMode,
  chatMessages,
  onSendMessage,
  onlineUsersCount
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getModeColor = (mode: string) => {
      switch(mode) {
          case 'STABLE BEAMS': return 'text-green-400 border-green-500/50 bg-green-500/10';
          case 'RAMP': return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
          case 'INJECTION': return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
          case 'BEAM DUMP': return 'text-red-400 border-red-500/50 bg-red-500/10';
          default: return 'text-slate-400';
      }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: string; icon: any; label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        currentView === view 
          ? 'bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-400' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex overflow-hidden">
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
            <div className="flex items-center group relative cursor-help h-full">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                   <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                </div>
                <span className="text-lg font-bold text-white tracking-wider">CERN<span className="text-cyan-500 text-xs ml-1 font-mono">CTS</span></span>
                
                <div className="absolute left-0 top-12 hidden group-hover:block w-56 p-3 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 shadow-xl z-[100]">
                  <p className="font-bold text-white mb-1">Control Tools Suite</p>
                   Unified interface for experiment monitoring and equipment health tracking.
                </div>
            </div>
            
            {/* Mobile Close Button */}
            <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
            >
                <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 space-y-1 px-3">
            <div className="px-4 mb-2 text-xs font-mono text-slate-500 uppercase tracking-widest">Modules</div>
            <NavItem view="dashboard" icon={Activity} label="Exp. Monitor" />
            <NavItem view="power" icon={Zap} label="Power Converters" />
            <NavItem view="simulation" icon={Atom} label="Collider Sim" />
            <NavItem view="logs" icon={Settings} label="System Logs" />
            
            {user.role === Role.ADMIN && (
              <>
                <div className="px-4 mt-8 mb-2 text-xs font-mono text-slate-500 uppercase tracking-widest">Administration</div>
                <NavItem view="admin" icon={ShieldCheck} label="Access Control" />
              </>
            )}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full border border-slate-600 object-cover" />
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1">
                   <p className="text-xs text-cyan-500 truncate font-mono">{user.role}</p>
                   <span className="text-[10px] text-slate-500">• {user.department}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="mt-3 w-full flex items-center justify-center space-x-2 py-2 text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 relative">
        {/* Mobile Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
          
          <div className="hidden md:flex items-center text-slate-400 text-sm font-mono group relative cursor-help">
            <div className={`flex items-center px-3 py-1 rounded border ${getModeColor(lhcMode)}`}>
                 <Radio size={14} className="mr-2 animate-pulse" />
                 <span className="font-bold tracking-widest text-xs">{lhcMode}</span>
            </div>
            <span className="mx-3 text-slate-600">|</span>
            <span className="text-xs text-slate-500">LHC FILL #8932</span>
            
            <div className="absolute top-8 left-0 hidden group-hover:block w-72 p-3 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 shadow-xl z-50">
              <div className="font-bold text-white mb-1">LHC Operational Mode</div>
              <p>Current machine state.</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                 type="text" 
                 placeholder="Search assets..." 
                 className="bg-slate-800 border-none rounded-full py-1.5 pl-10 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none w-64"
               />
               <InfoTooltip title="Asset Search" text="Find sensors, magnets, or converters by ID (e.g., 'PC-LHC-001') or sector name." className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 opacity-0 hover:opacity-100 cursor-help"></div>
               </InfoTooltip>
            </div>
            
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative text-slate-400 hover:text-cyan-400 transition-colors block p-1"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border border-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                    <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                      <h4 className="text-sm font-semibold text-white">Notifications</h4>
                      {notifications.length > 0 && (
                        <button onClick={onClearNotifications} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                          <Check size={12} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors flex items-start gap-3 relative">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                            <div>
                              <p className="text-sm text-slate-200 font-medium">{n.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                              <p className="text-[10px] text-slate-500 mt-1 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </main>
        
        {/* Floating Widgets - Swapped order to ensure AI Assistant (z-80) stacks on top of Global Chat (z-60) naturally */}
        <GlobalChat 
            currentUser={user} 
            messages={chatMessages} 
            onSendMessage={onSendMessage} 
            onlineUsersCount={onlineUsersCount} 
        />
        <CernAIAssistant user={user} context={{ view: currentView }} />
      </div>
    </div>
  );
};

export default Layout;