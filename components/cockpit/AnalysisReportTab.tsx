// components/cockpit/AnalysisReportTab.tsx
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '../icons.tsx';
import { StrategicModel, SixVariablesModel, KpiStatus, ReportItem } from '../../types.ts';
import { getFullContextFromModel, analyzeSingleFactor, diagnoseSingleVariable } from '../../services/geminiService.ts';
import { STRATEGIC_MAP_QUESTIONS, SIX_VARIABLES_QUESTIONS } from '../../constants.tsx';
import { formatMarkdownToHtml } from '../../utils/markdown.ts';

interface AnalysisReportTabProps {
  title: string;
  reportContent: ReportItem[];
  setReportContent: React.Dispatch<React.SetStateAction<ReportItem[]>>;
  strategicModel: StrategicModel;
  sixVariablesModel: SixVariablesModel;
  analysisType: '18factors' | '6variables';
  triggerGeneration?: number;
}

const AnalysisReportTab: React.FC<AnalysisReportTabProps> = ({ title, reportContent, setReportContent, strategicModel, sixVariablesModel, analysisType, triggerGeneration }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  const generateReportIncrementally = async () => {
    setIsLoading(true);
    setReportContent([]); // Clear array at the start
    const context = getFullContextFromModel(strategicModel, sixVariablesModel);

    if (analysisType === '18factors') {
        const factors = Object.entries(STRATEGIC_MAP_QUESTIONS);
        for (let i = 0; i < factors.length; i++) {
            const [factorName] = factors[i];
            setProgressMessage(`Đang phân tích yếu tố ${i + 1}/${factors.length}: ${factorName}`);
            const analysis = await analyzeSingleFactor(context, factorName);
            const newReportItem: ReportItem = { id: factorName, content: analysis };
            setReportContent(prev => [...prev, newReportItem]);
        }
    } else { // 6 variables
        const variables = SIX_VARIABLES_QUESTIONS;
        for (let i = 0; i < variables.length; i++) {
            const variable = variables[i];
            setProgressMessage(`Đang chẩn đoán biến số ${i + 1}/${variables.length}: ${variable.name}`);
            const result = await diagnoseSingleVariable(context, variable.name);
            const newReportItem: ReportItem = { 
                id: variable.name, 
                content: result.assessment,
                status: result.status 
            };
            setReportContent(prev => [...prev, newReportItem]);
        }
    }

    setIsLoading(false);
    setProgressMessage('');
  };
  
  useEffect(() => {
    if (triggerGeneration && triggerGeneration > 0) {
        generateReportIncrementally();
    }
  }, [triggerGeneration]);

  const statusColors: Record<KpiStatus, string> = { Good: 'text-green-700 bg-green-100', Warning: 'text-yellow-700 bg-yellow-100', Bad: 'text-red-700 bg-red-100', Neutral: 'text-slate-700 bg-slate-100' };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          onClick={generateReportIncrementally}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
        >
          <SparklesIcon />
          <span className="ml-2">{isLoading ? 'Đang tạo...' : `Tạo ${title}`}</span>
        </button>
      </div>

       {isLoading && <p className="text-sm text-center mb-2 text-slate-600 animate-pulse">{progressMessage}</p>}

      <div className="bg-slate-100 p-4 rounded-lg shadow-inner flex-1 overflow-y-auto">
        {!reportContent.length && !isLoading && (
            <div className="flex justify-center items-center h-full">
                <p className="text-center text-slate-500">Nhấn nút ở trên để bắt đầu tạo phân tích.</p>
            </div>
        )}
        {reportContent.length > 0 && (
            <div className="space-y-4">
                {reportContent.map(item => (
                     <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm">
                        <h4 className="font-bold text-blue-800 text-base flex justify-between items-center">
                            <span>{item.id}</span>
                            {item.status && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[item.status]}`}>
                                    {item.status}
                                </span>
                            )}
                        </h4>
                        <div 
                            className="prose prose-sm max-w-none mt-2 text-slate-700" 
                            dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(item.content) }} 
                        />
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisReportTab;