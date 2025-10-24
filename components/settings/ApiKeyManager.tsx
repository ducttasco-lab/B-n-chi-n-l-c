// components/settings/ApiKeyManager.tsx
import React, { useState, DragEvent } from 'react';
import { ApiKey } from '../../types.ts';
import { KeyIcon, PlusIcon, PencilIcon, TrashIcon } from '../icons.tsx';
import ApiKeyEditorModal from './ApiKeyEditorModal.tsx';

interface ApiKeyManagerProps {
    apiKeys: ApiKey[];
    setApiKeys: React.Dispatch<React.SetStateAction<ApiKey[]>>;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ apiKeys, setApiKeys }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    const handleAdd = () => {
        setEditingKey(null);
        setIsModalOpen(true);
    };

    const handleEdit = (key: ApiKey) => {
        setEditingKey(key);
        setIsModalOpen(true);
    };

    const handleDelete = (keyId: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa API key này không?")) {
            setApiKeys(prev => prev.filter(k => k.id !== keyId));
        }
    };

    const handleSave = (key: ApiKey) => {
        const isNew = !apiKeys.some(k => k.id === key.id);
        if (isNew) {
            setApiKeys(prev => [...prev, key]);
        } else {
            setApiKeys(prev => prev.map(k => k.id === key.id ? key : k));
        }
    };

    // Drag and Drop handlers
    const handleDragStart = (e: DragEvent<HTMLTableRowElement>, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: DragEvent<HTMLTableRowElement>) => {
        e.preventDefault(); 
    };

    const handleDrop = (e: DragEvent<HTMLTableRowElement>, targetId: string) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) return;

        const currentKeys = [...apiKeys];
        const draggedIndex = currentKeys.findIndex(k => k.id === draggedItemId);
        const targetIndex = currentKeys.findIndex(k => k.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = currentKeys.splice(draggedIndex, 1);
        currentKeys.splice(targetIndex, 0, draggedItem);
        
        // Re-assign priority based on the new order
        const reorderedKeys = currentKeys.map((key, index) => ({...key, priority: currentKeys.length - index }));
        
        setApiKeys(reorderedKeys);
        setDraggedItemId(null);
    };


    return (
        <div className="space-y-6 max-w-4xl">
            {isModalOpen && <ApiKeyEditorModal apiKey={editingKey} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}

            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Quản lý API Key</h3>
                        <p className="text-xs text-slate-500">Thêm và sắp xếp các API key. Ứng dụng sẽ tự động dùng key có độ ưu tiên cao nhất.</p>
                    </div>
                    <button onClick={handleAdd} className="px-3 py-2 text-sm bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center gap-2">
                        <PlusIcon /> Thêm Key
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-2 w-10">Ưu tiên</th>
                                <th className="p-2 text-left">Tên</th>
                                <th className="p-2 text-left">Key (ẩn)</th>
                                <th className="p-2 text-left">Engine</th>
                                <th className="p-2 text-center w-24">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...apiKeys].sort((a,b) => b.priority - a.priority).map((key, index) => (
                                <tr key={key.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, key.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, key.id)}
                                    className={`border-b cursor-move ${draggedItemId === key.id ? 'opacity-50' : ''}`}
                                >
                                    <td className="p-2 text-center font-bold text-slate-500">{index + 1}</td>
                                    <td className="p-2 font-semibold">{key.name}</td>
                                    <td className="p-2 font-mono text-slate-500">{`...${key.key.slice(-4)}`}</td>
                                    <td className="p-2">{key.engine}</td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => handleEdit(key)} className="p-1 hover:bg-slate-200 rounded"><PencilIcon /></button>
                                        <button onClick={() => handleDelete(key.id)} className="p-1 hover:bg-slate-200 rounded ml-2"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyManager;