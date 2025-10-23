// components/matrix/AiCockpit.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MatrixContextInput, ChatMessage, Department } from '../../types.ts';
import { suggestTasksForMatrix, generateCompanyMatrix, sendAiChat } from '../../services/geminiService.ts';
import { SendIcon, PaperClipIcon } from '../icons.tsx';

interface AiCockpitProps {
    contextInputs: MatrixContextInput[];
    onContextChange: (id: number, answer: string) => void;
    onTasksGenerated: (markdown: string) => void;
    onCompanyMatrixGenerated: (markdown: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    tasksGenerated: boolean;
    generatedTaskMarkdown: string;
    departments: Department[];
    // New props for chat
    chatMessages: ChatMessage[];
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    lastAiResponse: string;
    setLastAiResponse: React.Dispatch<React.SetStateAction<string>>;
    isAiCockpitCollapsed: boolean;
    setIsAiCockpitCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
    attachedFile: File | null;
    setAttachedFile: React.Dispatch<React.SetStateAction<File | null>>;
    onApplyToNote: (content: string) => void;
}

const AiCockpit: React.FC<AiCockpitProps> = ({
    contextInputs, onContextChange, onTasksGenerated, onCompanyMatrixGenerated,
    isLoading, setIsLoading, tasksGenerated, generatedTaskMarkdown, departments,
    chatMessages, setChatMessages, lastAiResponse, setLastAiResponse,
    isAiCockpitCollapsed, setIsAiCockpitCollapsed,
    attachedFile, setAttachedFile, onApplyToNote
}) => {
    const [detailLevel, setDetailLevel] = useState('Chi tiết đến cấp 4');
    const [userInput, setUserInput] = useState('');
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [chatMessages, isLoading]);

    const handleGenerateTasks = async () => {
        setIsLoading(true);
        setChatMessages([]);
        setLastAiResponse('');
        const context = contextInputs.map(i => `${i.question}\n${i.answer}`).join('\n\n');
        const markdownResult = await suggestTasksForMatrix(context, detailLevel);
        if (markdownResult) {
            onTasksGenerated(markdownResult);
        } else {
            alert("AI không thể tạo danh sách công việc. Vui lòng thử lại.");
        }
        setIsLoading(false);
    };

