// components/matrix/AiCockpit.tsx
import React, { useState } from 'react';
import { MatrixContextInput, ChatMessage } from '../../types.ts';
import { suggestTasksForMatrix, generateCompanyMatrix } from '../../services/geminiService.ts';
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
    departments: string[];
}

const AiCockpit: React.FC<AiCockpitProps> = ({
    contextInputs, onContextChange, onTasksGenerated, onCompanyMatrixGenerated,
    isLoading, setIsLoading, tasksGenerated, generatedTaskMarkdown, departments
}) => {
    const [detailLevel, setDetailLevel] = useState('Chi tiết đến cấp 4');
    const [userInput, setUserInput] = useState('');

    const handleGenerateTasks = async () => {
        setIsLoading(true);
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
        // departments prop is already sorted by priority from parent
        const matrixMarkdown = await generateCompanyMatrix(generatedTaskMarkdown, departments);
        if (matrixMarkdown) {
            onCompanyMatrixGenerated(matrixMarkdown);
        } else {
             alert("AI không thể tạo ma trận cấp công ty. Vui lòng thử lại.");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex-[1.5] flex flex-col p-4 space-y-4 overflow-y-auto bg-slate-50">
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

            <div className="flex items-center space-x-4">
                <button onClick={handleGenerateTasks} disabled={isLoading} className={`flex-1 p-3 rounded-md text-white font-semibold transition-colors text-center ${isLoading ? 'bg-slate-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    Bước 1: AI Gợi ý Nhiệm vụ
                </button>
                <button onClick={handleGenerateCompanyMatrix} disabled={isLoading || !tasksGenerated} className={`flex-1 p-3 rounded-md font-semibold transition-colors text-center ${isLoading || !tasksGenerated ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-200 hover:bg-slate-300'}`}>
                   Bước 2: Tạo Ma trận Cấp Công ty
                </button>
            </div>

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

            <div className="flex-1 flex flex-col border-t pt-4">
                 <h2 className="text-base font-bold mb-2">Cố vấn AI</h2>
                 <div className="flex-1 bg-white rounded-md p-2 border border-slate-200 overflow-y-auto min-h-[100px]">
                     <p className="text-xs text-slate-500 text-center p-4">Chức năng Cố vấn AI đang được xây dựng.</p>
                 </div>
                 <div className="mt-2 relative">
                     <textarea 
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        rows={3}
                        className="w-full p-2 pr-12 border border-slate-300 rounded-md text-sm"
                        placeholder="Tinh chỉnh kết quả hoặc hỏi thêm..."
                        disabled
                     />
                     <button className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-400" disabled>
                        <SendIcon />
                     </button>
                 </div>
                 <div className="mt-2 flex space-x-2 text-xs text-slate-600">
                    <button className="flex items-center gap-1 hover:text-blue-600 disabled:text-slate-400" disabled><PaperClipIcon/> Đính kèm File</button>
                    <button className="hover:text-blue-600 disabled:text-slate-400" disabled>Tùy chọn...</button>
                 </div>
            </div>
        </div>
    );
};

export default AiCockpit;