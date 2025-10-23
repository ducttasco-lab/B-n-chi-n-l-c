// components/matrix/ProcessLookupTab.tsx
import React, { useState, useMemo } from 'react';
import { Task } from '../../types.ts';

interface ProcessLookupTabProps {
    tasks: Task[];
}

const ProcessLookupTab: React.FC<ProcessLookupTabProps> = ({ tasks }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const filteredTasks = useMemo(() => {
        if (!searchTerm) return tasks.filter(t => !t.isGroupHeader);
        const lowerSearchTerm = searchTerm.toLowerCase();
        return tasks.filter(t => 
            !t.isGroupHeader &&
            (t.name.toLowerCase().includes(lowerSearchTerm) || 
             t.mc1.toLowerCase().includes(lowerSearchTerm) ||
             t.mc2.toLowerCase().includes(lowerSearchTerm) ||
             t.mc3.toLowerCase().includes(lowerSearchTerm) ||
             t.mc4.toLowerCase().includes(lowerSearchTerm))
        );
    }, [tasks, searchTerm]);
    
    return (
        <div className="h-full flex">
            {/* Left Panel: Task List */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col p-2">
                <input 
                    type="text"
                    placeholder="Tìm kiếm theo Mã hoặc Tên..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md mb-2"
                />
                <div className="flex-1 overflow-y-auto border rounded-md">
                    <ul className="divide-y divide-slate-200">
                        {filteredTasks.map(task => (
                            <li 
                                key={task.id} 
                                onClick={() => setSelectedTask(task)}
                                className={`p-2 cursor-pointer text-sm ${selectedTask?.id === task.id ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
                            >
                                <span className="font-semibold text-slate-500 mr-2">
                                     {[task.mc1, task.mc2, task.mc3, task.mc4].filter(Boolean).join('.')}
                                </span>
                                {task.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* Right Panel: Details */}
            <div className="w-2/3 flex flex-col p-4">
                {selectedTask ? (
                    <>
                        <div className="flex-1 flex flex-col border border-slate-200 rounded-md p-4">
                             <h3 className="text-lg font-bold mb-2">Tóm tắt Quy trình Thực hiện (AI)</h3>
                             <div className="flex-1 overflow-y-auto bg-slate-50 p-3 rounded">
                                <p className="text-slate-600">
                                    Chức năng tóm tắt quy trình từ các tài liệu đính kèm đang được phát triển.
                                    <br/><br/>
                                    Khi hoàn thiện, AI sẽ đọc các file Word, PDF, Excel liên quan đến nhiệm vụ
                                    <span className="font-bold"> "{selectedTask.name}" </span> 
                                    và tạo ra một bản hướng dẫn chi tiết tại đây.
                                </p>
                             </div>
                             <button className="mt-4 px-4 py-2 bg-slate-300 text-slate-500 rounded-md cursor-not-allowed" disabled>
                                Tạo / Cập nhật Tóm tắt bằng AI (Đang phát triển)
                             </button>
                        </div>
                        <div className="flex-shrink-0 mt-4 border border-slate-200 rounded-md p-4 h-48">
                            <h3 className="text-lg font-bold mb-2">Các File Mẫu / Tài liệu Liên quan</h3>
                            <div className="overflow-y-auto h-full">
                               <p className="text-slate-500 text-sm">Danh sách các file đính kèm cho nhiệm vụ này sẽ xuất hiện ở đây.</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                        Vui lòng chọn một nhiệm vụ từ danh sách bên trái để xem chi tiết.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProcessLookupTab;