// App.tsx
import React, { useState, useRef, useEffect } from 'react';
import StrategicCockpit from './components/StrategicCockpit.tsx';
import TaskMatrixBuilder from './components/TaskMatrixBuilder.tsx';
import GoalManager from './components/GoalManager.tsx';
import AiSettings from './components/AiSettings.tsx';
import UserGuide from './components/UserGuide.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import AiAdvisorPage from './components/AiAdvisorPage.tsx'; // Import the new page
import { checkAuth, logout } from './services/authService.ts';
import { MapIcon, TableCellsIcon, CheckCircleIcon, CogIcon, BookOpenIcon, SparklesIcon, UserCircleIcon, LogoutIcon, BuildingOfficeIcon, PencilIcon } from './components/icons.tsx';
import { Department, Role } from './types.ts';
import { MOCK_DEPARTMENTS, MOCK_ROLES } from './constants.tsx';
import PersonnelManagerTab from './components/matrix/PersonnelManagerTab.tsx';


type AppView = 'cockpit' | 'matrix' | 'goals' | 'advisor' | 'guide' | 'settings' | 'user-profile' | 'company-settings';

// --- User Profile Page Component ---
const UserProfilePage: React.FC = () => {
    const [name, setName] = useState('Admin');
    const [title, setTitle] = useState('Quản trị viên');
    const [email, setEmail] = useState('admin@asco.com.vn');
    const [phone, setPhone] = useState('0123456789');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        setSaveStatus('saving');
        // In a real app, this would call an API
        setTimeout(() => {
            setSaveStatus('success');
            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000); // Hide message after 3 seconds
        }, 1000); // Simulate network delay
    };
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="h-full flex flex-col bg-slate-200 p-6">
            <header className="flex-shrink-0 bg-white p-4 border-b border-slate-200 rounded-t-lg">
                <h2 className="text-xl font-bold text-slate-800">Hồ sơ của bạn</h2>
            </header>
            <main className="flex-1 bg-white p-6 rounded-b-lg shadow-sm">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-24 h-24 text-slate-400" />
                            )}
                            <button 
                                onClick={triggerFileSelect} 
                                className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow border hover:bg-slate-100"
                                aria-label="Sửa ảnh đại diện"
                            >
                                <PencilIcon className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{name}</h3>
                            <p className="text-slate-500">{title}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Họ và Tên</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border rounded-md"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Chức danh</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border rounded-md"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-2 border rounded-md"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Số điện thoại</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full mt-1 p-2 border rounded-md"/>
                        </div>
                    </div>
                     <div className="flex justify-end items-center pt-4 gap-4">
                        {saveStatus === 'success' && (
                            <div className="text-green-600 flex items-center gap-2 transition-opacity duration-300" role="status">
                                <CheckCircleIcon className="w-5 h-5" />
                                <span className="font-semibold">Đã lưu thành công!</span>
                            </div>
                        )}
                        <button 
                            onClick={handleSave} 
                            disabled={saveStatus === 'saving'}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-wait"
                        >
                            {saveStatus === 'saving' ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- Company Settings Page Component ---
interface CompanySettingsPageProps {
    departments: Department[];
    setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

const CompanySettingsPage: React.FC<CompanySettingsPageProps> = ({ departments, setDepartments, roles, setRoles }) => {
    return (
        <div className="h-full flex flex-col bg-slate-200">
            <header className="flex-shrink-0 bg-white p-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Cài đặt Công ty</h2>
                <p className="text-sm text-slate-500">Quản lý các phòng ban và nhân sự trong toàn bộ công ty.</p>
            </header>
            <main className="flex-1 overflow-y-auto">
                 <PersonnelManagerTab 
                    departments={departments} 
                    setDepartments={setDepartments}
                    roles={roles}
                    setRoles={setRoles}
                 />
            </main>
        </div>
    );
};


const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
    const [activeView, setActiveView] = useState<AppView>('advisor');
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    
    // Lifted state for shared data
    const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
    const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);

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
            case 'matrix': return <TaskMatrixBuilder departments={departments} roles={roles} />;
            case 'goals': return <GoalManager />;
            case 'advisor': return <AiAdvisorPage />;
            case 'guide': return <UserGuide />;
            case 'settings': return <AiSettings />;
            case 'user-profile': return <UserProfilePage />;
            case 'company-settings': return <CompanySettingsPage departments={departments} setDepartments={setDepartments} roles={roles} setRoles={setRoles} />;
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