// components/matrix/TaskListTab.tsx
import React, { useState } from 'react';
import { Task } from '../../types.ts';
import { PlusIcon, TrashIcon, FileImportIcon } from '../icons.tsx';

interface TaskListTabProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    isLoading: boolean;
}

const TaskListTab: React.FC<TaskListTabProps> = ({ tasks, setTasks, isLoading }) => {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center text-slate-500 animate-pulse">AI đang tạo danh sách công việc...</div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center text-slate-500 max-w-md">
                    <h3 className="text-lg font-semibold">Bắt đầu Xây dựng Ma trận</h3>
                    <p className="mt-2">Khu vực này sẽ hiển thị danh sách công việc do AI đề xuất.</p>
                    <p className="mt-2">Bắt đầu bằng cách cung cấp thông tin ở panel bên phải và nhấn 'Bước 1: AI Gợi ý Nhiệm vụ'.</p>
                </div>
            </div>
        );
    }
    
    const handleCellChange = (taskId: string, field: keyof Task, value: string) => {
        setTasks(prevTasks => prevTasks.map(task => 
            task.id === taskId ? { ...task, [field]: value } : task
        ));
    };

    const getRowStyle = (task: Task): string => {
        if (task.isGroupHeader) {
            return 'bg-slate-200 font-bold';
        }
        if (task.mc4) {
            return 'bg-white hover:bg-slate-50'; // MC4 level, no color
        }
        if (task.mc3) {
            return 'bg-white hover:bg-slate-50'; 
        }
        if (task.mc2) {
            return 'bg-green-50 hover:bg-green-100'; // MC2 level, light green
        }
        if (task.mc1) {
            return 'bg-blue-50 hover:bg-blue-100 font-bold'; // MC1 level, bold and light blue
        }
        return 'bg-white hover:bg-slate-50'; // Default for rows with no MC code
    };

    const handleAddTask = () => {
        const newTask: Task = {
            id: `task-${Date.now()}`,
            rowNumber: 0, // Will be re-indexed
            mc1: '', mc2: '', mc3: '', mc4: '',
            name: 'Nhiệm vụ mới',
            isGroupHeader: false,
            assignments: {}
        };

        setTasks(prevTasks => {
            const selectedIndex = prevTasks.findIndex(t => t.id === selectedTaskId);
            
            const newTasks = [...prevTasks];
            // Insert above the selected row, or at the end if no row is selected
            const insertIndex = selectedIndex !== -1 ? selectedIndex : prevTasks.length;
            newTasks.splice(insertIndex, 0, newTask);
            
            // Re-index row numbers for data integrity
            return newTasks.map((task, index) => ({ ...task, rowNumber: index + 1 }));
        });
    };

    const handleDeleteTask = () => {
        if (!selectedTaskId) {
            alert('Vui lòng chọn một dòng để xóa.');
            return;
        }
        if (window.confirm('Bạn có chắc chắn muốn xóa nhiệm vụ đã chọn không?')) {
            setTasks(prevTasks => {
                const newTasks = prevTasks.filter(task => task.id !== selectedTaskId);
                 // Re-index row numbers
                return newTasks.map((task, index) => ({ ...task, rowNumber: index + 1 }));
            });
            setSelectedTaskId(null); // Clear selection
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-slate-100 z-10">
                        <tr>
                            <th className="p-2 border font-semibold w-16">MC1</th>
                            <th className="p-2 border font-semibold w-16">MC2</th>
                            <th className="p-2 border font-semibold w-16">MC3</th>
                            <th className="p-2 border font-semibold w-16">MC4</th>
                            <th className="p-2 border text-left font-semibold">Tên Nhiệm vụ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr 
                                key={task.id} 
                                onClick={() => setSelectedTaskId(task.id)}
                                className={`${getRowStyle(task)} ${selectedTaskId === task.id ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                            >
                               {task.isGroupHeader ? (
                                   <td colSpan={5} className="p-2 border">
                                       <input 
                                            type="text" 
                                            value={task.name} 
                                            onChange={(e) => handleCellChange(task.id, 'name', e.target.value)}
                                            className="w-full bg-transparent font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                   </td>
                               ) : (
                                   <>
                                    <td className="p-0 border"><input type="text" value={task.mc1} onChange={e => handleCellChange(task.id, 'mc1', e.target.value)} className="w-full p-2 text-center focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none bg-transparent" /></td>
                                    <td className="p-0 border"><input type="text" value={task.mc2} onChange={e => handleCellChange(task.id, 'mc2', e.target.value)} className="w-full p-2 text-center focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none bg-transparent" /></td>
                                    <td className="p-0 border"><input type="text" value={task.mc3} onChange={e => handleCellChange(task.id, 'mc3', e.target.value)} className="w-full p-2 text-center focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none bg-transparent" /></td>
                                    <td className="p-0 border"><input type="text" value={task.mc4} onChange={e => handleCellChange(task.id, 'mc4', e.target.value)} className="w-full p-2 text-center focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none bg-transparent" /></td>
                                    <td className="p-0 border"><input type="text" value={task.name} onChange={e => handleCellChange(task.id, 'name', e.target.value)} className="w-full p-2 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none bg-transparent" /></td>
                                   </>
                               )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="p-2 border-t border-slate-200 flex space-x-2 flex-shrink-0">
                <button onClick={handleAddTask} className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1"><PlusIcon/> Thêm mới</button>
                <button onClick={handleDeleteTask} disabled={!selectedTaskId} className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"><TrashIcon/> Xóa</button>
                <button onClick={() => alert('Chức năng Import từ File đang được phát triển.')} className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1"><FileImportIcon/> Import từ File...</button>
            </div>
        </div>
    );
};

export default TaskListTab;