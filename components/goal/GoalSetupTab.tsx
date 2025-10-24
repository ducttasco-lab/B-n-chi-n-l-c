// components/goal/GoalSetupTab.tsx
import React, { useState, useMemo } from 'react';
import { Goal, Department, Role, UserTask, KPI, PredefinedKPI } from '../../types.ts';
import { suggestKPIs } from '../../services/geminiService.ts';
import { PlusIcon, TrashIcon, SparklesIcon } from '../icons.tsx';

interface KpiLibraryModalProps {
    availableKpis: PredefinedKPI[];
    onClose: () => void;
    onSelect: (kpis: PredefinedKPI[]) => void;
}

const KpiLibraryModal: React.FC<KpiLibraryModalProps> = ({ availableKpis, onClose, onSelect }) => {
    const [selectedKpis, setSelectedKpis] = useState<Set<string>>(new Set());

    const handleToggle = (code: string) => {
        setSelectedKpis(prev => {
            const newSet = new Set(prev);
            if (newSet.has(code)) {
                newSet.delete(code);
            } else {
                newSet.add(code);
            }
            return newSet;
        });
    };

    const handleConfirm = () => {
        const selected = availableKpis.filter(kpi => selectedKpis.has(kpi.code));
        onSelect(selected);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col h-[70vh]">
                <h2 className="text-xl font-bold mb-4">Thư viện KPI</h2>
                <div className="flex-1 overflow-y-auto border-t border-b mb-4">
                    {availableKpis.map(kpi => (
                        <div key={kpi.code} className="flex items-center p-2 border-b hover:bg-slate-50">
                            <input
                                type="checkbox"
                                checked={selectedKpis.has(kpi.code)}
                                onChange={() => handleToggle(kpi.code)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-3 text-sm">
                                <label className="font-medium text-gray-900">{kpi.code}: {kpi.description}</label>
                                <p className="text-gray-500">Đơn vị: {kpi.unit} | Nhóm: {kpi.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Hủy</button>
                    <button type="button" onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Thêm mục đã chọn</button>
                </div>
            </div>
        </div>
    );
};


interface GoalSetupTabProps {
    goals: Goal[];
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    departments: Department[];
    roles: Role[];
    userTasks: UserTask[];
    predefinedKpis: PredefinedKPI[];
}

const GoalSetupTab: React.FC<GoalSetupTabProps> = ({ goals, setGoals, departments, roles, userTasks, predefinedKpis }) => {
    const [selectedDept, setSelectedDept] = useState<string | null>(departments[0]?.code || null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isKpiLibraryOpen, setIsKpiLibraryOpen] = useState(false);
    const [targetGoalIdForKpi, setTargetGoalIdForKpi] = useState<string | null>(null);
    const [isAiSuggesting, setIsAiSuggesting] = useState<string | null>(null); // Stores goalId

    const employeesInDept = useMemo(() => {
        if (!selectedDept) return [];
        return roles.filter(r => r.departmentCode === selectedDept);
    }, [selectedDept, roles]);

    const employeeTasks = useMemo(() => {
        if (!selectedEmployeeId) return [];
        return userTasks.filter(t => t.employeeId === selectedEmployeeId);
    }, [selectedEmployeeId, userTasks]);
    
    const employeeGoals = useMemo(() => {
        if (!selectedEmployeeId) return [];
        return goals.filter(g => g.employeeId === selectedEmployeeId);
    }, [selectedEmployeeId, goals]);

    const handleAddObjective = () => {
        const selectedTask = userTasks.find(t => t.id === selectedTaskId);
        const selectedEmployee = roles.find(r => r.id === selectedEmployeeId);
        if (!selectedTask || !selectedEmployee) {
            alert("Vui lòng chọn nhân viên và nhiệm vụ.");
            return;
        }

        const newGoal: Goal = {
            goalId: `goal-${Date.now()}`,
            goalDescription: `Mục tiêu mới cho: ${selectedTask.taskName}`,
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.name,
            departmentCode: selectedEmployee.departmentCode,
            linkedTaskId: selectedTask.id,
            linkedTaskName: selectedTask.taskName,
            kpis: [],
        };
        setGoals(prev => [...prev, newGoal]);
    };
    
    const handleUpdateGoal = (goalId: string, field: keyof Goal, value: any) => {
        setGoals(prev => prev.map(g => g.goalId === goalId ? { ...g, [field]: value } : g));
    };

    const handleDeleteGoal = (goalId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa mục tiêu này và tất cả KPI liên quan không?')) {
            setGoals(prev => prev.filter(g => g.goalId !== goalId));
        }
    };
    
    const handleSelectKpisFromLibrary = (selectedKpis: PredefinedKPI[]) => {
        if (!targetGoalIdForKpi) return;
        
        const newKpis: KPI[] = selectedKpis.map(pk => ({
            kpiId: `kpi-${Date.now()}-${pk.code}`,
            kpiCode: pk.code,
            description: pk.description,
            unit: pk.unit,
            baseline: 0,
            target: 0,
            actual: 0,
            progress: 0,
            history: [],
        }));

        setGoals(prev => prev.map(g => {
            if (g.goalId === targetGoalIdForKpi) {
                // Filter out already existing KPIs
                const existingKpiCodes = new Set(g.kpis.map(k => k.kpiCode));
                const kpisToAdd = newKpis.filter(nk => !existingKpiCodes.has(nk.kpiCode));
                return { ...g, kpis: [...g.kpis, ...kpisToAdd] };
            }
            return g;
        }));
    };
    
    const handleAiSuggest = async (goal: Goal) => {
        setIsAiSuggesting(goal.goalId);
        const suggestedKpis = await suggestKPIs(goal.linkedTaskName, goal.goalDescription);
        if (suggestedKpis && suggestedKpis.length > 0) {
            // Here, you would typically show a modal to let the user select from AI suggestions
            // and then match them to the predefined KPI library.
            // For simplicity now, we'll just alert and log them.
            alert(`AI đã gợi ý ${suggestedKpis.length} KPIs. Xem console để biết chi tiết.\n(Trong phiên bản hoàn thiện, đây sẽ là một modal để bạn chọn và liên kết với thư viện)`);
            console.log("AI Suggested KPIs:", suggestedKpis);
        } else {
            alert("AI không thể tạo gợi ý.");
        }
        setIsAiSuggesting(null);
    };

    return (
        <div className="h-full flex p-4 space-x-4 bg-slate-50">
            {isKpiLibraryOpen && <KpiLibraryModal availableKpis={predefinedKpis} onClose={() => setIsKpiLibraryOpen(false)} onSelect={handleSelectKpisFromLibrary} />}

            {/* Left Panel */}
            <aside className="w-1/3 flex flex-col space-y-4">
                {/* Employee Selector */}
                <div className="bg-white p-3 border rounded-lg shadow-sm">
                    <h3 className="font-bold mb-2">1. Chọn Nhân viên</h3>
                    <div className="space-y-2">
                        <select onChange={e => { setSelectedDept(e.target.value); setSelectedEmployeeId(null); }} value={selectedDept || ''} className="w-full p-2 border rounded">
                            {departments.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                        </select>
                        <select onChange={e => setSelectedEmployeeId(e.target.value)} value={selectedEmployeeId || ''} className="w-full p-2 border rounded" disabled={!selectedDept}>
                            <option value="">-- Chọn nhân viên --</option>
                            {employeesInDept.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Task Selector */}
                <div className="flex-1 flex flex-col bg-white p-3 border rounded-lg shadow-sm">
                    <h3 className="font-bold mb-2">2. Chọn Nhiệm vụ để gán Mục tiêu</h3>
                    <div className="flex-1 overflow-y-auto border rounded p-1">
                        {selectedEmployeeId ? (
                            employeeTasks.length > 0 ? (
                                <ul className="divide-y">
                                    {employeeTasks.map(task => (
                                        <li key={task.id} onClick={() => setSelectedTaskId(task.id)} className={`p-2 cursor-pointer rounded ${selectedTaskId === task.id ? 'bg-blue-100' : 'hover:bg-slate-50'}`}>
                                            <span className="font-mono text-sm bg-slate-200 px-1 rounded mr-2">{task.fullCode}</span>
                                            {task.taskName}
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-sm text-slate-500 text-center p-4">Nhân viên này không có nhiệm vụ 'Thực hiện' (T) nào.</p>)
                        ) : (<p className="text-sm text-slate-500 text-center p-4">Vui lòng chọn nhân viên để xem nhiệm vụ.</p>)}
                    </div>
                    <button onClick={handleAddObjective} disabled={!selectedTaskId} className="w-full mt-2 p-2 bg-blue-600 text-white rounded font-semibold disabled:bg-slate-400">
                        Thêm Mục tiêu cho Nhiệm vụ này
                    </button>
                </div>
            </aside>
            
            {/* Right Panel */}
            <main className="w-2/3 flex-1 flex flex-col">
                 <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <h3 className="text-lg font-bold">3. Thiết lập Mục tiêu và KPIs</h3>
                     {employeeGoals.length > 0 ? employeeGoals.map(goal => (
                        <div key={goal.goalId} className="bg-white p-4 border rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <input 
                                    type="text" 
                                    value={goal.goalDescription} 
                                    onChange={e => handleUpdateGoal(goal.goalId, 'goalDescription', e.target.value)}
                                    className="text-lg font-bold w-full border-b-2 border-transparent focus:border-blue-500 outline-none"
                                />
                                <button onClick={() => handleDeleteGoal(goal.goalId)} className="ml-4 p-1 text-slate-400 hover:text-red-600"><TrashIcon /></button>
                            </div>
                            <p className="text-sm text-slate-500 mb-3">Liên kết với nhiệm vụ: {goal.linkedTaskName}</p>

                            {/* KPI Table */}
                            <table className="w-full text-sm">
                                <thead className="text-left bg-slate-50">
                                    <tr>
                                        <th className="p-2 w-24">Mã số</th>
                                        <th className="p-2">Mô tả KPI</th>
                                        <th className="p-2 w-28">Ban đầu</th>
                                        <th className="p-2 w-28">Mục tiêu</th>
                                        <th className="p-2 w-20">Đơn vị</th>
                                        <th className="p-2 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {goal.kpis.map((kpi, kpiIndex) => (
                                        <tr key={kpi.kpiId}>
                                            <td className="p-1 border-b">{kpi.kpiCode}</td>
                                            <td className="p-1 border-b">{kpi.description}</td>
                                            <td className="p-1 border-b"><input type="number" value={kpi.baseline} onChange={e => {
                                                const newKpis = [...goal.kpis]; newKpis[kpiIndex].baseline = Number(e.target.value); handleUpdateGoal(goal.goalId, 'kpis', newKpis);
                                            }} className="w-full p-1 border rounded"/></td>
                                             <td className="p-1 border-b"><input type="number" value={kpi.target} onChange={e => {
                                                const newKpis = [...goal.kpis]; newKpis[kpiIndex].target = Number(e.target.value); handleUpdateGoal(goal.goalId, 'kpis', newKpis);
                                            }} className="w-full p-1 border rounded"/></td>
                                            <td className="p-1 border-b text-center">{kpi.unit}</td>
                                            <td className="p-1 border-b text-center">
                                                <button onClick={() => {
                                                    const newKpis = goal.kpis.filter(k => k.kpiId !== kpi.kpiId);
                                                    handleUpdateGoal(goal.goalId, 'kpis', newKpis);
                                                }} className="p-1 text-slate-400 hover:text-red-600"><TrashIcon/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-3 flex gap-2">
                                 <button onClick={() => { setTargetGoalIdForKpi(goal.goalId); setIsKpiLibraryOpen(true); }} className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1"><PlusIcon/> Chọn KPI từ Thư viện...</button>
                                 <button onClick={() => handleAiSuggest(goal)} disabled={isAiSuggesting === goal.goalId} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1 disabled:opacity-50">
                                    <SparklesIcon/> {isAiSuggesting === goal.goalId ? 'Đang xử lý...' : 'AI Gợi ý KPI'}
                                </button>
                            </div>
                        </div>
                     )) : (
                        <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <p className="text-slate-500">Chưa có mục tiêu nào được thiết lập cho nhân viên này.</p>
                            <p className="text-sm text-slate-400 mt-1">Hãy chọn một nhiệm vụ và nhấn "Thêm Mục tiêu".</p>
                        </div>
                     )}
                 </div>
                 <div className="flex-shrink-0 mt-4">
                    <button onClick={() => {
                        // In a real app, this would be a more robust save to backend
                        alert('Đã lưu thay đổi.');
                    }} className="w-full p-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
                        Lưu toàn bộ
                    </button>
                 </div>
            </main>
        </div>
    );
};

export default GoalSetupTab;