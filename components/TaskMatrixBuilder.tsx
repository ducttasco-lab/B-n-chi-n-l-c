// components/TaskMatrixBuilder.tsx
import React, { useState, useMemo } from 'react';
import { Task, Role, Department, MatrixContextInput } from '../types.ts';
import { MOCK_ROLES, MOCK_DEPARTMENTS, MATRIX_BUILDER_INITIAL_INPUTS } from '../constants.tsx';
import AiCockpit from './matrix/AiCockpit.tsx';
import TaskListTab from './matrix/TaskListTab.tsx';
import CompanyMatrixTab from './matrix/CompanyMatrixTab.tsx';
import DepartmentAssignmentTab from './matrix/DepartmentAssignmentTab.tsx';
import PersonnelManagerTab from './matrix/PersonnelManagerTab.tsx';
import VersionManagerTab from './matrix/VersionManagerTab.tsx';
import TaskDashboardTab from './matrix/TaskDashboardTab.tsx';
import ProcessLookupTab from './matrix/ProcessLookupTab.tsx';
import MatrixAuditTab from './matrix/MatrixAuditTab.tsx';

type MainTab = 'cockpit' | 'view-tasks' | 'lookup' | 'audit';
type CockpitTab = 'tasks' | 'company-matrix' | 'detail-assignment' | 'personnel' | 'versions';

