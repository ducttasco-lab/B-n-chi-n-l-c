// components/StrategicCockpit.tsx
import React, { useState, useMemo, useCallback, useRef } from 'react';

import MapAndDiagnosisTab from './cockpit/MapAndDiagnosisTab.tsx';
import ActionPlanTab from './cockpit/ActionPlanTab.tsx';
import AnalysisReportTab from './cockpit/AnalysisReportTab.tsx';
import StrategyBoardTab from './cockpit/StrategyBoardTab.tsx';
import AiAdvisor from './AiAdvisor.tsx';
import TemplateFillerDialog from './TemplateFillerDialog.tsx';
import { PaperClipIcon, SparklesIcon, PlusIcon } from './icons.tsx';
import InitiativeEditor from './cockpit/InitiativeEditor.tsx';
import ProgressLogger from './cockpit/ProgressLogger.tsx';


import { StrategicModel, SixVariablesModel, StrategicNode, StrategicInitiative, SixVariablesNode, ProgressUpdate, StrategyReport, ReportItem } from '../types.ts';
import { INITIAL_STRATEGIC_MODEL, INITIAL_SIX_VARIABLES_MODEL } from '../constants.tsx';
import { getNoteSummaryFromAI, getInitiativeSummaryFromAI } from '../services/geminiService.ts';

type CockpitTab = 'map' | 'plan' | 'analysis-18' | 'analysis-6' | 'board' | 'action-plan' | 'strategy-board';


