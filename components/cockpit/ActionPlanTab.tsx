// components/cockpit/ActionPlanTab.tsx
import React, { useState } from 'react';
import { StrategicModel, StrategicNode, StrategicInitiative, ProgressUpdate } from '../../types.ts';
import InitiativeEditor from './InitiativeEditor.tsx';
import ProgressLogger from './ProgressLogger.tsx';
import { STRATEGIC_MAP_QUESTIONS } from '../../constants.tsx';

interface ActionPlanTabProps {
    strategicModel: StrategicModel;
    onUpdateNode: (nodeId: string, data: Partial<StrategicNode>) => void;
}

const ActionPlanTab: React.FC<ActionPlanTabProps> = ({ strategicModel, onUpdateNode }) => {
    const [editingInitiative, setEditingInitiative] = useState<{nodeId: string, initiative?: StrategicInitiative} | null>(null);
    const [loggingProgressFor, setLoggingProgressFor] = useState<{nodeId: string, initiative: StrategicInitiative} | null>(null);

    const handleSaveInitiative = (nodeId: string, initiative: StrategicInitiative) => {
        const node = strategicModel[nodeId];
        const existingIndex = node.initiatives.findIndex(i => i.id === initiative.id);
        const newInitiatives = [...node.initiatives];
        if (existingIndex > -1) {
            newInitiatives[existingIndex] = initiative;
        } else {
            newInitiatives.push(initiative);
        }
        onUpdateNode(nodeId, { initiatives: newInitiatives });
    };

    const handleSaveProgress = (nodeId: string, initiativeId: string, update: ProgressUpdate) => {
        const node = strategicModel[nodeId];
        const initiativeIndex = node.initiatives.findIndex(i => i.id === initiativeId);
        if (initiativeIndex > -1) {
            const updatedInitiative = { ...node.initiatives[initiativeIndex] };
            
            const newProgressHistory = [...updatedInitiative.progressHistory, update];
            const latestUpdate = newProgressHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            updatedInitiative.progressHistory = newProgressHistory;
            updatedInitiative.currentProgress = latestUpdate.progressPercentage;
            updatedInitiative.latestStatusComment = latestUpdate.comment;
            
            const newInitiatives = [...node.initiatives];
            newInitiatives[initiativeIndex] = updatedInitiative;
            onUpdateNode(nodeId, { initiatives: newInitiatives });
        }
    };
    
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

    return (
        <div className="p-6 bg-slate-50 h-full">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Kế hoạch Hành động</h2>
            <div className="space-y-6">
                {Object.keys(STRATEGIC_MAP_QUESTIONS).map(nodeId => {
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
                                            <button onClick={() => setLoggingProgressFor({nodeId, initiative})} className="text-xs bg-slate-200 px-3 py-1 rounded hover:bg-slate-300">Ghi nhận</button>
                                            <button onClick={() => setEditingInitiative({nodeId, initiative})} className="text-xs text-blue-600 hover:underline">Sửa</button>
                                            <button onClick={() => handleDeleteInitiative(nodeId, initiative.id)} className="text-xs text-red-600 hover:underline">Xóa</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                 <div className="text-center p-4">
                    <p className="text-slate-500">Để thêm Sáng kiến, hãy chọn một Yếu tố trong tab "Bản đồ & Chẩn đoán" và sử dụng Cố vấn AI.</p>
                </div>
            </div>
            {editingInitiative && (
                <InitiativeEditor 
                    nodeId={editingInitiative.nodeId}
                    initiative={editingInitiative.initiative}
                    onClose={() => setEditingInitiative(null)}
                    onSave={handleSaveInitiative}
                />
            )}
            {loggingProgressFor && (
                <ProgressLogger
                    initiative={loggingProgressFor.initiative}
                    onClose={() => setLoggingProgressFor(null)}
                    onSave={(update) => handleSaveProgress(loggingProgressFor.nodeId, loggingProgressFor.initiative.id, update)}
                />
            )}
        </div>
    );
};

export default ActionPlanTab;
