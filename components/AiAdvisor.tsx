// components/AiAdvisor.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, StrategicModel, SixVariablesModel } from '../types.ts';
import { getFullContextFromModel, generateText } from '../services/geminiService.ts';
import { SparklesIcon, SendIcon } from './icons.tsx';

interface AiAdvisorProps {
  strategicModel: StrategicModel;
  sixVariablesModel: SixVariablesModel;
  selectedNodeId: string | null;
  selectedVariableId: string | null;
  onNewResponse: (response: string) => void;
}

const AiAdvisor: React.FC<AiAdvisorProps> = ({ 
    strategicModel, 
    sixVariablesModel, 
    selectedNodeId, 
    selectedVariableId,
    onNewResponse 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    const fullContext = getFullContextFromModel(strategicModel, sixVariablesModel);
    
    let currentFocus = "Chúng ta đang xem xét bối cảnh chung.";
    if (selectedNodeId) {
        currentFocus = `[BỐI CẢNH THẢO LUẬN HIỆN TẠI]: Chúng ta đang tập trung vào yếu tố '${selectedNodeId}'.`;
    } else if (selectedVariableId) {
        const variable = sixVariablesModel[selectedVariableId];
        currentFocus = `[BỐI CẢNH THẢO LUẬN HIỆN TẠI]: Chúng ta đang tập trung vào biến số '${variable.name}'.\nGhi chú của người dùng về biến số này:\n${variable.questionAnswers.map(qa => qa.answer).filter(Boolean).join('\n')}`;
    }

    const historyForPrompt = messages.map(m => {
        if (m.role === 'user') return `[NGƯỜI DÙNG HỎI]: '${m.content}'`;
        if (m.role === 'ai') return `[AI TRẢ LỜI]:\n${m.content}`;
        return '';
    }).join('\n\n');

    const prompt = `[ĐÓNG VAI]: Bạn là một cố vấn chiến lược AI, chuyên sâu về mô hình của Fredmund Malik.
[TOÀN BỘ BỐI CẢNH DOANH NGHIỆP]:
${fullContext}
---
${currentFocus}
[LỊCH SỬ HỘI THOẠI GẦN ĐÂY]:
${historyForPrompt}
---
[NHIỆM VỤ]: Dựa vào TOÀN BỘ bối cảnh trên, hãy trả lời câu hỏi sau của người dùng một cách chi tiết, sâu sắc và mang tính hành động.
[CÂU HỎI CỦA NGƯỜI DÙNG]: ${userInput}`;
    
    const aiResponseContent = await generateText(prompt);
    
    onNewResponse(aiResponseContent);

    const aiMessage: ChatMessage = { role: 'ai', content: aiResponseContent, isMarkdown: true };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    // Basic markdown to HTML for presentation
    const formatContent = (content: string) => {
        if (!msg.isMarkdown) return content.replace(/\n/g, '<br/>');
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-lg shadow-sm ${isUser ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
            </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <header className="flex items-center justify-between p-3 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <SparklesIcon />
          <h2 className="text-lg font-semibold text-slate-800">Cố vấn AI</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => <MessageBubble key={index} msg={msg} />)}
        {isLoading && (
            <div className="flex justify-start">
                <div className="p-3 rounded-lg shadow-sm bg-slate-200 text-slate-500 italic animate-pulse">
                    AI đang suy nghĩ...
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
        <div className="relative">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Đặt câu hỏi cho Cố vấn AI..."
            rows={2}
            className="w-full p-3 pr-14 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={isLoading}
          />
          <div className="absolute right-2 bottom-2 flex space-x-1">
             <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                <SendIcon />
             </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AiAdvisor;