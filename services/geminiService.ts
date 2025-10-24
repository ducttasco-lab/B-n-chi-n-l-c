// services/geminiService.ts
import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { StrategicModel, SixVariablesModel, KPI, StrategicNode, SixVariablesNode, Task, KpiStatus } from '../types.ts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not defined. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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

export const sendAiChat = async (prompt: string, file?: File): Promise<string> => {
  if (!API_KEY) return "AI features are disabled because the API key is not configured.";
  try {
    const parts: any[] = [{ text: prompt }];

    if (file) {
        const base64Data = await fileToBase64(file);
        parts.push({
            inlineData: {
                mimeType: file.type,
                data: base64Data,
            },
        });
    }

    const contents: Content = { parts: parts };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });
    return response.text;
  } catch (error) {
    console.error("Error in AI chat:", error);
    return `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`;
  }
};


export const generateText = async (prompt: string): Promise<string> => {
  if (!API_KEY) return "AI features are disabled because the API key is not configured.";
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    return `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export const generateJsonResponse = async <T>(
  prompt: string,
  files?: { mimeType: string; data: string }[]
): Promise<T | null> => {
    if (!API_KEY) return null;
    try {
        const parts: any[] = [{ text: prompt }];
        if (files && files.length > 0) {
            files.forEach(file => {
                parts.push({
                    inlineData: {
                        mimeType: file.mimeType,
                        data: file.data,
                    },
                });
            });
        }

        const contents: Content = { parts: parts };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        // Robust JSON parsing
        const textResponse = response.text;
        const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
        if (jsonMatch) {
            const jsonString = jsonMatch[1] || jsonMatch[2];
            return JSON.parse(jsonString) as T;
        } else {
             return JSON.parse(textResponse) as T;
        }
    } catch (error) {
        console.error("Error generating JSON response:", error);
        return null;
    }
};


export const getFullContextFromModel = (strategicModel: StrategicModel, sixVariablesModel: SixVariablesModel): string => {
    let context = "Dưới đây là toàn bộ bối cảnh kinh doanh của doanh nghiệp:\n\n";
    context += "=== BẢN ĐỒ CHIẾN LƯỢỢC 18 YẾU TỐ ===\n";
    for(const nodeData of Object.values(strategicModel) as StrategicNode[]) {
        context += `\n--- ${nodeData.name} ---\n`;
        nodeData.questionAnswers.forEach(qa => {
            if (qa.answer && qa.answer.trim()) {
                 context += `- ${qa.question}: ${qa.answer}\n`;
            }
        });
    }

    context += "\n\n=== 6 BIẾN SỐ KIỂM SOÁT ===\n";
    for(const variableData of Object.values(sixVariablesModel) as SixVariablesNode[]) {
        context += `\n--- ${variableData.name} ---\n`;
        variableData.questionAnswers.forEach(qa => {
            if (qa.answer && qa.answer.trim()) {
                context += `- ${qa.question}: ${qa.answer}\n`;
            }
        });
        if(variableData.aiAssessment.trim()) {
            context += `Tóm tắt chẩn đoán: ${variableData.aiAssessment}\n`;
        }
    }
    return context;
};

export const analyzeSingleFactor = async (context: string, factorName: string): Promise<string> => {
    const prompt = `[ĐÓNG VAI]: Bạn là một nhà tư vấn chiến lược cấp cao.
[BỐI CẢNH]: Bạn đã được cung cấp TOÀN BỘ BỐI CẢNH CHIẾN LƯỢC của một doanh nghiệp.
--- BỐI CẢNH CHUNG ---
${context}
--- HẾT BỐI CẢNH CHUNG ---
[NHIỆM VỤ]: Dựa vào toàn bộ bối cảnh, hãy tập trung phân tích sâu sắc về CHỈ MỘT YẾU TỐ DUY NHẤT: "${factorName}". 
Hãy đưa ra một bài phân tích tổng thể, đánh giá các điểm mạnh, điểm yếu, các mâu thuẫn logic (nếu có) và đề xuất các hành động chiến lược cụ thể liên quan đến yếu tố này.
[ĐỊNH DẠNG ĐẦU RA]: Chỉ trả về nội dung phân tích cho yếu tố này dưới dạng văn bản Markdown. KHÔNG bao gồm tiêu đề của yếu tố.`;
    return await generateText(prompt);
};

export const diagnoseSingleVariable = async (context: string, variableName: string): Promise<{ assessment: string; status: KpiStatus }> => {
    const prompt = `[ĐÓNG VAI]: Bạn là một nhà tư vấn chiến lược cấp cao, chuyên chẩn đoán sức khỏe doanh nghiệp.
[BỐI CẢNH]: Người dùng đã cung cấp một bản tự đánh giá về biến số '${variableName}'. Toàn bộ bối cảnh doanh nghiệp như sau:
---
${context}
---
[NHIỆM VỤ]: Dựa vào nội dung trên, hãy thực hiện 2 việc cho CHỈ BIẾN SỐ '${variableName}':
1. Đưa ra một nhận định trạng thái: 'Good', 'Warning', hoặc 'Bad'.
2. Viết một câu tóm tắt (tối đa 25 từ) về tình hình của biến số đó.
[ĐỊNH DẠNG ĐẦU RA BẮT BUỘC]: Trả về một đối tượng JSON duy nhất có 2 khóa: 'status' (string) và 'assessment' (string).`;

    const result = await generateJsonResponse<{ assessment: string; status: KpiStatus }>(prompt);
    return result || { assessment: 'Lỗi trong quá trình chẩn đoán.', status: 'Neutral' };
};


export const getNoteSummaryFromAI = async (fullText: string): Promise<string> => {
  const prompt = `
[ĐÓNG VAI]: Bạn là một trợ lý thông minh, chuyên chắt lọc thông tin.
[BỐI CẢNH]: Bạn nhận được một đoạn hội thoại giữa Cố vấn AI và người dùng.
--- VĂN BẢN GỐC ---
${fullText}
--- KẾT THÚC VĂN BẢN GỐC ---
[NHIỆM VỤ]: Dựa vào văn bản trên, hãy rút ra câu trả lời hoặc kết luận chính, cốt lõi nhất để ghi vào một ô ghi chú. Nội dung phải súc tích, đi thẳng vào vấn đề và loại bỏ các câu chào hỏi, văn phong hội thoại.
[ĐẦU RA]: Chỉ trả về đoạn văn bản tóm tắt. Không thêm bất kỳ lời dẫn nào.`;
  return await generateText(prompt);
};

export const getInitiativeSummaryFromAI = async (fullText: string): Promise<string> => {
  const prompt = `
[ĐÓNG VAI]: Bạn là một trợ lý cấp cao, có khả năng tóm tắt xuất sắc.
[BỐI CẢNH]: Bạn nhận được một đoạn văn bản phân tích dài.
--- VĂN BẢN GỐC ---
${fullText}
--- KẾT THÚC VĂN BẢN GỐC ---
[NHIỆM VỤ]: Dựa vào văn bản trên, hãy tóm tắt nó thành một đoạn mô tả ngắn gọn (tối đa 3-4 câu) cho một 'Sáng kiến' hoặc 'Kế hoạch hành động' mới. Tập trung vào kết quả và hành động cần làm.
[ĐẦU RA]: Chỉ trả về đoạn văn bản tóm tắt. Không thêm bất kỳ lời dẫn nào.`;
  return await generateText(prompt);
};


export const suggestKPIs = async (taskName: string, objective: string): Promise<Omit<KPI, 'kpiId' | 'actual' | 'progress' | 'history'>[] | null> => {
    const prompt = `[ĐÓNG VAI]: Bạn là một chuyên gia hàng đầu về quản trị hiệu suất bằng KPI.
[BỐI CẢNH]:
- Nhiệm vụ chính từ Ma trận Phân nhiệm: "${taskName}"
- Mục tiêu chính đã đặt ra: "${objective}"
[NHIỆM VỤ]: Đề xuất 3-5 Chỉ số Hiệu suất Chính (KPI) theo tiêu chí SMART để đo lường việc hoàn thành mục tiêu.
[QUY TẮC ĐỊNH DẠNG ĐẦU RA]: Trả về một đối tượng JSON duy nhất có một khóa là "kpis", giá trị là một MẢNG các đối tượng. Mỗi đối tượng trong mảng phải có 4 khóa:
1. "description": (string) Mô tả KPI.
2. "baseline": (number) Giá trị ban đầu, thường là 0.
3. "target": (number) Giá trị mục tiêu.
4. "unit": (string) Đơn vị tính (ví dụ: 'VNĐ', '%', 'báo cáo').
[VÍ DỤ]:
{"kpis": [{"description": "Doanh thu bán hàng", "baseline": 0, "target": 500000000, "unit": "VNĐ"}, {"description": "Tỷ lệ khách hàng hài lòng", "baseline": 80, "target": 95, "unit": "%"}]}
`;
    const result = await generateJsonResponse<{ kpis: Omit<KPI, 'kpiId' | 'actual' | 'progress' | 'history'>[] }>(prompt);
    return result?.kpis || null;
};

export const suggestTasksForMatrix = async (context: string, detailLevel: string): Promise<string | null> => {
    let detailLevelRequest = "";
    if (detailLevel.includes('4')) {
        detailLevelRequest = `[YÊU CẦU VỀ ĐỘ SÂU]: BẮT BUỘC phân cấp chi tiết đến cấp 4 nếu có thể.`;
    } else if (detailLevel.includes('3')) {
        detailLevelRequest = `[YÊU CẦU VỀ ĐỘ SÂU]: BẮT BUỘC phân cấp chi tiết đến cấp 3 nếu có thể.`;
    } else if (detailLevel.includes('2')) {
        detailLevelRequest = `[YÊU CẦU VỀ ĐỘ SÂU]: BẮT BUỘC phân cấp chi tiết đến cấp 2 nếu có thể.`;
    } else {
        detailLevelRequest = "[YÊU CẦU VỀ ĐỘ SÂU]: Hãy phân cấp chi tiết đến mức tối đa mà bạn cho là hợp lý.";
    }

    const prompt = `[ĐÓNG VAI]: Bạn là một nhà tư vấn cấu trúc tổ chức bậc thầy, chuyên gia về mô hình quản trị của Fredmund Malik.
[BỐI CẢNH]: Bạn vừa phỏng vấn và có được các thông tin cốt lõi về doanh nghiệp.
--- DỮ LIỆU PHỎNG VẤN ---
${context}
--- HẾT DỮ LIỆU ---
[NHIỆM VỤ]: Dựa trên sự am hiểu sâu sắc về quản lý và TOÀN BỘ các thông tin đã có, hãy tự suy luận và đề xuất một DANH SÁCH CÔNG VIỆC CHI TIẾT cần được thực hiện. Danh sách này phải được cấu trúc chặt chẽ theo 2 nhóm chính:
1. **Nhiệm vụ Quản lý (Mã A):** Dựa trên 5 nhiệm vụ của F. Malik (1. Đề ra mục tiêu; 2. Tổ chức; 3. Ra quyết định; 4. Giám sát; 5. Phát triển và thúc đẩy con người).
2. **Nhiệm vụ Tác nghiệp (Mã B):** Dựa trên quy trình chính mà người dùng đã mô tả và 9 nhóm chức năng sau: 1. Marketing và thương hiệu; 2. Nghiên cứu và Phát triển (R&D); 3. Bán hàng và chăm sóc khách hàng; 4. Thực hiện dịch vụ; 5. Nguồn nhân lực; 6. Tài chính; 7. IT và AI; 8. KẾ TOÁN; 9. Hành chính.

${detailLevelRequest}

[QUY TẮC ĐỊNH DẠNG BẮT BUỘC]:
- **Chỉ tạo 2 cột:** 'Mã Phân cấp' và 'Tên Nhiệm vụ'.
- **Cột 'Mã Phân cấp':** Sử dụng cấu trúc mã không có dấu chấm. Cấp 1 là một chữ cái và một chữ số (ví dụ: A1, B2). Các cấp con được tạo bằng cách thêm một chữ số (ví dụ: A11 là con của A1, A112 là con của A11).
- **Cột 'Tên Nhiệm vụ':** KHÔNG được thêm số thứ tự (như 1.1, 1.1.1) vào đầu Tên Nhiệm vụ.
- **Tiêu đề nhóm:** Các dòng tiêu đề nhóm công việc (ví dụ: 'NHIỆM VỤ QUẢN LÝ CHUNG') phải được in đậm, và cột 'Mã Phân cấp' phải để trống.

[VÍ DỤ ĐỊNH DẠNG MONG MUỐN]:
| Mã Phân cấp | Tên Nhiệm vụ |
|---|---|
| | **NHIỆM VỤ QUẢN LÝ CHUNG** |
| A1 | Đề ra Mục tiêu |
| A11 | Xác định Mục tiêu Chiến lược Cốt lõi |
| A111| Phân rã mục tiêu 'Top 10 SME Auditor' |

[ĐỊNH DẠNG ĐẦU RA BẮT BUỘC]:
Chỉ trả về kết quả dưới dạng một BẢNG MARKDOWN duy nhất có 2 cột. KHÔNG thêm bất kỳ lời bình hay giải thích nào khác.`;

    return await generateText(prompt);
};

export const generateCompanyMatrix = async (taskListMarkdown: string, departmentNames: string[]): Promise<string | null> => {
    const prompt = `[ĐÓNG VAI]: Bạn là một chuyên gia tư vấn tổ chức nhân sự, bậc thầy về việc xây dựng ma trận trách nhiệm QTKBP.
[BỐI CẢNH]: Bạn được cung cấp hai bộ thông tin:
1. **DANH SÁCH PHÒNG BAN:**
${departmentNames.join(', ')}
2. **BẢNG CÔNG VIỆC CUỐI CÙNG (đã được người dùng xác nhận, có cấu trúc 4 cấp):**
${taskListMarkdown}
[NHIỆM VỤ]: Dựa trên hai bộ thông tin trên, hãy xây dựng một Ma trận Phân công Trách nhiệm (QTKBP) cấp CÔNG TY.
- **Cấu trúc bảng:** Dựng lại BẢNG CÔNG VIỆC, giữ nguyên 5 cột đầu tiên (MC1, MC2, MC3, MC4, Tên Nhiệm vụ). Sau đó, thêm các cột cho từng **PHÒNG BAN** trong danh sách đã cho.
- **Điền vai trò:** Với mỗi công việc, hãy điền các ký tự sau vào cột của **PHÒNG BAN** phù hợp:
    - **Q (Quyết định):** Người chịu trách nhiệm cuối cùng, có quyền ra quyết định cao nhất.
    - **T (Thực hiện):** Người/bộ phận trực tiếp thực hiện công việc.
    - **K (Kiểm soát):** Người/bộ phận kiểm tra, giám sát chất lượng và tiến độ.
    - **P (Phối hợp):** Người/bộ phận cần phối hợp, tham gia ý kiến.
    - **B (Báo cáo):** Người/bộ phận cần được thông báo, báo cáo kết quả.
- **Logic suy luận:** Hãy suy luận một cách logic dựa trên bản chất của công việc và chức năng của từng phòng ban để đưa ra phân công tối ưu nhất. Cố gắng phân bổ vai trò cho nhiều phòng ban có liên quan, tránh tập trung tất cả vào một phòng ban duy nhất.
- **Quy tắc vàng:** Luôn đảm bảo mỗi hàng (mỗi công việc chi tiết, không phải dòng tiêu đề) chỉ CÓ DUY NHẤT một chữ 'Q'.
- **QUY TẮC ƯU TIÊN:** Đối với các nhiệm vụ quản lý cấp cao (thường có Mã A), vai trò 'Q' hoặc 'K' nên được ưu tiên gán cho 'Ban Giám đốc' hoặc 'Hội đồng thành viên'. Đối với các nhiệm vụ tác nghiệp (Mã B), vai trò 'T' nên được gán cho các phòng ban chuyên môn.
[ĐỊNH DẠNG ĐẦU RA]: Chỉ trả về kết quả dưới dạng một BẢNG MARKDOWN duy nhất. KHÔNG thêm bất kỳ văn bản, lời giải thích hay bình luận nào khác.`;

    return await generateText(prompt);
};

export const suggestDepartmentAssignments = async (
    departmentName: string,
    tasks: {name: string, role: string}[],
    staff: string[],
    notes: string
): Promise<string | null> => {
    const taskListString = tasks.map(t => `- ${t.name} (Vai trò phòng: ${t.role})`).join('\n');
    
    const prompt = `[ĐÓNG VAI]: Bạn là một chuyên gia tư vấn tổ chức nhân sự, bậc thầy về việc xây dựng ma trận trách nhiệm QTKBP.
[BỐI CẢNH]: Bạn cần phân công chi tiết các nhiệm vụ cho các nhân viên trong '${departmentName}'.
--- DANH SÁCH NHIỆM VỤ CẦN PHÂN CÔNG & VAI TRÒ CỦA PHÒNG ---
${taskListString}
--- DANH SÁCH NHÂN SỰ TRONG PHÒNG ---
${staff.map(s => `- ${s}`).join('\n')}
${notes ? `--- GHI CHÚ BỔ SUNG TỪ NGƯỜI QUẢN LÝ ---\n${notes}` : ''}
[NHIỆM VỤ]: Dựa vào TOÀN BỘ thông tin trên, hãy đề xuất phân công vai trò (Q, T, K, B, P) cho từng nhân viên vào từng nhiệm vụ.
[QUY TẮC BẮT BUỘC]:
1. Vai trò của nhân viên phải phù hợp với vai trò chung của phòng ban. Ví dụ, nếu phòng là 'T', thì các nhân viên trong phòng sẽ chia nhau vai trò 'T', và có thể có một người là 'Q' trong phạm vi phòng đó.
2. Ưu tiên các chỉ dẫn trong 'GHI CHÚ BỔ SUNG' nếu có.
3. Suy luận logic dựa trên tên nhiệm vụ và tên/chức vụ nhân viên.
4. Mỗi nhiệm vụ phải có ít nhất một 'T' (Thực hiện).
5. Mỗi nhiệm vụ chỉ nên có MỘT 'Q' (Quyết định).
[ĐỊNH DẠNG ĐẦU RA]: Chỉ trả về một BẢNG MARKDOWN duy nhất có 3 cột: 'Tên Nhiệm vụ', 'Tên Nhân viên', 'Vai trò'. KHÔNG thêm bất kỳ lời bình nào khác.`;

    return await generateText(prompt);
};