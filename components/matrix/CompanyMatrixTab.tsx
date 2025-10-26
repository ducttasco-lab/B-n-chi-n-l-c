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

const getDisplayCodes = (task: Task) => {
    const d = { mc1: '', mc2: '', mc3: '', mc4: '' };
    if (!task || task.isGroupHeader) return d;
    
    // This logic ensures only the most specific code is shown in its column
    if (task.mc4) {
        d.mc1 = task.mc1; d.mc2 = task.mc2; d.mc3 = task.mc3; d.mc4 = task.mc4;
    } else if (task.mc3) {
        d.mc1 = task.mc1; d.mc2 = task.mc2; d.mc3 = task.mc3;
    } else if (task.mc2) {
        d.mc1 = task.mc1; d.mc2 = task.mc2;
    } else if (task.mc1) {
        d.mc1 = task.mc1;
    }
    
    // Clear out parent codes to create the "staircase" effect
    if (d.mc4) { d.mc1 = d.mc2 = d.mc3 = ''; }
    else if (d.mc3) { d.mc1 = d.mc2 = ''; }
    else if (d.mc2) { d.mc1 = ''; }

    return d;
};

const getRowClassName = (task: Task): string => {
    const classes = ['hover:bg-slate-50'];
    if (task.isGroupHeader) {
        return 'bg-slate-200 font-bold';
    }
    
    const isMC1 = task.mc1 && !task.mc2;
    const isMC2 = task.mc2 && !task.mc3;

    if (isMC2) {
        classes.push('font-bold', 'italic');
    } else if (isMC1) {
        classes.push('font-bold');
    }

    return classes.join(' ');
};


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
    
    const handleAssignmentChange = (taskId: string, deptCode: string, role: string, isChecked: boolean) => {
        setAssignments(prev => {
            const newAssignments = JSON.parse(JSON.stringify(prev));
            const currentRoles = (newAssignments[taskId]?.[deptCode] || '').split(',').filter(Boolean);
            let updatedRoles;

            if (isChecked) {
                updatedRoles = [...new Set([...currentRoles, role])];
            } else {
                updatedRoles = currentRoles.filter(r => r !== role);
            }

            // Sort roles for consistent display (Q, T, K, B, P order is not alphabetical, so custom sort)
            const roleOrder = ['Q', 'T', 'K', 'B', 'P'];
            updatedRoles.sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b));
            
            if (!newAssignments[taskId]) newAssignments[taskId] = {};
            newAssignments[taskId][deptCode] = updatedRoles.join(',');

            return newAssignments;
        });
    };

    const sortedDepartments = [...departments].sort((a, b) => a.priority - b.priority);
    const ROLES = ['Q', 'T', 'K', 'B', 'P'];

    return (
        <div className="h-full overflow-auto">
            <table className="min-w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 z-10">
                    <tr>
                        <th className="p-1 border font-bold w-12">MC1</th>
                        <th className="p-1 border font-semibold w-12">MC2</th>
                        <th className="p-1 border font-semibold w-12">MC3</th>
                        <th className="p-1 border font-semibold w-12">MC4</th>
                        <th className="p-1 border text-left font-semibold min-w-[250px]">Tên Nhiệm vụ</th>
                        {sortedDepartments.map(dept => (
                            <th key={dept.code} className="p-1 border font-semibold min-w-[120px]" title={dept.name}>{dept.code}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => {
                        const displayCodes = getDisplayCodes(task);
                        return (
                            <tr key={task.id} className={getRowClassName(task)}>
                                <td className="p-1 border text-center">{displayCodes.mc1}</td>
                                <td className="p-1 border text-center">{displayCodes.mc2}</td>
                                <td className="p-1 border text-center">{displayCodes.mc3}</td>
                                <td className="p-1 border text-center">{displayCodes.mc4}</td>
                                <td className="p-1 border">{task.name}</td>
                                {sortedDepartments.map(dept => (
                                <td key={dept.code} className="p-0 border">
                                    {!task.isGroupHeader && (
                                        <div className="flex justify-around items-center h-full px-1">
                                            {ROLES.map(role => {
                                                const currentRoles = (assignments[task.id]?.[dept.code] || '').split(',');
                                                return (
                                                    <label key={role} title={role} className="flex items-center gap-1 cursor-pointer p-0.5 rounded hover:bg-slate-200">
                                                        <input
                                                            type="checkbox"
                                                            checked={currentRoles.includes(role)}
                                                            onChange={e => handleAssignmentChange(task.id, dept.code, role, e.target.checked)}
                                                            className="h-3 w-3"
                                                        />
                                                        <span className="text-xs">{role}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default CompanyMatrixTab;