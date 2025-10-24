// components/matrix/MatrixAuditTab.tsx
import React, { useState } from 'react';
import { Task, Role, Department, AuditFinding } from '../../types.ts';

interface MatrixAuditTabProps {
    tasks: Task[];
    roles: Role[];
    departments: Department[];
    companyAssignments: Record<string, Record<string, string>>;
    departmentalAssignments: Record<string, Record<string, string>>;
}

const MatrixAuditTab: React.FC<MatrixAuditTabProps> = ({ tasks, roles, companyAssignments, departmentalAssignments }) => {
    const [rules, setRules] = useState({
        missingT: true,
        missingQ: true,
        multipleQ: true,
        missingK: true,
    });
    const [findings, setFindings] = useState<AuditFinding[]>([]);
    const [summary, setSummary] = useState('Kết quả kiểm tra sẽ được hiển thị ở đây.');

    const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setRules(prev => ({ ...prev, [name]: checked }));
    };

    const runAudit = () => {
        const newFindings: AuditFinding[] = [];

        tasks.forEach(task => {
            if (task.isGroupHeader) return;

            const finalRoles: string[] = [];
            // Get all staff members who could potentially have a role for this task
            const allStaff = roles;
            
            allStaff.forEach(staff => {
                // Specific assignment to staff takes highest priority
                const specificRole = departmentalAssignments[task.id]?.[staff.id];
                if (specificRole) {
                    finalRoles.push(specificRole.toUpperCase());
                    return; // Move to next staff member
                }

                // If no specific assignment, check for inherited department role
                const inheritedRole = companyAssignments[task.id]?.[staff.departmentCode];
                if(inheritedRole) {
                    finalRoles.push(inheritedRole.toUpperCase());
                }
            });

            if (rules.missingT && !finalRoles.includes('T')) {
                // FIX: Removed redundant `taskId` and `taskName` properties. The `...task` spread already includes `id` and `name`.
                newFindings.push({ ...task, findingType: "Thiếu vai trò 'Thực hiện' (T)" });
            }
            if (rules.missingQ && !finalRoles.includes('Q')) {
                // FIX: Removed redundant `taskId` and `taskName` properties. The `...task` spread already includes `id` and `name`.
                newFindings.push({ ...task, findingType: "Thiếu vai trò 'Quyết định' (Q)" });
            }
            if (rules.multipleQ && finalRoles.filter(r => r === 'Q').length > 1) {
                // FIX: Removed redundant `taskId` and `taskName` properties. The `...task` spread already includes `id` and `name`.
                newFindings.push({ ...task, findingType: "Có nhiều hơn 1 vai trò 'Quyết định' (Q)" });
            }
            if (rules.missingK && !finalRoles.includes('K')) {
                // FIX: Removed redundant `taskId` and `taskName` properties. The `...task` spread already includes `id` and `name`.
                newFindings.push({ ...task, findingType: "Thiếu vai trò 'Kiểm soát' (K)" });
            }
        });
        
        setFindings(newFindings);
        if (newFindings.length > 0) {
            setSummary(`Kết quả: Tìm thấy ${newFindings.length} lỗi tiềm ẩn.`);
        } else {
            setSummary('Chúc mừng! Không tìm thấy lỗi logic nào trong Ma trận Phân nhiệm.');
        }
    };
    
    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <div className="flex-shrink-0 flex items-center gap-8 p-4 border border-slate-200 rounded-md">
                <div className="space-y-2">
                    <h3 className="font-bold">Chọn các quy tắc cần kiểm tra</h3>
                    <label className="flex items-center gap-2"><input type="checkbox" name="missingT" checked={rules.missingT} onChange={handleRuleChange}/> Công việc thiếu vai trò Thực hiện (T)</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="missingQ" checked={rules.missingQ} onChange={handleRuleChange}/> Công việc thiếu vai trò Quyết định (Q)</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="multipleQ" checked={rules.multipleQ} onChange={handleRuleChange}/> Công việc có nhiều hơn 1 vai trò Quyết định (Q)</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="missingK" checked={rules.missingK} onChange={handleRuleChange}/> Công việc thiếu vai trò Kiểm soát (K)</label>
                </div>
                <button onClick={runAudit} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 self-center">Chạy Kiểm tra</button>
            </div>
             <div className="flex-shrink-0 font-bold">{summary}</div>
            <div className="flex-1 overflow-auto border border-slate-200 rounded-md">
                 <table className="min-w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-slate-100 z-10">
                        <tr>
                            {['MC1','MC2','MC3','MC4', 'Tên Công việc', 'Nội dung Lỗi'].map(h => 
                                <th key={h} className="p-2 border font-semibold text-left">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {findings.map((finding, index) => (
                            // FIX: Used `finding.id` for the key as `taskId` does not exist on AuditFinding.
                            <tr key={`${finding.id}-${index}`} className="bg-red-50 hover:bg-red-100">
                                <td className="p-2 border text-center w-12">{finding.mc1}</td>
                                <td className="p-2 border text-center w-12">{finding.mc2}</td>
                                <td className="p-2 border text-center w-12">{finding.mc3}</td>
                                <td className="p-2 border text-center w-12">{finding.mc4}</td>
                                {/* FIX: Used `finding.name` for the task name as `taskName` does not exist on AuditFinding. */}
                                <td className="p-2 border">{finding.name}</td>
                                <td className="p-2 border font-semibold">{finding.findingType}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
                 {findings.length === 0 && <div className="p-4 text-center text-slate-500">Không có lỗi nào được tìm thấy.</div>}
            </div>
        </div>
    );
};

export default MatrixAuditTab;
