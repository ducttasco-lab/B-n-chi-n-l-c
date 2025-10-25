// components/ai/ChatHistorySidebar.tsx
import React from 'react';
import { Conversation } from '../../types.ts';
import { ChatBubbleLeftRightIcon, PlusIcon, TrashIcon } from '../icons.tsx';

interface ChatHistorySidebarProps {
    history: Conversation[];
    activeConversationId: string | null;
    onSelect: (id: string) => void;
    onNew: () => void;
    onDelete: (id: string) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({ history, activeConversationId, onSelect, onNew, onDelete }) => {
    
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Hôm nay, ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return `Hôm qua, ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
        }
        return date.toLocaleDateString('vi-VN');
    };
    
    return (
        <aside className="w-72 bg-slate-100 flex flex-col flex-shrink-0 border-r border-slate-300">
            <div className="h-16 flex items-center justify-between p-4 border-b border-slate-300">
                <div className="flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-slate-600"/>
                    <h2 className="text-lg font-bold text-slate-800">Lịch sử</h2>
                </div>
                <button 
                    onClick={onNew}
                    className="p-2 rounded-md hover:bg-slate-200"
                    title="Cuộc trò chuyện mới"
                >
                    <PlusIcon className="w-5 h-5 text-slate-700"/>
                </button>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {history.map(convo => {
                    const isActive = activeConversationId === convo.id;
                    return (
                        <div key={convo.id} className="relative group">
                            <button
                                onClick={() => onSelect(convo.id)}
                                className={`w-full text-left p-2.5 rounded-md transition-colors text-sm truncate ${
                                    isActive 
                                    ? 'bg-blue-200 text-blue-800 font-semibold' 
                                    : 'text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                <p className="truncate">{convo.title}</p>
                                <p className={`text-xs mt-1 ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>{formatDate(convo.timestamp)}</p>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(window.confirm('Bạn có chắc muốn xóa cuộc trò chuyện này không?')) {
                                        onDelete(convo.id);
                                    }
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Xóa cuộc trò chuyện"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
                 {history.length === 0 && (
                    <p className="text-center text-sm text-slate-500 p-4">Chưa có cuộc trò chuyện nào.</p>
                )}
            </nav>
        </aside>
    );
};

export default ChatHistorySidebar;