// components/matrix/CompanyMatrixWizard.tsx
import React, { useState } from 'react';
import { Department } from '../../types.ts';
import { suggestAssignmentRules } from '../../services/geminiService.ts';
import { SparklesIcon } from '../icons.tsx';

interface CompanyMatrixWizardProps {
    isOpen: boolean;
    onClose: () => void;
    departments: Department[];
    tasksMarkdown: string;
    onGenerate: (assignmentRules: string) => void;
}

const CompanyMatrixWizard: React.FC<CompanyMatrixWizardProps> = ({ isOpen, onClose, departments, tasksMarkdown, onGenerate }) => {
    const [assignmentRules, setAssignmentRules] = useState('');
    const [isLoadingRules, setIsLoadingRules] = useState(false);

    const handleSuggestRules = async () => {
        setIsLoadingRules(true);
        const deptNames = departments.map(d => d.name);
        try {
            const rules = await suggestAssignmentRules(deptNames, tasksMarkdown);
            setAssignmentRules(rules);
        } catch (error) {
            console.error("Failed to suggest assignment rules:", error);
            alert("Đã có lỗi xảy ra khi AI gợi ý quy tắc. Vui lòng thử lại.");
        } finally {
            setIsLoadingRules(false);
        }
    };

    const handleFinalGenerate = () => {
        if (!assignmentRules.trim()) {
            alert("Vui lòng nhập hoặc để AI gợi ý quy tắc phân nhiệm trước khi tạo ma trận.");
            return;
        }
        onGenerate(assignmentRules);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col h-[90vh]">
                <header className="p-4 border-b">
                    <h2 className="text-xl font-bold">AI-Assisted Functional Assignment Wizard</h2>
                </header>
                
                <main className="p-6 flex-1 flex flex-col overflow-y-auto space-y-4">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Bước 1: Thiết lập Quy tắc Phân nhiệm</h3>
                        <p className="text-sm text-slate-600 mb-2">
                            Cung cấp cho AI các quy tắc, logic, hoặc định hướng để phân công vai trò (QTKBP) cho các phòng ban.
                            Bạn có thể tự viết hoặc để AI gợi ý dựa trên danh sách nhiệm vụ và phòng ban hiện có.
                        </p>
                        <button 
                            onClick={handleSuggestRules} 
                            disabled={isLoadingRules}
                            className="w-full flex items-center justify-center p-2 bg-blue-100 text-blue-700 font-semibold rounded-md hover:bg-blue-200 disabled:bg-slate-200 disabled:text-slate-500"
                        >
                            <SparklesIcon />
                            <span className="ml-2">
                                {isLoadingRules ? 'AI đang suy nghĩ...' : 'AI Gợi ý Quy tắc Phân nhiệm'}
                            </span>
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung Quy tắc:</label>
                        <textarea
                            value={assignmentRules}
                            onChange={e => setAssignmentRules(e.target.value)}
                            placeholder="Ví dụ: Ban Giám đốc sẽ Quyết định (Q) các nhiệm vụ có mã A1, A2. Phòng Kinh doanh sẽ Thực hiện (T) các nhiệm vụ bán hàng..."
                            className="w-full flex-1 p-2 border border-slate-300 rounded-md resize-none"
                        />
                    </div>
                     <div>
                        <h3 className="font-bold text-lg mb-2">Bước 2: Tạo Ma trận</h3>
                        <p className="text-sm text-slate-600 mb-2">
                            Sau khi đã hài lòng với bộ quy tắc, nhấn nút bên dưới để AI tạo ra ma trận phân nhiệm chi tiết.
                        </p>
                    </div>
                </main>

                <footer className="p-4 border-t bg-slate-50 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Hủy bỏ</button>
                    <button 
                        onClick={handleFinalGenerate} 
                        disabled={isLoadingRules || !assignmentRules.trim()} 
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-slate-400"
                    >
                        Tạo Ma trận theo Quy tắc
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CompanyMatrixWizard;