// App.tsx
import React, { useState } from 'react';
import StrategicCockpit from './components/StrategicCockpit.tsx';
import TaskMatrixBuilder from './components/TaskMatrixBuilder.tsx';
import GoalManager from './components/GoalManager.tsx';
import AiSettings from './components/AiSettings.tsx';
import UserGuide from './components/UserGuide.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import AiAdvisorPage from './components/AiAdvisorPage.tsx'; // Import the new page
import { checkAuth, logout } from './services/authService.ts';
import { MapIcon, TableCellsIcon, CheckCircleIcon, CogIcon, BookOpenIcon, SparklesIcon } from './components/icons.tsx';
import { ASCO_LOGO_BASE64 } from './constants.tsx';

type AppView = 'cockpit' | 'matrix' | 'goals' | 'advisor' | 'guide' | 'settings';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
    const [activeView, setActiveView] = useState<AppView>('advisor');

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
            case 'matrix': return <TaskMatrixBuilder />;
            case 'goals': return <GoalManager />;
            case 'advisor': return <AiAdvisorPage />; // Render the new page
            case 'guide': return <UserGuide />;
            case 'settings': return <AiSettings />;
            default: return <StrategicCockpit />;
        }
    };
    
    const navItems = [
        { id: 'cockpit', label: 'Bản đồ Chiến lược', icon: <MapIcon /> },
        { id: 'matrix', label: 'Ma trận Phân nhiệm', icon: <TableCellsIcon /> },
        { id: 'goals', label: 'Quản lý Mục tiêu', icon: <CheckCircleIcon /> },
        { id: 'advisor', label: 'Cố vấn AI', icon: <SparklesIcon />, isHighlighted: true },
        { id: 'guide', label: 'Hướng dẫn', icon: <BookOpenIcon /> },
        { id: 'settings', label: 'Cài đặt AI', icon: <CogIcon /> },
    ];

    return (
        <div className="flex h-screen w-screen bg-slate-100 text-slate-900">
            <aside className="w-64 bg-white flex flex-col flex-shrink-0 border-r border-slate-200">
                <div className="h-16 flex items-center justify-center p-4 border-b">
                    <img src={ASCO_LOGO_BASE64} alt="ASCO Logo" className="h-full object-contain" />
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
                                        : 'text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <div className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : isHighlighted ? 'text-blue-500' : 'text-slate-500'}`}>{item.icon}</div>
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className="p-4 border-t">
                    <button 
                        onClick={handleLogout}
                        className="w-full text-center px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 rounded-md"
                    >
                        Đăng xuất
                    </button>
                </div>
            </aside>
            <main className="flex-1">
                {renderView()}
            </main>
        </div>
    );
};

export default App;