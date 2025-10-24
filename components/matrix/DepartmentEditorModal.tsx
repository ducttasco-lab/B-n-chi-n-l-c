// components/matrix/DepartmentEditorModal.tsx
import React, { useState, useEffect } from 'react';
import { Department } from '../../types.ts';

interface DepartmentEditorModalProps {
    department: Department | null;
    onClose: () => void;
    onSave: (department: Department) => void;
    existingCodes: string[];
}

const DepartmentEditorModal: React.FC<DepartmentEditorModalProps> = ({ department, onClose, onSave, existingCodes }) => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [priority, setPriority] = useState(10);
    const [error, setError] = useState('');
    const isEditing = !!department;

    useEffect(() => {
        if (department) {
            setCode(department.code);
            setName(department.name);
            setPriority(department.priority);
        }
    }, [department]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || !name.trim()) {
            setError('Mã và Tên phòng ban không được để trống.');
            return;
        }
        if (!isEditing && existingCodes.includes(code.toUpperCase())) {
            setError('Mã phòng ban này đã tồn tại.');
            return;
        }

        onSave({ code: code.toUpperCase(), name, priority });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Sửa Phòng ban' : 'Thêm Phòng ban mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Mã Phòng ban (VD: MKT, SALE)</label>
                        <input type="text" value={code} onChange={e => setCode(e.target.value)} className="w-full mt-1 p-2 border rounded" required disabled={isEditing} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tên Phòng ban</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Thứ tự ưu tiên (số nhỏ hơn được hiển thị trước)</label>
                        <input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} className="w-full mt-1 p-2 border rounded" required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
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
