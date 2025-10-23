// components/StrategicMap.tsx
import React from 'react';
import { StrategicModel } from '../types.ts';

interface StrategicMapProps {
  model: StrategicModel;
  onNodeSelect: (nodeId: string) => void;
  selectedNodeId: string | null;
}

// All dimensions are now percentages relative to the container
const NODE_WIDTH = 12;
const NODE_HEIGHT = 7.5;

const nodePositions: Record<string, { top: string; left: string }> = {
    "1: Vấn đề của Khách hàng": { top: '5%', left: '38%' },
    "2: Giải pháp đã có sẵn trên thị trường": { top: '16%', left: '38%' },
    "3: Giải pháp của doanh nghiệp": { top: '16%', left: '55%' },
    "4: Giải pháp mới (phát triển)": { top: '16%', left: '21%' },
    "5: Giải pháp mới tiềm năng (nghiên cứu)": { top: '16%', left: '4%' },
    "6: Xu hướng kinh tế xã hội": { top: '28%', left: '4%' },
    "7: Sự tăng trưởng của thị trường": { top: '28%', left: '21%' },
    "8: Đối thủ cạnh tranh": { top: '40%', left: '21%' },
    "9: Mục tiêu về thị phần": { top: '28%', left: '55%' },
    "11: Sự phát triển của doanh nghiệp (qua thời kỳ)": { top: '40%', left: '55%' },
    "10: Mục tiêu Marketing": { top: '40%', left: '72%' },
    "13: Mục tiêu về việc Giảm chi phí": { top: '52%', left: '55%' },
    "12: Năng lực và đầu tư": { top: '52%', left: '72%' },
    "15: Đánh giá tổ chức": { top: '64%', left: '55%' },
    "14: Mục tiêu về nghiên cứu và phát triển": { top: '64%', left: '72%' },
    "16: Cân đối dòng tiền": { top: '76%', left: '55%' },
    "17: Thay đổi dòng tiền thâm hụt chi tiêu/ thặng dư": { top: '76%', left: '72%' },
    "18: Kế hoạch cân đối": { top: '76%', left: '89%' }
};

const getAnchorPoint = (nodeId: string, anchor: 'top' | 'bottom' | 'left' | 'right') => {
    const pos = nodePositions[nodeId];
    if (!pos) return { x: 0, y: 0 };
    const left = parseFloat(pos.left);
    const top = parseFloat(pos.top);
    switch (anchor) {
        case 'top': return { x: left + NODE_WIDTH / 2, y: top };
        case 'bottom': return { x: left + NODE_WIDTH / 2, y: top + NODE_HEIGHT };
        case 'left': return { x: left, y: top + NODE_HEIGHT / 2 };
        case 'right': return { x: left + NODE_WIDTH, y: top + NODE_HEIGHT / 2 };
    }
};

const ArrowMarker = () => (
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
    </marker>
);

const Connector: React.FC<{ startNode: string, startAnchor: any, endNode: string, endAnchor: any, dashed?: boolean }> = ({ startNode, startAnchor, endNode, endAnchor, dashed }) => {
    const start = getAnchorPoint(startNode, startAnchor);
    const end = getAnchorPoint(endNode, endAnchor);
    return <line x1={`${start.x}%`} y1={`${start.y}%`} x2={`${end.x}%`} y2={`${end.y}%`} stroke="#94a3b8" strokeWidth="0.15" markerEnd="url(#arrow)" strokeDasharray={dashed ? "0.5 0.5" : "none"} />;
};

const PolylineConnector: React.FC<{ points: {x:number, y:number}[], dashed?: boolean }> = ({ points, dashed }) => {
    const pointsString = points.map(p => `${p.x}%,${p.y}%`).join(' ');
    return <polyline points={pointsString} stroke="#94a3b8" strokeWidth="0.15" fill="none" markerEnd="url(#arrow)" strokeDasharray={dashed ? "0.5 0.5" : "none"} />;
};

