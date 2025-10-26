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
    
    if (d.mc4) { d.mc1 = d.mc2 = d.mc3 = ''; }
    else if (d.mc3) { d.mc1 = d.mc2 = ''; }
    else if (d.mc2) { d.mc1 = ''; }
    
    return d;
};


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
                    // Split in case of multi-role assignment at company level like 'Q,T'
                    inheritedRole.split(',').forEach(r => finalRoles.push(r.trim().toUpperCase()));
                }
            });

            // Count unique roles for the task across all staff
            const uniqueRoles = [...new Set(finalRoles)];

            if (rules.missingT && !uniqueRoles.includes('T')) {
                newFindings.push({ ...task, findingType: "Thiếu vai trò 'Thực hiện' (T)" });
            }
            if (rules.missingQ && !uniqueRoles.includes('Q')) {
                newFindings.push({ ...task, findingType: "Thiếu vai trò 'Quyết định' (Q)" });
            }
            if (rules.multipleQ && uniqueRoles.filter(r => r === 'Q').length > 1) {
                newFindings.push({ ...task, findingType: "Có nhiều hơn 1 vai trò 'Quyết định' (Q)" });
            }
            if (rules.missingK && !uniqueRoles.includes('K')) {
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
                                <th key={h} className={`p-2 border font-semibold text-left ${h === 'MC1' ? 'font-bold' : ''}`}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {findings.map((finding, index) => {
                            const displayCodes = getDisplayCodes(finding);
                            const isMC1 = finding.mc1 && !finding.mc2;
                            const isMC2 = finding.mc2 && !finding.mc3;
                            let rowClasses = "bg-red-50 hover:bg-red-100";
                            if (isMC2) {
                                rowClasses += " font-bold italic";
                            } else if (isMC1) {
                                rowClasses += " font-bold";
                            }
                            return (
                                <tr key={`${finding.id}-${index}`} className={rowClasses}>
                                    <td className="p-2 border text-center w-12">{displayCodes.mc1}</td>
                                    <td className="p-2 border text-center w-12">{displayCodes.mc2}</td>
                                    <td className="p-2 border text-center w-12">{displayCodes.mc3}</td>
                                    <td className="p-2 border text-center w-12">{displayCodes.mc4}</td>
                                    <td className="p-2 border">{finding.name}</td>
                                    <td className="p-2 border font-semibold">{finding.findingType}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                 </table>
                 {findings.length === 0 && <div className="p-4 text-center text-slate-500">Không có lỗi nào được tìm thấy.</div>}
            </div>
        </div>
    );
};

export default MatrixAuditTab;