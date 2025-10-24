// components/GoalManager.tsx
import React, { useState } from 'react';
import { Goal, Department, Role, UserTask, PredefinedKPI } from '../types.ts';
import { MOCK_GOALS, MOCK_DEPARTMENTS, MOCK_ROLES, MOCK_USER_TASKS, MOCK_PREDEFINED_KPIS } from '../constants.tsx';
import GoalSetupTab from './goal/GoalSetupTab.tsx';
import GoalTrackingTab from './goal/GoalTrackingTab.tsx';
import GoalDashboardTab from './goal/GoalDashboardTab.tsx';
import KpiLibraryManagerTab from './goal/KpiLibraryManagerTab.tsx';
import { TargetIcon, ListChecksIcon, TrophyIcon, BookOpenIcon } from './icons.tsx';

type GoalTab = 'setup' | 'tracking' | 'dashboard' | 'kpi-library';

const GoalManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<GoalTab>('setup');
    
    // In a real app, this state would likely be lifted higher or managed by a global state manager (like Context or Redux)
    // For this self-contained component, we'll manage it here.
    const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
    const [departments] = useState<Department[]>(MOCK_DEPARTMENTS);
    const [roles] = useState<Role[]>(MOCK_ROLES);
    const [userTasks] = useState<UserTask[]>(MOCK_USER_TASKS);
    const [predefinedKpis, setPredefinedKpis] = useState<PredefinedKPI[]>(MOCK_PREDEFINED_KPIS);

    const tabs = [
        { id: 'setup', label: 'Thiết lập Mục tiêu', icon: <TargetIcon className="w-5 h-5 mr-2" /> },
        { id: 'tracking', label: 'Theo dõi Tiến độ', icon: <ListChecksIcon className="w-5 h-5 mr-2" /> },
        { id: 'dashboard', label: 'Bảng tổng hợp Kết quả', icon: <TrophyIcon className="w-5 h-5 mr-2" /> },
        { id: 'kpi-library', label: 'Quản lý Thư viện KPI', icon: <BookOpenIcon className="w-5 h-5 mr-2" /> },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'setup':
                return <GoalSetupTab 
                            goals={goals} 
                            setGoals={setGoals}
                            departments={departments}
                            roles={roles}
                            userTasks={userTasks}
                            predefinedKpis={predefinedKpis}
                        />;
            case 'tracking':
                return <GoalTrackingTab 
                            goals={goals}
                            setGoals={setGoals}
                            departments={departments}
                            roles={roles}
                        />;
            case 'dashboard':
                 return <GoalDashboardTab goals={goals} departments={departments} roles={roles} />;
            case 'kpi-library':
                 return <KpiLibraryManagerTab kpis={predefinedKpis} setKpis={setPredefinedKpis} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-200">
            <header className="flex-shrink-0 bg-white p-3 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Quản lý mục tiêu năm</h2>
            </header>
            <div className="flex-1 flex min-h-0">
                <aside className="w-60 bg-white border-r border-slate-200 p-2">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                             <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as GoalTab)}
                                className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default GoalManager;