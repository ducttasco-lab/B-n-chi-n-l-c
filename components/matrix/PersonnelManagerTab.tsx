// components/matrix/PersonnelManagerTab.tsx
import React, { useState, useMemo, DragEvent } from 'react';
import { Department, Role } from '../../types.ts';
import { PencilIcon, TrashIcon, PlusIcon, BuildingOfficeIcon, UserCircleIcon } from '../icons.tsx';
import DepartmentEditorModal from './DepartmentEditorModal.tsx';
import StaffEditorModal from './StaffEditorModal.tsx';

interface PersonnelManagerTabProps {
    departments: Department[];
    setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

const PersonnelManagerTab: React.FC<PersonnelManagerTabProps> = ({ departments, setDepartments, roles, setRoles }) => {
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedDeptCode, setSelectedDeptCode] = useState<string | null>(null);
    const [draggedRoleId, setDraggedRoleId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);


    const handleSaveDepartment = (dept: Department) => {
        const isNew = !departments.some(d => d.code === dept.code);
        if (isNew) {
            setDepartments(prev => [...prev, dept]);
        } else {
            setDepartments(prev => prev.map(d => d.code === dept.code ? dept : d));
        }
    };

    const handleDeleteDepartment = (deptCode: string) => {
        if (roles.some(r => r.departmentCode === deptCode)) {
            alert('Không thể xóa phòng ban khi vẫn còn nhân viên.');
            return;
        }
        if (window.confirm(`Bạn có chắc muốn xóa phòng ban "${deptCode}" không?`)) {
            setDepartments(prev => prev.filter(d => d.code !== deptCode));
            if(selectedDeptCode === deptCode) {
                setSelectedDeptCode(null);
            }
        }
    };

    const handleSaveRole = (role: Role) => {
        const isNew = !roles.some(r => r.id === role.id);
        if (isNew) {
            setRoles(prev => [...prev, role]);
        } else {
            setRoles(prev => prev.map(r => r.id === role.id ? role : r));
        }
    };

