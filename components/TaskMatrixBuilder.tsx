// components/TaskMatrixBuilder.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Task, Role, Department, MatrixContextInput, ChatMessage, VersionData, VersionInfo } from '../types.ts';
import { MATRIX_BUILDER_INITIAL_INPUTS } from '../constants.tsx';
import AiCockpit from './matrix/AiCockpit.tsx';
import TaskListTab from './matrix/TaskListTab.tsx';
import CompanyMatrixTab from './matrix/CompanyMatrixTab.tsx';
import DepartmentAssignmentTab from './matrix/DepartmentAssignmentTab.tsx';
import VersionManagerTab from './matrix/VersionManagerTab.tsx';
import TaskDashboardTab from './matrix/TaskDashboardTab.tsx';
import ProcessLookupTab from './matrix/ProcessLookupTab.tsx';
import MatrixAuditTab from './matrix/MatrixAuditTab.tsx';
import * as versionManager from '../services/versionManager.ts';


type MainTab = 'cockpit' | 'view-tasks' | 'lookup' | 'audit';
type CockpitTab = 'tasks' | 'company-matrix' | 'detail-assignment' | 'versions';

interface TaskMatrixBuilderProps {
    departments: Department[];
    roles: Role[];
}

const TaskMatrixBuilder: React.FC<TaskMatrixBuilderProps> = ({ departments, roles }) => {
    const [activeMainTab, setActiveMainTab] = useState<MainTab>('cockpit');
    const [activeCockpitTab, setActiveCockpitTab] = useState<CockpitTab>('tasks');
    const [isLoading, setIsLoading] = useState(false);
    
    // State for the entire workflow
    const [contextInputs, setContextInputs] = useState<MatrixContextInput[]>(MATRIX_BUILDER_INITIAL_INPUTS);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [generatedTaskMarkdown, setGeneratedTaskMarkdown] = useState('');
    const [companyMatrixAssignments, setCompanyMatrixAssignments] = useState<Record<string, Record<string, string>>>({});
    const [departmentalAssignments, setDepartmentalAssignments] = useState<Record<string, Record<string, string>>>({});

    // New state for AI Advisor
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [lastAiResponse, setLastAiResponse] = useState<string>('');
    const [isAiCockpitCollapsed, setIsAiCockpitCollapsed] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    
    // State for version management
    const [versions, setVersions] = useState<VersionInfo[]>([]);


    // Load active matrix and versions from local storage on initial render
    useEffect(() => {
        const activeData = versionManager.loadActiveMatrix();
        if (activeData) {
            setTasks(activeData.tasks || []);
            setCompanyMatrixAssignments(activeData.companyAssignments || {});
            setDepartmentalAssignments(activeData.departmentalAssignments || {});
            setGeneratedTaskMarkdown(activeData.generatedTaskMarkdown || '');
            console.log("Loaded active matrix from storage.");
        }
        setVersions(versionManager.getVersions());
    }, []);
    
    const handleContextChange = (id: number, answer: string) => {
        setContextInputs(prevInputs => 
            prevInputs.map(input => 
                input.id === id ? { ...input, answer } : input
            )
        );
    };

    const handleApplyToNote = (content: string) => {
        if (contextInputs.length === 0) return;
        
        // Always target the last input for simplicity and predictability
        const targetInput = contextInputs[contextInputs.length - 1];

        const currentAnswer = targetInput.answer.startsWith("VD:") ? '' : targetInput.answer;
        
        handleContextChange(targetInput.id, (currentAnswer ? currentAnswer + '\n\n' : '') + `[AI Ghi chú]:\n${content}`);
        
        alert('Đã áp dụng ghi chú vào mục cuối cùng: "Kỳ vọng về Phân công".');
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
                    if (numbers.length >= 2) mc2 = letter + numbers.substring(0, 2);
                    if (numbers.length >= 3) mc3 = letter + numbers.substring(0, 3);
                    if (numbers.length >= 4) mc4 = letter + numbers.substring(0, 4);
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
    
     const handleSaveVersion = () => {
        if (tasks.length === 0) {
            alert("Không có dữ liệu ma trận để lưu.");
            return;
        }
        const versionName = prompt("Nhập tên cho phiên bản này:", `Phiên bản ngày ${new Date().toLocaleDateString()}`);
        if (versionName && versionName.trim()) {
            const versionData: VersionData = {
                tasks,
                companyAssignments: companyMatrixAssignments,
                departmentalAssignments,
                generatedTaskMarkdown,
                departments,
                roles
            };
            const newVersions = versionManager.saveVersion(versionName.trim(), versionData);
            setVersions(newVersions);
            alert(`Đã lưu thành công phiên bản '${versionName.trim()}'.\nBạn có thể xem lại trong tab '4. Quản lý Phiên bản'.`);
        }
    };

    const handleLoadVersion = (data: VersionData) => {
        if (window.confirm("Thao tác này sẽ ghi đè toàn bộ dữ liệu làm việc hiện tại. Bạn có chắc chắn muốn tải phiên bản này không?")) {
            setTasks(data.tasks);
            setCompanyMatrixAssignments(data.companyAssignments);
            setDepartmentalAssignments(data.departmentalAssignments);
            setGeneratedTaskMarkdown(data.generatedTaskMarkdown);
            // Departments and roles are now managed globally, so we don't load them here
            // to avoid overwriting company settings.
            setActiveCockpitTab('tasks');
            alert("Đã tải phiên bản thành công vào buồng lái.");
        }
    };

    const handleActivateMatrix = () => {
        if (tasks.length === 0) {
            alert("Không có dữ liệu để kích hoạt.");
            return;
        }
        if (window.confirm("Hành động này sẽ lưu ma trận hiện tại làm phiên bản hoạt động chính.\n\nDữ liệu này sẽ được tự động tải lại vào lần sau khi bạn mở ứng dụng.\n\nBạn có chắc chắn muốn tiếp tục?")) {
            const dataToSave: VersionData = {
                tasks,
                companyAssignments: companyMatrixAssignments,
                departmentalAssignments,
                generatedTaskMarkdown,
                departments,
                roles
            };
            versionManager.saveActiveMatrix(dataToSave);
            alert('Ma trận đã được kích hoạt thành công!\n\nPhiên bản này sẽ được tự động tải vào lần làm việc tiếp theo của bạn.');
        }
    };

    const handleRenameVersion = (id: string, newName: string) => {
        const updatedVersions = versionManager.renameVersion(id, newName);
        setVersions(updatedVersions);
    };

    const handleDeleteVersion = (id: string) => {
        const updatedVersions = versionManager.deleteVersion(id);
        setVersions(updatedVersions);
    };


    const renderCockpitContent = () => {
        switch(activeCockpitTab) {
            case 'tasks': return <TaskListTab tasks={tasks} setTasks={setTasks} isLoading={isLoading} />;
            case 'company-matrix': return <CompanyMatrixTab tasks={tasks} setTasks={setTasks} departments={departments} assignments={companyMatrixAssignments} onSaveVersion={handleSaveVersion} onActivateMatrix={handleActivateMatrix} />;
            case 'detail-assignment': return <DepartmentAssignmentTab tasks={tasks} roles={roles} departments={departments} allAssignments={departmentalAssignments} setAllAssignments={setDepartmentalAssignments} companyAssignments={companyMatrixAssignments} onSaveVersion={handleSaveVersion} onActivateMatrix={handleActivateMatrix} />;
            case 'versions': return <VersionManagerTab versions={versions} onLoadVersion={handleLoadVersion} onRenameVersion={handleRenameVersion} onDeleteVersion={handleDeleteVersion} roles={roles} departments={departments}/>;
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
                                {[{id: 'tasks', label: '1. DS Công việc'}, {id: 'company-matrix', label: '2. Ma trận Cấp Công ty'}, {id: 'detail-assignment', label: '3. Phân nhiệm Chi tiết'}, {id: 'versions', label: '4. Quản lý Phiên bản'}].map(tab => (
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
            case 'view-tasks': return <TaskDashboardTab tasks={tasks} roles={roles} departments={departments} companyAssignments={companyMatrixAssignments} departmentalAssignments={departmentalAssignments} />;
            case 'lookup': return <ProcessLookupTab tasks={tasks} />;
            case 'audit': return <MatrixAuditTab tasks={tasks} roles={roles} departments={departments} companyAssignments={companyMatrixAssignments} departmentalAssignments={departmentalAssignments} />;
            default: return <div className="p-4 text-slate-500">Chức năng này đang được xây dựng.</div>;
        }
    };

    return (
        <div className="h-full flex flex-col bg-white text-slate-800 text-sm">
             <header className="flex-shrink-0 p-3 border-b border-slate-200 flex space-x-2 overflow-x-auto">
                 {[{id: 'cockpit', label: 'Xây dựng Ma trận phân nhiệm'}, {id: 'view-tasks', label: 'Xem Nhiệm vụ'}, {id: 'lookup', label: 'Tra cứu Quy trình'}, {id: 'audit', label: 'Kiểm tra Ma trận'}].map(tab => (
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
                    departments={departments.sort((a,b) => a.priority - b.priority)}
                    chatMessages={chatMessages}
                    setChatMessages={setChatMessages}
                    lastAiResponse={lastAiResponse}
                    setLastAiResponse={setLastAiResponse}
                    isAiCockpitCollapsed={isAiCockpitCollapsed}
                    setIsAiCockpitCollapsed={setIsAiCockpitCollapsed}
                    attachedFile={attachedFile}
                    setAttachedFile={setAttachedFile}
                    onApplyToNote={handleApplyToNote}
                />
            </div>
        </div>
    );
};

export default TaskMatrixBuilder;