// components/matrix/ProcessLookupTab.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task } from '../../types.ts';
import { generateTextWithFiles } from '../../services/geminiService.ts';
import { formatMarkdownToHtml } from '../../utils/markdown.ts';
import { SparklesIcon, FileImportIcon, TrashIcon, PaperClipIcon, EyeIcon } from '../icons.tsx';
import * as processLookupService from '../../services/processLookupService.ts';
import { StoredFile } from '../../services/processLookupService.ts';

interface ProcessLookupTabProps {
    tasks: Task[];
}

// --- File Preview Modal ---
const FilePreviewModal: React.FC<{ file: StoredFile | null; onClose: () => void }> = ({ file, onClose }) => {
    if (!file) return null;

    const isViewable = file.type.startsWith('image/') || file.type === 'application/pdf';
    
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        const base64toBlob = (base64Data: string, contentType: string) => {
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            return new Blob([byteArray], { type: contentType });
        };
        
        const blob = base64toBlob(file.data, file.type);
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);

        return () => {
            URL.revokeObjectURL(url);
            setBlobUrl(null);
        };
    }, [file]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-3 border-b">
                    <h3 className="font-bold text-lg truncate">{file.name}</h3>
                    <button onClick={onClose} className="text-2xl font-bold hover:text-red-600">&times;</button>
                </header>
                <main className="flex-1 p-2 bg-slate-200">
                    {blobUrl && isViewable ? (
                        <iframe src={blobUrl} title={file.name} className="w-full h-full border-0" />
                    ) : blobUrl ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-slate-600">Không thể xem trước loại file này.</p>
                            <a 
                                href={blobUrl} 
                                download={file.name}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                            >
                                Tải File
                            </a>
                        </div>
                    ) : (
                         <p className="text-slate-500 text-center">Đang tải file...</p>
                    )}
                </main>
            </div>
        </div>
    );
};


