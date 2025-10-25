// components/AiAdvisorPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Conversation } from '../types.ts';
import { sendAiChat } from '../services/geminiService.ts';
import { SparklesIcon, SendIcon, PaperClipIcon, MicrophoneIcon } from './icons.tsx';
import { formatMarkdownToHtml } from '../utils/markdown.ts';
import * as versionManager from '../services/versionManager.ts';
import * as chatHistoryService from '../services/chatHistoryService.ts';
import ChatHistorySidebar from './ai/ChatHistorySidebar.tsx';

// FIX: Add type definitions for Web Speech API to resolve TypeScript errors.
interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onstart: (() => void) | null;
    start(): void;
    stop(): void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}


const SpeechRecognitionAPI: SpeechRecognitionStatic | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognitionIsSupported = !!SpeechRecognitionAPI;

const AiAdvisorPage: React.FC = () => {
  const [history, setHistory] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useAppContext, setUseAppContext] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const initialTextRef = useRef<string>(''); // Ref to store text before recognition starts
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadedHistory = chatHistoryService.getHistory();
    setHistory(loadedHistory);
    if (loadedHistory.length > 0 && !activeConversationId) {
      setActiveConversationId(loadedHistory[0].id);
    }
  }, []);

  const activeMessages = history.find(c => c.id === activeConversationId)?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [activeMessages, isLoading]);

  useEffect(() => {
    // Cleanup SpeechRecognition instance on component unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if ((!userInput.trim() && !attachedFile) || isLoading) return;

    const currentInput = userInput;
    const userMessage: ChatMessage = { role: 'user', content: currentInput };
    setUserInput('');
    setIsLoading(true);

    let convoId = activeConversationId;
    let updatedHistory = [...history];

    if (!convoId) { // It's a new chat
      const newConvo: Conversation = {
        id: `convo-${Date.now()}`,
        title: currentInput.substring(0, 40) + (currentInput.length > 40 ? '...' : ''),
        timestamp: Date.now(),
        messages: [userMessage],
      };
      updatedHistory = [newConvo, ...history];
      convoId = newConvo.id;
      setActiveConversationId(convoId);
    } else {
      updatedHistory = history.map(c => 
        c.id === convoId 
        ? { ...c, messages: [...c.messages, userMessage], timestamp: Date.now() } 
        : c
      );
    }
    
    // Sort to bring the latest conversation to the top
    updatedHistory.sort((a,b) => b.timestamp - a.timestamp);
    setHistory(updatedHistory);
    chatHistoryService.saveHistory(updatedHistory);
    
    let context = '';
    if (useAppContext) {
        const activeData = versionManager.loadActiveMatrix();
        if (activeData) {
            const contextBuilder = ['Dưới đây là dữ liệu từ ma trận phân nhiệm hiện tại của người dùng:'];
            contextBuilder.push(`- Các phòng ban: ${activeData.departments.map(d => d.name).join(', ')}.`);
            contextBuilder.push(`- Các nhân sự: ${activeData.roles.map(r => r.name).join(', ')}.`);
            contextBuilder.push(`- Danh sách công việc và phân công:\n${activeData.generatedTaskMarkdown}`);
            context = contextBuilder.join('\n');
        } else {
            context = 'Không có dữ liệu ma trận nào được kích hoạt. Hãy trả lời dựa trên kiến thức chung.';
        }
    }
    
    const messagesForPrompt = updatedHistory.find(c => c.id === convoId)?.messages || [];
    const historyForPrompt = messagesForPrompt.map(m => {
        if (m.role === 'user') return `[NGƯỜI DÙNG HỎI]: '${m.content}'`;
        if (m.role === 'ai') return `[AI TRẢ LỜI]:\n${m.content}`;
        return '';
    }).join('\n\n');

    const prompt = `[ĐÓNG VAI]: Bạn là một cố vấn AI chuyên nghiệp, hữu ích, chuyên về quản trị doanh nghiệp và ma trận phân nhiệm.
${useAppContext ? `[BỐI CẢNH DỮ LIỆU TỪ ỨNG DỤNG]:\n${context}\n---` : ''}
${attachedFile ? `[TÀI LIỆU THAM KHẢO]: Người dùng đã đính kèm file '${attachedFile.name}'. Hãy sử dụng nội dung file này làm nguồn thông tin chính để trả lời.` : ''}
[LỊCH SỬ HỘI THOẠI]:
${historyForPrompt}
---
[NHIỆM VỤ]: Dựa vào bối cảnh và lịch sử hội thoại (nếu có), hãy trả lời câu hỏi sau của người dùng một cách chi tiết và chuyên nghiệp.
[CÂU HỎI CỦA NGƯỜI DÙNG]: ${currentInput}`;
    
    const aiResponseContent = await sendAiChat(prompt, attachedFile ?? undefined);
    setAttachedFile(null);

    const aiMessage: ChatMessage = { role: 'ai', content: aiResponseContent, isMarkdown: true };
    
    const finalHistory = updatedHistory.map(c => 
      c.id === convoId 
      ? { ...c, messages: [...c.messages, aiMessage] }
      : c
    );
    
    setHistory(finalHistory);
    chatHistoryService.saveHistory(finalHistory);
    setIsLoading(false);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleDeleteChat = (id: string) => {
    const newHistory = history.filter(c => c.id !== id);
    setHistory(newHistory);
    chatHistoryService.saveHistory(newHistory);
    if (activeConversationId === id) {
        setActiveConversationId(newHistory.length > 0 ? newHistory[0].id : null);
    }
  };


  const handleToggleListening = () => {
    // --- STOP LISTENING ---
    if (isListening) {
      recognitionRef.current?.stop();
      // onend will handle setting isListening to false
      return;
    }

    // --- START LISTENING ---
    if (!recognitionIsSupported) {
      alert("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      
      initialTextRef.current = userInput; // Save text from before we start listening

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => {
        console.log('Speech recognition active');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Rebuild the full transcript from all results to handle interim updates properly
        const fullSpokenTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
          
        const initialText = initialTextRef.current.trim();
        setUserInput((initialText ? initialText + ' ' : '') + fullSpokenTranscript.trim());
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        initialTextRef.current = '';
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false); // Revert UI state on error
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert('Quyền truy cập micro đã bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt của bạn và đảm bảo bạn đang dùng HTTPS.');
        } else if (event.error === 'no-speech') {
            console.warn('No speech detected.');
        } else {
          alert(`Lỗi nhận dạng giọng nói: ${event.error}`);
        }
      };

      recognition.start();
      // Set listening state immediately for instant UI feedback
      setIsListening(true); 

    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsListening(false); // Revert on failure
      alert("Không thể bắt đầu nhận dạng giọng nói. Hãy đảm bảo bạn đang dùng kết nối an toàn (HTTPS) và đã cấp quyền truy cập micro.");
    }
  };
  
  const handleFileAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setAttachedFile(event.target.files[0]);
      // Clear the input value to allow attaching the same file again
      event.target.value = '';
    }
  };


  const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    const contentHtml = msg.isMarkdown
      ? formatMarkdownToHtml(msg.content)
      : msg.content.replace(/\n/g, '<br />');

    return (
        <div className={`flex w-full my-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl p-3 rounded-lg shadow-sm ${isUser ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 border'}`}>
                <div className="prose prose-sm max-w-none prose-p:my-1" dangerouslySetInnerHTML={{ __html: contentHtml }} />
            </div>
        </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-slate-200">
      <ChatHistorySidebar 
        history={history}
        activeConversationId={activeConversationId}
        onSelect={(id) => setActiveConversationId(id)}
        onNew={handleNewChat}
        onDelete={handleDeleteChat}
      />
      <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0 bg-white">
            <div className="flex items-center space-x-3">
              <SparklesIcon />
              <h2 className="text-xl font-bold text-slate-800">Cố vấn AI</h2>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Sử dụng Dữ liệu Ứng dụng:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={useAppContext} onChange={(e) => setUseAppContext(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeMessages.length === 0 && !isLoading && (
                <div className="text-center text-slate-500 pt-16">
                    <p className="text-lg">Đặt câu hỏi cho Cố vấn AI để được hỗ trợ.</p>
                    <p className="text-sm mt-2">Bật "Sử dụng Dữ liệu Ứng dụng" để hỏi về ma trận phân nhiệm đã được kích hoạt của bạn.</p>
                </div>
            )}
            {activeMessages.map((msg, index) => <MessageBubble key={index} msg={msg} />)}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="p-3 rounded-lg shadow-sm bg-white border text-slate-500 italic animate-pulse">
                        AI đang suy nghĩ...
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          <footer className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
            {attachedFile && (
                <div className="max-w-4xl mx-auto mb-2 text-sm">
                    <div className="flex items-center justify-between bg-slate-100 p-2 rounded-md">
                        <div className="flex items-center gap-2">
                            <PaperClipIcon className="w-4 h-4 text-slate-600"/>
                            <span className="font-semibold text-slate-700 truncate">{attachedFile.name}</span>
                        </div>
                        <button onClick={() => setAttachedFile(null)} className="font-bold text-red-500 hover:text-red-700 ml-2 px-2 text-lg">&times;</button>
                    </div>
                </div>
            )}
            <div className="relative max-w-4xl mx-auto">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isListening ? "Đang lắng nghe..." : "Đặt câu hỏi về chiến lược, quản trị, hoặc ma trận phân nhiệm..."}
                rows={2}
                className="w-full p-3 pl-24 pr-14 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex space-x-1">
                 <button onClick={handleSendMessage} disabled={isLoading || (!userInput.trim() && !attachedFile)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed" aria-label="Send message">
                    <SendIcon />
                 </button>
              </div>
               <div className="absolute left-2 bottom-2 flex space-x-1">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    <button onClick={handleFileAttachClick} disabled={isLoading} className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 disabled:text-slate-300" title="Đính kèm file" aria-label="Attach file">
                        <PaperClipIcon />
                    </button>
                    <button
                        onClick={handleToggleListening}
                        disabled={isLoading}
                        className={`p-2 rounded-lg transition-colors ${
                            isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-500 hover:bg-slate-100'
                        } disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed`}
                        title={
                            !recognitionIsSupported
                            ? "Trình duyệt không hỗ trợ nhận dạng giọng nói"
                            : isListening
                            ? "Dừng ghi âm"
                            : "Bắt đầu ghi âm"
                        }
                        aria-label={isListening ? "Stop listening" : "Start listening"}
                    >
                        <MicrophoneIcon />
                    </button>
              </div>
            </div>
          </footer>
      </div>
    </div>
  );
};

export default AiAdvisorPage;