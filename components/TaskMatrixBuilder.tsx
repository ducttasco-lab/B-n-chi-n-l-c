// components/TaskMatrixBuilder.tsx
import React, { useState, useEffect } from 'react';
import { Department, Role, Task, ChatMessage, VersionInfo, VersionData } from '../types.ts';
// FIX: Corrected icon imports to match available exports.
import { TableCellsIcon, ListBulletIcon, BuildingOfficeIcon, UserGroupIcon, DocumentDuplicateIcon, CircleStackIcon, ChartBarIcon } from './icons.tsx';
import AiCockpit from './matrix/AiCockpit.tsx';
import TaskListTab from './matrix/TaskListTab.tsx';
import CompanyMatrixTab from './matrix/CompanyMatrixTab.tsx';
import DepartmentAssignmentTab from './matrix/DepartmentAssignmentTab.tsx';
import PersonnelManagerTab from './matrix/PersonnelManagerTab.tsx';
import VersionManagerTab from './matrix/VersionManagerTab.tsx';
import MatrixAuditTab from './matrix/MatrixAuditTab.tsx';
import TaskDashboardTab from './matrix/TaskDashboardTab.tsx';
import ProcessLookupTab from './matrix/ProcessLookupTab.tsx';
import * as versionManager from '../services/versionManager.ts';
import { parseTasksFromMarkdown } from '../../utils/markdown.ts';

type MatrixTab = 'tasks' | 'company' | 'department' | 'personnel' | 'versions' | 'audit' | 'dashboard' | 'process';

interface TaskMatrixBuilderProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    departments: Department[];
    setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    generatedTaskMarkdown: string;
    setGeneratedTaskMarkdown: React.Dispatch<React.SetStateAction<string>>;
    companyMatrixAssignments: Record<string, Record<string, string>>;
    setCompanyMatrixAssignments: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>;
    departmentalAssignments: Record<string, Record<string, string>>;
    setDepartmentalAssignments: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>;
    versions: VersionInfo[];
    setVersions: React.Dispatch<React.SetStateAction<VersionInfo[]>>;
}

const parseMarkdownTable = (markdown: string): { headers: string[], rows: string[][] } => {
    if (!markdown) return { headers: [], rows: [] };
    const lines = markdown.split('\n').map(line => line.trim()).filter(line => line.startsWith('|'));
    if (lines.length < 2) return { headers: [], rows: [] };
    
    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    const rows = lines.slice(2).map(line => line.split('|').map(cell => cell.trim()).filter((_, i) => i > 0 && i <= headers.length));
    return { headers, rows };
};


