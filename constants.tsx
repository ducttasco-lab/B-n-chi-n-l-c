// constants.tsx
import { StrategicModel, SixVariablesModel, MatrixContextInput, Department, Role, Goal, UserTask, PredefinedKPI } from './types.ts';

export const ASCO_LOGO_BASE64 = "data:image/png;base64,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v16hg8fzv79+7l16xZz587lxIkTePr0qQULFvDKK69w//79jB49mqNHj5KTk8Phw4dZu3Yt58+f5/79+xw5coQzZ87w888/873vfY+77777zTff8NVXXzVo0CD+/Oc/88ADD/Dmm29WVlZWVFSUkJAQBQUFlixZwhlnnMHWrVtZvHhxixYteO+999555x0++OAD3njjDTZt2lRcXJyrr74aX15entXV1StWrOALL7xA9erVufnmm9mzZ0/x+bvvvsuIESO4desWb731FqdOnWL79u1ERETk5ORw5swZPvnkE2bOnMny5ctxcHC4du1a9erVs3bt2vXr19+6dYvu3bvrvL+goEBGRuazn/2so0ePsnHjRsaMGdNisYiPj+/atYuvv/66Wq1+/fXXeeihh3jooYf49a9/zSeffMLHH39clJSUlpYWj8cjk8k8Hg9fX9+cnJzGxsYqKCgcP36chIQExo0bxyuvvEIulx87dky/fv1KSkpycnJSVVVVU1NTbW1tfn7+qlevXqlSpZYuXZpIJKqqqqqqqqqpqTkyMmJmZmZra6uTk9PExMTMzEyVSi0sLKxdu3ZjY2PffvstTz/9NL/+9a+5cOHC66+/zrZt2+jTpw9PPfWU5557rqqqqpqaGnV1dcXFxdXV1XV0dOzatUv0/+uvv2bbtm28++67/OlPf+qNN97o1q1bjx49WLFiRWZm5owZM7jvvvtYuXIlN910Ey+88ELnzhXfvVevXjz55JPk5+dzxRVX8Pzzz9OhQweNHj2ahQsX8vjjj/PMM8/wwQcfkJqaSkRExLvvvtugoUOHDm3btq1atWrLli1btWpVYWGhSCSCg4N79OhRUlLS/PnzWbJkSUJCQmFhYaGhodHV1XV2drY11/vvvz8RERGZmZlRUVFZWVkVFRXt27evrq4uc+fOTUtL44tf/CI/+MEP+MY3vsGKFSuYOXMmf//731esWIGPj0/U+uUvf8nFixeZP38+Dz30kCFDhjBt2rRly5bdcccdvPTSS/zP//xP0d21a9eybds2VqxYQVlZWVpaWlpamp+fn6urq7e3V3/8/Pzc3NxCoXDVqlX+r+Srrrpql156KV988QVz5sx58sknefHFF/n9739vFofZbDZr/NefPHnyb3/7W/bu3cudO3e4e/cuL7/8MqtXr37ttdewZMkSTpw4QVhYWFxc3NDQUFZW1tTU1NTUlJaWlpeXFxcXd+zYsZaWllarVbVaXVRUlJaWxmAwGBsba2trKyws5L3/+y9+9u3v8/zzz/PYY4+tX7++uLg4Ho/n5uaWlJSUlZWlpaVVVFScPXu2uLg4PT09EAh49dVXk5KS+uUvf8nvfvcbXnvtNc466yw++eQTiouL++tf/2ry5MkMHz581apV/OxnP2PgwIF9+vSxfPlyRowYwS233MK6det4+OGH+clPftKgQYMmTZrEwMAgf/zjH/m///f/tG3bNnsTJUaNGjVq/K+h/K/sQ40aNWpU/H8c5Z/y7oA/FvLgUaPGr1gV+B/UjRo1atSoyvEfGAAQEQCMADBuuD+u/x+oRo0aNWpU/H+S3F/vHq8S/ge1W23Pzz/Gv+8bNWpUvF+qjUaNGjVq1Pjn8B+A52b/10aNGjVq1Kj4/0L0D2vQoEGDBg0b/g8A7Nl3f582rN/hPwCAgAEBAQICAoDRoEGDBg0aRjQ/4N+21atXr169evXq1as3b940P/Cn/H8BwB/83wD8AfkHDAgIEBBg/z+U/QMAkAAAAABJRU5ErkJggg==";

