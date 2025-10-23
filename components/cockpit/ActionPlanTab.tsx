// components/cockpit/ActionPlanTab.tsx
import React from 'react';
import { StrategicModel, StrategicNode, StrategicInitiative } from '../../types.ts';

interface ActionPlanTabProps {
    strategicModel: StrategicModel;
    onUpdateNode: (nodeId: string, data: Partial<StrategicNode>) => void;
    onEditInitiative: (nodeId: string, initiative: StrategicInitiative) => void;
    onLogProgress: (nodeId: string, initiative: StrategicInitiative) => void;
}

const ActionPlanTab: React.FC<ActionPlanTabProps> = ({ strategicModel, onUpdateNode, onEditInitiative, onLogProgress }) => {
    
    const getStatusColor = (status: StrategicInitiative['status']) => {
        switch (status) {
            case 'Hoàn thành': return 'bg-green-100 text-green-800';
            case 'Đang thực hiện': return 'bg-blue-100 text-blue-800';
            case 'Tạm dừng': return 'bg-yellow-100 text-yellow-800';
            case 'Mới tạo':
            default: return 'bg-slate-100 text-slate-800';
        }
    };
    
    const handleDeleteInitiative = (nodeId: string, initiativeId: string) => {
        if(window.confirm('Bạn có chắc muốn xóa sáng kiến này không?')) {
            const node = strategicModel[nodeId];
            const newInitiatives = node.initiatives.filter(i => i.id !== initiativeId);
            onUpdateNode(nodeId, { initiatives: newInitiatives });
        }
    };

    // FIX: Explicitly cast Object.values to StrategicNode[] to resolve type inference issues where `node` was `unknown`.
    const allInitiatives = (Object.values(strategicModel) as StrategicNode[]).flatMap(node => node.initiatives.map(i => ({...i, nodeId: node.id})));

    return (
        <div className="p-6 bg-slate-50 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Kế hoạch Hành động</h2>
            
            {allInitiatives.length === 0 ? (
                 <div className="text-center p-8 border-2 border-dashed rounded-lg mt-10">
                    <p className="text-slate-500">Chưa có sáng kiến nào được tạo.</p>
                    <p className="text-sm text-slate-400 mt-1">Hãy chọn một Yếu tố trong tab "Bản đồ & Chẩn đoán" và sử dụng Cố vấn AI hoặc nút "+ Tạo Sáng kiến".</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.keys(strategicModel).map(nodeId => {
                        const node = strategicModel[nodeId];
                        if (!node || node.initiatives.length === 0) return null;

                        return (
                            <div key={nodeId} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                <h3 className="font-bold text-blue-800 mb-3 text-base border-b pb-2">{nodeId}</h3>
                                <div className="space-y-3">
                                    {node.initiatives.map(initiative => (
                                        <div key={initiative.id} className="border border-slate-200 p-3 rounded-md hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{initiative.name}</p>
                                                    <p className="text-xs text-slate-500">Người phụ trách: {initiative.owner || 'N/A'} | Thời hạn: {initiative.dueDate || 'N/A'}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(initiative.status)}`}>{initiative.status}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-2">{initiative.description}</p>
                                            <div className="mt-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-medium text-slate-600">Tiến độ</span>
                                                    <span className="text-xs font-bold text-slate-800">{initiative.currentProgress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${initiative.currentProgress}%`}}></div>
                                                </div>
                                                {initiative.latestStatusComment && <p className="text-xs text-slate-500 mt-1 italic">Cập nhật mới nhất: {initiative.latestStatusComment}</p>}
                                            </div>
                                            <div className="mt-4 text-right space-x-2">
                                                <button onClick={() => onLogProgress(nodeId, initiative)} className="text-xs bg-slate-200 px-3 py-1 rounded hover:bg-slate-300">Ghi nhận</button>
                                                <button onClick={() => onEditInitiative(nodeId, initiative)} className="text-xs text-blue-600 hover:underline">Sửa</button>
                                                <button onClick={() => handleDeleteInitiative(nodeId, initiative.id)} className="text-xs text-red-600 hover:underline">Xóa</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ActionPlanTab;