const TaskMatrixBuilder: React.FC = () => {
    const [activeMainTab, setActiveMainTab] = useState<MainTab>('cockpit');
    const [activeCockpitTab, setActiveCockpitTab] = useState<CockpitTab>('personnel');
    const [isLoading, setIsLoading] = useState(false);
    
    // State for the entire workflow
    const [contextInputs, setContextInputs] = useState<MatrixContextInput[]>(MATRIX_BUILDER_INITIAL_INPUTS);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [generatedTaskMarkdown, setGeneratedTaskMarkdown] = useState('');
    const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
    const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
    const [companyMatrixAssignments, setCompanyMatrixAssignments] = useState<Record<string, Record<string, string>>>({});
    const [departmentalAssignments, setDepartmentalAssignments] = useState<Record<string, Record<string, string>>>({});
    
    const handleContextChange = (id: number, answer: string) => {
        setContextInputs(prevInputs => 
            prevInputs.map(input => 
                input.id === id ? { ...input, answer } : input
            )
        );
    };

    const handleTasksGenerated = (markdown: string) => {
        setGeneratedTaskMarkdown(markdown);
        try {
            const lines = markdown.split('\n').filter(line => line.trim().startsWith('|') && !line.includes('---'));
            const headerLine = lines[0];
            const isTwoColumn = headerLine.split('|').length - 2 === 2;

            if (!isTwoColumn) throw new Error("Expecting a 2-column markdown table for tasks.");

            const parsedTasks: Task[] = lines.slice(1).map((line, index) => {
                const columns = line.split('|').map(c => c.trim()).slice(1,-1);
                const hierarchicalCode = columns[0] || '';
                const name = columns[1] || 'Unnamed Task';
                const isGroup = name.startsWith('**');
                
                let mc1 = '', mc2 = '', mc3 = '', mc4 = '';
                if (hierarchicalCode.match(/^[A-Z][0-9]+$/)) {
                    const letter = hierarchicalCode.substring(0,1);
                    const numbers = hierarchicalCode.substring(1);
                    if (numbers.length >= 1) mc1 = letter + numbers.substring(0, 1);
                    if (numbers.length >= 2) mc2 = mc1 + numbers.substring(1, 2);
                    if (numbers.length >= 3) mc3 = mc2 + numbers.substring(2, 3);
                    if (numbers.length >= 4) mc4 = mc3 + numbers.substring(3, 4);
                }

                return {
                    id: `task-${index}`,
                    rowNumber: index + 1,
                    mc1, mc2, mc3, mc4,
                    name: name.replace(/\*\*/g, ''),
                    isGroupHeader: isGroup,
                    assignments: {}
                };
            });
            setTasks(parsedTasks);
            setActiveCockpitTab('tasks');
        } catch (error) {
            console.error("Error parsing task markdown:", error);
            alert("Đã có lỗi khi phân tích danh sách công việc từ AI. Vui lòng thử lại.");
            setTasks([]);
        }
    };
    
    const handleCompanyMatrixGenerated = (markdown: string) => {
        try {
            const lines = markdown.split('\n').filter(line => line.trim().startsWith('|') && !line.includes('---'));
            if (lines.length < 2) return;

            const headerCells = lines[0].split('|').map(h => h.trim()).slice(1, -1);
            const deptHeaders = headerCells.slice(5); // Department names start from column 6
            const newAssignments: Record<string, Record<string, string>> = {};

            lines.slice(1).forEach((line, index) => {
                if (index >= tasks.length) return;
                const task = tasks[index];
                if (task.isGroupHeader) return;

                const cells = line.split('|').map(c => c.trim()).slice(1, -1);
                const assignmentRow: Record<string, string> = {};

                deptHeaders.forEach((deptName, deptIndex) => {
                    const roleSymbol = cells[5 + deptIndex];
                    if (roleSymbol) {
                        const dept = departments.find(d => d.name === deptName);
                        if (dept) {
                             assignmentRow[dept.code] = roleSymbol;
                        }
                    }
                });
                newAssignments[task.id] = assignmentRow;
            });

            setCompanyMatrixAssignments(newAssignments);
            setActiveCockpitTab('company-matrix');
        } catch (error) {
            console.error("Error parsing company matrix:", error);
            alert("Đã có lỗi khi phân tích ma trận cấp công ty từ AI.");
        }
    };


    const renderCockpitContent = () => {
        switch(activeCockpitTab) {
            case 'tasks': return <TaskListTab tasks={tasks} setTasks={setTasks} isLoading={isLoading} />;
            case 'company-matrix': return <CompanyMatrixTab tasks={tasks} departments={departments} assignments={companyMatrixAssignments} />;
            case 'detail-assignment': return <DepartmentAssignmentTab tasks={tasks} roles={roles} departments={departments} allAssignments={departmentalAssignments} setAllAssignments={setDepartmentalAssignments} companyAssignments={companyMatrixAssignments} />;
            case 'personnel': return <PersonnelManagerTab departments={departments} setDepartments={setDepartments} roles={roles} setRoles={setRoles} />;
            case 'versions': return <VersionManagerTab />;
            default: return null;
        }
    };
    
    const renderMainContent = () => {
        switch(activeMainTab) {
            case 'cockpit':
                return (
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="border-b border-slate-200 flex-shrink-0">
                             <div className="flex space-x-1 px-2 overflow-x-auto">
                                {[{id: 'tasks', label: '1. DS Công việc'}, {id: 'company-matrix', label: '2. Ma trận Cấp Công ty'}, {id: 'detail-assignment', label: '3. Phân nhiệm Chi tiết'}, {id: 'personnel', label: '4. Quản lý Nhân sự'}, {id: 'versions', label: '5. Quản lý Phiên bản'}].map(tab => (
                                    <button key={tab.id} onClick={() => setActiveCockpitTab(tab.id as CockpitTab)} className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${activeCockpitTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 p-2 overflow-auto">
                            {renderCockpitContent()}
                        </div>
                    </div>
                );
            case 'view-tasks': return <TaskDashboardTab />;
            case 'lookup': return <ProcessLookupTab />;
            case 'audit': return <MatrixAuditTab />;
            default: return <div className="p-4 text-slate-500">Chức năng này đang được xây dựng.</div>;
        }
    };

    return (
        <div className="h-full flex flex-col bg-white text-slate-800">
             <header className="flex-shrink-0 p-3 border-b border-slate-200 flex space-x-2 overflow-x-auto">
                 {[{id: 'cockpit', label: 'Buồng lái Xây dựng Ma trận (AI)'}, {id: 'view-tasks', label: 'Xem Nhiệm vụ'}, {id: 'lookup', label: 'Tra cứu Quy trình'}, {id: 'audit', label: 'Kiểm tra Ma trận'}].map(tab => (
                    <button key={tab.id} onClick={() => setActiveMainTab(tab.id as MainTab)} className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeMainTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {tab.label}
                    </button>
                ))}
            </header>
            <div className="flex-1 flex min-h-0">
                {/* Left Panel: Work Area */}
                <div className="flex-[2] border-r border-slate-200 flex flex-col min-h-0">
                    {renderMainContent()}
                </div>
                {/* Right Panel: AI Cockpit */}
                <AiCockpit
                    contextInputs={contextInputs}
                    onContextChange={handleContextChange}
                    onTasksGenerated={handleTasksGenerated}
                    onCompanyMatrixGenerated={handleCompanyMatrixGenerated}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    tasksGenerated={tasks.length > 0}
                    generatedTaskMarkdown={generatedTaskMarkdown}
                    departments={departments.sort((a,b) => a.priority - b.priority).map(d => d.name)}
                />
            </div>
        </div>
    );
};

export default TaskMatrixBuilder;