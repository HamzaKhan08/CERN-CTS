import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, User, Database } from 'lucide-react';
import { User as UserType, Role } from '../types';
import { chatWithCernAI } from '../services/geminiService';

interface CernAIAssistantProps {
    user: UserType;
    context: any; // Context data from the current view
}

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: number;
}

const CernAIAssistant: React.FC<CernAIAssistantProps> = ({ user, context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'init', sender: 'ai', text: `Greetings, ${user.name}. I am CERN-AI. Connected to system telemetry. How can I assist your ${user.role.toLowerCase()} operations today?`, timestamp: Date.now() }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputText, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        const responseText = await chatWithCernAI(userMsg.text, user.role, context);

        const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: responseText, timestamp: Date.now() };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 group border border-white/10"
            >
                <Bot className="text-white" size={28} />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
                    CERN-AI Assistant
                </div>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl z-[80] overflow-hidden flex flex-col transition-all duration-300 ${isMinimized ? 'w-72 h-14' : 'w-80 md:w-96 h-[500px]'}`}>
            {/* Header */}
            <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 rounded-lg">
                        <Bot size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white leading-none">CERN-AI</h3>
                        <span className="text-[10px] text-green-400 font-mono">ONLINE • {user.role} MODE</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
                        {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
                         {messages.map((msg) => (
                             <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                                     {msg.sender === 'ai' && <div className="text-[10px] text-indigo-400 font-bold mb-1 flex items-center gap-1"><Sparkles size={10}/> AI ANALYSIS</div>}
                                     {msg.text}
                                 </div>
                             </div>
                         ))}
                         {isTyping && (
                             <div className="flex justify-start">
                                 <div className="bg-slate-800 rounded-2xl rounded-bl-none p-3 border border-slate-700">
                                     <div className="flex space-x-1">
                                         <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                                         <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                                         <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                                     </div>
                                 </div>
                             </div>
                         )}
                         <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-slate-800 border-t border-slate-700">
                         {context && (
                            <div className="flex items-center gap-1 mb-2 text-[10px] text-slate-500 px-1">
                                <Database size={10} />
                                <span>Accessing live context from {context.view || 'System'}</span>
                            </div>
                         )}
                         <form onSubmit={handleSend} className="relative">
                             <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Query system parameters..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:border-indigo-500 focus:outline-none"
                             />
                             <button type="submit" disabled={!inputText.trim() || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-400 disabled:opacity-50 p-1">
                                 <Send size={18} />
                             </button>
                         </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default CernAIAssistant;