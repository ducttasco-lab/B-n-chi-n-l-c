// services/chatHistoryService.ts
import { Conversation } from '../types.ts';

const HISTORY_KEY = 'ai_advisor_chat_history';

export const getHistory = (): Conversation[] => {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        if (!historyJson) return [];
        const history = JSON.parse(historyJson) as Conversation[];
        // Sort by most recent first
        return history.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error("Failed to load chat history:", error);
        return [];
    }
};

export const saveHistory = (history: Conversation[]) => {
    try {
        const historyJson = JSON.stringify(history);
        localStorage.setItem(HISTORY_KEY, historyJson);
    } catch (error) {
        console.error("Failed to save chat history:", error);
        alert("Lỗi khi lưu lịch sử trò chuyện. Có thể dung lượng lưu trữ trình duyệt đã đầy.");
    }
};