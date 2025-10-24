// services/settingsService.ts
import { AiSettingsData, ApiKey } from '../types.ts';

const SETTINGS_KEY = 'ai_assistant_settings';
const API_KEYS_KEY = 'ai_assistant_api_keys';

const DEFAULT_SETTINGS: AiSettingsData = {
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  topP: 0.9,
  showPrompt: false,
  useGrounding: false,
  thinkingBudgetMode: 'flexible',
  customThinkingBudget: 8192,
};

const DEFAULT_API_KEY: ApiKey = {
    id: `gemini-default-${Date.now()}`,
    name: 'Gemini Key Mặc định',
    key: 'YOUR_GEMINI_API_KEY_HERE', // User should replace this
    engine: 'Gemini',
    priority: 1,
};


// General AI Settings
export const getSettings = (): AiSettingsData => {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
        }
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
    }
    return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AiSettingsData) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
};


// API Key Management
export const getApiKeys = (): ApiKey[] => {
    try {
        const storedKeys = localStorage.getItem(API_KEYS_KEY);
        if (storedKeys) {
            const keys = JSON.parse(storedKeys) as ApiKey[];
            if (keys.length > 0) {
                 return keys.sort((a, b) => b.priority - a.priority);
            }
        }
    } catch (error) {
        console.error("Failed to parse API keys from localStorage", error);
    }
    // If no keys, return a default one to guide the user
    return [DEFAULT_API_KEY];
};

export const saveApiKeys = (apiKeys: ApiKey[]) => {
    try {
        // Ensure priority is correctly set based on order before saving
        const sortedKeys = apiKeys.map((key, index) => ({...key, priority: apiKeys.length - index }));
        localStorage.setItem(API_KEYS_KEY, JSON.stringify(sortedKeys));
    } catch (error) {
        console.error("Failed to save API keys to localStorage", error);
    }
};

// You can add more specific functions here, e.g., getActiveApiKey
export const getActiveApiKey = (): ApiKey | null => {
    const keys = getApiKeys();
    return keys[0] || null; // The highest priority key is the first one
}