// App.tsx
import React, { useState, useRef, useEffect } from 'react';
import StrategicCockpit from './components/StrategicCockpit.tsx';
import TaskMatrixBuilder from './components/TaskMatrixBuilder.tsx';
import GoalManager from './components/GoalManager.tsx';
import AiSettings from './components/AiSettings.tsx';
import UserGuide from './components/UserGuide.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import AiAdvisorPage from './components/AiAdvisorPage.tsx'; // Import the new page
import UserProfilePage from './components/UserProfilePage.tsx'; // Import the extracted component
import { checkAuth, logout } from './services/authService.ts';
import { MapIcon, TableCellsIcon, CheckCircleIcon, CogIcon, BookOpenIcon, SparklesIcon, UserCircleIcon, LogoutIcon } from './components/icons.tsx';
import { Department, Role, Task, VersionData, VersionInfo } from './types.ts';
import { MOCK_DEPARTMENTS, MOCK_ROLES } from './constants.tsx';
import * as versionManager from './services/versionManager.ts';


type AppView = 'cockpit' | 'matrix' | 'goals' | 'advisor' | 'guide' | 'settings' | 'user-profile';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
    const [activeView, setActiveView] = useState<AppView>('matrix');
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    
    // --- STATE LIFTED FROM TaskMatrixBuilder ---
    const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
    const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [generatedTaskMarkdown, setGeneratedTaskMarkdown] = useState('');
    const [companyMatrixAssignments, setCompanyMatrixAssignments] = useState<Record<string, Record<string, string>>>({});
    const [departmentalAssignments, setDepartmentalAssignments] = useState<Record<string, Record<string, string>>>({});
    const [versions, setVersions] = useState<VersionInfo[]>([]);

    // Load active matrix and versions from local storage on initial render
    useEffect(() => {
        const activeData = versionManager.loadActiveMatrix();
        if (activeData) {
            setTasks(activeData.tasks || []);
            setCompanyMatrixAssignments(activeData.companyAssignments || {});
            setDepartmentalAssignments(activeData.departmentalAssignments || {});
            setGeneratedTaskMarkdown(activeData.generatedTaskMarkdown || '');
            setDepartments(activeData.departments || MOCK_DEPARTMENTS);
            setRoles(activeData.roles || MOCK_ROLES);
            console.log("Loaded active matrix from storage.");
        }
        setVersions(versionManager.getVersions());
    }, []);
    // --- END OF LIFTED STATE ---

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setProfileMenuOpen(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileMenuRef]);

    if (!isAuthenticated) {
        return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
    };

    const renderView = () => {
        switch (activeView) {
            case 'cockpit': return <StrategicCockpit />;
            case 'matrix': return <TaskMatrixBuilder 
                                    tasks={tasks} setTasks={setTasks}
                                    departments={departments} setDepartments={setDepartments}
                                    roles={roles} setRoles={setRoles}
                                    generatedTaskMarkdown={generatedTaskMarkdown} setGeneratedTaskMarkdown={setGeneratedTaskMarkdown}
                                    companyMatrixAssignments={companyMatrixAssignments} setCompanyMatrixAssignments={setCompanyMatrixAssignments}
                                    departmentalAssignments={departmentalAssignments} setDepartmentalAssignments={setDepartmentalAssignments}
                                    versions={versions} setVersions={setVersions}
                                 />;
            case 'goals': return <GoalManager 
                                    departments={departments}
                                    roles={roles}
                                    tasks={tasks}
                                    companyMatrixAssignments={companyMatrixAssignments}
                                    departmentalAssignments={departmentalAssignments}
                                />;
            case 'advisor': return <AiAdvisorPage />;
            case 'guide': return <UserGuide />;
            case 'settings': return <AiSettings />;
            case 'user-profile': return <UserProfilePage />;
            default: return <StrategicCockpit />;
        }
    };
    
    const navItems = [
        { id: 'cockpit', label: 'Bản đồ Chiến lược', icon: <MapIcon /> },
        { id: 'matrix', label: 'Ma trận Phân nhiệm', icon: <TableCellsIcon />, isHighlighted: true },
        { id: 'goals', label: 'Quản lý Mục tiêu', icon: <CheckCircleIcon /> },
        { id: 'advisor', label: 'Cố vấn AI', icon: <SparklesIcon /> },
        { id: 'guide', label: 'Hướng dẫn', icon: <BookOpenIcon /> },
        { id: 'settings', label: 'Cài đặt AI', icon: <CogIcon /> },
    ];

    return (
        <div className="flex h-screen w-screen bg-slate-200 text-slate-900">
            <aside className="w-64 bg-slate-100 flex flex-col flex-shrink-0 border-r border-slate-300">
                <div className="h-16 flex items-center justify-center p-4 border-b border-slate-300">
                    <h1 className="text-2xl font-bold text-blue-800">ASCO AI</h1>
                </div>
                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map(item => {
                        const isActive = activeView === item.id;
                        const isHighlighted = (item as any).isHighlighted;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id as AppView)}
                                className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                    isActive 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : isHighlighted
                                        ? 'bg-blue-100 text-blue-700 font-bold hover:bg-blue-200'
                                        : 'text-slate-700 hover:bg-slate-300'
                                }`}
                            >
                                <div className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : isHighlighted ? 'text-blue-500' : 'text-slate-500'}`}>{item.icon}</div>
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-300">
                    <div className="relative" ref={profileMenuRef}>
                        <button 
                            onClick={() => setProfileMenuOpen(prev => !prev)}
                            className="w-full p-3 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors text-left"
                        >
                            <div className="flex items-center">
                                <UserCircleIcon className="w-10 h-10 text-slate-500 flex-shrink-0" />
                                <div className="ml-3">
                                    <p className="text-sm font-bold text-slate-800">Admin</p>
                                    <p className="text-xs text-slate-600">Quản trị viên</p>
                                </div>
                            </div>
                        </button>

                        {isProfileMenuOpen && (
                          <div className="absolute bottom-full mb-2 w-full bg-white rounded-md shadow-lg border border-slate-200 z-10">
                            <div className="p-2">
                              <button onClick={() => { setActiveView('user-profile'); setProfileMenuOpen(false); }} className="w-full text-left flex items-center px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100">
                                <UserCircleIcon className="w-5 h-5 mr-3 text-slate-500" />
                                <span>Hồ sơ của bạn</span>
                              </button>
                              <div className="border-t my-1 border-slate-200"></div>
                              <button onClick={() => { handleLogout(); setProfileMenuOpen(false); }} className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 hover:text-red-700">
                                <LogoutIcon className="w-5 h-5 mr-3" />
                                <span>Đăng xuất</span>
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                </div>
            </aside>
            <main className="flex-1">
                {renderView()}
            </main>
        </div>
    );
};

export default App;