// components/SixVariablesNavigator.tsx
import React from 'react';
import { SixVariablesModel, KpiStatus } from '../types.ts';
import { SIX_VARIABLES_QUESTIONS } from '../constants.tsx';

interface SixVariablesNavigatorProps {
  model: SixVariablesModel;
  selectedVariableId: string | null;
  onVariableSelect: (variableId: string) => void;
}

const statusStyles: Record<KpiStatus, { gradient: string; text: string, border: string }> = {
    Good: { gradient: 'from-green-500 to-emerald-600', text: 'text-white', border: 'border-emerald-700' },
    Warning: { gradient: 'from-amber-400 to-amber-500', text: 'text-white', border: 'border-amber-600' },
    Bad: { gradient: 'from-red-500 to-rose-600', text: 'text-white', border: 'border-rose-700' },
    Neutral: { gradient: 'from-slate-500 to-slate-600', text: 'text-white', border: 'border-slate-700' },
};

const Hexagon: React.FC<{
    variableId: string,
    label: string,
    status: KpiStatus,
    isFilled: boolean,
    isSelected: boolean,
    onClick: (id: string) => void
}> = ({ variableId, label, status, isFilled, isSelected, onClick }) => {
    const baseStyles = statusStyles[status];
    
    const backgroundClass = (status === 'Neutral' && isFilled)
        ? 'from-sky-500 to-sky-600' // Blue for filled but not diagnosed
        : baseStyles.gradient;
        
    const borderClass = (status === 'Neutral' && isFilled)
        ? 'border-sky-700'
        : baseStyles.border;

    return (
        <div
            onClick={() => onClick(variableId)}
            className={`relative w-32 h-36 flex items-center justify-center cursor-pointer group transition-transform duration-200 ease-in-out ${isSelected ? 'scale-110' : 'hover:scale-105 hover:-translate-y-1'}`}
        >
            <div
                className={`absolute inset-0 bg-gradient-to-br ${backgroundClass} ${borderClass} border-b-4 shadow-lg transition-all duration-200 ${isSelected ? 'brightness-110' : 'group-hover:brightness-105'}`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            />
            {isSelected && (
                 <div
                    className="absolute inset-0 ring-4 ring-blue-400 ring-offset-2 ring-offset-white rounded-full"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                />
            )}
            <div className={`relative z-10 p-2 text-center ${baseStyles.text}`}>
                <p className="text-sm font-bold drop-shadow-sm">{label}</p>
            </div>
        </div>
    );
};


const SixVariablesNavigator: React.FC<SixVariablesNavigatorProps> = ({ model, selectedVariableId, onVariableSelect }) => {

  const positions = [
    { id: 'MarketPosition', top: '0%', left: '50%' },
    { id: 'Innovation', top: '22%', left: '85.3%' },
    { id: 'Productivity', top: '66%', left: '85.3%' },
    { id: 'People', top: '88%', left: '50%' },
    { id: 'Liquidity', top: '66%', left: '14.7%' },
    { id: 'Profitability', top: '22%', left: '14.7%' },
  ];
  
  const center = { x: 50, y: 44 }; // %

  return (
    <div className="relative w-full mx-auto" style={{ paddingTop: '75%' }}>
      {/* Background connecting lines */}
      <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ left: '0' }}>
        <defs>
            <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
                <circle cx="5" cy="5" r="5" fill="#cbd5e1" />
            </marker>
        </defs>
        {positions.map(pos => {
            const end = { x: parseFloat(pos.left), y: parseFloat(pos.top) + (100 / (1/0.75) * 0.12) }; // Adjust y for hexagon height
            return <line key={`line-center-${pos.id}`} x1={`${center.x}%`} y1={`${center.y}%`} x2={`${end.x}%`} y2={`${end.y}%`} stroke="#e2e8f0" strokeWidth="2" />;
        })}
         {positions.map((pos, index) => {
            const nextIndex = (index + 1) % positions.length;
            const start = { x: parseFloat(pos.left), y: parseFloat(pos.top) + (100 / (1/0.75) * 0.12) };
            const end = { x: parseFloat(positions[nextIndex].left), y: parseFloat(positions[nextIndex].top) + (100 / (1/0.75) * 0.12) };
            return <line key={`line-outer-${pos.id}`} x1={`${start.x}%`} y1={`${start.y}%`} x2={`${end.x}%`} y2={`${end.y}%`} stroke="#e2e8f0" strokeWidth="2" />;
        })}
      </svg>
      
      {/* Central Hub */}
       <div className="absolute" style={{ top: '44%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="relative w-32 h-36 flex items-center justify-center">
                 <div className="absolute inset-0 bg-slate-200" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                 <div className="relative z-10 p-2 text-center">
                    <p className="text-sm font-bold text-slate-600">6 BIẾN SỐ</p>
                </div>
            </div>
       </div>

      {/* Hexagon Nodes */}
      {positions.map(pos => {
        const variableConfig = SIX_VARIABLES_QUESTIONS.find(v => v.id === pos.id);
        if (!variableConfig) return null;
        
        const variableData = model[pos.id];
        const isFilled = variableData.questionAnswers.some(qa => qa.answer.trim() !== '');

        return (
          <div
            key={pos.id}
            className={`absolute`}
            style={{ top: pos.top, left: pos.left, transform: `translate(-50%, -50%)` }}
          >
            <Hexagon
                variableId={pos.id}
                label={variableConfig.name.split('(')[0].trim()}
                status={variableData.status}
                isFilled={isFilled}
                isSelected={selectedVariableId === pos.id}
                onClick={onVariableSelect}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SixVariablesNavigator;