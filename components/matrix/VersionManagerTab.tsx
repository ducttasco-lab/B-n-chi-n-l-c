// components/matrix/VersionManagerTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { VersionInfo, VersionData, Task, Department, Role } from '../../types.ts';
import * as versionManager from '../../services/versionManager.ts';
import { PencilIcon, TrashIcon } from '../icons.tsx';

interface VersionManagerTabProps {
    versions: VersionInfo[];
    setVersions: React.Dispatch<React.SetStateAction<VersionInfo[]>>;
    tasks: Task[];
    departments: Department[];
    roles: Role[];
    generatedTaskMarkdown: string;
    companyAssignments: Record<string, Record<string, string>>;
    departmentalAssignments: Record<string, Record<string, string>>;
    loadVersionData: (data: VersionData) => void;
    activeVersionId: string | null;
    setActiveVersionId: (id: string | null) => void;
}

/**
 * Creates a canonical (consistent) JSON string from version data by sorting arrays and object keys.
 * This is crucial for reliably comparing two VersionData objects.
 * @param data The version data to stringify.
 * @returns A consistent JSON string representation.
 */
const getCanonicalJson = (data: VersionData | null): string => {
    if (!data) return '';
    try {
        // Replacer function for JSON.stringify that sorts object keys alphabetically.
        const replacer = (key: string, value: any) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const replacement: Record<string, any> = {};
                for (const k of Object.keys(value).sort()) {
                    replacement[k] = value[k];
                }
                return replacement;
            }
            return value;
        };

        const dataCopy = JSON.parse(JSON.stringify(data));

        dataCopy.tasks?.sort((a: any, b: any) => a.rowNumber - b.rowNumber || a.id.localeCompare(b.id));
        dataCopy.departments?.sort((a: any, b: any) => a.priority - b.priority || a.code.localeCompare(b.code));
        dataCopy.roles?.sort((a: any, b: any) => a.id.localeCompare(b.id));
        
        return JSON.stringify(dataCopy, replacer);
        
    } catch (e) {
        console.error("Error creating canonical JSON:", e);
        return JSON.stringify(data);
    }
};


