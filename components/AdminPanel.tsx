import React, { useState } from 'react';
import { User, Role, UserStatus } from '../types';
import { Shield, UserPlus, Trash2, Key, Info, Edit2, Check, X, Building, UserCheck, AlertOctagon } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  departments: string[];
  onAddUser: (user: Omit<User, 'id' | 'joinedAt'>) => void;
  onDeleteUser: (id: string) => void;
  onUpdateUserRole: (id: string, role: Role) => void;
  onApproveUser: (id: string) => void;
  onRejectUser: (id: string) => void;
  onAddDepartment: (dept: string) => void;
  onDeleteDepartment: (dept: string) => void;
}

const InfoTooltip = ({ text, title, children }: { text: string, title?: string, children?: React.ReactNode }) => (
  <div className="group relative inline-flex items-center cursor-help ml-2">
    {children || <Info size={14} className="text-slate-500 hover:text-cyan-400 transition-colors" />}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 border border-slate-600 rounded-lg text-xs text-slate-200 shadow-xl z-50 pointer-events-none text-center">
      {title && <div className="font-bold text-white mb-1 border-b border-slate-700 pb-1">{title}</div>}
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-600"></div>
    </div>
  </div>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    users, departments, onAddUser, onDeleteUser, onUpdateUserRole, 
    onApproveUser, onRejectUser, onAddDepartment, onDeleteDepartment 
}) => {
    const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'departments'>('users');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', department: '', role: Role.SCIENTIST, avatar: '', status: UserStatus.ACTIVE });
    const [newDeptName, setNewDeptName] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    const pendingUsers = users.filter(u => u.status === UserStatus.PENDING);
    const activeUsers = users.filter(u => u.status === UserStatus.ACTIVE);

    const handleAddUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddUser({
            ...newUser,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random`
        });
        setIsAddUserModalOpen(false);
        setNewUser({ name: '', email: '', department: departments[0] || '', role: Role.SCIENTIST, avatar: '', status: UserStatus.ACTIVE });
    };

    const handleAddDeptSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(newDeptName) {
            onAddDepartment(newDeptName);
            setNewDeptName('');
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        Administration
                        <InfoTooltip text="Central command for User Access, Department Structure, and Security Protocols." />
                    </h1>
                    <p className="text-slate-400 text-sm">Manage personnel, approvals, and organizational structure</p>
                </div>
                <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Requests
                        {pendingUsers.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingUsers.length}</span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('departments')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'departments' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Departments
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold">Total Personnel</p>
                        <p className="text-2xl text-white font-mono font-bold">{users.length}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><UserCheck size={24}/></div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold">Pending Requests</p>
                        <p className={`text-2xl font-mono font-bold ${pendingUsers.length > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{pendingUsers.length}</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400"><AlertOctagon size={24}/></div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold">Departments</p>
                        <p className="text-2xl text-white font-mono font-bold">{departments.length}</p>
                    </div>
                    <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400"><Building size={24}/></div>
                </div>
            </div>

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl animate-fadeIn">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur flex justify-between items-center">
                        <h3 className="text-white font-medium flex items-center">
                            Authorized Personnel
                        </h3>
                        <button 
                            onClick={() => setIsAddUserModalOpen(true)}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-500 flex items-center space-x-1"
                        >
                            <UserPlus size={14} />
                            <span>Add User</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase">
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium">Department</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {activeUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <img src={u.avatar} alt="" className="w-8 h-8 rounded-full mr-3 border border-slate-600" />
                                                <div>
                                                    <div className="text-slate-200 font-medium text-sm">{u.name}</div>
                                                    <div className="text-slate-500 text-xs">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {editingUserId === u.id ? (
                                                <select 
                                                    value={u.role}
                                                    onChange={(e) => {
                                                        onUpdateUserRole(u.id, e.target.value as Role);
                                                        setEditingUserId(null);
                                                    }}
                                                    className="bg-slate-900 border border-slate-600 text-xs text-white rounded px-2 py-1 focus:border-cyan-500 outline-none"
                                                >
                                                    {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            ) : (
                                                <span 
                                                    className={`px-2 py-1 rounded text-[10px] font-bold font-mono uppercase cursor-pointer hover:opacity-80
                                                        ${u.role === Role.ADMIN ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                                                          u.role === Role.ENGINEER ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                                                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}
                                                    onClick={() => setEditingUserId(u.id)}
                                                    title="Click to edit role"
                                                >
                                                    {u.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm">{u.department}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                ACTIVE
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button 
                                                    onClick={() => setEditingUserId(editingUserId === u.id ? null : u.id)}
                                                    className="text-slate-500 hover:text-cyan-400 transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => onDeleteUser(u.id)}
                                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl animate-fadeIn">
                     <div className="p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur">
                        <h3 className="text-white font-medium">Access Requests</h3>
                    </div>
                    {pendingUsers.length === 0 ? (
                         <div className="p-8 text-center text-slate-500 text-sm">No pending access requests.</div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {pendingUsers.map(u => (
                                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-700/20">
                                    <div className="flex items-center gap-4">
                                        <img src={u.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-600 grayscale" />
                                        <div>
                                            <p className="text-white font-medium text-sm">{u.name}</p>
                                            <p className="text-slate-500 text-xs">{u.email}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 border border-slate-600">Requested: {u.role}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 border border-slate-600">Dept: {u.department}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onRejectUser(u.id)}
                                            className="px-3 py-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium flex items-center gap-1"
                                        >
                                            <X size={14}/> Reject
                                        </button>
                                        <button 
                                            onClick={() => onApproveUser(u.id)}
                                            className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-xs font-medium flex items-center gap-1 shadow-lg shadow-green-900/20"
                                        >
                                            <Check size={14}/> Approve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* DEPARTMENTS TAB */}
            {activeTab === 'departments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden p-6">
                        <h3 className="text-white font-medium mb-4">Add Department</h3>
                        <form onSubmit={handleAddDeptSubmit} className="flex gap-2">
                            <input 
                                type="text" 
                                value={newDeptName}
                                onChange={e => setNewDeptName(e.target.value)}
                                placeholder="Department Name (e.g. BE - Physics)"
                                className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none"
                            />
                            <button type="submit" disabled={!newDeptName} className="px-4 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-500 disabled:opacity-50">Add</button>
                        </form>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden p-0">
                        <div className="p-4 border-b border-slate-700 bg-slate-800/80">
                            <h3 className="text-white font-medium">Existing Departments</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-slate-700">
                            {departments.map((dept, idx) => (
                                <div key={idx} className="p-3 flex justify-between items-center hover:bg-slate-700/20">
                                    <span className="text-slate-300 text-sm">{dept}</span>
                                    <button 
                                        onClick={() => onDeleteDepartment(dept)}
                                        className="text-slate-500 hover:text-red-400 p-1"
                                        title="Delete Department"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Add New User</h3>
                            <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleAddUserSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none"/>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none"/>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                                <select required value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none">
                                    <option value="" disabled>Select Department</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none">
                                    {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="mr-3 px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;