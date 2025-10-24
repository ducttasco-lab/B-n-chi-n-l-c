// components/matrix/CompanyMatrixTab.tsx
import React from 'react';
import { Task, Department } from '../../types.ts';

interface CompanyMatrixTabProps {
    tasks: Task[];
    departments: Department[];
    assignments: Record<string, Record<string, string>>;
    setAssignments: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>;
    isLoading: boolean;
}

const CompanyMatrixTab: React.FC<CompanyMatrixTabProps> = ({ tasks, departments, assignments, setAssignments, isLoading }) => {
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center text-slate-500 animate-pulse">AI đang tạo ma trận...</div>
            </div>
        );
    }
    
    if (tasks.length === 0 || departments.length === 0) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center text-slate-500 max-w-md">
                    <p>Vui lòng tạo danh sách nhiệm vụ và phòng ban trước khi xem ma trận này.</p>
                </div>
            </div>
        );
    }
    
    const handleAssignmentChange = (taskId: string, deptCode: string, value: string) => {
        setAssignments(prev => {
            const newAssignments = { ...prev };
            if (!newAssignments[taskId]) {
                newAssignments[taskId] = {};
            }
            newAssignments[taskId][deptCode] = value.toUpperCase();
            return newAssignments;
        });
    };

    const sortedDepartments = [...departments].sort((a, b) => a.priority - b.priority);

    return (
        <div className="h-full overflow-auto">
            <table className="min-w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 z-10">
                    <tr>
                        <th className="p-1 border font-semibold w-12">MC1</th>
                        <th className="p-1 border font-semibold w-12">MC2</th>
                        <th className="p-1 border font-semibold w-12">MC3</th>
                        <th className="p-1 border font-semibold w-12">MC4</th>
                        <th className="p-1 border text-left font-semibold min-w-[250px]">Tên Nhiệm vụ</th>
                        {sortedDepartments.map(dept => (
                            <th key={dept.code} className="p-1 border font-semibold w-16" title={dept.name}>{dept.code}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => (
                        <tr key={task.id} className={task.isGroupHeader ? 'bg-slate-200 font-bold' : 'hover:bg-slate-50'}>
                           <td className="p-1 border text-center">{task.mc1}</td>
                           <td className="p-1 border text-center">{task.mc2}</td>
                           <td className="p-1 border text-center">{task.mc3}</td>
                           <td className="p-1 border text-center">{task.mc4}</td>
                           <td className="p-1 border">{task.name}</td>
                           {sortedDepartments.map(dept => (
                               <td key={dept.code} className="p-0 border">
                                   {!task.isGroupHeader && (
                                       <select 
                                            value={assignments[task.id]?.[dept.code] || ''}
                                            onChange={e => handleAssignmentChange(task.id, dept.code, e.target.value)}
                                            className="w-full h-full p-1 bg-transparent focus:bg-white outline-none"
                                        >
                                            <option value=""></option>
                                            <option value="Q">Q</option>
                                            <option value="T">T</option>
                                            <option value="K">K</option>
                                            <option value="B">B</option>
                                            <option value="P">P</option>
                                       </select>
                                   )}
                               </td>
                           ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CompanyMatrixTab;
