// components/matrix/DepartmentAssignmentTab.tsx
import React, { useState, useMemo } from 'react';
import { Task, Role, Department } from '../../types.ts';
import { SparklesIcon } from '../icons.tsx';
import { suggestDepartmentAssignments } from '../../services/geminiService.ts';

interface DepartmentAssignmentTabProps {
    tasks: Task[];
    roles: Role[];
    departments: Department[];
    companyAssignments: Record<string, Record<string, string>>;
    departmentalAssignments: Record<string, Record<string, string>>;
    setDepartmentalAssignments: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>;
}

const DepartmentAssignmentTab: React.FC<DepartmentAssignmentTabProps> = ({ 
    tasks, roles, departments, companyAssignments, departmentalAssignments, setDepartmentalAssignments 
}) => {
    const [selectedDept, setSelectedDept] = useState<string | null>(departments[0]?.code || null);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAssignmentChange = (taskId: string, roleId: string, value: string) => {
        setDepartmentalAssignments(prev => {
            const newAssignments = { ...prev };
            if (!newAssignments[taskId]) {
                newAssignments[taskId] = {};
            }
            newAssignments[taskId][roleId] = value.toUpperCase();
            return newAssignments;
        });
    };

    const tasksForDept = useMemo(() => {
        if (!selectedDept) return [];
        return tasks.filter(task => companyAssignments[task.id]?.[selectedDept] && !task.isGroupHeader);
    }, [selectedDept, tasks, companyAssignments]);

    const staffInDept = useMemo(() => {
        if (!selectedDept) return [];
        return roles.filter(role => role.departmentCode === selectedDept);
    }, [selectedDept, roles]);

    const handleAiSuggest = async () => {
        if (!selectedDept) return;
        setIsLoading(true);
        const tasksWithRoles = tasksForDept.map(t => ({ name: t.name, role: companyAssignments[t.id][selectedDept] }));
        const staffNames = staffInDept.map(s => `${s.name} (${s.title})`);
        
        const resultMarkdown = await suggestDepartmentAssignments(
            departments.find(d => d.code === selectedDept)!.name,
            tasksWithRoles,
            staffNames,
            notes
        );

        if (resultMarkdown) {
            // Parse markdown and update state
            const lines = resultMarkdown.split('\n').slice(2); // Skip header and separator
            const newAssignments = { ...departmentalAssignments };
            lines.forEach(line => {
                const parts = line.split('|').map(p => p.trim()).filter(Boolean);
                if (parts.length === 3) {
                    const [taskName, staffInfo, role] = parts;
                    const task = tasks.find(t => t.name === taskName);
                    const staff = staffInDept.find(s => `${s.name} (${s.title})` === staffInfo);
                    if (task && staff) {
                        if (!newAssignments[task.id]) newAssignments[task.id] = {};
                        newAssignments[task.id][staff.id] = role;
                    }
                }
            });
            setDepartmentalAssignments(newAssignments);
        } else {
            alert("AI không thể tạo gợi ý phân công.");
        }
        setIsLoading(false);
    };

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <div className="flex-shrink-0 flex items-center gap-4">
                <label className="font-semibold">Chọn phòng ban:</label>
                <select value={selectedDept || ''} onChange={e => setSelectedDept(e.target.value)} className="p-2 border rounded-md">
                    {departments.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                </select>
            </div>
            <div className="flex-1 overflow-auto border rounded-md">
                <table className="min-w-full text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-100 z-10">
                        <tr>
                            <th className="p-1 border font-semibold min-w-[250px] text-left">Tên Nhiệm vụ</th>
                            <th className="p-1 border font-semibold w-16">Vai trò Phòng</th>
                            {staffInDept.map(role => <th key={role.id} className="p-1 border font-semibold w-24" title={role.title}>{role.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {tasksForDept.map(task => (
                            <tr key={task.id} className="hover:bg-slate-50">
                                <td className="p-1 border">{task.name}</td>
                                <td className="p-1 border text-center font-bold">{companyAssignments[task.id]?.[selectedDept!]}</td>
                                {staffInDept.map(role => (
                                    <td key={role.id} className="p-0 border">
                                        <select
                                            value={departmentalAssignments[task.id]?.[role.id] || ''}
                                            onChange={e => handleAssignmentChange(task.id, role.id, e.target.value)}
                                            className="w-full h-full p-1 bg-transparent focus:bg-white outline-none"
                                        >
                                            <option value=""></option>
                                            <option value="Q">Q</option>
                                            <option value="T">T</option>
                                            <option value="K">K</option>
                                            <option value="B">B</option>
                                            <option value="P">P</option>
                                        </select>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex-shrink-0 p-4 border rounded-md bg-slate-50 space-y-2">
                <h4 className="font-semibold">AI Gợi ý Phân công</h4>
                <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2 border rounded-md text-sm"
                    placeholder="Thêm ghi chú cho AI (ví dụ: 'Nguyễn Văn A là trưởng phòng', 'Trần Thị B là chuyên viên mới'...)"
                />
                <button onClick={handleAiSuggest} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-400 flex items-center gap-2">
                    <SparklesIcon /> {isLoading ? 'Đang xử lý...' : 'AI Gợi ý'}
                </button>
            </div>
        </div>
    );
};

export default DepartmentAssignmentTab;