const StrategicMap: React.FC<StrategicMapProps> = ({ model, onNodeSelect, selectedNodeId }) => {
  return (
    <div className="relative w-full h-full p-4 bg-slate-50">
        {/* Backgrounds and Headers */}
        <div className="absolute top-0 left-0 h-full w-[48%] bg-slate-100" />
        <div className="absolute top-0 right-0 h-full w-[52%] bg-amber-50" />
        <p className="absolute top-4 left-4 text-sm font-semibold text-slate-700">Thông tin kinh doanh không thể kiểm soát</p>
        <p className="absolute top-4 left-[49%] text-sm font-semibold text-slate-700">Thông tin kinh doanh có thể kiểm soát</p>

        <div className="relative w-full h-full">
            <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <defs><ArrowMarker /></defs>
                
                {/* Grouping Borders */}
                <rect x="3%" y="15%" width="48%" height="10%" fill="none" stroke="#f472b6" strokeOpacity="0.7" strokeWidth="0.2" rx="1"/>
                <rect x="20%" y="27%" width="25%" height="23%" fill="none" stroke="#38bdf8" strokeOpacity="0.7" strokeWidth="0.2" strokeDasharray="0.4 0.4" rx="1"/>
                <rect x="54%" y="75%" width="46%" height="10%" fill="none" stroke="#8b5cf6" strokeOpacity="0.7" strokeWidth="0.2" strokeDasharray="0.4 0.4" rx="1"/>
                <rect x="54%" y="27%" width="22%" height="23%" fill="none" stroke="#22c55e" strokeOpacity="0.7" strokeWidth="0.2" strokeDasharray="0.8 0.4" rx="1"/>
                
                {/* Connectors */}
                <Connector startNode="1: Vấn đề của Khách hàng" startAnchor='bottom' endNode="2: Giải pháp đã có sẵn trên thị trường" endAnchor='top' />
                <Connector startNode="2: Giải pháp đã có sẵn trên thị trường" startAnchor='right' endNode="3: Giải pháp của doanh nghiệp" endAnchor='left' />
                <PolylineConnector points={[getAnchorPoint("3: Giải pháp của doanh nghiệp", 'bottom'), {x: getAnchorPoint("3: Giải pháp của doanh nghiệp", 'bottom').x, y: 31}, {x: getAnchorPoint("9: Mục tiêu về thị phần", 'top').x, y: 31}, getAnchorPoint("9: Mục tiêu về thị phần", 'top')]} />
                <Connector startNode="7: Sự tăng trưởng của thị trường" startAnchor='bottom' endNode="8: Đối thủ cạnh tranh" endAnchor='top' />
                <Connector startNode="7: Sự tăng trưởng của thị trường" startAnchor='right' endNode="9: Mục tiêu về thị phần" endAnchor='left' />
                <Connector startNode="8: Đối thủ cạnh tranh" startAnchor='right' endNode="9: Mục tiêu về thị phần" endAnchor='left' />
                <Connector startNode="9: Mục tiêu về thị phần" startAnchor='bottom' endNode="11: Sự phát triển của doanh nghiệp (qua thời kỳ)" endAnchor='top' />
                <Connector startNode="11: Sự phát triển của doanh nghiệp (qua thời kỳ)" startAnchor='right' endNode="10: Mục tiêu Marketing" endAnchor='left' />
                <PolylineConnector points={[getAnchorPoint("11: Sự phát triển của doanh nghiệp (qua thời kỳ)", 'bottom'), {x: getAnchorPoint("11: Sự phát triển của doanh nghiệp (qua thời kỳ)", 'bottom').x, y: 55}, {x: getAnchorPoint("13: Mục tiêu về việc Giảm chi phí", 'top').x, y: 55}, getAnchorPoint("13: Mục tiêu về việc Giảm chi phí", 'top')]} />
                <Connector startNode="13: Mục tiêu về việc Giảm chi phí" startAnchor='bottom' endNode="15: Đánh giá tổ chức" endAnchor='top' />
                <Connector startNode="15: Đánh giá tổ chức" startAnchor='bottom' endNode="16: Cân đối dòng tiền" endAnchor='top' />
                <Connector startNode="16: Cân đối dòng tiền" startAnchor='right' endNode="17: Thay đổi dòng tiền thâm hụt chi tiêu/ thặng dư" endAnchor='left' />
                <Connector startNode="17: Thay đổi dòng tiền thâm hụt chi tiêu/ thặng dư" startAnchor='right' endNode="18: Kế hoạch cân đối" endAnchor='left' />
                <Connector startNode="12: Năng lực và đầu tư" startAnchor='left' endNode="13: Mục tiêu về việc Giảm chi phí" endAnchor='right' />
                <Connector startNode="15: Đánh giá tổ chức" startAnchor='right' endNode="14: Mục tiêu về nghiên cứu và phát triển" endAnchor='left' />
                
                {/* Dashed Connectors */}
                <Connector startNode="6: Xu hướng kinh tế xã hội" startAnchor='right' endNode="7: Sự tăng trưởng của thị trường" endAnchor='left' dashed />
                <Connector startNode="12: Năng lực và đầu tư" startAnchor='bottom' endNode="14: Mục tiêu về nghiên cứu và phát triển" endAnchor='top' dashed />
                <PolylineConnector points={[getAnchorPoint("10: Mục tiêu Marketing", 'bottom'), {x: getAnchorPoint("10: Mục tiêu Marketing", 'bottom').x, y: 55}, {x: getAnchorPoint("12: Năng lực và đầu tư", 'top').x, y: 55}, getAnchorPoint("12: Năng lực và đầu tư", 'top')]} dashed />
            </svg>

            {Object.entries(nodePositions).map(([id, pos]) => {
                const nodeData = model[id];
                const isCompleted = nodeData?.questionAnswers && nodeData.questionAnswers.some(a => a.answer.trim() !== '');
                const isSelected = selectedNodeId === id;
                const number = id.split(':')[0];
                const text = id.split(':')[1]?.trim();

                return (
                <button
                    key={id}
                    onClick={() => onNodeSelect(id)}
                    className={`absolute flex items-center justify-center p-2 text-center rounded-md shadow-md transition-all duration-200 
                    ${isCompleted ? 'bg-green-100' : 'bg-white'}
                    ${isSelected ? 'border-2 border-blue-500 ring-4 ring-blue-500/20 shadow-lg' : 'border border-slate-300'}
                    hover:shadow-xl hover:-translate-y-px
                    `}
                    style={{ top: pos.top, left: pos.left, width: `${NODE_WIDTH}%`, height: `${NODE_HEIGHT}%` }}
                    title={id}
                >
                    <p className="text-xs text-slate-800">
                        <span className="font-bold text-slate-600">{number}:</span> {text}
                    </p>
                </button>
                );
            })}
             {/* Legend */}
            <div className="absolute bottom-[2%] left-[2%] p-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-md" style={{zIndex: 30}}>
                <h4 className="font-bold text-xs mb-1 text-slate-700">Chú thích</h4>
                <div className="space-y-1 text-[10px] text-slate-600">
                    <div className="flex items-center">
                        <svg width="30" height="8" className="flex-shrink-0"><line x1="0" y1="4" x2="30" y2="4" stroke="#f472b6" strokeWidth="2"/></svg>
                        <span className="ml-1">Lĩnh vực chiến lược kinh doanh</span>
                    </div>
                    <div className="flex items-center">
                        <svg width="30" height="8" className="flex-shrink-0"><line x1="0" y1="4" x2="30" y2="4" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3"/></svg>
                        <span className="ml-1">Đường cong thay thế</span>
                    </div>
                    <div className="flex items-center">
                        <svg width="30" height="8" className="flex-shrink-0"><line x1="0" y1="4" x2="30" y2="4" stroke="#22c55e" strokeWidth="2" strokeDasharray="6 2"/></svg>
                        <span className="ml-1">Đường cong thị phần</span>
                    </div>
                    <div className="flex items-center">
                        <svg width="30" height="8" className="flex-shrink-0"><line x1="0" y1="4" x2="30" y2="4" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="3 3"/></svg>
                        <span className="ml-1">Đơn vị kinh doanh của công ty</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StrategicMap;
