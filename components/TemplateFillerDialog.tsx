// components/TemplateFillerDialog.tsx
import React, { useState } from 'react';
import { StrategicModel, SixVariablesModel } from '../types.ts';
import { STRATEGIC_MAP_QUESTIONS, SIX_VARIABLES_QUESTIONS } from '../constants.tsx';
import { generateJsonResponse } from '../services/geminiService.ts';
import { SparklesIcon } from './icons.tsx';

interface TemplateFillerDialogProps {
  onClose: () => void;
  setStrategicModel: React.Dispatch<React.SetStateAction<StrategicModel>>;
  setSixVariablesModel: React.Dispatch<React.SetStateAction<SixVariablesModel>>;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });

const TemplateFillerDialog: React.FC<TemplateFillerDialogProps> = ({ onClose, setStrategicModel, setSixVariablesModel }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('All');
  const [dataSource, setDataSource] = useState('web');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState<Record<string, string[]>>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        setUploadedFiles(Array.from(event.target.files));
    }
  };

  const handleStart = async () => {
    if (!subject.trim()) {
      alert("Vui lòng nhập Tên Công ty hoặc Chủ đề.");
      return;
    }
     if (dataSource === 'file' && uploadedFiles.length === 0) {
      alert("Vui lòng chọn ít nhất một file để làm ngữ cảnh.");
      return;
    }

    setIsLoading(true);
    setProgress('Bắt đầu quá trình...');
    setResults({});

    let fileData: { mimeType: string, data: string }[] | undefined = undefined;
    if (dataSource === 'file') {
        setProgress('Đang xử lý file...');
        const filePromises = uploadedFiles.map(async (file) => ({
            mimeType: file.type,
            data: await fileToBase64(file),
        }));
        fileData = await Promise.all(filePromises);
    }


    const factorsToProcess = (
      selectedTemplate === 'All'
        ? [...Object.keys(STRATEGIC_MAP_QUESTIONS), ...SIX_VARIABLES_QUESTIONS.map(q => q.name)]
        : selectedTemplate === 'StrategyMap'
          ? Object.keys(STRATEGIC_MAP_QUESTIONS)
          : SIX_VARIABLES_QUESTIONS.map(q => q.name)
    );

    const allQuestions: Record<string, string[]> = { ...STRATEGIC_MAP_QUESTIONS };
    SIX_VARIABLES_QUESTIONS.forEach(v => { allQuestions[v.name] = v.questions; });
    
    let tempResults: Record<string, string[]> = {};
    
    for (let i = 0; i < factorsToProcess.length; i++) {
      const factorName = factorsToProcess[i];
      setProgress(`Đang xử lý yếu tố ${i + 1}/${factorsToProcess.length}: ${factorName}`);
      const questions = allQuestions[factorName];
      
      let prompt = `[ĐÓNG VAI]: Bạn là một nhà tư vấn chiến lược, đang nghiên cứu về công ty/chủ đề: "${subject}".
[NHIỆM VỤ]: Dựa trên kiến thức của bạn và tìm kiếm trên internet, hãy trả lời TỪNG câu hỏi sau đây một cách súc tích cho yếu tố "${factorName}".
[DANH SÁCH CÂU HỎI]:
${questions.map(q => `- ${q}`).join('\n')}
[ĐỊNH DẠNG ĐẦU RA]: Trả về một đối tượng JSON với key là "answers" và value là một mảng các chuỗi (string), mỗi chuỗi là câu trả lời tương ứng với một câu hỏi theo đúng thứ tự.`;

      if (dataSource === 'file') {
        prompt = `[ĐÓNG VAI]: Bạn là một trợ lý phân tích, có khả năng đọc hiểu và tổng hợp thông tin từ các tài liệu nội bộ được cung cấp để trả lời các câu hỏi chiến lược.
[BỐI CẢNH]: Bạn đã được cung cấp một hoặc nhiều file tài liệu về chủ đề "${subject}".
[NHIỆM VỤ]: Dựa CHỦ YẾU vào nội dung các file đã cho, hãy trả lời TỪNG câu hỏi sau đây một cách súc tích cho yếu tố "${factorName}". Nếu không có thông tin, hãy ghi rõ.
[DANH SÁCH CÂU HỎI]:
${questions.map(q => `- ${q}`).join('\n')}
[ĐỊNH DẠNG ĐẦU RA]: Trả về một đối tượng JSON với key là "answers" và value là một mảng các chuỗi (string), mỗi chuỗi là câu trả lời tương ứng với một câu hỏi theo đúng thứ tự.`
      }

      const response = await generateJsonResponse<{ answers: string[] }>(prompt, fileData);
      if (response && response.answers) {
        tempResults[factorName] = response.answers;
        setResults({...tempResults});
      } else {
         tempResults[factorName] = questions.map(() => "(AI không thể tạo câu trả lời)");
         setResults({...tempResults});
      }
    }
    
    setProgress('Hoàn tất!');
    setIsLoading(false);
  };
  
  const handleApply = () => {
      setStrategicModel(prevModel => {
          const newModel = JSON.parse(JSON.stringify(prevModel));
          Object.keys(results).forEach(factorName => {
              if (newModel[factorName]) {
                  const answers = results[factorName];
                  for(let i = 0; i < Math.min(newModel[factorName].questionAnswers.length, answers.length); i++) {
                      newModel[factorName].questionAnswers[i].answer = answers[i];
                  }
              }
          });
          return newModel;
      });

      setSixVariablesModel(prevModel => {
          const newModel = JSON.parse(JSON.stringify(prevModel));
          Object.keys(results).forEach(factorName => {
              const variable = SIX_VARIABLES_QUESTIONS.find(v => v.name === factorName);
              if(variable && newModel[variable.id]) {
                  const answers = results[factorName];
                  for(let i = 0; i < Math.min(newModel[variable.id].questionAnswers.length, answers.length); i++) {
                      newModel[variable.id].questionAnswers[i].answer = answers[i];
                  }
              }
          });
          return newModel;
      });
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col" style={{height: '90vh'}}>
        <header className="p-4 border-b">
          <h2 className="text-xl font-bold">AI Điền Dữ liệu Tự động</h2>
        </header>
        
        <main className="p-6 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">1. Chọn mẫu cần điền:</label>
            <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md">
              <option value="All">Cả Bản đồ Chiến lược & 6 Biến số</option>
              <option value="StrategyMap">Chỉ Bản đồ Chiến lược (18 Yếu tố)</option>
              <option value="SixVariables">Chỉ 6 Biến số Kiểm soát</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">2. Nhập Tên Công ty / Chủ đề:</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" placeholder="Ví dụ: Vinamilk"/>
          </div>
           <div>
              <label className="block text-sm font-medium text-slate-700">3. Chọn Nguồn dữ liệu cho AI:</label>
              <select value={dataSource} onChange={e => setDataSource(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md">
                <option value="web">Nghiên cứu trên Internet (Mặc định)</option>
                <option value="file">Sử dụng File Tải lên làm Ngữ cảnh</option>
              </select>
            </div>

            {dataSource === 'file' && (
                <div className="p-4 border border-dashed rounded-md">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tải lên các file ngữ cảnh (PDF, DOCX, XLSX, TXT...):</label>
                    <input type="file" multiple onChange={handleFileChange} className="w-full text-sm"/>
                    {uploadedFiles.length > 0 && (
                        <ul className="mt-2 text-xs list-disc list-inside">
                            {uploadedFiles.map(f => <li key={f.name}>{f.name}</li>)}
                        </ul>
                    )}
                </div>
            )}
          
          <button onClick={handleStart} disabled={isLoading} className="w-full flex items-center justify-center p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-400">
            <SparklesIcon /> <span className="ml-2">{isLoading ? 'Đang xử lý...' : 'Bắt đầu Nghiên cứu & Điền dữ liệu'}</span>
          </button>
          
          {progress && <p className="text-sm text-center mt-2 text-slate-600">{progress}</p>}

          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Kết quả xem trước:</h3>
            <div className="h-64 overflow-y-auto p-2 bg-slate-50 border rounded-md">
              {Object.keys(results).length === 0 && !isLoading && <p className="text-slate-500 text-center">Kết quả sẽ hiện ở đây...</p>}
              {Object.entries(results).map(([factor, answers]) => (
                <div key={factor} className="mb-3">
                  <p className="font-bold text-sm text-blue-700">{factor}</p>
                  <ul className="list-disc list-inside text-xs text-slate-600 pl-2">
                    {Array.isArray(answers) && answers.map((ans, i) => <li key={i} className="truncate">{ans}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="p-4 border-t bg-slate-50 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Hủy bỏ</button>
          <button onClick={handleApply} disabled={isLoading || Object.keys(results).length === 0} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-slate-400">Áp dụng vào Ghi chú</button>
        </footer>
      </div>
    </div>
  );
};

export default TemplateFillerDialog;