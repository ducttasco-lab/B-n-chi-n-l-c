// components/StrategicCockpit.tsx
import React, { useState, useMemo, useCallback, useRef } from 'react';

import MapAndDiagnosisTab from './cockpit/MapAndDiagnosisTab.tsx';
import ActionPlanTab from './cockpit/ActionPlanTab.tsx';
import AnalysisReportTab from './cockpit/AnalysisReportTab.tsx';
import StrategyBoardTab from './cockpit/StrategyBoardTab.tsx';
import AiAdvisor from './AiAdvisor.tsx';
import TemplateFillerDialog from './TemplateFillerDialog.tsx';
import { PaperClipIcon, SparklesIcon } from './icons.tsx';

import { StrategicModel, SixVariablesModel, StrategicNode, StrategicInitiative, SixVariablesNode } from '../types.ts';
import { INITIAL_STRATEGIC_MODEL, INITIAL_SIX_VARIABLES_MODEL } from '../constants.tsx';
import { getNoteSummaryFromAI, getInitiativeSummaryFromAI, diagnoseAll6Variables } from '../services/geminiService.ts';

type CockpitTab = 'map' | 'plan' | 'analysis-18' | 'analysis-6' | 'board' | 'action-plan' | 'strategy-board';


const StrategicCockpit: React.FC = () => {
    const [strategicModel, setStrategicModel] = useState<StrategicModel>(INITIAL_STRATEGIC_MODEL);
    const [sixVariablesModel, setSixVariablesModel] = useState<SixVariablesModel>(INITIAL_SIX_VARIABLES_MODEL);
    const [activeTab, setActiveTab] = useState<CockpitTab>('map');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedVariableId, setSelectedVariableId] = useState<string | null>(null);
    const [isFillerOpen, setIsFillerOpen] = useState(false);
    const [lastAiResponse, setLastAiResponse] = useState("");
    const [isNotesPanelCollapsed, setIsNotesPanelCollapsed] = useState(false);
    
    const [trigger18Factors, setTrigger18Factors] = useState(0);
    const [trigger6Variables, setTrigger6Variables] = useState(0);
    const [triggerStrategyBoard, setTriggerStrategyBoard] = useState(0);

    const [report18Factors, setReport18Factors] = useState('');
    const [report6Variables, setReport6Variables] = useState('');
    
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
        if (!lastAiResponse.trim() || !selectedNodeId) return;
        const summary = await getInitiativeSummaryFromAI(lastAiResponse);
        const newNode = { ...strategicModel[selectedNodeId] };
        const newInitiative: StrategicInitiative = {
            id: `initiative-${Date.now()}`,
            name: `Sáng kiến mới cho "${newNode.name}"`,
            description: summary,
            owner: '',
            dueDate: new Date().toISOString().split('T')[0],
            status: 'Mới tạo',
            currentProgress: 0,
            progressHistory: [],
            latestStatusComment: 'Mới được tạo bởi AI.',
        };
        newNode.initiatives = [...newNode.initiatives, newInitiative];
        handleUpdateNode(selectedNodeId, newNode);
        alert('Sáng kiến mới đã được tạo trong tab "Kế hoạch Hành động".');
        setActiveTab('action-plan');
    };

    const handleDiagnoseVariables = async () => {
        setActiveTab('analysis-6');
        setTrigger6Variables(Date.now());
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


    const renderTabContent = () => {
        switch (activeTab) {
            case 'action-plan':
                return <ActionPlanTab strategicModel={strategicModel} onUpdateNode={handleUpdateNode} />;
            case 'strategy-board':
                return <StrategyBoardTab strategicModel={strategicModel} sixVariablesModel={sixVariablesModel} triggerGeneration={triggerStrategyBoard} />;
            case 'analysis-18':
                return <AnalysisReportTab title="Phân tích 18 Yếu tố" reportContent={report18Factors} setReportContent={setReport18Factors} strategicModel={strategicModel} sixVariablesModel={sixVariablesModel} analysisType="18factors" triggerGeneration={trigger18Factors} />;
            case 'analysis-6':
                 return <AnalysisReportTab title="Chẩn đoán 6 Biến số" reportContent={report6Variables} setReportContent={setReport6Variables} strategicModel={strategicModel} sixVariablesModel={sixVariablesModel} analysisType="6variables" triggerGeneration={trigger6Variables} />;
            case 'map':
            default:
                return <MapAndDiagnosisTab strategicModel={strategicModel} sixVariablesModel={sixVariablesModel} selectedNodeId={selectedNodeId} selectedVariableId={selectedVariableId} onNodeSelect={handleNodeSelect} onVariableSelect={handleVariableSelect} />;
        }
    };
    
    return (
        <div className="h-full w-full flex flex-col bg-slate-50 text-sm">
             {isFillerOpen && <TemplateFillerDialog onClose={() => setIsFillerOpen(false)} setStrategicModel={setStrategicModel} setSixVariablesModel={setSixVariablesModel} />}
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
                            <button key={tabId} onClick={() => setActiveTab(tabId)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tabId ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
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
                <aside className="w-[550px] flex-shrink-0 border-l border-slate-200 flex flex-col bg-slate-100">
                     <div className="flex-1 flex flex-col min-h-0">
                        {/* Notes Panel (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <h2 className="text-lg font-bold">{selectedItem?.name || "Chọn một Yếu tố hoặc Biến số để xem chi tiết"}</h2>
                            {selectedItem ? (
                                selectedItem.questionAnswers.map((qa, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-1">
                                        <div className="bg-slate-200 p-2 rounded-l-md text-slate-700">{qa.question}</div>
                                        <textarea 
                                            value={qa.answer}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            rows={3}
                                            className="w-full p-2 border border-slate-300 rounded-r-md text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-center p-4">Vui lòng chọn một yếu tố từ bản đồ để xem chi tiết.</p>
                            )}
                        </div>
                        
                        {/* Action Buttons Panel (Fixed) */}
                        <div className="flex-shrink-0 p-4 border-t border-b border-slate-200">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <button onClick={handleSaveNotes} className="p-2 bg-slate-200 rounded hover:bg-slate-300">Lưu Ghi chú</button>
                                <button onClick={() => setIsFillerOpen(true)} className="p-2 bg-slate-200 rounded hover:bg-slate-300">AI Điền Dữ liệu...</button>
                                <button onClick={() => { setActiveTab('analysis-18'); setTrigger18Factors(Date.now()); }} className="p-2 bg-slate-200 rounded hover:bg-slate-300">AI Phân tích 18 Yếu tố</button>
                                <button onClick={handleDiagnoseVariables} className="p-2 bg-slate-200 rounded hover:bg-slate-300">AI Chẩn đoán 6 Biến số</button>
                                <button onClick={() => { setActiveTab('strategy-board'); setTriggerStrategyBoard(Date.now()); }} className="p-2 bg-slate-200 rounded hover:bg-slate-300 col-span-2">AI Tổng hợp Bảng Chiến lược</button>
                            </div>
                        </div>
                    </div>
                    
                    {/* AI Advisor Panel (Fixed Height) */}
                    <div className="h-[40%] flex flex-col min-h-0 flex-shrink-0">
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
                     <div className="flex-shrink-0 p-2 bg-slate-100 flex items-center justify-start space-x-2 text-xs border-t">
                        <input type="file" ref={fileInputRef} className="hidden" onChange={() => { alert('Chức năng đính kèm file đang được phát triển.')}} />
                        <button onClick={handleFileAttach} className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-200"><PaperClipIcon /> <span>Đính kèm File</span></button>
                        <button onClick={() => setIsNotesPanelCollapsed(p => !p)} className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-200"><span>{isNotesPanelCollapsed ? 'Mở rộng' : 'Thu gọn'} Chat</span></button>
                        <button onClick={handleApplyNote} className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-200 disabled:opacity-50" disabled={!lastAiResponse}><span>✔ Áp dụng Ghi chú</span></button>
                        <button onClick={handleCreateInitiative} className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-200 disabled:opacity-50" disabled={!lastAiResponse || !selectedNodeId}><span>+ Tạo Sáng kiến</span></button>
                        <div className="relative">
                             <button ref={optionsButtonRef} onClick={() => setIsOptionsOpen(p => !p)} className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-200"><span>Tùy chọn...</span></button>
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