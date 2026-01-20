import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Users } from 'lucide-react';
import { User, ChatMessage } from '../types';

interface GlobalChatProps {
    currentUser: User;
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    onlineUsersCount: number;
}

const GlobalChat: React.FC<GlobalChatProps> = ({ currentUser, messages, onSendMessage, onlineUsersCount }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (messagesEndRef.current && isOpen && !isMinimized) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isMinimized]);

    useEffect(() => {
        if (!isOpen || isMinimized) {
             // Increment unread if chat is closed or minimized when new messages arrive
             setUnreadCount(prev => prev + 1);
        }
    }, [messages]);

    const handleOpen = () => {
        setIsOpen(true);
        setIsMinimized(false);
        setUnreadCount(0);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        onSendMessage(inputText);
        setInputText('');
    };

    if (!isOpen) {
        return (
            <button 
                onClick={handleOpen}
                className="fixed bottom-24 right-6 p-4 bg-slate-800 hover:bg-slate-700 rounded-full shadow-2xl transition-all border border-slate-600 z-[60] group"
            >
                <MessageSquare className="text-white" size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold border border-slate-900">
                        {unreadCount}
                    </span>
                )}
                <div className="absolute right-full mr-4 top-1/2 -translate-x-2 -translate-y-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-slate-700 whitespace-nowrap">
                    Team Chat ({onlineUsersCount} online)
                </div>
            </button>
        );
    }

    // Positioning logic: 
    // Mobile: bottom-24 right-6 (stacks above button area)
    // Desktop (md): bottom-6 right-[28rem] (moves to left of AI assistant to avoid overlap)
    return (
        <div className={`fixed z-[60] bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 
            ${isMinimized ? 'w-64 h-14' : 'w-80 h-[450px]'}
            bottom-24 right-6 md:bottom-6 md:right-[28rem]
        `}>
            {/* Header */}
            <div 
                className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700 cursor-pointer" 
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-cyan-400" />
                    <div>
                        <h3 className="text-sm font-bold text-white leading-none">CERN Team</h3>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            {onlineUsersCount} Online
                        </span>
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

            {/* Messages */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/95">
                        {messages.map((msg) => {
                            const isMe = msg.userId === currentUser.id;
                            return (
                                <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <img src={msg.userAvatar} alt="" className="w-6 h-6 rounded-full border border-slate-600 self-start mt-1" />
                                    <div className={`max-w-[80%] rounded-xl p-2.5 text-xs ${
                                        isMe 
                                        ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 rounded-tr-none' 
                                        : 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-none'
                                    }`}>
                                        {!isMe && <div className="text-[10px] font-bold text-slate-500 mb-0.5">{msg.userName}</div>}
                                        {msg.text}
                                        <div className="text-[9px] text-right mt-1 opacity-50">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-2 bg-slate-800 border-t border-slate-700">
                        <form onSubmit={handleSend} className="relative flex items-center gap-2">
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Message team..."
                                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg py-2 pl-3 pr-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                            />
                            <button type="submit" disabled={!inputText.trim()} className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-50 transition-colors">
                                <Send size={14} />
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default GlobalChat;