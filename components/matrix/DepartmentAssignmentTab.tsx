// components/matrix/DepartmentAssignmentTab.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Task, Role, Department } from '../../types.ts';
import { suggestDepartmentAssignments } from '../../services/geminiService.ts';

interface DepartmentAssignmentTabProps {
    tasks: Task[];
    roles: Role[];
    departments: Department[];
    allAssignments: Record<string, Record<string, string>>;
    setAllAssignments: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>;
    companyAssignments: Record<string, Record<string, string>>;
    onSaveVersion: () => void;
    onActivateMatrix: () => void;
}

const DepartmentAssignmentTab: React.FC<DepartmentAssignmentTabProps> = ({ tasks, roles, departments, allAssignments, setAllAssignments, companyAssignments, onSaveVersion, onActivateMatrix }) => {
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const sortedDepartments = useMemo(() => [...departments].sort((a,b) => a.priority - b.priority), [departments]);

    useEffect(() => {
        if (sortedDepartments.length > 0 && !selectedDept) {
            setSelectedDept(sortedDepartments[0].code);
        }
    }, [sortedDepartments, selectedDept]);
    
    const staffInDept = useMemo(() => {
        if (!selectedDept) return [];
        return roles.filter(r => r.departmentCode === selectedDept).sort((a, b) => a.name.localeCompare(b.name));
    }, [selectedDept, roles]);

    const tasksForDept = useMemo(() => {
        if (!selectedDept) return [];
        return tasks.filter(task => companyAssignments[task.id] && companyAssignments[task.id][selectedDept] && !task.isGroupHeader);
    }, [tasks, companyAssignments, selectedDept]);
    
    const handleAssignmentChange = (taskId: string, staffId: string, role: string) => {
        setAllAssignments(prev => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                [staffId]: role.toUpperCase()
            }
        }));
    };

    const handleAiAssist = async () => {
        if (!selectedDept) return;
        
        const deptName = departments.find(d => d.code === selectedDept)?.name || selectedDept;
        setIsLoading(true);
        const taskInfoForPrompt = tasksForDept.map(t => ({ name: t.name, role: companyAssignments[t.id]?.[selectedDept] || '' }));
        const staffNames = staffInDept.map(s => s.name);
        const userNotes = prompt(`Thêm ghi chú cho AI (tùy chọn) khi phân công cho phòng ${deptName}:`, "Ưu tiên giao việc cho trưởng phòng cho các nhiệm vụ quan trọng.");

        if(userNotes === null) { // User clicked cancel
             setIsLoading(false);
             return;
        }

        const markdownResult = await suggestDepartmentAssignments(deptName, taskInfoForPrompt, staffNames, userNotes || "");

        if(markdownResult) {
            // Parse markdown and update state
            const lines = markdownResult.split('\n').filter(line => line.trim().startsWith('|') && !line.includes('---'));
            lines.slice(1).forEach(line => {
                const parts = line.split('|').map(p => p.trim());
                if (parts.length < 4) return;
                const taskName = parts[1];
                const staffName = parts[2];
                const roleSymbol = parts[3];
                
                const task = tasks.find(t => t.name === taskName);
                const staff = staffInDept.find(s => s.name === staffName);
                
                if(task && staff) {
                    handleAssignmentChange(task.id, staff.id, roleSymbol);
                }
            });
            alert("AI đã hoàn tất đề xuất. Vui lòng kiểm tra lại.");
        } else {
            alert("AI không thể tạo đề xuất.");
        }
        setIsLoading(false);
    };


    if (tasks.length === 0) {
        return <div className="p-4 text-center text-slate-500">Vui lòng tạo danh sách công việc và ma trận cấp công ty trước.</div>;
    }

    return (
        <div className="h-full flex flex-col p-2">
            <div className="flex-shrink-0 flex items-center gap-4 mb-2 p-2 bg-slate-100 rounded-md">
                <label htmlFor="dept-select" className="font-semibold">Chọn Phòng ban:</label>
                <select 
                    id="dept-select"
                    value={selectedDept || ''}
                    onChange={e => setSelectedDept(e.target.value)}
                    className="p-2 border border-slate-300 rounded-md"
                >
                    {sortedDepartments.map(dept => <option key={dept.code} value={dept.code}>{dept.name}</option>)}
                </select>
                 <button onClick={handleAiAssist} disabled={isLoading} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:bg-slate-200">
                    {isLoading ? 'AI Đang xử lý...' : 'AI Hỗ trợ Phân công'}
                </button>
                 <div className="flex-grow"></div>
                 <button onClick={onSaveVersion} className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">Lưu Phiên bản...</button>
                 <button onClick={onActivateMatrix} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-semibold">Kích hoạt Ma trận</button>
            </div>
            <div className="flex-1 overflow-auto">
                 <table className="min-w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-slate-200 z-10">
                        <tr>
                            <th className="p-2 border font-semibold min-w-[250px] text-left">Tên Nhiệm vụ</th>
                            <th className="p-2 border font-semibold w-20">Vai trò Phòng</th>
                             {staffInDept.map(staff => (
                                <th key={staff.id} className="p-2 border font-semibold w-24">{staff.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tasksForDept.map(task => (
                             <tr key={task.id} className="hover:bg-slate-50">
                                <td className="p-2 border">{task.name}</td>
                                <td className="p-2 border text-center font-bold bg-slate-100">{companyAssignments[task.id]?.[selectedDept || ''] || ''}</td>
                                {staffInDept.map(staff => (
                                    <td key={`${task.id}-${staff.id}`} className="p-0 border text-center">
                                        <input 
                                            type="text"
                                            value={allAssignments[task.id]?.[staff.id] || ''}
                                            onChange={e => handleAssignmentChange(task.id, staff.id, e.target.value)}
                                            maxLength={1}
                                            className="w-full h-full p-2 text-center bg-transparent focus:bg-yellow-100 focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </div>
    );
};

export default DepartmentAssignmentTab;