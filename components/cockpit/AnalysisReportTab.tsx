// components/cockpit/AnalysisReportTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
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
  shouldStartGeneration: boolean;
}

type GenerationStatus = 'idle' | 'running' | 'paused' | 'completed';

const AnalysisReportTab: React.FC<AnalysisReportTabProps> = ({ title, reportContent, setReportContent, strategicModel, sixVariablesModel, analysisType, shouldStartGeneration }) => {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const factorsToProcess = useMemo(() => {
    if (analysisType === '18factors') {
        return Object.entries(STRATEGIC_MAP_QUESTIONS).map(([factorName]) => factorName);
    } else {
        return SIX_VARIABLES_QUESTIONS.map(v => v.name);
    }
  }, [analysisType]);


  useEffect(() => {
    if (shouldStartGeneration) {
        setCurrentIndex(0);
        setGenerationStatus('running');
    }
  }, [shouldStartGeneration, setReportContent]);

  useEffect(() => {
    if (generationStatus !== 'running') {
        return; // Do nothing if not running
    }

    if (currentIndex >= factorsToProcess.length) {
        setGenerationStatus('completed');
        setProgressMessage('Hoàn tất!');
        return; // We are done
    }

    let isCancelled = false;

    const processCurrentFactor = async () => {
        const factorName = factorsToProcess[currentIndex];
        setProgressMessage(`Đang xử lý yếu tố ${currentIndex + 1}/${factorsToProcess.length}: ${factorName}`);
        
        try {
            if (analysisType === '18factors') {
                const analysis = await analyzeSingleFactor(getFullContextFromModel(strategicModel, sixVariablesModel), factorName);
                if (!isCancelled) {
                    const newReportItem: ReportItem = { id: factorName, content: analysis };
                    setReportContent(prev => [...prev, newReportItem]);
                }
            } else { // 6 variables
                const result = await diagnoseSingleVariable(getFullContextFromModel(strategicModel, sixVariablesModel), factorName);
                if (!isCancelled) {
                    const newReportItem: ReportItem = { 
                        id: factorName, 
                        content: result.assessment,
                        status: result.status 
                    };
                    setReportContent(prev => [...prev, newReportItem]);
                }
            }
    
            if (!isCancelled) {
                setCurrentIndex(prev => prev + 1);
            }

        } catch (error) {
            console.error("Error processing factor:", error);
            const errorItem: ReportItem = { id: factorName, content: `**Lỗi:** Không thể phân tích yếu tố này. ${error instanceof Error ? error.message : ''}`};
            setReportContent(prev => [...prev, errorItem]);
            if (!isCancelled) {
               setCurrentIndex(prev => prev + 1); // Move to the next one even if there's an error
            }
        }
    };

    processCurrentFactor();

    return () => {
        isCancelled = true;
    };

  }, [generationStatus, currentIndex, factorsToProcess, analysisType, strategicModel, sixVariablesModel, setReportContent]);

  const handleMainButtonClick = () => {
    if (generationStatus === 'running') {
        setGenerationStatus('paused');
        setProgressMessage('Đã tạm dừng...');
    } else if (generationStatus === 'paused') {
        setGenerationStatus('running');
    } else { // idle or completed
        setReportContent([]);
        setCurrentIndex(0);
        setGenerationStatus('running');
    }
  };

  const getButtonText = () => {
    switch(generationStatus) {
        case 'running': return 'Tạm dừng';
        case 'paused': return 'Tiếp tục';
        case 'completed': return 'Tạo lại Báo cáo';
        case 'idle':
        default:
            return `Tạo ${title}`;
    }
  };

  const statusColors: Record<KpiStatus, string> = { Good: 'text-green-700 bg-green-100', Warning: 'text-yellow-700 bg-yellow-100', Bad: 'text-red-700 bg-red-100', Neutral: 'text-slate-700 bg-slate-100' };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          onClick={handleMainButtonClick}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
        >
          <SparklesIcon />
          <span className="ml-2">{getButtonText()}</span>
        </button>
      </div>

       {(generationStatus === 'running' || generationStatus === 'paused') && <p className="text-sm text-center mb-2 text-slate-600 animate-pulse">{progressMessage}</p>}

      <div className="bg-slate-100 p-4 rounded-lg shadow-inner flex-1 overflow-y-auto">
        {reportContent.length === 0 && generationStatus !== 'running' && (
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