const VersionManagerTab: React.FC<VersionManagerTabProps> = ({ 
    versions, setVersions, tasks, departments, roles, generatedTaskMarkdown, 
    companyAssignments, departmentalAssignments, loadVersionData, 
    activeVersionId, setActiveVersionId 
}) => {
    const [newVersionName, setNewVersionName] = useState('');
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameText, setRenameText] = useState('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const currentData: VersionData = useMemo(() => ({
        tasks, departments, roles, generatedTaskMarkdown, companyAssignments, departmentalAssignments
    }), [tasks, departments, roles, generatedTaskMarkdown, companyAssignments, departmentalAssignments]);

    const stringifiedCurrentData = useMemo(() => getCanonicalJson(currentData), [currentData]);
    
    const viewingVersionId = useMemo(() => {
        for (const version of versions) {
            const versionData = versionManager.getVersionData(version.id);
            const stringifiedVersionData = getCanonicalJson(versionData);
            if (stringifiedVersionData && stringifiedVersionData === stringifiedCurrentData) {
                return version.id;
            }
        }
        return null; 
    }, [stringifiedCurrentData, versions]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);


    const handleSave = () => {
        if (!newVersionName.trim()) {
            alert('Vui lòng nhập tên cho phiên bản.');
            return;
        }
        try {
            // Construct the data object explicitly here to ensure all parts are included.
            const dataToSave: VersionData = {
                tasks,
                departments,
                roles,
                generatedTaskMarkdown,
                companyAssignments,
                departmentalAssignments,
            };
            const updatedVersions = versionManager.saveVersion(newVersionName, dataToSave);
            setVersions(updatedVersions);
            setNewVersionName('');
            setNotification({ message: `Đã lưu phiên bản "${newVersionName}" thành công.`, type: 'success' });
        } catch (e) {
            setNotification({ message: 'Lỗi khi lưu phiên bản.', type: 'error' });
        }
    };

    const handleLoad = (versionId: string) => {
        const versionToLoad = versions.find(v => v.id === versionId);
        if (!versionToLoad) {
            setNotification({ message: 'Lỗi: Không tìm thấy phiên bản.', type: 'error' });
            return;
        }
    
        if (window.confirm(`Thao tác này sẽ ghi đè dữ liệu làm việc hiện tại bằng phiên bản "${versionToLoad.name}". Dữ liệu chưa lưu sẽ bị mất. Bạn có muốn tiếp tục?`)) {
            const data = versionManager.getVersionData(versionId);
            if (data) {
                loadVersionData(data);
                setNotification({ message: `Đã tải phiên bản "${versionToLoad.name}" vào không gian làm việc.`, type: 'success' });
            } else {
                setNotification({ message: 'Lỗi: Không thể tải dữ liệu phiên bản.', type: 'error' });
            }
        }
    };
    
    const handleActivate = (versionId: string) => {
        const versionToActivate = versions.find(v => v.id === versionId);
        if (!versionToActivate) {
            setNotification({ message: 'Lỗi: Không tìm thấy phiên bản.', type: 'error' });
            return;
        }
        
        if (window.confirm(`Kích hoạt phiên bản "${versionToActivate.name}" sẽ đặt nó làm ma trận chính thức cho toàn bộ ứng dụng và ghi đè công việc hiện tại. Tiếp tục?`)) {
            const data = versionManager.getVersionData(versionId);
            if (data) {
                loadVersionData(data);
                versionManager.saveActiveMatrix(data);
                setActiveVersionId(versionId);
                setNotification({ message: `Đã kích hoạt phiên bản "${versionToActivate.name}".`, type: 'success' });
            } else {
                setNotification({ message: 'Lỗi: Không thể kích hoạt phiên bản.', type: 'error' });
            }
        }
    };

    const handleDelete = (versionId: string) => {
        const versionToDelete = versions.find(v => v.id === versionId);
        if (!versionToDelete) {
             setNotification({ message: 'Lỗi: Không tìm thấy phiên bản.', type: 'error' });
            return;
        }
    
        if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn phiên bản "${versionToDelete.name}" không?`)) {
            const updatedVersions = versionManager.deleteVersion(versionId);
            setVersions(updatedVersions);
            setNotification({ message: `Đã xóa phiên bản "${versionToDelete.name}".`, type: 'success' });
        }
    };

    const handleRename = (versionId: string) => {
        if (!renameText.trim()) {
            setRenamingId(null);
            return;
        };
        const updatedVersions = versionManager.renameVersion(versionId, renameText);
        setVersions(updatedVersions);
        setNotification({ message: `Đã đổi tên phiên bản thành "${renameText}".`, type: 'success' });
        setRenamingId(null);
        setRenameText('');
    };

    return (
        <div className="p-4 h-full flex flex-col space-y-4 relative bg-slate-50">
            <div className="flex-shrink-0 p-4 border border-slate-200 rounded-md bg-white shadow-sm space-y-2">
                <h3 className="font-bold text-lg">Lưu Phiên bản Hiện tại</h3>
                {viewingVersionId === null && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                        Bạn có những thay đổi chưa được lưu. Nhập tên và nhấn "Lưu" để tạo phiên bản mới.
                    </div>
                )}
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
                                {versions.map(v => {
                                    const isActive = activeVersionId === v.id;
                                    const isViewingContent = viewingVersionId === v.id; // Does the content in editor match this version?
                                    
                                    let rowClass = 'border-b transition-colors';
                                    if (isActive) {
                                        rowClass += ' bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500';
                                    } else if (isViewingContent) {
                                        rowClass += ' bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400';
                                    } else {
                                        rowClass += ' hover:bg-slate-50 border-l-4 border-transparent';
                                    }

                                    return (
                                        <tr key={v.id} className={rowClass}>
                                            <td className={`p-2 ${isActive ? 'font-bold text-blue-800' : ''}`}>
                                                {renamingId === v.id ? (
                                                    <input 
                                                        type="text" 
                                                        value={renameText}
                                                        onChange={e => setRenameText(e.target.value)}
                                                        onBlur={() => handleRename(v.id)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') handleRename(v.id);
                                                            if (e.key === 'Escape') setRenamingId(null);
                                                        }}
                                                        className="p-1 border rounded"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div className="flex items-center">
                                                        <span>{v.name}</span>
                                                        {isActive && (
                                                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                Đang hoạt động
                                                            </span>
                                                        )}
                                                        {isViewingContent && !isActive && (
                                                             <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                Đang xem
                                                            </span>
                                                        )}
                                                        <button onClick={() => { setRenamingId(v.id); setRenameText(v.name); }} className="ml-2 text-slate-400 hover:text-blue-600"><PencilIcon /></button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2">{new Date(v.timestamp).toLocaleString('vi-VN')}</td>
                                            <td className="p-2 text-center space-x-1">
                                                <button 
                                                    onClick={() => handleLoad(v.id)} 
                                                    disabled={isViewingContent}
                                                    className="px-3 py-1 bg-slate-200 rounded text-slate-700 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                                >
                                                    Tải
                                                </button>
                                                <button 
                                                    onClick={() => handleActivate(v.id)} 
                                                    disabled={isActive}
                                                    className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                                >
                                                    Kích hoạt
                                                </button>
                                                <button onClick={() => handleDelete(v.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            
            {notification && (
                <div className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-xl text-sm font-semibold animate-fade-in-out z-50
                    ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default VersionManagerTab;