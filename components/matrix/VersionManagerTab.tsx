// components/matrix/VersionManagerTab.tsx
import React, { useState } from 'react';
import { VersionInfo, VersionData } from '../../types.ts';
import * as versionManager from '../../services/versionManager.ts';
import { PencilIcon, TrashIcon } from '../icons.tsx';

interface VersionManagerTabProps {
    versions: VersionInfo[];
    setVersions: React.Dispatch<React.SetStateAction<VersionInfo[]>>;
    currentData: VersionData;
    loadVersionData: (data: VersionData) => void;
}

const VersionManagerTab: React.FC<VersionManagerTabProps> = ({ versions, setVersions, currentData, loadVersionData }) => {
    const [newVersionName, setNewVersionName] = useState('');
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameText, setRenameText] = useState('');

    const handleSave = () => {
        if (!newVersionName.trim()) {
            alert('Vui lòng nhập tên cho phiên bản.');
            return;
        }
        try {
            const updatedVersions = versionManager.saveVersion(newVersionName, currentData);
            setVersions(updatedVersions);
            setNewVersionName('');
            alert(`Đã lưu phiên bản "${newVersionName}" thành công.`);
        } catch (e) {
            // Error is alerted within the service
        }
    };

    const handleLoad = (versionId: string) => {
        if (window.confirm('Thao tác này sẽ ghi đè lên dữ liệu hiện tại. Bạn có chắc muốn tải phiên bản này không?')) {
            const data = versionManager.getVersionData(versionId);
            if (data) {
                loadVersionData(data);
                alert('Đã tải phiên bản thành công.');
            } else {
                alert('Không thể tải dữ liệu phiên bản.');
            }
        }
    };
    
    const handleActivate = (versionId: string) => {
        if (window.confirm('Kích hoạt phiên bản này sẽ đặt nó làm ma trận chính thức cho các chức năng khác (như Quản lý Mục tiêu). Dữ liệu hiện tại của bạn cũng sẽ được lưu và kích hoạt. Bạn có chắc chắn?')) {
            const dataToActivate = versionManager.getVersionData(versionId);
            if (dataToActivate) {
                versionManager.saveActiveMatrix(dataToActivate);
                alert('Đã kích hoạt phiên bản thành công.');
            }
        }
    };

    const handleDelete = (versionId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa vĩnh viễn phiên bản này không?')) {
            const updatedVersions = versionManager.deleteVersion(versionId);
            setVersions(updatedVersions);
        }
    };

    const handleRename = (versionId: string) => {
        if (!renameText.trim()) return;
        const updatedVersions = versionManager.renameVersion(versionId, renameText);
        setVersions(updatedVersions);
        setRenamingId(null);
        setRenameText('');
    };

    return (
        <div className="p-4 h-full flex flex-col space-y-4">
            <div className="flex-shrink-0 p-4 border border-slate-200 rounded-md bg-white shadow-sm space-y-2">
                <h3 className="font-bold text-lg">Lưu Phiên bản Hiện tại</h3>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newVersionName}
                        onChange={e => setNewVersionName(e.target.value)}
                        placeholder="Tên phiên bản (VD: Ma trận T10/2024)"
                        className="flex-1 p-2 border rounded-md"
                    />
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Lưu</button>
                </div>
            </div>

            <div className="flex-1 p-4 border border-slate-200 rounded-md bg-white shadow-sm flex flex-col">
                <h3 className="font-bold text-lg mb-2">Các Phiên bản đã Lưu</h3>
                <div className="flex-1 overflow-y-auto">
                    {versions.length === 0 ? (
                        <p className="text-center text-slate-500 mt-8">Chưa có phiên bản nào được lưu.</p>
                    ) : (
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-2 text-left font-semibold">Tên Phiên bản</th>
                                    <th className="p-2 text-left font-semibold">Ngày lưu</th>
                                    <th className="p-2 text-center font-semibold">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {versions.map(v => (
                                    <tr key={v.id} className="border-b hover:bg-slate-50">
                                        <td className="p-2">
                                            {renamingId === v.id ? (
                                                <input 
                                                    type="text" 
                                                    value={renameText}
                                                    onChange={e => setRenameText(e.target.value)}
                                                    onBlur={() => handleRename(v.id)}
                                                    onKeyDown={e => e.key === 'Enter' && handleRename(v.id)}
                                                    className="p-1 border rounded"
                                                    autoFocus
                                                />
                                            ) : (
                                                <>
                                                    {v.name}
                                                    <button onClick={() => { setRenamingId(v.id); setRenameText(v.name); }} className="ml-2 text-slate-400 hover:text-blue-600"><PencilIcon /></button>
                                                </>
                                            )}
                                        </td>
                                        <td className="p-2">{new Date(v.timestamp).toLocaleString('vi-VN')}</td>
                                        <td className="p-2 text-center space-x-1">
                                            <button onClick={() => handleLoad(v.id)} className="px-2 py-1 bg-slate-200 rounded hover:bg-slate-300">Tải</button>
                                            <button onClick={() => handleActivate(v.id)} className="px-2 py-1 bg-green-200 text-green-800 rounded hover:bg-green-300 font-semibold">Kích hoạt</button>
                                            <button onClick={() => handleDelete(v.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersionManagerTab;