    const handleGenerateCompanyMatrix = async () => {
        setIsLoading(true);
        const deptNames = departments.map(d => d.name);
        const matrixMarkdown = await generateCompanyMatrix(generatedTaskMarkdown, deptNames);
        if (matrixMarkdown) {
            onCompanyMatrixGenerated(matrixMarkdown);
        } else {
             alert("AI không thể tạo ma trận cấp công ty. Vui lòng thử lại.");
        }
        setIsLoading(false);
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userInput };
        setChatMessages(prev => [...prev, newUserMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        const historyForPrompt = [...chatMessages, newUserMessage]
            .map(m => (m.role === 'user' ? `[User]: ${m.content}` : `[AI]: ${m.content}`))
            .join('\n');
            
        const initialContext = contextInputs.map(i => `${i.question}\n${i.answer}`).join('\n\n');

        const prompt = `[ĐÓNG VAI]: Bạn là một cố vấn AI chuyên về xây dựng ma trận phân nhiệm QTKBP.
[BỐI CẢNH HIỆN TẠI]:
--- DỮ LIỆU ĐẦU VÀO CỦA NGƯỜI DÙNG ---
${initialContext}

--- DANH SÁCH CÔNG VIỆC HIỆN TẠI (MARKDOWN) ---
${generatedTaskMarkdown || "(Chưa có)"}

--- LỊCH SỬ HỘI THOẠI ---
${historyForPrompt}
---
${attachedFile ? `[TÀI LIỆU THAM KHẢO]: Người dùng đã đính kèm file '${attachedFile.name}'. Hãy sử dụng nội dung file này làm nguồn thông tin bổ sung.` : ''}

[YÊU CẦU MỚI CỦA NGƯỜI DÙNG]: ${currentInput}

[NHIỆM VỤ]: Dựa vào toàn bộ bối cảnh trên, hãy trả lời hoặc thực hiện yêu cầu của người dùng. Nếu họ yêu cầu sửa đổi danh sách công việc hoặc ma trận, hãy trả về phiên bản BẢNG MARKDOWN hoàn chỉnh đã được cập nhật.`;

        const aiResponseContent = await sendAiChat(prompt, attachedFile || undefined);

        setLastAiResponse(aiResponseContent);
        setChatMessages(prev => [...prev, { role: 'ai', content: aiResponseContent, isMarkdown: true }]);
        setAttachedFile(null); // Clear file after sending
        setIsLoading(false);
    };

    const handleFileAttach = () => fileInputRef.current?.click();

    const handleClearChat = () => {
        if(window.confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) {
            setChatMessages([]);
            setLastAiResponse('');
        }
        setIsOptionsOpen(false);
    };
    
    return (
        <div className="flex-[1.5] flex flex-col p-4 space-y-4 overflow-y-auto bg-slate-50">
            {!isAiCockpitCollapsed && (
                 <div>
                    <h2 className="text-base font-bold mb-2">Cung cấp Thông tin Ban đầu</h2>
                    <div className="bg-white rounded-lg border border-slate-300">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100">
                                <tr className="bg-slate-100">
                                    <th className="p-2 text-left w-1/3 border-b">Câu hỏi Gợi ý</th>
                                    <th className="p-2 text-left w-2/3 border-b">Câu trả lời của bạn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contextInputs.map((input, index) => (
                                    <tr key={input.id}>
                                        <td className={`p-2 border-r ${index < contextInputs.length -1 ? 'border-b' : ''} bg-blue-50 text-blue-800 font-semibold`}>{input.question}</td>
                                        <td className={`p-1 ${index < contextInputs.length -1 ? 'border-b' : ''}`}>
                                            <textarea 
                                                value={input.answer}
                                                onChange={(e) => onContextChange(input.id, e.target.value)}
                                                className="w-full h-full border-none focus:ring-0 resize-none text-xs p-1"
                                                rows={4}
                                                disabled={isLoading}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="flex items-center space-x-4">
                <button onClick={handleGenerateTasks} disabled={isLoading} className={`flex-1 p-3 rounded-md text-white font-semibold transition-colors text-center ${isLoading ? 'bg-slate-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    Bước 1: AI Gợi ý Nhiệm vụ
                </button>
                <button onClick={handleGenerateCompanyMatrix} disabled={isLoading || !tasksGenerated} className={`flex-1 p-3 rounded-md font-semibold transition-colors text-center ${isLoading || !tasksGenerated ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-200 hover:bg-slate-300'}`}>
                   Bước 2: Tạo Ma trận Cấp Công ty
                </button>
            </div>

            {!isAiCockpitCollapsed && (
                <div className="flex items-center gap-4 text-xs">
                    <div>
                         <label className="font-semibold">Mức độ chi tiết:</label>
                         <select value={detailLevel} onChange={e => setDetailLevel(e.target.value)} className="ml-2 p-1 border border-slate-300 rounded-md" disabled={isLoading}>
                             <option>Chi tiết đến cấp 2</option>
                             <option>Chi tiết đến cấp 3</option>
                             <option>Chi tiết đến cấp 4</option>
                             <option>Chi tiết tối đa (AI quyết định)</option>
                         </select>
                    </div>
                    <p className="text-slate-500">Kết quả sẽ được hiển thị ở các Tab bên trái.</p>
                </div>
            )}

            <div className="flex-1 flex flex-col border-t pt-4">
                 <h2 className="text-base font-bold mb-2">Cố vấn AI</h2>
                 <div className="flex-1 bg-white rounded-md p-2 border border-slate-200 overflow-y-auto min-h-[150px] space-y-3">
                     {chatMessages.map((msg, index) => (
                         <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                                <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                            </div>
                         </div>
                     ))}
                     {isLoading && <div className="text-slate-500 italic animate-pulse">AI đang suy nghĩ...</div>}
                     <div ref={messagesEndRef} />
                 </div>
                 <div className="mt-2 relative">
                     <textarea 
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        rows={3}
                        className="w-full p-2 pr-12 border border-slate-300 rounded-md text-sm"
                        placeholder="Tinh chỉnh kết quả hoặc hỏi thêm..."
                        disabled={isLoading}
                     />
                     <button onClick={handleSendMessage} className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-400" disabled={isLoading || !userInput.trim()}>
                        <SendIcon />
                     </button>
                 </div>
                 <div className="mt-2 flex space-x-3 text-xs text-slate-600 items-center">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setAttachedFile(e.target.files ? e.target.files[0] : null)} />
                    <button onClick={handleFileAttach} className="flex items-center gap-1 hover:text-blue-600 disabled:text-slate-400" disabled={isLoading}>
                        <PaperClipIcon/> {attachedFile ? `${attachedFile.name} (x)` : 'Đính kèm File'}
                    </button>
                    <button onClick={() => setIsAiCockpitCollapsed(p => !p)} className="hover:text-blue-600">{isAiCockpitCollapsed ? 'Mở rộng Chat' : 'Thu gọn Chat'}</button>
                    <button onClick={onApplyToNote} className="hover:text-blue-600 disabled:text-slate-400" disabled={!lastAiResponse}>Áp dụng vào Ghi chú</button>
                    <div className="relative">
                        <button onClick={() => setIsOptionsOpen(p => !p)} className="hover:text-blue-600">Tùy chọn...</button>
                        {isOptionsOpen && (
                            <div className="absolute bottom-full right-0 mb-1 w-48 bg-white border border-slate-200 rounded shadow-lg z-10">
                                <button onClick={handleClearChat} className="block w-full text-left px-3 py-2 hover:bg-slate-100">Xóa cuộc trò chuyện</button>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default AiCockpit;