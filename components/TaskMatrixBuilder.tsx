// components/TaskMatrixBuilder.tsx
import React, { useState, useCallback } from 'react';
import { Task, Role, MatrixContextInput, ChatMessage } from '../types';
import { MOCK_ROLES, MATRIX_BUILDER_INITIAL_INPUTS } from '../constants';
import { suggestTasksForMatrix, generateCompanyMatrix, suggestDepartmentAssignments } from '../services/geminiService';
import { SparklesIcon, PlusIcon, TrashIcon, FileImportIcon, PaperClipIcon, SendIcon } from './icons.tsx';


const TaskMatrixBuilder: React.FC = () => {
    const [activeMainTab, setActiveMainTab] = useState('cockpit');
    const [activeCockpitTab, setActiveCockpitTab] = useState('tasks');

    // AI Cockpit State
    const [contextInputs, setContextInputs] = useState<MatrixContextInput[]>(MATRIX_BUILDER_INITIAL_INPUTS);
    const [detailLevel, setDetailLevel] = useState('Chi tiết đến cấp 4');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Results State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [companyMatrix, setCompanyMatrix] = useState<Record<string, Record<string, string>>>({});
    const [roles] = useState<Role[]>(MOCK_ROLES);
    const [generatedTaskMarkdown, setGeneratedTaskMarkdown] = useState('');


    const handleContextChange = (id: number, answer: string) => {
        setContextInputs(prev => prev.map(input => (input.id === id ? { ...input, answer } : input)));
    };
    
    const handleGenerateTasks = async () => {
        setIsLoading(true);
        setTasks([]);
        setActiveMainTab('cockpit');
        setActiveCockpitTab('tasks');
        
        const context = contextInputs.map(i => `${i.question}\n${i.answer}`).join('\n\n');
        const markdownResult = await suggestTasksForMatrix(context, detailLevel);
        
        if (markdownResult) {
            setGeneratedTaskMarkdown(markdownResult);
            // Simple parsing for display
            const lines = markdownResult.split('\n').filter(line => line.trim().startsWith('|') && !line.includes('---'));
            const parsedTasks: Task[] = lines.slice(1).map((line, index) => {
                const columns = line.split('|').map(c => c.trim()).slice(1,-1);
                const isGroup = columns[4]?.startsWith('**');
                return {
                    id: `task-${index}`,
                    rowNumber: index + 1,
                    mc1: columns[0] || '',
                    mc2: columns[1] || '',
                    mc3: columns[2] || '',
                    mc4: columns[3] || '',
                    name: columns[4]?.replace(/\*\*/g, '') || 'Unnamed Task',
                    isGroupHeader: isGroup,
                    assignments: {}
                };
            });
            setTasks(parsedTasks);
        } else {
            alert("AI không thể tạo danh sách công việc. Vui lòng thử lại.");
        }
        setIsLoading(false);
    };

    const handleGenerateCompanyMatrix = async () => {
         if (tasks.length === 0) {
            alert("Vui lòng tạo danh sách công việc trước.");
            return;
        }
        setIsLoading(true);
        setActiveCockpitTab('company-matrix');
        // FIX: Explicitly typed `departmentNames` as `string[]` to resolve a TypeScript inference issue where it was being inferred as `unknown[]`.
        const departmentNames: string[] = [...new Set(roles.map(r => r.department))];
        const matrixMarkdown = await generateCompanyMatrix(generatedTaskMarkdown, departmentNames);

        // This part would be more complex, involving parsing the new matrix and updating task assignments
        // For now, let's just log it.
        console.log("Generated Company Matrix:", matrixMarkdown);
        
        setIsLoading(false);
        alert("Ma trận cấp công ty đã được tạo (xem console log). Giao diện hiển thị sẽ được cập nhật ở bước sau.");
    };


    const renderWorkArea = () => {
        switch(activeMainTab) {
            case 'cockpit':
                return (
                    <div className="flex-1 flex flex-col">
                        <div className="border-b border-slate-200">
                             <div className="flex space-x-1 px-2">
                                {[{id: 'tasks', label: '1. Danh sách Công việc'}, {id: 'company-matrix', label: '2. Ma trận Cấp Công ty'}, {id: 'detail-assignment', label: '3. Chi tiết Phân nhiệm Phòng ban'}, {id: 'personnel', label: '4. Quản lý Nhân sự & Phòng ban'}, {id: 'versions', label: '5. Quản lý Phiên bản'}].map(tab => (
                                    <button key={tab.id} onClick={() => setActiveCockpitTab(tab.id)} className={`px-3 py-2 text-sm font-medium ${activeCockpitTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 p-4 overflow-auto">
                            {renderCockpitContent()}
                        </div>
                        <div className="p-2 border-t border-slate-200 flex space-x-2">
                            <button className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1"><PlusIcon/> Thêm mới</button>
                            <button className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1"><TrashIcon/> Xóa</button>
                            <button className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1"><FileImportIcon/> Import từ File...</button>
                        </div>
                    </div>
                );
            case 'view-tasks':
            case 'lookup':
            case 'audit':
            default:
                return <div className="p-4 text-slate-500">Chức năng này đang được xây dựng.</div>;
        }
    };
    
    const renderCockpitContent = () => {
        if (tasks.length === 0 && !isLoading) {
            return (
                <div className="text-center text-slate-500 mt-10">
                    <p>Khu vực này sẽ hiển thị danh sách công việc do AI đề xuất.</p>
                    <p className="mt-2">Bắt đầu bằng cách cung cấp thông tin ở panel bên phải và nhấn 'Bước 1: AI Gợi ý Nhiệm vụ'.</p>
                </div>
            );
        }
        if (isLoading) return <div className="text-center text-slate-500 mt-10 animate-pulse">AI đang xử lý...</div>
        return (
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="p-2 border">MC1</th><th className="p-2 border">MC2</th><th className="p-2 border">MC3</th><th className="p-2 border">MC4</th>
                        <th className="p-2 border text-left">Tên Nhiệm vụ</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => (
                        <tr key={task.id} className={task.isGroupHeader ? 'bg-slate-200 font-bold' : 'hover:bg-slate-50'}>
                           {task.isGroupHeader ? (
                               <td colSpan={5} className="p-2 border">{task.name}</td>
                           ) : (
                               <>
                                <td className="p-2 border text-center">{task.mc1}</td>
                                <td className="p-2 border text-center">{task.mc2}</td>
                                <td className="p-2 border text-center">{task.mc3}</td>
                                <td className="p-2 border text-center">{task.mc4}</td>
                                <td className="p-2 border">{task.name}</td>
                               </>
                           )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white text-slate-800">
             <header className="flex-shrink-0 p-3 border-b border-slate-200 flex space-x-2">
                 {[{id: 'cockpit', label: 'Buồng lái Xây dựng Ma trận (AI)'}, {id: 'view-tasks', label: 'Xem Nhiệm vụ'}, {id: 'lookup', label: 'Tra cứu Quy trình'}, {id: 'audit', label: 'Kiểm tra Ma trận'}].map(tab => (
                    <button key={tab.id} onClick={() => setActiveMainTab(tab.id)} className={`px-4 py-2 text-sm font-medium rounded-md ${activeMainTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {tab.label}
                    </button>
                ))}
            </header>
            <div className="flex-1 flex min-h-0">
                {/* Left Panel: Work Area */}
                <div className="flex-[2] border-r border-slate-200 flex flex-col">
                    {renderWorkArea()}
                </div>
                {/* Right Panel: AI Cockpit */}
                <div className="flex-[1.5] flex flex-col p-4 space-y-4 overflow-y-auto">
                    <div>
                        <h2 className="text-base font-bold mb-2">Cung cấp Thông tin Ban đầu</h2>
                        <div className="bg-white rounded-lg border border-slate-300">
                            <table className="w-full text-sm">
                                <thead>
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
                                                    onChange={(e) => handleContextChange(input.id, e.target.value)}
                                                    className="w-full h-full border-none focus:ring-0 resize-none text-xs p-1"
                                                    rows={4}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button onClick={handleGenerateTasks} disabled={isLoading} className={`flex-1 p-3 rounded-md text-white font-semibold transition-colors ${isLoading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            Bước 1: AI Gợi ý Nhiệm vụ
                        </button>
                        <button onClick={handleGenerateCompanyMatrix} disabled={isLoading || tasks.length === 0} className={`flex-1 p-3 rounded-md font-semibold transition-colors ${isLoading || tasks.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-200 hover:bg-slate-300'}`}>
                           Bước 2: Tạo Ma trận Cấp Công ty
                        </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <div>
                             <label className="font-semibold">Mức độ chi tiết:</label>
                             <select value={detailLevel} onChange={e => setDetailLevel(e.target.value)} className="ml-2 p-1 border border-slate-300 rounded-md">
                                 <option>Chi tiết đến cấp 2</option>
                                 <option>Chi tiết đến cấp 3</option>
                                 <option>Chi tiết đến cấp 4</option>
                             </select>
                        </div>
                        <p className="text-slate-500">Kết quả sẽ được hiển thị ở các Tab bên trái.</p>
                    </div>

                    <div className="flex-1 flex flex-col border-t pt-4">
                         <h2 className="text-base font-bold mb-2">Cố vấn AI</h2>
                         <div className="flex-1 bg-slate-100 rounded-md p-2 overflow-y-auto min-h-[100px]">
                            {/* Chat messages would go here */}
                             <p className="text-xs text-slate-500 text-center">Bắt đầu cuộc hội thoại...</p>
                         </div>
                         <div className="mt-2 relative">
                             <textarea 
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                rows={3}
                                className="w-full p-2 pr-12 border border-slate-300 rounded-md text-sm"
                                placeholder="Tinh chỉnh kết quả hoặc hỏi thêm..."
                             />
                             <button className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                <SendIcon />
                             </button>
                         </div>
                         <div className="mt-2 flex space-x-2 text-xs text-slate-600">
                            <button className="flex items-center gap-1 hover:text-blue-600"><PaperClipIcon/> Đính kèm File</button>
                            <button className="hover:text-blue-600">Mở rộng Chat</button>
                            <button className="hover:text-blue-600">✔ Áp dụng vào Ghi chú</button>
                            <button className="hover:text-blue-600">Tùy chọn...</button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskMatrixBuilder;