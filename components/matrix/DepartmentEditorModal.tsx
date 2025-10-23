// components/matrix/DepartmentEditorModal.tsx
import React, { useState, useEffect } from 'react';
import { Department } from '../../types.ts';

interface DepartmentEditorModalProps {
    department: Department | null;
    onClose: () => void;
    onSave: (department: Department) => void;
}

const DepartmentEditorModal: React.FC<DepartmentEditorModalProps> = ({ department, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [priority, setPriority] = useState(99);
    const isEditing = !!department;

    useEffect(() => {
        if (department) {
            setName(department.name);
            setCode(department.code);
            setPriority(department.priority);
        }
    }, [department]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !code.trim()) {
            alert('Tên và Mã phòng ban không được để trống.');
            return;
        }
        onSave({ name, code, priority });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Sửa thông tin Phòng ban' : 'Thêm Phòng ban mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tên Phòng ban:</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Mã Phòng ban:</label>
                        <input type="text" value={code} onChange={e => setCode(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" required disabled={isEditing} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Thứ tự Ưu tiên (số nhỏ hơn được xếp trước):</label>
                        <input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} className="w-full mt-1 p-2 border border-slate-300 rounded-md" />
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

export default DepartmentEditorModal;