// --- STRATEGIC COCKPIT CONSTANTS ---

export const STRATEGIC_MAP_QUESTIONS: Record<string, string[]> = {
    "1: Vấn đề của Khách hàng": [
        "Giới thiệu về công ty bạn (Tên công ty; lĩnh vực hoạt động, sản phẩm, thị trường...)?",
        "Bạn đang xác định vấn đề dựa trên phản hồi thực tế hay chỉ là giả định nội bộ?",
        "Bạn đã có dữ liệu nào từ khách hàng chưa? (khảo sát, phản hồi, khiếu nại, nghiên cứu thị trường...).",
        "Doanh nghiệp có thực hiện phỏng vấn, focus group hay chỉ dựa trên phân tích số liệu có sẵn?",
        "Nếu có dữ liệu, bạn đã kiểm chứng tính chính xác của nó chưa?",
        "Bạn có chắc rằng vấn đề bạn xác định đúng với thực tế của khách hàng?",
        "Có bằng chứng nào chỉ ra khách hàng sẵn sàng chi trả để giải quyết vấn đề này?"
    ],
    "2: Giải pháp đã có sẵn trên thị trường": [
        "Các giải pháp hiện có trên thị trường để giải quyết vấn đề của khách hàng là gì?",
        "Đối thủ cạnh tranh trực tiếp và gián tiếp chính là ai?",
        "Phân loại các giải pháp trên thị trường: Common, Innovative, Niche Solutions.",
        "Giải pháp của bạn có điểm gì vượt trội so với thị trường (Giá trị, Giá cả, Tính khả dụng, Công nghệ)?",
        "Khoảng trống nào trên thị trường mà giải pháp của bạn có thể khai thác?",
        "Bạn có thể tối ưu hóa hoặc nâng cấp giải pháp để chiếm ưu thế không?"
    ],
    "3: Giải pháp của doanh nghiệp": [
        "Doanh nghiệp hiện tại đang cung cấp giải pháp gì cho vấn đề của khách hàng?",
        "Giải pháp này có phải là sự lựa chọn hàng đầu của khách hàng không? Nếu không, tại sao?",
        "Điểm mạnh, điểm yếu, cơ hội, thách thức (SWOT) của giải pháp so với đối thủ là gì?",
        "Yếu tố cạnh tranh cốt lõi của giải pháp là gì (tốt hơn, rẻ hơn, nhanh hơn, linh hoạt hơn)?",
        "Giải pháp của bạn có thực sự khác biệt và mang lại lợi ích cho khách hàng không?",
        "Doanh nghiệp có thể duy trì lợi thế cạnh tranh này trong bao lâu?"
    ],
    "4: Giải pháp mới (phát triển)": [
        "Phân tích khoảng trống thị trường (từ Yếu tố 2 & 3) cho thấy cần cải tiến hay tạo mới hoàn toàn giải pháp?",
        "Động lực phát triển giải pháp mới là gì? (Nhu cầu khách hàng, Công nghệ mới, Mô hình kinh doanh mới).",
        "Lựa chọn hướng phát triển: Cải tiến giải pháp cũ, Phát triển công nghệ đột phá, hay Đổi mới mô hình kinh doanh?",
        "Ý tưởng nào có tiềm năng cao nhất để phát triển thành sản phẩm thực tế?",
        "Khách hàng có phản hồi tích cực với nguyên mẫu thử nghiệm (MVP) không?"
    ],
    "5: Giải pháp mới tiềm năng (nghiên cứu)": [
        "Xu hướng công nghệ và thị trường nào có tác động lớn nhất đến ngành của doanh nghiệp?",
        "Lĩnh vực nào có tiềm năng nghiên cứu để tạo ra giá trị dài hạn? (Công nghệ chưa khai thác, Vấn đề KH chưa có giải pháp, Lợi thế R&D của DN).",
        "Doanh nghiệp có đủ nguồn lực nghiên cứu/hợp tác không?",
        "Ý tưởng nghiên cứu nào có tiềm năng ứng dụng cao nhất trong tương lai?",
        "Công nghệ này có thực sự khả thi để phát triển thành sản phẩm thương mại không?"
    ],
    "6: Xu hướng kinh tế xã hội": [
        "Các xu hướng lớn về Kinh tế, Công nghệ, Xã hội, Chính trị đang ảnh hưởng đến doanh nghiệp là gì?",
        "Xu hướng nào có khả năng tác động mạnh nhất đến doanh nghiệp?",
        "Tác động của các xu hướng này đến Khách hàng, Chi phí sản xuất, và Mô hình kinh doanh của bạn là gì?",
        "Doanh nghiệp đã có chiến lược phù hợp để thích nghi và tận dụng cơ hội từ các xu hướng này chưa?"
    ],
    "7: Sự tăng trưởng của thị trường": [
        "Phân tích số liệu thị trường (GDP, chi tiêu, đầu tư) cho thấy thị trường đang mở rộng hay thu hẹp?",
        "Yếu tố nào đang ảnh hưởng đến tốc độ tăng trưởng? (Xu hướng KT-XH, Đối thủ, Khách hàng).",
        "Vị thế của doanh nghiệp trong chu kỳ tăng trưởng thị trường là gì? Sản phẩm có phù hợp với tốc độ tăng trưởng không?",
        "Doanh nghiệp đang hưởng lợi từ tăng trưởng hay bị cạnh tranh mạnh hơn?"
    ],
    "8: Đối thủ cạnh tranh": [
        "Xác định đối thủ cạnh tranh trực tiếp, gián tiếp và tiềm năng.",
        "Phân tích mô hình kinh doanh, chiến lược giá, sản phẩm, phân phối của đối thủ.",
        "Điểm mạnh và điểm yếu của đối thủ mà bạn có thể tận dụng là gì?",
        "Lợi thế cạnh tranh bền vững của bạn so với đối thủ là gì? (Chi phí thấp, Khác biệt hóa, Tập trung thị trường ngách).",
        "Đối thủ có dễ dàng sao chép chiến lược của bạn không?"
    ],
    "9: Mục tiêu về thị phần": [
        "Thị phần hiện tại của doanh nghiệp là bao nhiêu? (doanh thu, số lượng khách hàng...). Đang tăng hay giảm?",
        "Vị thế thị phần so với đối thủ (dẫn đầu, nằm giữa, hay tụt lại)? Tốc độ tăng trưởng thị phần của đối thủ?",
        "Mục tiêu thị phần SMART của bạn là gì? (Cụ thể, Đo lường được, Khả thi, Thực tế, Có thời hạn).",
        "Chiến lược mở rộng thị phần của bạn là gì? (Mở rộng khách hàng hiện tại, thâm nhập thị trường mới, cạnh tranh trực tiếp...)."
    ],
    "10: Mục tiêu Marketing": [
        "Mục tiêu marketing có liên kết với mục tiêu kinh doanh tổng thể không? (Tăng nhận diện, tăng chuyển đổi, tăng lòng trung thành).",
        "KPI marketing cụ thể của bạn là gì? (ROAS, ROI, số lượng khách hàng mới, Brand Awareness...).",
        "Chân dung khách hàng mục tiêu và thông điệp marketing chính là gì?"
    ],
    "11: Sự phát triển của doanh nghiệp (qua thời kỳ)": [
        "Kênh truyền thông phù hợp để tiếp cận khách hàng mục tiêu là gì? (Digital, Truyền thống, Cộng đồng...).",
        "Doanh nghiệp đang ở giai đoạn phát triển nào? (Khởi nghiệp, Tăng trưởng, Trưởng thành, Suy giảm/Chuyển đổi).",
        "Yếu tố nào đang thúc đẩy hoặc cản trở sự phát triển của doanh nghiệp? (Thị phần, Marketing, Xu hướng KT-XH).",
        "Chiến lược phát triển có phù hợp với từng giai đoạn không?",
        "Các chỉ số đo lường có phản ánh đúng sự phát triển của doanh nghiệp không? (Tăng trưởng lợi nhuận, chỉ số tài chính, thị phần...)."
    ],
    "12: Năng lực và đầu tư": [
        "Đánh giá năng lực hiện tại của doanh nghiệp: Tài chính, Nhân sự, Công nghệ, Quản trị.",
        "Lĩnh vực đầu tư trọng tâm là gì? (Công nghệ, Con người, Mở rộng sản xuất...).",
        "Đánh giá mức độ rủi ro và lợi nhuận của từng hướng đầu tư.",
        "Kế hoạch huy động vốn nếu cần thiết là gì?",
        "Quy trình quản lý năng lực và đầu tư có đang giúp tối ưu hóa hiệu suất không?"
    ],
    "13: Mục tiêu về việc Giảm chi phí": [
        "Phân tích cơ cấu chi phí hiện tại: Sản xuất, Vận hành, Tài chính, Marketing & Bán hàng.",
        "Đánh giá mức độ cần thiết của từng khoản chi phí, tìm ra các điểm có thể tối ưu hóa.",
        "Lựa chọn phương pháp giảm chi phí: Cải thiện quy trình sản xuất, tối ưu vận hành, đàm phán với nhà cung cấp...",
        "Doanh nghiệp có đang giảm chi phí mà vẫn duy trì chất lượng tốt không?"
    ],
    "14: Mục tiêu về nghiên cứu và phát triển": [
        "Nhu cầu nghiên cứu và phát triển của doanh nghiệp là gì? (Dựa trên xu hướng công nghệ, nhu cầu thị trường).",
        "Mục tiêu R&D theo tiêu chí SMART là gì?",
        "Lựa chọn phương pháp R&D: Nội bộ, Hợp tác với đối tác, hay Mua lại công nghệ (M&A)?",
        "Ngân sách và nhân sự dành cho R&D có đủ để triển khai hiệu quả không?"
    ],
    "15: Đánh giá tổ chức": [
        "Tiêu chí cốt lõi để đánh giá tổ chức là gì? (Hiệu suất tài chính, Hiệu quả quản lý nhân sự, Cấu trúc tổ chức, Khả năng đổi mới).",
        "Lựa chọn mô hình đánh giá phù hợp: Balanced Scorecard (BSC), OKRs, 6 Sigma...",
        "Thu thập dữ liệu và phân tích kết quả đánh giá (Báo cáo tài chính, khảo sát nhân viên, phản hồi khách hàng).",
        "Những cải tiến nào về cấu trúc tổ chức và vận hành cần được đề xuất?"
    ],
    "16: Cân đối dòng tiền": [
        "Phân tích báo cáo dòng tiền: Dòng tiền vào, ra, và tồn quỹ.",
        "Các vấn đề trong dòng tiền là gì? (Chu kỳ thu tiền > trả tiền, lợi nhuận cao nhưng tiền mặt yếu...).",
        "Kế hoạch quản lý dòng tiền trong ngắn và dài hạn (dự báo thu chi, tối ưu công nợ).",
        "Dòng tiền có đang được quản lý tốt hay vẫn tiềm ẩn rủi ro?"
    ],
    "17: Thay đổi dòng tiền thâm hụt chi tiêu/ thặng dư": [
        "Xác định tình trạng dòng tiền hiện tại: Thâm hụt hay Thặng dư? Tạm thời hay dài hạn?",
        "Nếu thâm hụt, chiến lược xử lý là gì? (Tối ưu dòng vào, kiểm soát dòng ra, tận dụng công cụ tài chính).",
        "Nếu thặng dư, chiến lược tận dụng là gì? (Tái đầu tư, giảm nợ, quỹ dự phòng, mua lại cổ phiếu...).",
        "Kế hoạch sử dụng/xử lý dòng tiền có rõ ràng và hiệu quả không?"
    ],
    "18: Kế hoạch cân đối": [
        "Phân tích báo cáo tài chính: Tài sản, Nợ, Dòng tiền.",
        "Rủi ro tài chính chính là gì? (Nợ gây áp lực, phụ thuộc vốn vay...).",
        "Thiết lập mục tiêu cân đối tài chính: Giảm nợ vay, tăng vốn tự có, đảm bảo dòng tiền lưu động.",
        "Kế hoạch điều chỉnh cấu trúc tài sản và nguồn vốn là gì?"
    ]
};

