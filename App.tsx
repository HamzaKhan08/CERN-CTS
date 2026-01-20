import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ExperimentMonitor from './components/ExperimentMonitor';
import PowerConverterHealth from './components/PowerConverterHealth';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import SystemLogs from './components/SystemLogs';
import CollisionSimulator from './components/CollisionSimulator';
import { User, Role, SystemLog, Notification, UserStatus, ChatMessage } from './types';

// Initial Mock Data
const INITIAL_USERS: User[] = [
  { id: '1', name: 'Hamza Khan', email: 'hamzakhan@cern.ch', role: Role.ADMIN, avatar: 'https://ui-avatars.com/api/?name=Hamza+Khan&background=0D8ABC&color=fff', department: 'Administration', joinedAt: '2023-01-15', status: UserStatus.ACTIVE },
  { id: '2', name: 'James Chen', email: 'j.chen@cern.ch', role: Role.SCIENTIST, avatar: 'https://ui-avatars.com/api/?name=James+Chen&background=random', department: 'BE - Physics', joinedAt: '2023-03-10', status: UserStatus.ACTIVE },
  { id: '3', name: 'Sarah Miller', email: 's.miller@cern.ch', role: Role.OPERATOR, avatar: 'https://ui-avatars.com/api/?name=Sarah+Miller&background=random', department: 'TE - Operations', joinedAt: '2023-06-22', status: UserStatus.ACTIVE },
  { id: '4', name: 'Hans Weber', email: 'h.weber@cern.ch', role: Role.ENGINEER, avatar: 'https://ui-avatars.com/api/?name=Hans+Weber&background=random', department: 'EN - Electrical', joinedAt: '2023-02-05', status: UserStatus.ACTIVE },
];

