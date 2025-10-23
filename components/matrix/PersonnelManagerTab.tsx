// components/matrix/PersonnelManagerTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Department, Role } from '../../types.ts';
import { PencilIcon, TrashIcon, PlusIcon } from '../icons.tsx';
import DepartmentEditorModal from './DepartmentEditorModal.tsx';
import StaffEditorModal from './StaffEditorModal.tsx';

interface PersonnelManagerTabProps {
    departments: Department[];
    setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

const PersonnelManagerTab: React.FC<PersonnelManagerTabProps> = ({ departments, setDepartments, roles, setRoles }) => {
    // Local state for editing before saving
    const [localDepartments, setLocalDepartments] = useState<Department[]>([]);
    const [localRoles, setLocalRoles] = useState<Role[]>([]);
    const [selectedDeptCode, setSelectedDeptCode] = useState<string | null>(null);

    // Modal states
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Role | null>(null);

    // Sync local state with props on initial load and when props change
    useEffect(() => {
        setLocalDepartments(JSON.parse(JSON.stringify(departments)));
        setLocalRoles(JSON.parse(JSON.stringify(roles)));
        if (departments.length > 0 && !selectedDeptCode) {
            setSelectedDeptCode(departments.sort((a, b) => a.priority - b.priority)[0].code);
        }
    }, [departments, roles]);

    const staffInSelectedDept = useMemo(() => {
        return localRoles.filter(r => r.departmentCode === selectedDeptCode).sort((a, b) => a.name.localeCompare(b.name));
    }, [localRoles, selectedDeptCode]);

    const handleSave = () => {
        setDepartments(localDepartments);
        setRoles(localRoles);
        alert('Đã lưu và đồng bộ dữ liệu nhân sự thành công!');
    };

    // Department Handlers
    const handleAddDept = () => {
        setEditingDept(null);
        setIsDeptModalOpen(true);
    };

    const handleEditDept = (dept: Department) => {
        setEditingDept(dept);
        setIsDeptModalOpen(true);
    };

    const handleDeleteDept = (deptCode: string) => {
        if (window.confirm('Bạn có chắc muốn xóa phòng ban này? Tất cả nhân viên trong phòng cũng sẽ bị xóa.')) {
            setLocalDepartments(prev => prev.filter(d => d.code !== deptCode));
            setLocalRoles(prev => prev.filter(r => r.departmentCode !== deptCode));
            if(selectedDeptCode === deptCode) {
                setSelectedDeptCode(localDepartments.length > 1 ? localDepartments.filter(d=>d.code !== deptCode)[0].code : null);
            }
        }
    };
    
    const handleSaveDept = (dept: Department) => {
        const isNew = !localDepartments.some(d => d.code === dept.code);
        if (isNew) {
            setLocalDepartments(prev => [...prev, dept]);
        } else {
            setLocalDepartments(prev => prev.map(d => d.code === dept.code ? dept : d));
        }
    };

    // Staff Handlers
    const handleAddStaff = () => {
        if (!selectedDeptCode) {
            alert('Vui lòng chọn một phòng ban trước.');
            return;
        }
        setEditingStaff(null);
        setIsStaffModalOpen(true);
    };
    
    const handleEditStaff = (staff: Role) => {
        setEditingStaff(staff);
        setIsStaffModalOpen(true);
    };

    const handleDeleteStaff = (staffId: string) => {
        if(window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
            setLocalRoles(prev => prev.filter(r => r.id !== staffId));
        }
    };

    const handleSaveStaff = (staff: Role) => {
         const isNew = !localRoles.some(r => r.id === staff.id);
         if (isNew) {
             setLocalRoles(prev => [...prev, staff]);
         } else {
            setLocalRoles(prev => prev.map(r => r.id === staff.id ? staff : r));
         }
    };

    return (
        <div className="h-full flex flex-col p-2 space-y-4">
            {isDeptModalOpen && (
                <DepartmentEditorModal 
                    department={editingDept}
                    onClose={() => setIsDeptModalOpen(false)}
                    onSave={handleSaveDept}
                />
            )}
            {isStaffModalOpen && (
                <StaffEditorModal
                    role={editingStaff}
                    departmentCode={selectedDeptCode}
                    onClose={() => setIsStaffModalOpen(false)}
                    onSave={handleSaveStaff}
                />
            )}

            {/* Departments Section */}
            <div className="flex-1 flex flex-col border border-slate-200 rounded-md p-3 bg-white">
                <h3 className="text-base font-bold mb-2">Quản lý Phòng ban</h3>
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100 sticky top-0">
                            <tr>
                                <th className="p-2 border font-semibold w-12">STT</th>
                                <th className="p-2 border font-semibold text-left">Tên Phòng ban</th>
                                <th className="p-2 border font-semibold w-32">Mã</th>
                                <th className="p-2 border font-semibold w-24">Ưu tiên</th>
                                <th className="p-2 border font-semibold w-28">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localDepartments.sort((a,b) => a.priority - b.priority).map((dept, index) => (
                                <tr key={dept.code} onClick={() => setSelectedDeptCode(dept.code)} className={`cursor-pointer ${selectedDeptCode === dept.code ? 'bg-blue-100' : 'hover:bg-slate-50'}`}>
                                    <td className="p-2 border text-center">{index + 1}</td>
                                    <td className="p-2 border">{dept.name}</td>
                                    <td className="p-2 border text-center">{dept.code}</td>
                                    <td className="p-2 border text-center">{dept.priority}</td>
                                    <td className="p-2 border text-center">
                                        <button onClick={(e) => {e.stopPropagation(); handleEditDept(dept)}} className="p-1 hover:bg-slate-200 rounded"><PencilIcon/></button>
                                        <button onClick={(e) => {e.stopPropagation(); handleDeleteDept(dept.code)}} className="p-1 hover:bg-slate-200 rounded ml-2"><TrashIcon/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pt-2 flex-shrink-0">
                     <button onClick={handleAddDept} className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1"><PlusIcon/> Thêm mới...</button>
                </div>
            </div>

            {/* Staff Section */}
            <div className="flex-1 flex flex-col border border-slate-200 rounded-md p-3 bg-white">
                <h3 className="text-base font-bold mb-2">Quản lý Nhân sự ({localDepartments.find(d => d.code === selectedDeptCode)?.name || '...'})</h3>
                 <div className="flex-1 overflow-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100 sticky top-0">
                            <tr>
                                <th className="p-2 border font-semibold w-12">STT</th>
                                <th className="p-2 border font-semibold text-left">Họ và Tên</th>
                                <th className="p-2 border font-semibold text-left">Chức vụ</th>
                                <th className="p-2 border font-semibold text-left">Email</th>
                                <th className="p-2 border font-semibold w-28">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffInSelectedDept.map((staff, index) => (
                                <tr key={staff.id} className="hover:bg-slate-50">
                                    <td className="p-2 border text-center">{index + 1}</td>
                                    <td className="p-2 border">{staff.name}</td>
                                    <td className="p-2 border">{staff.title}</td>
                                    <td className="p-2 border">{staff.email}</td>
                                     <td className="p-2 border text-center">
                                        <button onClick={() => handleEditStaff(staff)} className="p-1 hover:bg-slate-200 rounded"><PencilIcon/></button>
                                        <button onClick={() => handleDeleteStaff(staff.id)} className="p-1 hover:bg-slate-200 rounded ml-2"><TrashIcon/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
                 <div className="pt-2 flex-shrink-0">
                     <button onClick={handleAddStaff} disabled={!selectedDeptCode} className="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"><PlusIcon/> Thêm mới...</button>
                </div>
            </div>
            
            {/* Save Button */}
            <div className="flex-shrink-0 flex justify-end items-center gap-4 p-2">
                <p className="text-xs text-slate-500">Kéo thả các dòng trong bảng Phòng ban để thay đổi thứ tự ưu tiên hiển thị.</p>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold">Lưu & Đồng bộ</button>
            </div>
        </div>
    );
};

export default PersonnelManagerTab;