export const SIX_VARIABLES_QUESTIONS: { id: keyof SixVariablesModel, name: string, questions: string[] }[] = [
    { id: "MarketPosition", name: "Vị thế Thị trường (Market Position)", questions: ["Thị phần của chúng ta so với đối thủ chính là bao nhiêu?", "Định vị thương hiệu của chúng ta trong tâm trí khách hàng là gì?"] },
    { id: "Innovation", name: "Sự Đổi mới (Innovation)", questions: ["Tỷ lệ doanh thu từ sản phẩm mới trong 2 năm qua là bao nhiêu?", "Quy trình phát triển ý tưởng mới của chúng ta hiệu quả đến đâu?"] },
    { id: "Productivity", name: "Năng suất (Productivity)", questions: ["Doanh thu trên mỗi nhân viên là bao nhiêu?", "Tỷ lệ sử dụng tài sản cố định (ví dụ: máy móc, nhà xưởng) là bao nhiêu?"] },
    { id: "People", name: "Con người & Tài sản Vô hình (People & Intangible Assets)", questions: ["Tỷ lệ nghỉ việc của nhân viên chủ chốt là bao nhiêu?", "Mức độ hài lòng và gắn kết của nhân viên được đo lường như thế nào?"] },
    { id: "Liquidity", name: "Khả năng Thanh khoản (Liquidity)", questions: ["Tỷ số thanh khoản hiện thời (Current Ratio) là bao nhiêu?", "Công ty có đủ tiền mặt để hoạt động trong 6 tháng tới không?"] },
    { id: "Profitability", name: "Khả năng Sinh lời (Profitability)", questions: ["Tỷ suất lợi nhuận gộp và lợi nhuận ròng là bao nhiêu?", "Lợi nhuận có đang tăng trưởng bền vững không?"] }
];

const createInitialModel = (): StrategicModel => {
    const model: StrategicModel = {};
    Object.entries(STRATEGIC_MAP_QUESTIONS).forEach(([id, questions]) => {
        model[id] = {
            id,
            name: id,
            questionAnswers: questions.map(q => ({ question: q, answer: '' })),
            initiatives: [],
        };
    });
    return model;
};

const createInitialSixVariablesModel = (): SixVariablesModel => {
    const model: SixVariablesModel = {};
    SIX_VARIABLES_QUESTIONS.forEach(variable => {
        model[variable.id] = {
            id: variable.id,
            name: variable.name,
            questionAnswers: variable.questions.map(q => ({ question: q, answer: '' })),
            status: 'Neutral',
            aiAssessment: ''
        };
    });
    return model;
};

export const INITIAL_STRATEGIC_MODEL: StrategicModel = createInitialModel();
export const INITIAL_SIX_VARIABLES_MODEL: SixVariablesModel = createInitialSixVariablesModel();


// --- TASK MATRIX BUILDER CONSTANTS ---

export const MATRIX_BUILDER_INITIAL_INPUTS: MatrixContextInput[] = [
  { id: 1, question: "Mô tả ngắn gọn về Doanh nghiệp", answer: "VD: Công ty ABC là một công ty tư vấn kiểm toán chuyên nghiệp cho các doanh nghiệp SME tại Hà Nội." },
  { id: 2, question: "Quy trình/Hoạt động chính", answer: "VD: 1. Tiếp cận khách hàng -> 2. Ký hợp đồng -> 3. Thực hiện kiểm toán -> 4. Báo cáo & Bàn giao." },
  { id: 3, question: "Kỳ vọng về Phân công", answer: "VD: Cần làm rõ vai trò của Trưởng phòng và nhân viên. Ban Giám đốc chỉ duyệt các hợp đồng lớn." }
];

export const MOCK_DEPARTMENTS: Department[] = [
    { code: 'BOD', name: 'Ban Giám đốc', priority: 1 },
    { code: 'MKT', name: 'Marketing', priority: 2 },
    { code: 'SALE', name: 'Kinh doanh', priority: 3 },
    { code: 'AUD', name: 'Kiểm toán', priority: 4 },
    { code: 'HR', name: 'Nhân sự', priority: 5 },
    { code: 'FIN', name: 'Tài chính', priority: 6 },
];

export const MOCK_ROLES: Role[] = [
    { id: 'role-1', name: 'Nguyễn Văn A', departmentCode: 'BOD', title: 'Giám đốc', email: 'a.nguyen@example.com', phone: '0901234567' },
    { id: 'role-2', name: 'Trần Thị B', departmentCode: 'AUD', title: 'Trưởng phòng Kiểm toán', email: 'b.tran@example.com', phone: '0901234568' },
    { id: 'role-3', name: 'Lê Văn C', departmentCode: 'AUD', title: 'Kiểm toán viên', email: 'c.le@example.com', phone: '0901234569' },
    { id: 'role-4', name: 'Phạm Thị D', departmentCode: 'SALE', title: 'Trưởng phòng Kinh doanh', email: 'd.pham@example.com', phone: '0901234570' },
];

// --- GOAL MANAGER CONSTANTS ---
export const MOCK_PREDEFINED_KPIS: PredefinedKPI[] = [
  { code: 'DT-01', description: 'Doanh thu bán hàng', unit: 'VNĐ', category: 'Doanh thu' },
  { code: 'DT-02', description: 'Doanh thu từ khách hàng mới', unit: 'VNĐ', category: 'Doanh thu' },
  { code: 'DS-01', description: 'Số lượng hợp đồng ký mới', unit: 'Hợp đồng', category: 'Doanh số' },
  { code: 'DS-02', description: 'Số lượng khách hàng tiềm năng', unit: 'Khách hàng', category: 'Doanh số' },
  { code: 'DT-01', description: 'Dòng tiền thu về', unit: 'VNĐ', category: 'Dòng tiền' },
  { code: 'KH-01', description: 'Tỷ lệ khách hàng hài lòng (NPS)', unit: '%', category: 'Khác' },
];

export const MOCK_GOALS: Goal[] = [
    {
        goalId: 'goal-1',
        goalDescription: 'Tăng trưởng doanh thu Quý 4',
        employeeId: 'role-4', // Phạm Thị D
        employeeName: 'Phạm Thị D',
        departmentCode: 'SALE',
        linkedTaskId: 'task-10', // Giả sử là task liên quan đến bán hàng
        linkedTaskName: 'Thực hiện bán hàng và chốt hợp đồng',
        kpis: [
            {
                kpiId: 'kpi-1-1',
                kpiCode: 'DT-01',
                description: 'Doanh thu bán hàng',
                unit: 'VNĐ',
                baseline: 0,
                target: 500000000,
                actual: 150000000,
                progress: 0.3,
                history: [
                    { id: 'h1', date: new Date(2024, 10, 15).toISOString(), value: 150000000, comment: 'Doanh thu giữa kỳ' }
                ]
            },
            {
                kpiId: 'kpi-1-2',
                kpiCode: 'DS-01',
                description: 'Số lượng hợp đồng ký mới',
                unit: 'Hợp đồng',
                baseline: 0,
                target: 10,
                actual: 4,
                progress: 0.4,
                history: []
            }
        ]
    }
];

export const MOCK_USER_TASKS: UserTask[] = [
    { id: 'task-10', employeeId: 'role-4', rowNumber: 10, mc1: 'B3', mc2: 'B31', mc3: '', mc4: '', fullCode: 'B3.B31', taskName: 'Thực hiện bán hàng và chốt hợp đồng', role: 'T' },
    { id: 'task-11', employeeId: 'role-4', rowNumber: 11, mc1: 'B3', mc2: 'B32', mc3: '', mc4: '', fullCode: 'B3.B32', taskName: 'Chăm sóc khách hàng sau bán', role: 'T' },
    { id: 'task-20', employeeId: 'role-3', rowNumber: 20, mc1: 'B4', mc2: 'B41', mc3: '', mc4: '', fullCode: 'B4.B41', taskName: 'Thực hiện kiểm toán tại khách hàng', role: 'T' },
];