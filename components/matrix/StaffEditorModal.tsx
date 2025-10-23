// components/matrix/StaffEditorModal.tsx
import React, { useState, useEffect } from 'react';
import { Role } from '../../types.ts';

interface StaffEditorModalProps {
    role: Role | null;
    departmentCode: string | null;
    onClose: () => void;
    onSave: (role: Role) => void;
}

const StaffEditorModal: React.FC<StaffEditorModalProps> = ({ role, departmentCode, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const isEditing = !!role;

    useEffect(() => {
        if (role) {
            setName(role.name);
            setTitle(role.title);
            setEmail(role.email);
            setPhone(role.phone);
        }
    }, [role]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Tên nhân viên không được để trống.');
            return;
        }
        onSave({ 
            id: role?.id || `role-${Date.now()}`,
            name, 
            title, 
            email, 
            phone,
            departmentCode: role?.departmentCode || departmentCode!
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Sửa thông tin Nhân sự' : 'Thêm Nhân sự mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tên Nhân viên / Vị trí:</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Chức danh:</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Email:</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Số điện thoại:</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" />
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

export default StaffEditorModal;
