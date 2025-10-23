// components/cockpit/InitiativeEditor.tsx
import React, { useState, useEffect } from 'react';
// FIX: Added .ts extension to the import path.
import { StrategicInitiative } from '../../types.ts';

interface InitiativeEditorProps {
  initiative?: StrategicInitiative;
  nodeId: string;
  onClose: () => void;
  onSave: (nodeId: string, initiative: StrategicInitiative) => void;
}

const InitiativeEditor: React.FC<InitiativeEditorProps> = ({ initiative, nodeId, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Mới tạo' | 'Đang thực hiện' | 'Hoàn thành' | 'Tạm dừng'>('Mới tạo');

  useEffect(() => {
    if (initiative) {
      setName(initiative.name);
      setOwner(initiative.owner);
      setDueDate(initiative.dueDate);
      setDescription(initiative.description);
      setStatus(initiative.status);
    }
  }, [initiative]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !owner.trim() || !dueDate.trim()) {
      alert('Vui lòng điền Tên Sáng kiến, Người phụ trách và Thời hạn.');
      return;
    }

    const newInitiative: StrategicInitiative = {
        id: initiative?.id || `initiative-${Date.now()}`,
        name,
        owner,
        dueDate,
        status,
        progressHistory: initiative?.progressHistory || [],
        description,
        currentProgress: initiative?.currentProgress || 0,
        latestStatusComment: initiative?.latestStatusComment || 'Newly created.',
    };
    onSave(nodeId, newInitiative);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg space-y-4">
        <h2 className="text-xl font-bold mb-4">{initiative ? 'Chỉnh sửa' : 'Tạo'} Sáng kiến Chiến lược</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên Sáng kiến</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Người phụ trách</label>
                <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Thời hạn</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" required />
            </div>
        </div>
        <div>
             <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
             <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                 <option>Mới tạo</option>
                 <option>Đang thực hiện</option>
                 <option>Hoàn thành</option>
                 <option>Tạm dừng</option>
             </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Hủy</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu</button>
        </div>
      </form>
    </div>
  );
};

export default InitiativeEditor;