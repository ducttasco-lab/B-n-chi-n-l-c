// components/cockpit/AnalysisReportTab.tsx
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '../icons.tsx';
// FIX: Added .ts extension to the import path.
import { StrategicModel, SixVariablesModel } from '../../types.ts';
// FIX: Added .ts extension to the import path.
import { getFullContextFromModel, analyzeAll18Factors, diagnoseAll6Variables } from '../../services/geminiService.ts';

interface AnalysisReportTabProps {
  title: string;
  reportContent: string;
  setReportContent: (content: string) => void;
  strategicModel: StrategicModel;
  sixVariablesModel: SixVariablesModel;
  analysisType: '18factors' | '6variables';
  triggerGeneration?: number;
}

const AnalysisReportTab: React.FC<AnalysisReportTabProps> = ({ title, reportContent, setReportContent, strategicModel, sixVariablesModel, analysisType, triggerGeneration }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReportContent('');
    const context = getFullContextFromModel(strategicModel, sixVariablesModel);
    
    // FIX: Handled the object response from the AI service and formatted it into a string for rendering.
    if (analysisType === '18factors') {
      const result = await analyzeAll18Factors(context);
      const formattedContent = Object.entries(result || {})
        .map(([factor, analysis]) => `<h4>${factor}</h4><p>${analysis}</p>`)
        .join('');
      setReportContent(formattedContent);
    } else {
      const result = await diagnoseAll6Variables(context);
      const formattedContent = Object.entries(result || {})
        .map(([variable, data]) => `<h4>${variable} - <span class="status-${data.status}">${data.status}</span></h4><p>${data.assessment}</p>`)
        .join('');
      setReportContent(formattedContent);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (triggerGeneration && triggerGeneration > 0) {
        handleGenerateReport();
    }
  }, [triggerGeneration]);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
        >
          <SparklesIcon />
          <span className="ml-2">{isLoading ? 'Đang tạo báo cáo...' : `Tạo ${title}`}</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-inner flex-1 overflow-y-auto">
        {isLoading && (
            <div className="flex justify-center items-center h-full">
                <p className="text-slate-500 animate-pulse">AI đang tạo báo cáo, quá trình này có thể mất một lúc...</p>
            </div>
        )}
        {!isLoading && !reportContent && (
            <div className="flex justify-center items-center h-full">
                <p className="text-center text-slate-500">Nhấn nút ở trên để bắt đầu tạo phân tích.</p>
            </div>
        )}
        {reportContent && (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: reportContent.replace(/\n/g, '<br/>') }} />
        )}
      </div>
    </div>
  );
};

export default AnalysisReportTab;
