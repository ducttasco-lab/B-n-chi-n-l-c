// components/settings/ModelParameters.tsx
import React from 'react';
import { AiSettingsData } from '../../types.ts';

interface ModelParametersProps {
    settings: AiSettingsData;
    setSettings: React.Dispatch<React.SetStateAction<AiSettingsData>>;
}

const ModelParameters: React.FC<ModelParametersProps> = ({ settings, setSettings }) => {
    
    const handleSettingChange = (key: keyof AiSettingsData, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Model Selection */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <label htmlFor="ai-model" className="block text-sm font-bold text-slate-700">Mô hình AI</label>
                <p className="text-xs text-slate-500 mt-1 mb-2">Chọn mô hình ngôn ngữ để sử dụng cho các tác vụ AI.</p>
                <select id="ai-model" value={settings.model} onChange={(e) => handleSettingChange('model', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md">
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyến nghị)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Nâng cao)</option>
                </select>
            </div>

            {/* Temperature Slider */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                    <label htmlFor="temperature" className="block text-sm font-bold text-slate-700">Độ sáng tạo (Temperature)</label>
                    <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{settings.temperature.toFixed(1)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 mb-2">Giá trị cao hơn (gần 2.0) cho kết quả sáng tạo hơn.</p>
                <input id="temperature" type="range" min="0" max="2" step="0.1" value={settings.temperature} onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
            </div>
            
            {/* Top-P Slider */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                    <label htmlFor="top-p" className="block text-sm font-bold text-slate-700">Top-P</label>
                    <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{settings.topP.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 mb-2">Kiểm soát sự đa dạng của câu trả lời.</p>
                <input id="top-p" type="range" min="0.05" max="1" step="0.05" value={settings.topP} onChange={(e) => handleSettingChange('topP', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
            </div>
            
             {/* Thinking Budget */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <label className="block text-sm font-bold text-slate-700">Ngân sách Tư duy (Thinking Budget)</label>
                <p className="text-xs text-slate-500 mt-1 mb-2">Phân bổ token cho quá trình "suy nghĩ" của AI để giải quyết các tác vụ phức tạp.</p>
                <div className="space-y-2 mt-3">
                    <div className="flex items-center">
                        <input type="radio" id="tb-flexible" name="thinkingBudget" value="flexible" checked={settings.thinkingBudgetMode === 'flexible'} onChange={(e) => handleSettingChange('thinkingBudgetMode', e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300"/>
                        <label htmlFor="tb-flexible" className="ml-2 block text-sm text-slate-900">Linh hoạt (Để AI tự quyết định)</label>
                    </div>
                     <div className="flex items-center">
                        <input type="radio" id="tb-off" name="thinkingBudget" value="off" checked={settings.thinkingBudgetMode === 'off'} onChange={(e) => handleSettingChange('thinkingBudgetMode', e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300"/>
                        <label htmlFor="tb-off" className="ml-2 block text-sm text-slate-900">Tắt tư duy (Phản hồi nhanh hơn)</label>
                    </div>
                    <div className="flex items-center gap-4">
                        <input type="radio" id="tb-custom" name="thinkingBudget" value="custom" checked={settings.thinkingBudgetMode === 'custom'} onChange={(e) => handleSettingChange('thinkingBudgetMode', e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300"/>
                        <label htmlFor="tb-custom" className="block text-sm text-slate-900">Tùy chỉnh:</label>
                        <input 
                            type="number" 
                            value={settings.customThinkingBudget} 
                            onChange={(e) => handleSettingChange('customThinkingBudget', parseInt(e.target.value, 10))}
                            disabled={settings.thinkingBudgetMode !== 'custom'}
                            className="p-1 border border-slate-300 rounded-md w-24 text-sm disabled:bg-slate-100"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelParameters;