// components/settings/GeneralSettings.tsx
import React from 'react';
import { AiSettingsData } from '../../types.ts';

interface GeneralSettingsProps {
    settings: AiSettingsData;
    setSettings: React.Dispatch<React.SetStateAction<AiSettingsData>>;
}

const Toggle: React.FC<{label: string, description: string, checked: boolean, onChange: (checked: boolean) => void}> = 
({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4 first:border-t-0 first:pt-0">
        <div>
            <label className="font-bold text-slate-700">{label}</label>
            <p className="text-xs text-slate-500">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    </div>
);


const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, setSettings }) => {
    const handleToggle = (key: keyof AiSettingsData, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6 max-w-2xl">
             <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
                 <Toggle 
                    label="Hiện Prompt"
                    description="Hiển thị hộp thoại xem trước và chỉnh sửa prompt trước khi gửi đến AI."
                    checked={settings.showPrompt}
                    onChange={(val) => handleToggle('showPrompt', val)}
                 />
                 <Toggle 
                    label="Dùng Google Search"
                    description="Cho phép AI tìm kiếm trên Google để có câu trả lời cập nhật hơn về các sự kiện gần đây."
                    checked={settings.useGrounding}
                    onChange={(val) => handleToggle('useGrounding', val)}
                 />
             </div>
        </div>
    );
};

export default GeneralSettings;