// components/AiSettings.tsx
import React, { useState, useEffect } from 'react';
import { CogIcon, CubeTransparentIcon, KeyIcon } from './icons.tsx';
import GeneralSettings from './settings/GeneralSettings.tsx';
import ModelParameters from './settings/ModelParameters.tsx';
import ApiKeyManager from './settings/ApiKeyManager.tsx';
import { getSettings, saveSettings, getApiKeys, saveApiKeys } from '../services/settingsService.ts';
import { AiSettingsData, ApiKey } from '../types.ts';

type SettingsTab = 'general' | 'parameters' | 'api-keys';

const AiSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('parameters');
    const [settings, setSettings] = useState<AiSettingsData>(getSettings());
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(getApiKeys());
    
    // Effect to save settings whenever they change
    useEffect(() => {
        saveSettings(settings);
    }, [settings]);

    // Effect to save api keys whenever they change
    useEffect(() => {
        saveApiKeys(apiKeys);
    }, [apiKeys]);


    const tabs = [
        { id: 'general', label: 'Cài đặt Chung', icon: <CogIcon className="w-5 h-5 mr-3" /> },
        { id: 'parameters', label: 'Tham số Model', icon: <CubeTransparentIcon className="w-5 h-5 mr-3" /> },
        { id: 'api-keys', label: 'Quản lý API Key', icon: <KeyIcon className="w-5 h-5 mr-3" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings settings={settings} setSettings={setSettings} />;
            case 'parameters':
                return <ModelParameters settings={settings} setSettings={setSettings} />;
            case 'api-keys':
                return <ApiKeyManager apiKeys={apiKeys} setApiKeys={setApiKeys} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            <header className="flex-shrink-0 bg-white p-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Cài đặt Mô hình AI</h2>
            </header>
            <div className="flex-1 flex min-h-0">
                <aside className="w-64 bg-white border-r border-slate-200 p-4">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 overflow-y-auto p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AiSettings;