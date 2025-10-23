// components/cockpit/StrategyBoardTab.tsx
import React, { useState, useEffect } from 'react';
import { StrategicModel, StrategyReport, SixVariablesModel, StrategicNode } from '../../types.ts';
import { SparklesIcon } from '../icons.tsx';
import { getFullContextFromModel, generateJsonResponse } from '../../services/geminiService.ts';

interface StrategyBoardTabProps {
    strategicModel: StrategicModel;
    sixVariablesModel: SixVariablesModel;
    triggerGeneration?: number;
    report: StrategyReport | null;
    setReport: (report: StrategyReport | null) => void;
}

const DataGrid: React.FC<{data: any[], title?: string}> = ({ data, title }) => {
    if (!data || data.length === 0) {
        return <p className="text-sm text-slate-500 italic mt-2">{title ? `Không có dữ liệu cho ${title}.` : 'Không có dữ liệu.'}</p>;
    }
    const headers = Object.keys(data[0]);
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-slate-200">
                <thead className="bg-slate-100">
                    <tr>
                        {headers.map(header => (
                            <th key={header} className="p-2 border-b border-slate-300 text-left font-semibold text-slate-700">{header.replace(/_/g, ' ')}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-slate-50">
                            {headers.map(header => (
                                <td key={`${rowIndex}-${header}`} className="p-2 border-b border-slate-200 align-top">{String(row[header])}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const StrategyBoardTab: React.FC<StrategyBoardTabProps> = ({ strategicModel, sixVariablesModel, triggerGeneration, report, setReport }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReport(null);
        const context = getFullContextFromModel(strategicModel, sixVariablesModel);
        
        const prompt = `[ĐÓNG VAI]: Bạn là một nhà tư vấn quản trị cấp cao, có khả năng tổng hợp các vấn đề phức tạp thành một báo cáo chiến lược súc tích, rõ ràng và mang tính định hướng.
[BỐI CẢNH]: Bạn có toàn bộ dữ liệu ghi chú của doanh nghiệp về 18 yếu tố chiến lược và 6 biến số kiểm soát.
--- DỮ LIỆU ĐẦY ĐỦ ---
${context}
--- KẾT THÚC DỮ LIỆU ---
[NHIỆM VỤ]: Dựa vào TOÀN BỘ thông tin trên, hãy tạo ra một "Bảng Chiến lược" hoàn chỉnh.
[ĐỊNH DẠNG ĐẦU RA BẮT BUỘC]: Trả về một đối tượng JSON duy nhất, không có bất kỳ văn bản nào khác, với cấu trúc sau:
{
  "executiveSummary": "Một đoạn văn tổng hợp (khoảng 3-5 câu) về tình hình chung, vị thế và thách thức lớn nhất của doanh nghiệp.",
  "strategicFocusAreas": [
    { "id": "ID của Yếu tố/Biến số quan trọng nhất 1", "reason": "Lý do tại sao đây là trọng tâm chiến lược." },
    { "id": "ID của Yếu tố/Biến số quan trọng nhất 2", "reason": "Lý do..." }
  ],
  "strategicLevers": [
    { "focusAreaId": "ID của Trọng tâm 1", "leverDescription": "Đề xuất 1-2 'đòn bẩy chiến lược' (hành động cấp cao) để giải quyết trọng tâm này." },
    { "focusAreaId": "ID của Trọng tâm 2", "leverDescription": "Đề xuất cho trọng tâm 2..." }
  ],
  "conflictAnalysis": [
    { "conflict": "Chỉ ra 1-2 mâu thuẫn logic hoặc điểm thiếu nhất quán nghiêm trọng nhất.", "recommendation": "Đề xuất ngắn gọn để giải quyết mâu thuẫn." }
  ]
}`;

        const result = await generateJsonResponse<StrategyReport>(prompt);
        if (result) {
            setReport(result);
        } else {
            alert("AI không thể tạo báo cáo. Vui lòng thử lại.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (triggerGeneration && triggerGeneration > 0) {
            handleGenerateReport();
        }
    }, [triggerGeneration]);
    
    const getInitiativesForReport = () => {
        if (!report?.strategicFocusAreas) return [];
        const focusIds = new Set(report.strategicFocusAreas.map(f => f.id));
        const initiatives: any[] = [];
        Object.values(strategicModel).forEach((node: StrategicNode) => {
            if(focusIds.has(node.id) || (node.name && focusIds.has(node.name))) {
                node.initiatives.forEach(i => {
                    initiatives.push({
                        "Sáng kiến": i.name,
                        "Người phụ trách": i.owner,
                        "Thời hạn": i.dueDate,
                        "Tiến độ": `${i.currentProgress}%`,
                        "Liên quan đến": node.name,
                    });
                });
            }
        });
        return initiatives;
    }


    return (
        <div className="p-6 bg-slate-50 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-slate-800">Bảng Chiến lược</h2>
                <button
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
                >
                    <SparklesIcon />
                    <span className="ml-2">{isLoading ? 'Đang tạo...' : 'AI Tổng hợp Bảng Chiến lược'}</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white p-6 rounded-lg shadow-inner border border-slate-200">
                {!report && !isLoading && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-slate-500 text-center">Nhấn nút "AI Tổng hợp" để tạo báo cáo chiến lược dựa trên dữ liệu đã nhập.</p>
                    </div>
                )}
                {isLoading && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-slate-500 animate-pulse">AI đang phân tích và tổng hợp... Vui lòng đợi trong giây lát.</p>
                    </div>
                )}
                {report && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-lg text-blue-800 border-b pb-2 mb-3">1. Định vị Chiến lược (Tóm tắt)</h3>
                            <p className="text-slate-700 leading-relaxed">{report.executiveSummary}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-blue-800 border-b pb-2 mb-3">2. Các Trọng tâm Chiến lược</h3>
                            <DataGrid data={report.strategicFocusAreas.map(f => ({'Trọng tâm': f.id, 'Lý do': f.reason}))} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-blue-800 border-b pb-2 mb-3">3. Các Đòn bẩy Chiến lược</h3>
                            <DataGrid data={report.strategicLevers.map(l => ({'Thuộc trọng tâm': l.focusAreaId, 'Đòn bẩy chiến lược': l.leverDescription}))} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-blue-800 border-b pb-2 mb-3">4. Phân tích Mâu thuẫn & Rủi ro</h3>
                             <DataGrid data={report.conflictAnalysis.map(c => ({'Mâu thuẫn / Rủi ro': c.conflict, 'Đề xuất': c.recommendation}))} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-blue-800 border-b pb-2 mb-3">5. Các Sáng kiến Dẫn dắt</h3>
                             <DataGrid data={getInitiativesForReport()} title="Sáng kiến" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StrategyBoardTab;