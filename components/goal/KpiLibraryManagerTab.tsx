// components/goal/KpiLibraryManagerTab.tsx
import React, { useState } from 'react';
import { PredefinedKPI } from '../../types.ts';
import { PencilIcon, TrashIcon, PlusIcon } from '../icons.tsx';
import KpiEditorModal from './KpiEditorModal.tsx';

interface KpiLibraryManagerTabProps {
    kpis: PredefinedKPI[];
    setKpis: React.Dispatch<React.SetStateAction<PredefinedKPI[]>>;
}

const KpiLibraryManagerTab: React.FC<KpiLibraryManagerTabProps> = ({ kpis, setKpis }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKpi, setEditingKpi] = useState<PredefinedKPI | null>(null);

    const handleAdd = () => {
        setEditingKpi(null);
        setIsModalOpen(true);
    };

    const handleEdit = (kpi: PredefinedKPI) => {
        setEditingKpi(kpi);
        setIsModalOpen(true);
    };

    const handleDelete = (kpiCode: string) => {
        if (window.confirm(`Bạn có chắc muốn xóa KPI "${kpiCode}"?`)) {
            setKpis(prev => prev.filter(k => k.code !== kpiCode));
        }
    };
    
    const handleSave = (kpi: PredefinedKPI) => {
        const isNew = !kpis.some(k => k.code === kpi.code);
        if (isNew) {
            setKpis(prev => [...prev, kpi].sort((a,b) => a.code.localeCompare(b.code)));
        } else {
            setKpis(prev => prev.map(k => k.code === kpi.code ? kpi : k));
        }
    };

    return (
        <div className="p-4 h-full flex flex-col space-y-4">
            {isModalOpen && <KpiEditorModal kpi={editingKpi} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}

            <div className="flex-shrink-0 flex justify-between items-center">
                 <h3 className="text-xl font-bold">Thư viện KPI</h3>
                 <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center gap-2">
                     <PlusIcon /> Thêm KPI mới
                 </button>
            </div>

            <div className="flex-1 overflow-auto border border-slate-200 rounded-md bg-white">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 sticky top-0">
                        <tr>
                            <th className="p-2 border-b font-semibold text-left">Mã số</th>
                            <th className="p-2 border-b font-semibold text-left">Mô tả</th>
                            <th className="p-2 border-b font-semibold text-center">Đơn vị</th>
                            <th className="p-2 border-b font-semibold text-left">Nhóm</th>
                            <th className="p-2 border-b font-semibold text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kpis.sort((a,b) => a.code.localeCompare(b.code)).map(kpi => (
                            <tr key={kpi.code} className="hover:bg-slate-50">
                                <td className="p-2 border-b font-mono">{kpi.code}</td>
                                <td className="p-2 border-b">{kpi.description}</td>
                                <td className="p-2 border-b text-center">{kpi.unit}</td>
                                <td className="p-2 border-b">{kpi.category}</td>
                                <td className="p-2 border-b text-center">
                                    <button onClick={() => handleEdit(kpi)} className="p-1 hover:bg-slate-200 rounded"><PencilIcon /></button>
                                    <button onClick={() => handleDelete(kpi.code)} className="p-1 hover:bg-slate-200 rounded ml-2"><TrashIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KpiLibraryManagerTab;
