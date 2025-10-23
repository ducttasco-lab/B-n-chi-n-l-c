// App.tsx
import React, { useState } from 'react';
import StrategicCockpit from './components/StrategicCockpit.tsx';
import TaskMatrixBuilder from './components/TaskMatrixBuilder.tsx';
import GoalManager from './components/GoalManager.tsx';
import { MapIcon, TableCellsIcon, CheckCircleIcon } from './components/icons.tsx';

type View = 'cockpit' | 'matrix' | 'goals';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('matrix');

  const navItems = [
    { id: 'cockpit', icon: <MapIcon />, label: 'Bản đồ Chiến lược' },
    { id: 'matrix', icon: <TableCellsIcon />, label: 'Ma trận Phân nhiệm' },
    { id: 'goals', icon: <CheckCircleIcon />, label: 'Quản lý mục tiêu năm' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'matrix':
        return <TaskMatrixBuilder />;
      case 'goals':
        return <GoalManager />;
      case 'cockpit':
      default:
        return <StrategicCockpit />;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-100 font-sans flex text-slate-800">
      <nav className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">AI Assistant</h1>
          <p className="text-xs text-slate-500">Matrix & Goal Management</p>
        </div>
        <div className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <main className="flex-1 h-full overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
}

export default App;