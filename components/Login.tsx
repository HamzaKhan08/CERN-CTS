import React, { useState } from 'react';
import { Role } from '../types';
import { Lock, Info, Mail, User as UserIcon, ArrowRight, Building, AlertTriangle } from 'lucide-react';

interface LoginProps {
    onLogin: (email: string, role: Role, name?: string, department?: string) => void;
    departments: string[];
    error?: string | null;
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

const Login: React.FC<LoginProps> = ({ onLogin, departments, error }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role>(Role.SCIENTIST);
    const [selectedDept, setSelectedDept] = useState('');
    const [requestSent, setRequestSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, selectedRole, isSignUp ? name : undefined, isSignUp ? selectedDept : undefined);
        if (isSignUp) {
            setRequestSent(true);
            setTimeout(() => setRequestSent(false), 5000); // Reset for UI interaction
        }
    };

    if (requestSent && isSignUp) {
         return (
             <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                 <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center">
                     <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Lock size={32} />
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-2">Access Requested</h2>
                     <p className="text-slate-400 text-sm mb-6">Your clearance request has been forwarded to the Administration Board. You will be able to log in once an Admin approves your credentials.</p>
                     <button onClick={() => { setIsSignUp(false); setRequestSent(false); }} className="text-cyan-400 hover:text-cyan-300 text-sm">Return to Login</button>
                 </div>
             </div>
         )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 transition-all duration-300">
                <div className="flex flex-col items-center mb-6">
                    <div className="relative group cursor-help transition-transform hover:scale-105 duration-300">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] rotate-3">
                            <Lock className="text-white" size={28} />
                        </div>
                        <div className="absolute top-0 right-0">
                             <InfoTooltip title="System Access" text="Secure gateway for CERN Control Tools Suite. Authentication is logged." >
                                <div className="bg-slate-800 rounded-full p-1 border border-slate-600 hover:border-cyan-400 transition-colors"><Info size={12} className="text-slate-400 hover:text-white"/></div>
                             </InfoTooltip>
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        CERN<span className="text-cyan-400 font-mono">CTS</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium">{isSignUp ? 'Request Security Clearance' : 'Identify Authenticate'}</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-6 flex items-start gap-3">
                        <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                        <p className="text-red-400 text-xs">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input 
                                        type="text" 
                                        required 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                                        placeholder="Dr. Freeman"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Department</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <select 
                                        required 
                                        value={selectedDept}
                                        onChange={(e) => setSelectedDept(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="" disabled>Select Department</option>
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}
                    
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Official Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                                placeholder="user@cern.ch"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                         <div className="flex items-center gap-2 mb-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Clearance Level</label>
                            <InfoTooltip text={isSignUp ? "Select the role you are requesting." : "Select your assigned role."} >
                                <Info size={12} className="text-slate-500 hover:text-white cursor-pointer" />
                            </InfoTooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(Role).map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setSelectedRole(role)}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                                        selectedRole === role 
                                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-cyan-900/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <span>{isSignUp ? 'Submit Request' : 'Access System'}</span>
                        <ArrowRight size={16} />
                    </button>
                </form>

                <div className="mt-6 text-center border-t border-slate-800 pt-4">
                    <button 
                        onClick={() => { setIsSignUp(!isSignUp); setRequestSent(false); }}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                        {isSignUp ? 'Already have credentials? Login' : 'Need access? Request Clearance'}
                    </button>
                </div>
                
                <div className="mt-8 text-center opacity-40">
                    <p className="text-[10px] text-slate-500 font-mono">SECURE CONNECTION ESTABLISHED • TLS 1.3</p>
                </div>
            </div>
        </div>
    );
};

export default Login;