const INITIAL_DEPARTMENTS = [
    'Administration',
    'IT - Controls',
    'BE - Physics',
    'TE - Operations',
    'EN - Electrical',
    'EN - Cooling & Ventilation',
    'HSE - Safety'
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [departments, setDepartments] = useState<string[]>(INITIAL_DEPARTMENTS);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Real-Life CERN Feature: Machine Mode State Machine
  const [lhcMode, setLhcMode] = useState('STABLE BEAMS');

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
      { id: '1', userId: '2', userName: 'James Chen', userAvatar: 'https://ui-avatars.com/api/?name=James+Chen&background=random', text: 'Beam intensity looking good in Sector 4.', timestamp: Date.now() - 100000 }
  ]);

  // System Event & LHC Cycle Simulation
  useEffect(() => {
    if (!user) return;

    // Initial Welcome Log if just logged in (handled in handleLogin mostly, but safe here too)
    
    const interval = setInterval(() => {
      // 1. Simulate LHC Operation Cycle
      const modes = ['INJECTION', 'RAMP', 'STABLE BEAMS', 'STABLE BEAMS', 'STABLE BEAMS', 'BEAM DUMP', 'RAMP DOWN'];
      if (Math.random() > 0.9) {
          const nextMode = modes[Math.floor(Math.random() * modes.length)];
          if (nextMode !== lhcMode) {
              setLhcMode(nextMode);
              addLog('WARN', 'OP-LHC', `Machine mode changed to ${nextMode}`);
              // Trigger notification for critical mode changes
              if (nextMode === 'BEAM DUMP') {
                  const newNotif: Notification = {
                      id: Date.now().toString(),
                      title: 'BEAM DUMP TRIGGERED',
                      message: 'Automated beam dump sequence initiated by BIS.',
                      timestamp: Date.now(),
                      read: false,
                      type: 'error'
                  };
                  setNotifications(prev => [newNotif, ...prev]);
              }
          }
      }

      // 2. Randomly generate logs
      if (Math.random() > 0.7) {
        const modules = ['BEAM-OP', 'CRYOGENICS', 'POWER-CONVERTER', 'VACUUM', 'NET-SEC'];
        const levels: ('INFO' | 'WARN' | 'ERROR' | 'SUCCESS')[] = ['INFO', 'INFO', 'INFO', 'WARN', 'SUCCESS'];
        const messages = [
            'Routine calibration sequence started.',
            'Packet loss detected on subnet 10.0.4.x',
            'Magnet temperature stable at 1.9K.',
            'Beam injection sequence completed.',
            'Backup archive synchronized to tape.',
            'Minor voltage fluctuation in Sector 4.',
            'Cooling pump flow rate nominal.'
        ];
        
        const randomModule = modules[Math.floor(Math.random() * modules.length)];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        addLog(randomLevel, randomModule, randomMsg);
      }

      // 3. Randomly generate chat messages
      if (Math.random() > 0.85) {
          const randomUser = users.filter(u => u.id !== user.id && u.status === UserStatus.ACTIVE)[Math.floor(Math.random() * (users.length - 1))];
          if (randomUser) {
              const chatTexts = [
                  "Can someone check the cryo readings?",
                  "Confirmed, voltage spike was transient.",
                  "Coffee break in Building 40?",
                  "Deploying hotfix to frontend.",
                  "Who is on shift tonight?",
                  "Please approve the maintenance request."
              ];
              const newMsg: ChatMessage = {
                  id: Date.now().toString(),
                  userId: randomUser.id,
                  userName: randomUser.name,
                  userAvatar: randomUser.avatar,
                  text: chatTexts[Math.floor(Math.random() * chatTexts.length)],
                  timestamp: Date.now()
              };
              setChatMessages(prev => [...prev, newMsg]);
          }
      }

    }, 2000);

    return () => clearInterval(interval);
  }, [user, lhcMode, users]);

  const addLog = (level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', module: string, message: string) => {
    const newLog: SystemLog = {
      id: Date.now().toString() + Math.random().toString(),
      timestamp: Date.now(),
      level,
      module,
      message,
      user: Math.random() > 0.8 ? 'SYSTEM' : undefined
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  const handleLogin = (email: string, role: Role, name?: string, department?: string) => {
    setLoginError(null);
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        if (existingUser.status === UserStatus.PENDING) {
            setLoginError("Account pending approval. Please contact Admin (Hamza Khan).");
            return;
        }
        if (existingUser.status === UserStatus.REJECTED) {
            setLoginError("Access denied. Your account request was rejected.");
            return;
        }
        if (existingUser.status === UserStatus.INACTIVE) {
            setLoginError("Account is inactive.");
            return;
        }
        setUser(existingUser);
        addLog('INFO', 'AUTH', `User ${existingUser.name} logged in successfully.`);
    } else if (name) {
        // Sign Up Logic -> Pending Approval
        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            email: email,
            role: role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            department: department || 'Visitor',
            joinedAt: new Date().toISOString(),
            status: UserStatus.PENDING
        };
        setUsers(prev => [...prev, newUser]);
        // Do NOT log them in automatically
        addLog('WARN', 'AUTH', `New access request submitted: ${email}`);
    } else {
        // Simple login fallback if user not found but no name provided (shouldn't happen with UI)
        setLoginError("User not found. Please request access.");
    }
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    addLog('INFO', 'AUTH', `User ${user?.name} logged out.`);
    setUser(null);
    setCurrentView('dashboard');
    setLogs([]); 
  };

  // Admin Actions
  const handleAddUser = (userData: Omit<User, 'id' | 'joinedAt'>) => {
    const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
        joinedAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    addLog('SUCCESS', 'ADMIN', `Admin ${user?.name} created user ${newUser.email}`);
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    // PERMANENT DELETION: Removing from array means user must re-register
    setUsers(prev => prev.filter(u => u.id !== id));
    addLog('WARN', 'ADMIN', `Admin ${user?.name} permanently deleted user ${target?.email}`);

    // If the deleted user is the current user (edge case), force logout
    if (user?.id === id) {
        handleLogout();
    }
  };

  const handleUpdateUserRole = (id: string, role: Role) => {
     setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
     addLog('INFO', 'ADMIN', `User role updated for ID ${id} to ${role}`);
  };

  const handleApproveUser = (id: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: UserStatus.ACTIVE } : u));
      const target = users.find(u => u.id === id);
      addLog('SUCCESS', 'ADMIN', `Access request approved for ${target?.email} by ${user?.name}`);
  };

  const handleRejectUser = (id: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: UserStatus.REJECTED } : u));
      const target = users.find(u => u.id === id);
      addLog('WARN', 'ADMIN', `Access request rejected for ${target?.email} by ${user?.name}`);
  }

  const handleAddDepartment = (dept: string) => {
      if(!departments.includes(dept)) {
          setDepartments(prev => [...prev, dept]);
          addLog('INFO', 'ADMIN', `New department added: ${dept}`);
      }
  }

  const handleDeleteDepartment = (dept: string) => {
      setDepartments(prev => prev.filter(d => d !== dept));
      addLog('WARN', 'ADMIN', `Department deleted: ${dept}`);
  }

  const handleClearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleSendMessage = (text: string) => {
      if (!user) return;
      const newMsg: ChatMessage = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          text: text,
          timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, newMsg]);
  };

  if (!user) {
    return <Login onLogin={handleLogin} departments={departments} error={loginError} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ExperimentMonitor />;
      case 'power':
        return <PowerConverterHealth />;
      case 'simulation':
        return <CollisionSimulator />;
      case 'admin':
        return user.role === Role.ADMIN ? (
            <AdminPanel 
                users={users} 
                departments={departments}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                onUpdateUserRole={handleUpdateUserRole}
                onApproveUser={handleApproveUser}
                onRejectUser={handleRejectUser}
                onAddDepartment={handleAddDepartment}
                onDeleteDepartment={handleDeleteDepartment}
            />
        ) : (
            <div className="flex items-center justify-center h-full text-slate-500 flex-col">
                <div className="text-4xl mb-4">🚫</div>
                <h2 className="text-xl text-white">Access Denied</h2>
                <p>You require ADMIN clearance to view this module.</p>
            </div>
        );
      case 'logs':
        return <SystemLogs logs={logs} />;
      default:
        return <ExperimentMonitor />;
    }
  };

  return (
    <Layout 
      user={user} 
      currentView={currentView} 
      onNavigate={setCurrentView} 
      onLogout={handleLogout}
      notifications={notifications}
      onClearNotifications={handleClearNotifications}
      lhcMode={lhcMode}
      chatMessages={chatMessages}
      onSendMessage={handleSendMessage}
      onlineUsersCount={users.filter(u => u.status === UserStatus.ACTIVE).length + 32} // Mock + real
    >
      {renderView()}
    </Layout>
  );
};

export default App;