const StrategicCockpit: React.FC = () => {
    const [strategicModel, setStrategicModel] = useState<StrategicModel>(INITIAL_STRATEGIC_MODEL);
    const [sixVariablesModel, setSixVariablesModel] = useState<SixVariablesModel>(INITIAL_SIX_VARIABLES_MODEL);
    const [activeTab, setActiveTab] = useState<CockpitTab>('map');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>('1: Vấn đề của Khách hàng');
    const [selectedVariableId, setSelectedVariableId] = useState<string | null>(null);
    const [isFillerOpen, setIsFillerOpen] = useState(false);
    const [lastAiResponse, setLastAiResponse] = useState("");
    const [isNotesPanelCollapsed, setIsNotesPanelCollapsed] = useState(false);
    const [editingInitiative, setEditingInitiative] = useState<{nodeId: string, initiative?: StrategicInitiative} | null>(null);
    const [loggingProgressFor, setLoggingProgressFor] = useState<{nodeId: string, initiative: StrategicInitiative} | null>(null);
    
    const [trigger18Factors, setTrigger18Factors] = useState(0);
    const [trigger6Variables, setTrigger6Variables] = useState(0);
    const [triggerStrategyBoard, setTriggerStrategyBoard] = useState(0);

    const [report18Factors, setReport18Factors] = useState<ReportItem[]>([]);
    const [report6Variables, setReport6Variables] = useState<ReportItem[]>([]);
    const [strategyBoardReport, setStrategyBoardReport] = useState<StrategyReport | null>(null);

    const lastTrigger18Ref = useRef(0);
    const lastTrigger6Ref = useRef(0);
    const lastTriggerBoardRef = useRef(0);
    
    // AI Advisor state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const optionsButtonRef = useRef<HTMLButtonElement>(null);
    const [advisorKey, setAdvisorKey] = useState(Date.now());


    const selectedItem = useMemo(() => {
        if (selectedNodeId) return strategicModel[selectedNodeId];
        if (selectedVariableId) return sixVariablesModel[selectedVariableId];
        return null;
    }, [selectedNodeId, selectedVariableId, strategicModel, sixVariablesModel]);

    const handleNodeSelect = useCallback((nodeId: string) => {
        setSelectedNodeId(nodeId);
        setSelectedVariableId(null);
    }, []);

    const handleVariableSelect = useCallback((variableId: string) => {
        setSelectedVariableId(variableId);
        setSelectedNodeId(null);
    }, []);

    const handleUpdateNode = useCallback((nodeId: string, data: Partial<StrategicNode>) => {
        setStrategicModel(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], ...data } }));
    }, []);
    
    const handleUpdateVariable = useCallback((variableId: string, data: Partial<SixVariablesNode>) => {
        setSixVariablesModel(prev => ({ ...prev, [variableId]: { ...prev[variableId], ...data } }));
    }, []);

    const handleAnswerChange = (index: number, answer: string) => {
        if (selectedNodeId && strategicModel[selectedNodeId]) {
            const newQa = [...strategicModel[selectedNodeId].questionAnswers];
            newQa[index].answer = answer;
            handleUpdateNode(selectedNodeId, { questionAnswers: newQa });
        } else if (selectedVariableId && sixVariablesModel[selectedVariableId]) {
            const newQa = [...sixVariablesModel[selectedVariableId].questionAnswers];
            newQa[index].answer = answer;
            handleUpdateVariable(selectedVariableId, { questionAnswers: newQa });
        }
    };
    
    const handleApplyNote = async () => {
        if (!lastAiResponse.trim() || !selectedItem || selectedItem.questionAnswers.length === 0) return;
        const summary = await getNoteSummaryFromAI(lastAiResponse);
        const currentAnswer = selectedItem.questionAnswers[0]?.answer || '';
        handleAnswerChange(0, (currentAnswer ? currentAnswer + "\n\n" : "") + `[AI Ghi chú]: ${summary}`);
    };
    
   const handleCreateInitiative = async () => {
        if (!selectedNodeId) {
            alert("Vui lòng chọn một Yếu tố trên Bản đồ Chiến lược trước.");
            return;
        }
    
        const node = strategicModel[selectedNodeId];
        const newInitiative: StrategicInitiative = {
            id: `initiative-${Date.now()}`,
            name: `Sáng kiến mới cho "${node.name}"`,
            description: lastAiResponse ? await getInitiativeSummaryFromAI(lastAiResponse) : '',
            owner: '',
            dueDate: new Date().toISOString().split('T')[0],
            status: 'Mới tạo',
            currentProgress: 0,
            progressHistory: [],
            latestStatusComment: lastAiResponse ? 'Nội dung ban đầu được gợi ý bởi AI.' : 'Được tạo thủ công.',
        };
        
        setEditingInitiative({ nodeId: selectedNodeId, initiative: newInitiative });
    };

    const handleSaveInitiative = (nodeId: string, initiative: StrategicInitiative) => {
        const node = strategicModel[nodeId];
        const existingIndex = node.initiatives.findIndex(i => i.id === initiative.id);
        const newInitiatives = [...node.initiatives];
        if (existingIndex > -1) {
            newInitiatives[existingIndex] = initiative;
        } else {
            newInitiatives.push(initiative);
        }
        handleUpdateNode(nodeId, { initiatives: newInitiatives });
        if (existingIndex === -1) {
          alert('Sáng kiến mới đã được tạo trong tab "Kế hoạch Hành động".');
          setActiveTab('action-plan');
        }
    };

    const handleSaveProgress = (nodeId: string, initiativeId: string, update: ProgressUpdate) => {
        const node = strategicModel[nodeId];
        const initiativeIndex = node.initiatives.findIndex(i => i.id === initiativeId);
        if (initiativeIndex > -1) {
            const updatedInitiative = { ...node.initiatives[initiativeIndex] };
            
            const newProgressHistory = [...updatedInitiative.progressHistory, update];
            const latestUpdate = newProgressHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            updatedInitiative.progressHistory = newProgressHistory;
            updatedInitiative.currentProgress = latestUpdate.progressPercentage;
            updatedInitiative.latestStatusComment = latestUpdate.comment;
            
            const newInitiatives = [...node.initiatives];
            newInitiatives[initiativeIndex] = updatedInitiative;
            handleUpdateNode(nodeId, { initiatives: newInitiatives });
        }
    };


    const handleDiagnoseVariables = () => {
        setReport6Variables([]);
        setActiveTab('analysis-6');
        setTrigger6Variables(Date.now());
    };

    const handleAnalyze18Factors = () => {
        setReport18Factors([]);
        setActiveTab('analysis-18');
        setTrigger18Factors(Date.now());
    };

    const handleGenerateStrategyBoard = () => {
        setStrategyBoardReport(null);
        setActiveTab('strategy-board');
        setTriggerStrategyBoard(Date.now());
    };
    
    const handleSaveNotes = () => {
        // In a real app, this would save to a backend. Here, we just show a confirmation.
        alert("Ghi chú đã được lưu!");
    };
    
    const handleFileAttach = () => fileInputRef.current?.click();

    const handleClearChat = () => {
        if (window.confirm('Bạn có chắc muốn xóa lịch sử trò chuyện không?')) {
            setAdvisorKey(Date.now()); // Remounts the AiAdvisor component
        }
        setIsOptionsOpen(false);
    };

    // Logic to create single-use triggers for report generation
    const shouldStart18 = trigger18Factors > lastTrigger18Ref.current;
    if (shouldStart18) {
        lastTrigger18Ref.current = trigger18Factors;
    }

    const shouldStart6 = trigger6Variables > lastTrigger6Ref.current;
    if (shouldStart6) {
        lastTrigger6Ref.current = trigger6Variables;
    }

    const shouldStartBoard = triggerStrategyBoard > lastTriggerBoardRef.current;
    if (shouldStartBoard) {
        lastTriggerBoardRef.current = triggerStrategyBoard;
    }


    const renderTabContent = () => {
        switch (activeTab) {
            case 'action-plan':
                return <ActionPlanTab 
                            strategicModel={strategicModel} 
                            onUpdateNode={handleUpdateNode}
                            onEditInitiative={(nodeId, initiative) => setEditingInitiative({ nodeId, initiative })}
                            onLogProgress={(nodeId, initiative) => setLoggingProgressFor({ nodeId, initiative })}
                        />;
            case 'strategy-board':
                return <StrategyBoardTab 
                            strategicModel={strategicModel} 
                            sixVariablesModel={sixVariablesModel} 
                            shouldStartGeneration={shouldStartBoard} 
                            report={strategyBoardReport}
                            setReport={setStrategyBoardReport}
                        />;
            case 'analysis-18':
                return <AnalysisReportTab title="Phân tích 18 Yếu tố" reportContent={report18Factors} setReportContent={setReport18Factors} strategicModel={strategicModel} sixVariablesModel={sixVariablesModel} analysisType="18factors" shouldStartGeneration={shouldStart18} />;
            case 'analysis-6':
                 return <AnalysisReportTab title="Chẩn đoán 6 Biến số" reportContent={report6Variables} setReportContent={setReport6Variables} strategicModel={strategicModel} sixVariablesModel={sixVariablesModel} analysisType="6variables" shouldStartGeneration={shouldStart6} />;
            case 'map':
            default:
                return <MapAndDiagnosisTab strategicModel={strategicModel} sixVariablesModel={sixVariablesModel} selectedNodeId={selectedNodeId} selectedVariableId={selectedVariableId} onNodeSelect={handleNodeSelect} onVariableSelect={handleVariableSelect} />;
        }
    };
    
    return (
        <div className="h-full w-full flex flex-col bg-slate-200 text-sm">
             {isFillerOpen && <TemplateFillerDialog onClose={() => setIsFillerOpen(false)} setStrategicModel={setStrategicModel} setSixVariablesModel={setSixVariablesModel} />}
             {editingInitiative && (
                <InitiativeEditor 
                    nodeId={editingInitiative.nodeId}
                    initiative={editingInitiative.initiative}
                    onClose={() => setEditingInitiative(null)}
                    onSave={handleSaveInitiative}
                />
            )}
            {loggingProgressFor && (
                <ProgressLogger
                    initiative={loggingProgressFor.initiative}
                    onClose={() => setLoggingProgressFor(null)}
                    onSave={(update) => handleSaveProgress(loggingProgressFor.nodeId, loggingProgressFor.initiative.id, update)}
                />
            )}
            <header className="flex-shrink-0 bg-white border-b p-2 flex justify-between items-center">
                 <div className="flex items-center space-x-1">
                    {(['map', 'action-plan', 'strategy-board', 'analysis-18', 'analysis-6'] as CockpitTab[]).map(tabId => {
                        const labels: Record<string, string> = {
                            'map': 'Bản đồ & Chẩn đoán',
                            'action-plan': 'Kế hoạch Hành động',
                            'strategy-board': 'Bảng Chiến lược',
                            'analysis-18': 'Báo cáo 18 Yếu tố',
                            'analysis-6': 'Báo cáo 6 Biến số',
                        };
                        return (
                            <button key={tabId} onClick={() => setActiveTab(tabId)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tabId ? 'bg-blue-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                                {labels[tabId]}
                            </button>
                        );
                    })}
                </div>
            </header>
            <div className="flex-1 flex min-h-0">
                <main className="flex-1 min-w-0">
                    {renderTabContent()}
                </main>
                <aside className="w-[550px] flex-shrink-0 border-l border-slate-300 flex flex-col bg-slate-100">
                     <div className={`collapsible-panel flex-1 flex-col min-h-0 ${isNotesPanelCollapsed ? 'collapsed' : 'flex'}`}>
                        {/* Notes Panel (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <h2 className="text-lg font-bold text-slate-800">{selectedItem?.name || "Chọn một Yếu tố hoặc Biến số"}</h2>
                            {selectedItem ? (
                                selectedItem.questionAnswers.map((qa, index) => (
                                    <div key={index}>
                                        <label className="text-xs font-semibold text-slate-600">{qa.question}</label>
                                        <textarea 
                                            value={qa.answer}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            rows={3}
                                            className="w-full p-2 mt-1 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-center p-4">Vui lòng chọn một yếu tố từ bản đồ để xem chi tiết.</p>
                            )}
                        </div>
                        
                        {/* Action Buttons Panel (Fixed) */}
                        <div className="flex-shrink-0 p-4 border-t border-b border-slate-300 bg-white">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <button onClick={handleSaveNotes} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-medium transition-colors">Lưu Ghi chú</button>
                                <button onClick={() => setIsFillerOpen(true)} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-medium transition-colors">AI Điền Dữ liệu...</button>
                                <button onClick={handleAnalyze18Factors} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-medium transition-colors">AI Phân tích 18 Yếu tố</button>
                                <button onClick={handleDiagnoseVariables} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-medium transition-colors">AI Chẩn đoán 6 Biến số</button>
                                <button onClick={handleGenerateStrategyBoard} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 col-span-2 font-semibold transition-colors">AI Tổng hợp Bảng Chiến lược</button>
                            </div>
                        </div>
                    </div>
                    
                    {/* AI Advisor Panel */}
                    <div className={`flex flex-col min-h-0 flex-shrink-0 ${isNotesPanelCollapsed ? 'flex-1' : 'h-[40%]'}`}>
                       <AiAdvisor 
                           key={advisorKey}
                           strategicModel={strategicModel}
                           sixVariablesModel={sixVariablesModel}
                           selectedNodeId={selectedNodeId}
                           selectedVariableId={selectedVariableId}
                           onNewResponse={setLastAiResponse}
                        />
                    </div>
                    
                    {/* AI Advisor Toolbar (Fixed) */}
                     <div className="flex-shrink-0 p-2 bg-white flex items-center justify-start space-x-2 text-xs border-t">
                        <input type="file" ref={fileInputRef} className="hidden" onChange={() => { alert('Chức năng đính kèm file đang được phát triển.')}} />
                        <button onClick={handleFileAttach} className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-600"><PaperClipIcon className="w-4 h-4"/> <span>Đính kèm File</span></button>
                        <button onClick={() => setIsNotesPanelCollapsed(p => !p)} className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-600"><span>{isNotesPanelCollapsed ? 'Thu gọn Chat' : 'Mở rộng Chat'}</span></button>
                        <button onClick={handleApplyNote} className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-50" disabled={!lastAiResponse}><span>✔ Áp dụng Ghi chú</span></button>
                        <button onClick={handleCreateInitiative} className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-50" disabled={!selectedNodeId}><PlusIcon className="w-4 h-4" /> <span>Tạo Sáng kiến</span></button>
                        <div className="relative">
                             <button ref={optionsButtonRef} onClick={() => setIsOptionsOpen(p => !p)} className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-600"><span>Tùy chọn...</span></button>
                             {isOptionsOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-10">
                                    <button onClick={handleClearChat} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                        Xóa lịch sử trò chuyện
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default StrategicCockpit;