    const handleDeleteRole = (roleId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa nhân viên này không?')) {
            setRoles(prev => prev.filter(r => r.id !== roleId));
        }
    };

    const filteredRoles = useMemo(() => {
        if (!selectedDeptCode) {
            return roles;
        }
        return roles.filter(r => r.departmentCode === selectedDeptCode);
    }, [roles, selectedDeptCode]);

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: DragEvent<HTMLTableRowElement>, roleId: string) => {
        setDraggedRoleId(roleId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: DragEvent<HTMLTableRowElement>, targetId: string) => {
        e.preventDefault();
        if (targetId !== draggedRoleId && targetId !== dropTargetId) {
             setDropTargetId(targetId);
        }
    };
    
    const handleDragLeave = () => {
        setDropTargetId(null);
    };

    const handleDrop = (e: DragEvent<HTMLTableRowElement>, targetRoleId: string) => {
        e.preventDefault();
        if (!draggedRoleId || draggedRoleId === targetRoleId) {
            setDraggedRoleId(null);
            setDropTargetId(null);
            return;
        }

        const currentRoles = [...roles];
        const draggedIndex = currentRoles.findIndex(r => r.id === draggedRoleId);
        const targetIndex = currentRoles.findIndex(r => r.id === targetRoleId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = currentRoles.splice(draggedIndex, 1);
        currentRoles.splice(targetIndex, 0, draggedItem);

        setRoles(currentRoles);
        setDraggedRoleId(null);
        setDropTargetId(null);
    };


    return (
        <div className="h-full flex p-4 space-x-4">
            {isDeptModalOpen && (
                <DepartmentEditorModal 
                    department={editingDept} 
                    onClose={() => setIsDeptModalOpen(false)} 
                    onSave={handleSaveDepartment}
                    existingCodes={departments.map(d => d.code)}
                />
            )}
            {isStaffModalOpen && (
                <StaffEditorModal 
                    role={editingRole}
                    departments={departments}
                    onClose={() => setIsStaffModalOpen(false)}
                    onSave={handleSaveRole}
                />
            )}

            {/* Departments Panel */}
            <div className="w-1/3 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg flex items-center gap-2"><BuildingOfficeIcon /> Phòng ban</h3>
                    <button onClick={() => { setEditingDept(null); setIsDeptModalOpen(true); }} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"><PlusIcon /> Thêm</button>
                </div>
                <div className="flex-1 overflow-y-auto border rounded-md bg-white p-2 space-y-1">
                    <button
                        onClick={() => setSelectedDeptCode(null)}
                        className={`w-full text-left p-2 border rounded-md flex justify-between items-center transition-colors ${!selectedDeptCode ? 'bg-blue-100 border-blue-300 font-semibold' : 'hover:bg-slate-50 border-transparent'}`}
                    >
                        Tất cả Nhân viên ({roles.length})
                    </button>
                    {departments.sort((a,b) => a.priority - b.priority).map(dept => (
                        <div 
                            key={dept.code} 
                            onClick={() => setSelectedDeptCode(dept.code)}
                            className={`p-2 border rounded-md flex justify-between items-center cursor-pointer transition-colors ${selectedDeptCode === dept.code ? 'bg-blue-100 border-blue-300' : 'hover:bg-slate-50 border-transparent'}`}
                        >
                            <div>
                                <p className="font-semibold">{dept.name} <span className="font-mono text-xs text-slate-500">({dept.code})</span></p>
                                <p className="text-xs text-slate-500">{roles.filter(r => r.departmentCode === dept.code).length} nhân viên</p>
                            </div>
                            <div className="flex-shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); setEditingDept(dept); setIsDeptModalOpen(true); }} className="p-1 text-slate-500 hover:text-blue-600"><PencilIcon /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteDepartment(dept.code); }} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Staff Panel */}
            <div className="w-2/3 flex flex-col">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg flex items-center gap-2"><UserCircleIcon /> Nhân viên</h3>
                    <button onClick={() => { setEditingRole(null); setIsStaffModalOpen(true); }} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"><PlusIcon /> Thêm</button>
                </div>
                 <div className="flex-1 overflow-y-auto border rounded-md bg-white">
                     <table className="min-w-full text-sm">
                        <thead className="bg-slate-100 sticky top-0">
                            <tr>
                                <th className="p-2 w-12 text-center font-semibold">STT</th>
                                <th className="p-2 text-left font-semibold">Tên</th>
                                <th className="p-2 text-left font-semibold">Chức danh</th>
                                <th className="p-2 text-left font-semibold">Phòng ban</th>
                                <th className="p-2 text-center font-semibold">Hành động</th>
                            </tr>
                        </thead>
                        <tbody onDragLeave={handleDragLeave}>
                            {filteredRoles.map((role, index) => (
                                <tr 
                                    key={role.id} 
                                    className={`border-b hover:bg-slate-50 cursor-move transition-all ${draggedRoleId === role.id ? 'opacity-30' : 'opacity-100'} ${dropTargetId === role.id ? 'drag-over-indicator' : ''}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, role.id)}
                                    onDragOver={(e) => handleDragOver(e, role.id)}
                                    onDrop={(e) => handleDrop(e, role.id)}
                                >
                                    <td className="p-2 text-center text-slate-500">{index + 1}</td>
                                    <td className="p-2">{role.name}</td>
                                    <td className="p-2">{role.title}</td>
                                    <td className="p-2">{departments.find(d => d.code === role.departmentCode)?.name || role.departmentCode}</td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => { setEditingRole(role); setIsStaffModalOpen(true); }} className="p-1 text-slate-500 hover:text-blue-600"><PencilIcon /></button>
                                        <button onClick={() => handleDeleteRole(role.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default PersonnelManagerTab;