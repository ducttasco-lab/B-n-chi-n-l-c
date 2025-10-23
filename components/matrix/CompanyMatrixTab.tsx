// components/matrix/CompanyMatrixTab.tsx
import React from 'react';
import { Task, Department } from '../../types.ts';
import { PlusIcon, TrashIcon, FileImportIcon } from '../icons.tsx';

interface CompanyMatrixTabProps {
    tasks: Task[];
    departments: Department[];
    assignments: Record<string, Record<string, string>>;
}

const CompanyMatrixTab: React.FC<CompanyMatrixTabProps> = ({ tasks, departments, assignments }) => {
    
    if (tasks.length === 0) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center text-slate-500 max-w-md">
                    <h3 className="text-lg font-semibold">Chưa có Ma trận</h3>
                    <p className="mt-2">Khu vực này sẽ hiển thị ma trận cấp công ty sau khi bạn hoàn thành Bước 1 và chạy "Bước 2: Tạo Ma trận Cấp Công ty".</p>
                </div>
            </div>
        );
    }

    const sortedDepartments = [...departments].sort((a,b) => a.priority - b.priority);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-slate-100 z-10">
                        <tr>
                            <th className="p-2 border font-semibold w-12">MC1</th>
                            <th className="p-2 border font-semibold w-12">MC2</th>
                            <th className="p-2 border font-semibold w-12">MC3</th>
                            <th className="p-2 border font-semibold w-12">MC4</th>
                            <th className="p-2 border text-left font-semibold min-w-[250px]">Tên Nhiệm vụ</th>
                            {sortedDepartments.map(dept => (
                                <th key={dept.code} className="p-2 border font-semibold w-24 whitespace-nowrap">{dept.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id} className={task.isGroupHeader ? 'bg-slate-200 font-bold' : 'hover:bg-slate-50'}>
                               {task.isGroupHeader ? (
                                   <td colSpan={5 + departments.length} className="p-2 border">{task.name}</td>
                               ) : (
                                   <>
                                    <td className="p-2 border text-center">{task.mc1}</td>
                                    <td className="p-2 border text-center">{task.mc2}</td>
                                    <td className="p-2 border text-center">{task.mc3}</td>
                                    <td className="p-2 border text-center">{task.mc4}</td>
                                    <td className="p-2 border">{task.name}</td>
                                    {sortedDepartments.map(dept => (
                                        <td key={`${task.id}-${dept.code}`} className="p-2 border text-center">
                                            {assignments[task.id]?.[dept.code] || ''}
                                        </td>
                                    ))}
                                   </>
                               )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-2 border-t border-slate-200 flex space-x-2 flex-shrink-0">
                 <button className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1"><PlusIcon/> Thêm mới</button>
                <button className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1"><TrashIcon/> Xóa</button>
                <button className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1"><FileImportIcon/> Import từ File...</button>
                 <div className="flex-grow"></div>
                 <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">Lưu Phiên bản...</button>
                 <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-semibold">Kích hoạt Ma trận</button>
            </div>
        </div>
    );
};

export default CompanyMatrixTab;