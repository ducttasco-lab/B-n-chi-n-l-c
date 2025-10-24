// components/settings/ApiKeyEditorModal.tsx
import React, { useState, useEffect } from 'react';
import { ApiKey } from '../../types.ts';

interface ApiKeyEditorModalProps {
    apiKey: ApiKey | null;
    onClose: () => void;
    onSave: (apiKey: ApiKey) => void;
}

const ApiKeyEditorModal: React.FC<ApiKeyEditorModalProps> = ({ apiKey, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [engine, setEngine] = useState<'Gemini' | 'Other'>('Gemini');
    const isEditing = !!apiKey;

    useEffect(() => {
        if (apiKey) {
            setName(apiKey.name);
            setKey(apiKey.key);
            setEngine(apiKey.engine);
        }
    }, [apiKey]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !key.trim()) {
            alert('Tên và API Key không được để trống.');
            return;
        }
        onSave({ 
            id: apiKey?.id || crypto.randomUUID(),
            name, 
            key, 
            engine,
            priority: apiKey?.priority || 0 // Priority will be recalculated on save
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Sửa API Key' : 'Thêm API Key mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Tên định danh (VD: "Key cá nhân", "Key dự án X"):</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">API Key:</label>
                        <input type="password" value={key} onChange={e => setKey(e.target.value)} className="w-full mt-1 p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Engine:</label>
                        <select value={engine} onChange={e => setEngine(e.target.value as any)} className="w-full mt-1 p-2 border rounded">
                            <option>Gemini</option>
                            <option disabled>Other (sắp có)</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApiKeyEditorModal;