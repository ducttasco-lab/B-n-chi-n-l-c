// components/matrix/PersonnelManagerTab.tsx
import React, { useState } from 'react';
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
                <div className="flex-1 overflow-y-auto border rounded-md bg-white p-2 space-y-2">
                    {departments.sort((a,b) => a.priority - b.priority).map(dept => (
                        <div key={dept.code} className="p-2 border rounded-md flex justify-between items-center hover:bg-slate-50">
                            <div>
                                <p className="font-semibold">{dept.name} <span className="font-mono text-xs text-slate-500">({dept.code})</span></p>
                            </div>
                            <div>
                                <button onClick={() => { setEditingDept(dept); setIsDeptModalOpen(true); }} className="p-1 text-slate-500 hover:text-blue-600"><PencilIcon /></button>
                                <button onClick={() => handleDeleteDepartment(dept.code)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon /></button>
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
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-2 text-left font-semibold">Tên</th>
                                <th className="p-2 text-left font-semibold">Chức danh</th>
                                <th className="p-2 text-left font-semibold">Phòng ban</th>
                                <th className="p-2 text-center font-semibold">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id} className="border-b hover:bg-slate-50">
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