const TaskMatrixBuilder: React.FC<TaskMatrixBuilderProps> = ({
    tasks, setTasks, departments, setDepartments, roles, setRoles,
    generatedTaskMarkdown, setGeneratedTaskMarkdown,
    companyMatrixAssignments, setCompanyMatrixAssignments,
    departmentalAssignments, setDepartmentalAssignments,
    versions, setVersions
}) => {
    const [activeTab, setActiveTab] = useState<MatrixTab>('tasks');
    const [isLoading, setIsLoading] = useState(false);
    
    // AI Cockpit State
    const [contextInputs, setContextInputs] = useState([
        { id: 1, question: "Mô tả ngắn gọn về Doanh nghiệp", answer: "" },
        { id: 2, question: "Quy trình/Hoạt động chính", answer: "" },
        { id: 3, question: "Kỳ vọng về Phân công", answer: "" }
    ]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [lastAiResponse, setLastAiResponse] = useState('');
    const [isAiCockpitCollapsed, setIsAiCockpitCollapsed] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);

    // Save active state to local storage on change
    useEffect(() => {
        const activeData: VersionData = {
            tasks, departments, roles, generatedTaskMarkdown,
            // FIX: Corrected typo from `companyAssignments` to `companyMatrixAssignments` to match prop name.
            companyAssignments: companyMatrixAssignments, departmentalAssignments
        };
        versionManager.saveActiveMatrix(activeData);
    // FIX: Corrected typo in dependency array from `companyAssignments` to `companyMatrixAssignments`.
    }, [tasks, departments, roles, generatedTaskMarkdown, companyMatrixAssignments, departmentalAssignments]);

    const handleTasksGenerated = (markdown: string) => {
        setGeneratedTaskMarkdown(markdown);
        const newTasks = parseTasksFromMarkdown(markdown);
        setTasks(newTasks);
        setActiveTab('tasks');
    };
    
     const handleCompanyMatrixGenerated = (markdown: string) => {
        const { headers, rows } = parseMarkdownTable(markdown);
        const deptHeaders = headers.slice(5);
        const newAssignments: Record<string, Record<string, string>> = {};

        rows.forEach((row, index) => {
            const task = tasks[index];
            if (task && !task.isGroupHeader) {
                const assignmentsForRow: Record<string, string> = {};
                deptHeaders.forEach((deptName, deptIndex) => {
                    const dept = departments.find(d => d.name === deptName);
                    if (dept) {
                        const role = row[deptIndex + 5];
                        if (role) {
                            assignmentsForRow[dept.code] = role;
                        }
                    }
                });
                newAssignments[task.id] = assignmentsForRow;
            }
        });

        setCompanyMatrixAssignments(newAssignments);
        setActiveTab('company');
    };

    const loadVersionData = (data: VersionData) => {
        setTasks(data.tasks || []);
        setDepartments(data.departments || []);
        setRoles(data.roles || []);
        setGeneratedTaskMarkdown(data.generatedTaskMarkdown || '');
        setCompanyMatrixAssignments(data.companyAssignments || {});
        setDepartmentalAssignments(data.departmentalAssignments || {});
    };

    const tabs = [
        { id: 'tasks', label: 'Danh sách Nhiệm vụ', icon: <ListBulletIcon /> },
        { id: 'company', label: 'Ma trận Cấp Công ty', icon: <TableCellsIcon /> },
        { id: 'department', label: 'Phân nhiệm Chi tiết', icon: <UserGroupIcon /> },
        { id: 'personnel', label: 'Quản lý Nhân sự', icon: <BuildingOfficeIcon /> },
        { id: 'process', label: 'Tra cứu Quy trình', icon: <DocumentDuplicateIcon /> },
        { id: 'audit', label: 'Kiểm tra Logic', icon: <CircleStackIcon /> },
        { id: 'dashboard', label: 'Bảng Tổng hợp', icon: <ChartBarIcon /> },
        { id: 'versions', label: 'Quản lý Phiên bản', icon: <CircleStackIcon /> },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'tasks': return <TaskListTab tasks={tasks} setTasks={setTasks} isLoading={isLoading} />;
            case 'company': return <CompanyMatrixTab tasks={tasks} departments={departments} assignments={companyMatrixAssignments} setAssignments={setCompanyMatrixAssignments} isLoading={isLoading} />;
            case 'department': return <DepartmentAssignmentTab tasks={tasks} roles={roles} departments={departments} companyAssignments={companyMatrixAssignments} departmentalAssignments={departmentalAssignments} setDepartmentalAssignments={setDepartmentalAssignments} />;
            case 'personnel': return <PersonnelManagerTab departments={departments} setDepartments={setDepartments} roles={roles} setRoles={setRoles} />;
            // FIX: Corrected typo from `companyAssignments` to `companyMatrixAssignments` when constructing the `currentData` prop.
            case 'versions': return <VersionManagerTab versions={versions} setVersions={setVersions} currentData={{ tasks, departments, roles, generatedTaskMarkdown, companyAssignments: companyMatrixAssignments, departmentalAssignments }} loadVersionData={loadVersionData} />;
            case 'audit': return <MatrixAuditTab tasks={tasks} roles={roles} departments={departments} companyAssignments={companyMatrixAssignments} departmentalAssignments={departmentalAssignments} />;
            case 'dashboard': return <TaskDashboardTab tasks={tasks} roles={roles} departments={departments} companyAssignments={companyMatrixAssignments} departmentalAssignments={departmentalAssignments} />;
            case 'process': return <ProcessLookupTab tasks={tasks} />;
            default: return null;
        }
    };

    return (
        <div className="h-full flex">
            {/* Main Content */}
            <div className="flex-[3] flex flex-col">
                <div className="flex-shrink-0 bg-white p-2 border-b border-slate-200">
                     <div className="flex items-center space-x-1">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as MatrixTab)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <main className="flex-1 overflow-auto bg-white">
                    {renderContent()}
                </main>
            </div>
            
            {/* AI Cockpit */}
            <AiCockpit 
                contextInputs={contextInputs}
                onContextChange={(id, answer) => setContextInputs(prev => prev.map(i => i.id === id ? { ...i, answer } : i))}
                onTasksGenerated={handleTasksGenerated}
                onCompanyMatrixGenerated={handleCompanyMatrixGenerated}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                tasksGenerated={tasks.length > 0}
                generatedTaskMarkdown={generatedTaskMarkdown}
                departments={departments}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                lastAiResponse={lastAiResponse}
                setLastAiResponse={setLastAiResponse}
                isAiCockpitCollapsed={isAiCockpitCollapsed}
                setIsAiCockpitCollapsed={setIsAiCockpitCollapsed}
                attachedFile={attachedFile}
                setAttachedFile={setAttachedFile}
                onApplyToNote={(content) => {
                    const currentNote = contextInputs[0].answer;
                    setContextInputs(prev => prev.map(i => i.id === 1 ? {...i, answer: `${currentNote}\n\n[AI Ghi chú]:\n${content}`} : i));
                }}
            />
        </div>
    );
};

export default TaskMatrixBuilder;