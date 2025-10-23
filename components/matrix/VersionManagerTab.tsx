// components/matrix/VersionManagerTab.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { VersionInfo, VersionData, Role, Department } from '../../types.ts';
import * as versionManager from '../../services/versionManager.ts';

interface VersionManagerTabProps {
    versions: VersionInfo[];
    onLoadVersion: (data: VersionData) => void;
    onRenameVersion: (id: string, newName: string) => void;
    onDeleteVersion: (id: string) => void;
    roles: Role[];
    departments: Department[];
}

const VersionManagerTab: React.FC<VersionManagerTabProps> = ({ versions, onLoadVersion, onRenameVersion, onDeleteVersion, roles, departments }) => {
    const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<VersionData | null>(null);

    // This effect ensures that if the selected version is deleted from the parent's state,
    // the local selection and preview are cleared gracefully.
    useEffect(() => {
        if (selectedVersionId && !versions.some(v => v.id === selectedVersionId)) {
            setSelectedVersionId(null);
            setPreviewData(null);
        }
    }, [versions, selectedVersionId]);

    const handleSelectVersion = (versionId: string) => {
        setSelectedVersionId(versionId);
        const data = versionManager.getVersionData(versionId);
        setPreviewData(data);
    };

    const handleRename = () => {
        if (!selectedVersionId) return;
        const version = versions.find(v => v.id === selectedVersionId);
        if (!version) return;

        const newName = prompt("Nhập tên mới cho phiên bản:", version.name);
        if (newName && newName.trim()) {
            onRenameVersion(selectedVersionId, newName.trim());
        }
    };

    const handleDelete = () => {
        if (!selectedVersionId) return;
        const version = versions.find(v => v.id === selectedVersionId);
        if (version && window.confirm(`Bạn có chắc chắn muốn xóa phiên bản '${version.name}' không?`)) {
            onDeleteVersion(selectedVersionId);
        }
    };
    
    const previewDepartments = useMemo(() => {
        return previewData?.departments || departments;
    }, [previewData, departments]);

    const previewRoles = useMemo(() => {
        return previewData?.roles || roles;
    }, [previewData, roles]);


    return (
        <div className="h-full flex p-2 space-x-2">
            {/* Left Panel: Version List */}
            <div className="w-1/3 flex flex-col border border-slate-200 rounded-md p-2 bg-white">
                <h3 className="text-base font-bold mb-2">Danh sách Phiên bản</h3>
                <div className="flex-1 overflow-y-auto border-t">
                    {versions.length === 0 ? (
                        <p className="p-4 text-center text-slate-500 text-sm">Chưa có phiên bản nào được lưu.</p>
                    ) : (
                        <ul className="divide-y divide-slate-200">
                            {versions.map(version => (
                                <li 
                                    key={version.id}
                                    onClick={() => handleSelectVersion(version.id)}
                                    className={`p-2 cursor-pointer ${selectedVersionId === version.id ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
                                >
                                    <p className="font-semibold text-sm">{version.name}</p>
                                    <p className="text-xs text-slate-500">{new Date(version.timestamp).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Right Panel: Preview and Actions */}
            <div className="w-2/3 flex flex-col border border-slate-200 rounded-md p-2 bg-white">
                <h3 className="text-base font-bold mb-2">Nội dung Xem trước</h3>
                <div className="flex-1 overflow-auto border-t">
                    {previewData ? (
                        <table className="min-w-full text-xs border-collapse">
                            <thead className="sticky top-0 bg-slate-100 z-10">
                                <tr>
                                    <th className="p-1 border">MC1</th>
                                    <th className="p-1 border">MC2</th>
                                    <th className="p-1 border">MC3</th>
                                    <th className="p-1 border">MC4</th>
                                    <th className="p-1 border text-left">Tên Nhiệm vụ</th>
                                    {previewDepartments.map(dept => <th key={dept.code} className="p-1 border">{dept.name}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.tasks.map(task => (
                                    <tr key={task.id} className={task.isGroupHeader ? 'bg-slate-200 font-bold' : 'hover:bg-slate-50'}>
                                        {task.isGroupHeader ? (
                                            <td colSpan={5 + previewDepartments.length} className="p-1 border">{task.name}</td>
                                        ) : (
                                            <>
                                                <td className="p-1 border text-center">{task.mc1}</td>
                                                <td className="p-1 border text-center">{task.mc2}</td>
                                                <td className="p-1 border text-center">{task.mc3}</td>
                                                <td className="p-1 border text-center">{task.mc4}</td>
                                                <td className="p-1 border">{task.name}</td>
                                                {previewDepartments.map(dept => (
                                                    <td key={dept.code} className="p-1 border text-center">{previewData.companyAssignments[task.id]?.[dept.code] || ''}</td>
                                                ))}
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="p-4 text-center text-slate-500 text-sm">Chọn một phiên bản để xem trước.</p>
                    )}
                </div>
                <div className="pt-2 flex-shrink-0 flex justify-end space-x-2">
                    <button onClick={handleRename} disabled={!selectedVersionId} className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 disabled:opacity-50">Đổi tên...</button>
                    <button onClick={handleDelete} disabled={!selectedVersionId} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50">Xóa...</button>
                    <button onClick={() => previewData && onLoadVersion(previewData)} disabled={!previewData} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold disabled:opacity-50">Tải vào Buồng lái</button>
                </div>
            </div>
        </div>
    );
};

export default VersionManagerTab;