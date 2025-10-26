// components/matrix/TaskDashboardTab.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Task, Role, Department, UserTask } from '../../types.ts';

interface TaskDashboardTabProps {
    tasks: Task[];
    roles: Role[];
    departments: Department[];
    companyAssignments: Record<string, Record<string, string>>;
    departmentalAssignments: Record<string, Record<string, string>>;
}

const getDisplayCodes = (task: Task) => {
    const d = { mc1: '', mc2: '', mc3: '', mc4: '' };
    if (!task || task.isGroupHeader) return d;

    if (task.mc4) d.mc4 = task.mc4;
    else if (task.mc3) d.mc3 = task.mc3;
    else if (task.mc2) d.mc2 = task.mc2;
    else if (task.mc1) d.mc1 = task.mc1;
    
    return d;
};

const getRowClassName = (rowData: any): string => {
    const classes = ['hover:bg-slate-50'];
    // rowData can be UserTask or an object with mc columns from dept view
    if (rowData.mc1 && !rowData.mc2) {
        classes.push('font-bold');
    }
    if (rowData.mc2 && !rowData.mc3) {
        classes.push('font-bold', 'italic');
    }
    return classes.join(' ');
};


const TaskDashboardTab: React.FC<TaskDashboardTabProps> = ({ tasks, roles, departments, companyAssignments, departmentalAssignments }) => {
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<string>('__ALL__');
    const [selectedRole, setSelectedRole] = useState<string>('__ALL__');
    const [results, setResults] = useState<any[]>([]);
    const [stats, setStats] = useState('');
    const [isDepartmentView, setIsDepartmentView] = useState(false);

    const sortedDepartments = useMemo(() => [...departments].sort((a, b) => a.priority - b.priority), [departments]);
    
    useEffect(() => {
        if(sortedDepartments.length > 0 && !selectedDept) {
            setSelectedDept(sortedDepartments[0].code);
        }
    }, [sortedDepartments, selectedDept]);

    const staffInDept = useMemo(() => {
        if (!selectedDept) return [];
        return roles.filter(r => r.departmentCode === selectedDept).sort((a, b) => a.name.localeCompare(b.name));
    }, [selectedDept, roles]);

    const handleViewClick = () => {
        if (!selectedDept) {
            alert('Vui lòng chọn một phòng ban.');
            return;
        }

        const roleFilter = selectedRole === '__ALL__' ? null : selectedRole;

        if (selectedStaff === '__ALL__') {
            // Department View
            setIsDepartmentView(true);
            const staffIdsInDept = staffInDept.map(s => s.id);
            const deptResults: any[] = [];
            let allRolesForStats: string[] = [];

            tasks.forEach(task => {
                if(task.isGroupHeader) return;
                
                const displayCodes = getDisplayCodes(task);
                const assignmentRow: any = {
                    mc1: displayCodes.mc1,
                    mc2: displayCodes.mc2,
                    mc3: displayCodes.mc3,
                    mc4: displayCodes.mc4,
                    'Tên Công việc': task.name,
                };
                let hasAssignmentInDept = false;

                staffInDept.forEach(staff => {
                    const inheritedRole = companyAssignments[task.id]?.[selectedDept];
                    const specificRole = departmentalAssignments[task.id]?.[staff.id];
                    const finalRole = specificRole || inheritedRole;

                    if (finalRole && (!roleFilter || finalRole === roleFilter)) {
                        assignmentRow[staff.name] = finalRole;
                        hasAssignmentInDept = true;
                        allRolesForStats.push(finalRole);
                    } else {
                         assignmentRow[staff.name] = '';
                    }
                });

                if(hasAssignmentInDept) {
                    deptResults.push(assignmentRow);
                }
            });
            setResults(deptResults);
            updateStats(allRolesForStats);
        } else {
            // Staff View
            setIsDepartmentView(false);
            const userTasks: UserTask[] = [];
            tasks.forEach(task => {
                if(task.isGroupHeader) return;

                const inheritedRole = companyAssignments[task.id]?.[selectedDept];
                const specificRole = departmentalAssignments[task.id]?.[selectedStaff];
                const finalRole = specificRole || inheritedRole;

                if (finalRole && (!roleFilter || finalRole === roleFilter)) {
                    const displayCodes = getDisplayCodes(task);
                    userTasks.push({
                        id: task.id,
                        employeeId: selectedStaff,
                        rowNumber: task.rowNumber,
                        mc1: displayCodes.mc1,
                        mc2: displayCodes.mc2,
                        mc3: displayCodes.mc3,
                        mc4: displayCodes.mc4,
                        fullCode: [task.mc1, task.mc2, task.mc3, task.mc4].filter(Boolean).join('.'),
                        taskName: task.name,
                        role: finalRole,
                    });
                }
            });
            setResults(userTasks);
            updateStats(userTasks.map(t => t.role));
        }
    };

    const updateStats = (roleList: string[]) => {
        const counts = roleList.reduce((acc, role) => {
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const statsParts = [
            `Tổng cộng: ${roleList.length} lượt`,
            counts.T ? `Thực hiện (T): ${counts.T}` : null,
            counts.Q ? `Quyết định (Q): ${counts.Q}` : null,
            counts.K ? `Kiểm soát (K): ${counts.K}` : null,
            counts.P ? `Phối hợp (P): ${counts.P}` : null,
            counts.B ? `Báo cáo (B): ${counts.B}` : null,
        ];
        setStats(`Thống kê: ${statsParts.filter(Boolean).join(' | ')}`);
    }

    const StaffViewGrid = () => (
        <table className="min-w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-slate-100 z-10">
                <tr>
                    {['MC1','MC2','MC3','MC4', 'Vai trò', 'Tên Công việc'].map(h => 
                        <th key={h} className={`p-2 border font-semibold text-left ${h === 'MC1' ? 'font-bold' : ''}`}>{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {results.map((task: UserTask, index) => (
                    <tr key={index} className={getRowClassName(task)}>
                        <td className="p-2 border text-center w-12">{task.mc1}</td>
                        <td className="p-2 border text-center w-12">{task.mc2}</td>
                        <td className="p-2 border text-center w-12">{task.mc3}</td>
                        <td className="p-2 border text-center w-12">{task.mc4}</td>
                        <td className="p-2 border text-center w-20 font-bold">{task.role}</td>
                        <td className="p-2 border">{task.taskName}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const DepartmentViewGrid = () => {
        const columns = results.length > 0 ? Object.keys(results[0]) : [];
        return (
            <table className="min-w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-slate-100 z-10">
                    <tr>
                        {columns.map(col => <th key={col} className={`p-2 border font-semibold text-left whitespace-nowrap ${col.toLowerCase() === 'mc1' ? 'font-bold' : ''}`}>{col}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {results.map((row, index) => (
                        <tr key={index} className={getRowClassName(row)}>
                            {columns.map(col => <td key={col} className={`p-2 border ${['mc1','mc2','mc3','mc4'].includes(col.toLowerCase()) ? 'text-center' : ''}`}>{row[col]}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="p-4 h-full flex flex-col space-y-4">
            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium">1. Chọn Phòng ban:</label>
                    <select value={selectedDept || ''} onChange={e => setSelectedDept(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md">
                        {sortedDepartments.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium">2. Chọn Nhân viên:</label>
                    <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md">
                        <option value="__ALL__">(Tất cả Nhân viên trong Phòng)</option>
                        {staffInDept.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium">3. Chọn vai trò:</label>
                    <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md">
                        <option value="__ALL__">(Tất cả vai trò)</option>
                        {['Q', 'T', 'K', 'B', 'P'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <button onClick={handleViewClick} className="w-full p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Xem Nhiệm vụ</button>
            </div>
            <div className="flex-shrink-0 p-2 bg-slate-50 rounded-md text-sm font-semibold">{stats}</div>
            <div className="flex-1 overflow-auto border border-slate-200 rounded-md">
                {results.length === 0 ? (
                     <div className="flex justify-center items-center h-full text-slate-500">Chọn bộ lọc và nhấn "Xem Nhiệm vụ" để bắt đầu.</div>
                ) : (
                    isDepartmentView ? <DepartmentViewGrid /> : <StaffViewGrid />
                )}
            </div>
             <div className="flex-shrink-0 flex justify-end">
                <button className="px-4 py-2 text-sm bg-slate-200 rounded hover:bg-slate-300">Xuất ra Excel</button>
            </div>
        </div>
    );
};

export default TaskDashboardTab;