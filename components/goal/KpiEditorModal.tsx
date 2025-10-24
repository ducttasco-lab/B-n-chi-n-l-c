// components/goal/KpiEditorModal.tsx
import React, { useState, useEffect } from 'react';
import { PredefinedKPI } from '../../types.ts';

interface KpiEditorModalProps {
    kpi: PredefinedKPI | null;
    onClose: () => void;
    onSave: (kpi: PredefinedKPI) => void;
}

const KpiEditorModal: React.FC<KpiEditorModalProps> = ({ kpi, onClose, onSave }) => {
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('');
    const [category, setCategory] = useState<'Doanh thu' | 'Doanh số' | 'Dòng tiền' | 'Khác'>('Khác');
    const isEditing = !!kpi;

    useEffect(() => {
        if (kpi) {
            setCode(kpi.code);
            setDescription(kpi.description);
            setUnit(kpi.unit);
            setCategory(kpi.category);
        }
    }, [kpi]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || !description.trim() || !unit.trim()) {
            alert('Vui lòng điền đầy đủ Mã số, Mô tả và Đơn vị.');
            return;
        }
        onSave({ code, description, unit, category });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Sửa KPI' : 'Thêm KPI mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Mã số KPI:</label>
                        <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full mt-1 p-2 border rounded" required disabled={isEditing} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Mô tả:</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 p-2 border rounded" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Đơn vị:</label>
                            <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className="w-full mt-1 p-2 border rounded" required placeholder="VNĐ, %, Hợp đồng..."/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nhóm:</label>
                            <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full mt-1 p-2 border rounded">
                                <option>Doanh thu</option>
                                <option>Doanh số</option>
                                <option>Dòng tiền</option>
                                <option>Khác</option>
                            </select>
                        </div>
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

export default KpiEditorModal;