const ProcessLookupTab: React.FC<ProcessLookupTabProps> = ({ tasks }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
    
    // State is now for all tasks, loaded from localStorage
    const [taskFiles, setTaskFiles] = useState<Record<string, StoredFile[]>>({});
    const [taskSummaries, setTaskSummaries] = useState<Record<string, string>>({});

    const [isSummarizing, setIsSummarizing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load data from localStorage on initial mount
    useEffect(() => {
        const taskIds = tasks.map(t => t.id);
        const { files, summaries } = processLookupService.loadAllProcessData(taskIds);
        setTaskFiles(files);
        setTaskSummaries(summaries);
    }, [tasks]);


    const filteredTasks = useMemo(() => {
        if (!searchTerm) return tasks.filter(t => !t.isGroupHeader);
        const lowerSearchTerm = searchTerm.toLowerCase();
        return tasks.filter(t => 
            !t.isGroupHeader &&
            (t.name.toLowerCase().includes(lowerSearchTerm) || 
             [t.mc1, t.mc2, t.mc3, t.mc4].some(mc => mc.toLowerCase().includes(lowerSearchTerm)))
        );
    }, [tasks, searchTerm]);
    
    const currentFiles = useMemo(() => taskFiles[selectedTask?.id || ''] || [], [taskFiles, selectedTask]);
    const currentSummary = useMemo(() => taskSummaries[selectedTask?.id || ''], [taskSummaries, selectedTask]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && selectedTask) {
            // FIX: Explicitly type `newFiles` as File[] to resolve type inference issues where `file` was `unknown`.
            const newFiles: File[] = Array.from(event.target.files);
            for (const file of newFiles) {
                const updatedFiles = await processLookupService.addFileToTask(selectedTask.id, file);
                setTaskFiles(prev => ({ ...prev, [selectedTask!.id]: updatedFiles }));
            }
        }
        if(event.target) event.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const handleDeleteFile = (fileName: string) => {
        if (selectedTask && window.confirm(`Bạn có chắc muốn xóa file "${fileName}" không?`)) {
            const updatedFiles = processLookupService.deleteTaskFile(selectedTask.id, fileName);
            setTaskFiles(prev => ({ ...prev, [selectedTask!.id]: updatedFiles }));
        }
    };

    const handleGenerateSummary = async () => {
        if (!selectedTask || currentFiles.length === 0) return;

        setIsSummarizing(true);
        try {
            const prompt = `[ĐÓNG VAI]: Bạn là một trợ lý AI chuyên nghiệp, có khả năng đọc và tóm tắt tài liệu.
[NHIỆM VỤ]: Dựa trên nội dung của các tài liệu được đính kèm, hãy tạo ra một bản tóm tắt các bước hoặc các điểm chính cần thực hiện cho nhiệm vụ "${selectedTask.name}". Trình bày kết quả một cách rõ ràng, mạch lạc dưới dạng Markdown.`;
            
            const fileData = currentFiles.map(f => ({ mimeType: f.type, data: f.data }));

            const summary = await generateTextWithFiles(prompt, fileData);
            
            processLookupService.saveTaskSummary(selectedTask.id, summary);
            setTaskSummaries(prev => ({
                ...prev,
                [selectedTask.id]: summary
            }));
        } catch (error) {
            console.error("Error generating summary:", error);
            alert("Đã có lỗi khi tạo tóm tắt. Vui lòng kiểm tra console để biết chi tiết.");
        } finally {
            setIsSummarizing(false);
        }
    };
    
    return (
        <div className="h-full flex">
            {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />

            {/* Left Panel: Task List */}
            <div className="w-2/5 border-r border-slate-200 flex flex-col p-2">
                <input 
                    type="text"
                    placeholder="Tìm kiếm theo Mã hoặc Tên..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md mb-2"
                />
                <div className="flex-1 overflow-auto border rounded-md">
                    <table className="min-w-full text-sm border-collapse">
                        <thead className="sticky top-0 bg-slate-100 z-10">
                            <tr>
                                <th className="p-2 border font-semibold w-12">MC1</th>
                                <th className="p-2 border font-semibold w-12">MC2</th>
                                <th className="p-2 border font-semibold w-12">MC3</th>
                                <th className="p-2 border font-semibold w-12">MC4</th>
                                <th className="p-2 border text-left font-semibold">Tên Nhiệm vụ</th>
                            </tr>
                        </thead>
                         <tbody>
                            {filteredTasks.map(task => (
                                <tr 
                                    key={task.id} 
                                    onClick={() => setSelectedTask(task)}
                                    className={`cursor-pointer ${selectedTask?.id === task.id ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
                                >
                                    <td className="p-1 border text-center">{task.mc1}</td>
                                    <td className="p-1 border text-center">{task.mc2}</td>
                                    <td className="p-1 border text-center">{task.mc3}</td>
                                    <td className="p-1 border text-center">{task.mc4}</td>
                                    <td className="p-1 border">{task.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Panel: Details */}
            <div className="w-3/5 flex flex-col p-4 space-y-4">
                {selectedTask ? (
                    <>
                        <div className="flex-1 flex flex-col border border-slate-200 rounded-md p-4 bg-white shadow-sm">
                             <h3 className="text-lg font-bold mb-2 text-slate-800">Tóm tắt Quy trình Thực hiện (AI)</h3>
                             <div className="flex-1 overflow-y-auto bg-slate-50 p-3 rounded prose prose-sm max-w-none">
                                {isSummarizing ? (
                                    <p className="text-slate-500 animate-pulse">AI đang đọc tài liệu và tóm tắt...</p>
                                ) : currentSummary ? (
                                    <div dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(currentSummary) }} />
                                ) : (
                                    <p className="text-slate-500">Chưa có tóm tắt. Hãy tải lên tài liệu và yêu cầu AI tạo.</p>
                                )}
                             </div>
                             <button 
                                onClick={handleGenerateSummary}
                                disabled={currentFiles.length === 0 || isSummarizing}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <SparklesIcon />
                                {isSummarizing ? 'Đang xử lý...' : 'AI: Tạo Tóm tắt từ Tài liệu'}
                             </button>
                        </div>
                        <div className="flex-shrink-0 border border-slate-200 rounded-md p-4 h-56 flex flex-col bg-white shadow-sm">
                            <h3 className="text-lg font-bold mb-2 text-slate-800">Các File Mẫu / Tài liệu Liên quan</h3>
                            <div className="flex-1 overflow-y-auto border-t pt-2">
                               {currentFiles.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center pt-4">Chưa có file nào được đính kèm cho nhiệm vụ này.</p>
                               ) : (
                                   <ul className="space-y-2">
                                        {currentFiles.map(file => (
                                            <li key={file.name} className="flex items-center justify-between p-2 bg-slate-100 rounded-md text-sm">
                                                <div className="flex items-center gap-2 truncate">
                                                    <PaperClipIcon className="w-4 h-4 text-slate-600 flex-shrink-0"/>
                                                    <span className="font-medium truncate">{file.name}</span>
                                                </div>
                                                <div className="flex items-center flex-shrink-0">
                                                    <button onClick={() => setPreviewFile(file)} className="p-1 hover:bg-slate-200 rounded-full text-blue-600 flex items-center gap-1 text-xs px-2">
                                                        <EyeIcon className="w-4 h-4"/> Xem
                                                    </button>
                                                    <button onClick={() => handleDeleteFile(file.name)} className="p-1 hover:bg-red-100 rounded-full ml-2">
                                                        <TrashIcon className="w-4 h-4 text-red-500"/>
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                   </ul>
                               )}
                            </div>
                            <div className="border-t pt-2 mt-2">
                                 <button onClick={handleUploadClick} className="w-full px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 flex items-center justify-center gap-2">
                                    <FileImportIcon /> Tải lên tài liệu...
                                 </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                        Vui lòng chọn một nhiệm vụ từ danh sách bên trái để xem chi tiết.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProcessLookupTab;