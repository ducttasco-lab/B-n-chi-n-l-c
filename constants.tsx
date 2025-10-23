// constants.tsx
import { StrategicModel, SixVariablesModel, MatrixContextInput, Department, Role, Goal, UserTask, PredefinedKPI } from './types.ts';

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