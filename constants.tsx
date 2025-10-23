// constants.tsx
import { StrategicModel, SixVariablesModel, Role, MatrixContextInput, Department } from './types.ts';

export const SIX_VARIABLES_QUESTIONS: { id: string; name: string; questions: string[] }[] = [
  {
    id: 'MarketPosition',
    name: '1. Vị trí thị trường (Market Position)',
    questions: [
      '• Vị thế cạnh tranh: Công ty đang ở vị thế nào (Dẫn đầu, Thách thức, Theo sau, hay ở Thị trường ngách)? Thị phần cụ thể là bao nhiêu và xu hướng đang tăng hay giảm?',
      '• Nhận thức của khách hàng: Khách hàng và thị trường nhìn nhận thương hiệu, sản phẩm của công ty như thế nào so với các đối thủ chính? Đâu là điểm khác biệt cốt lõi trong mắt họ?',
      '• Phân khúc & Nhu cầu: Phân khúc khách hàng nào đang mang lại nhiều giá trị nhất? Nhu cầu chưa được đáp ứng hoặc các \'nỗi đau\' (pain points) của họ là gì mà công ty có thể giải quyết tốt hơn?',
    ],
  },
  {
    id: 'Innovation',
    name: '2. Đổi mới sáng tạo (Innovation)',
    questions: [
      '• Hiệu quả R&D: Tỷ lệ doanh thu từ các sản phẩm/dịch vụ mới (ra mắt trong vòng 3 năm) là bao nhiêu?',
      '• Năng lực đổi mới: Các dự án R&D hoặc sáng kiến cải tiến quan trọng nào đang được triển khai? Công ty đang đi đầu hay đi sau về công nghệ và quy trình so với ngành?',
      '• Văn hóa đổi mới: Văn hóa công ty có khuyến khích thử nghiệm và chấp nhận rủi ro có tính toán không? Các ý tưởng mới được tiếp nhận và phát triển như thế nào?',
    ],
  },
  {
    id: 'Productivity',
    name: '3. Năng suất (Productivity)',
    questions: [
      '• Năng suất lao động: Các chỉ số như doanh thu/nhân viên, lợi nhuận/nhân viên đang có xu hướng tăng hay giảm? So sánh với mức trung bình của ngành như thế nào?',
      '• Hiệu suất sử dụng vốn: Các chỉ số ROA, ROE đang ở mức nào? Vốn của công ty đang được sử dụng hiệu quả đến đâu để tạo ra lợi nhuận?',
      '• Tối ưu hóa quy trình: Các quy trình vận hành chính có những điểm nghẽn (bottleneck) hoặc lãng phí nào (thời gian, nguyên vật liệu, chi phí) cần được cải thiện không?',
    ],
  },
  {
    id: 'People',
    name: '4. Con người & Năng lực (People & Resources)',
    questions: [
      '• Thu hút & Giữ chân nhân tài: Tỷ lệ nhân viên giỏi nghỉ việc (regrettable turnover) là bao nhiêu? Công ty có dễ dàng thu hút được các ứng viên chất lượng cao cho các vị trí quan trọng không?',
      '• Phát triển Năng lực: Công ty có những chương trình nào để phát triển kỹ năng và năng lực cho đội ngũ kế thừa không? Các kỹ năng cốt lõi cần thiết cho tương lai là gì?',
      '• Sức hấp dẫn của thương hiệu tuyển dụng: Điều gì làm cho công ty trở thành một nơi làm việc hấp dẫn (lương thưởng, văn hóa, cơ hội phát triển, sự ổn định)?',
    ],
  },
  {
    id: 'Liquidity',
    name: '5. Tính thanh khoản (Liquidity)',
    questions: [
      '• Sức khỏe dòng tiền: Dòng tiền từ hoạt động kinh doanh (Operating Cash Flow) có dương và ổn định không? Các chỉ số thanh khoản hiện hành (current ratio, quick ratio) ở mức an toàn không?',
      '• Quản lý công nợ: Vòng quay các khoản phải thu và phải trả đang ở mức nào? Công ty có gặp khó khăn trong việc thu hồi công nợ hay thanh toán các khoản nợ đến hạn không?',
      '• Khả năng tiếp cận vốn: Công ty có dễ dàng tiếp cận các nguồn vốn vay ngắn hạn và dài hạn khi cần thiết không? Cấu trúc vốn (nợ/vốn chủ sở hữu) có hợp lý không?',
    ],
  },
  {
    id: 'Profitability',
    name: '6. Lợi nhuận (Profitability)',
    questions: [
      '• Chất lượng lợi nhuận: Biên lợi nhuận gộp, biên lợi nhuận hoạt động và biên lợi nhuận ròng đang có xu hướng nào? Lợi nhuận đến từ hoạt động kinh doanh cốt lõi hay từ các hoạt động bất thường/tài chính?',
      '• Cơ cấu chi phí: Đâu là những khoản chi phí lớn nhất? Có những chi phí nào có thể được tối ưu hóa mà không ảnh hưởng đến chất lượng và khả năng tăng trưởng?',
      '• Sự bền vững: Lợi nhuận hiện tại có bền vững không? Những rủi ro nào (từ thị trường, đối thủ, quy định...) có thể ảnh hưởng đến lợi nhuận trong tương lai?',
    ],
  },
];

export const STRATEGIC_MAP_QUESTIONS: Record<string, string[]> = {
  '1: Vấn đề của Khách hàng': [
    'Giới thiệu về công ty bạn (Tên công ty; lĩnh vực hoạt động, sản phẩm, thị trường...)?',
    'Bạn đang xác định vấn đề dựa trên phản hồi thực tế hay chỉ là giả định nội bộ?',
    'Bạn đã có dữ liệu nào từ khách hàng chưa? (khảo sát, phản hồi, khiếu nại, nghiên cứu thị trường...).',
    'Doanh nghiệp có thực hiện phỏng vấn, focus group hay chỉ dựa trên phân tích số liệu có sẵn?',
    'Nếu có dữ liệu, bạn đã kiểm chứng tính chính xác của nó chưa?',
    'Bạn có chắc rằng vấn đề bạn xác định đúng với thực tế của khách hàng?',
    'Có bằng chứng nào chỉ ra khách hàng sẵn sàng chi trả để giải quyết vấn đề này?',
  ],
  '2: Giải pháp đã có sẵn trên thị trường': [
    'Các giải pháp hiện có trên thị trường để giải quyết vấn đề của khách hàng là gì?',
    'Đối thủ cạnh tranh trực tiếp và gián tiếp chính là ai?',
    'Phân loại các giải pháp trên thị trường: Common, Innovative, Niche Solutions.',
    'Giải pháp của bạn có điểm gì vượt trội so với thị trường (Giá trị, Giá cả, Tính khả dụng, Công nghệ)?',
    'Khoảng trống nào trên thị trường mà giải pháp của bạn có thể khai thác?',
    'Bạn có thể tối ưu hóa hoặc nâng cấp giải pháp để chiếm ưu thế không?',
  ],
    "3: Giải pháp của doanh nghiệp": ["Sản phẩm/dịch vụ của bạn giải quyết vấn đề của khách hàng như thế nào?", "Điểm khác biệt độc nhất (USP) của bạn là gì?", "Lợi ích chính mà khách hàng nhận được là gì?"],
    "4: Giải pháp mới (phát triển)": ["Những tính năng hoặc sản phẩm mới nào đang được phát triển?", "Lộ trình phát triển sản phẩm trong 1-2 năm tới là gì?", "Nguồn lực nào được phân bổ cho việc phát triển này?"],
    "5: Giải pháp mới tiềm năng (nghiên cứu)": ["Những ý tưởng sản phẩm/dịch vụ nào đang trong giai đoạn nghiên cứu?", "Công nghệ hoặc xu hướng mới nào có thể được áp dụng?", "Thị trường tiềm năng cho các ý tưởng này là gì?"],
    "6: Xu hướng kinh tế xã hội": ["Những thay đổi về nhân khẩu học, lối sống nào ảnh hưởng đến khách hàng của bạn?", "Các quy định, chính sách mới nào có thể tác động đến kinh doanh?", "Tình hình kinh tế vĩ mô (lạm phát, tăng trưởng) ảnh hưởng như thế nào?"],
    "7: Sự tăng trưởng của thị trường": ["Tốc độ tăng trưởng dự kiến của thị trường là bao nhiêu?", "Động lực chính thúc đẩy sự tăng trưởng đó là gì?", "Những phân khúc nào trong thị trường đang phát triển nhanh nhất?"],
    "8: Đối thủ cạnh tranh": ["Đối thủ mới nổi nào có tiềm năng đe dọa?", "Chiến lược của đối thủ cạnh tranh chính gần đây là gì?", "Điểm mạnh và điểm yếu của họ so với chúng ta là gì?"],
    "9: Mục tiêu về thị phần": ["Mục tiêu thị phần trong 3-5 năm tới là gì?", "Để đạt được mục tiêu đó, cần tăng trưởng bao nhiêu % mỗi năm?", "Chiến lược chính để giành thị phần là gì (giá, chất lượng, kênh phân phối...)?"],
    "10: Mục tiêu Marketing": ["Mục tiêu về nhận diện thương hiệu là gì?", "Mục tiêu về số lượng khách hàng tiềm năng (leads) là gì?", "Ngân sách marketing dự kiến là bao nhiêu và phân bổ như thế nào?"],
    "11: Sự phát triển của doanh nghiệp (qua thời kỳ)": ["Doanh thu và lợi nhuận đã tăng trưởng như thế nào trong 3 năm qua?", "Những cột mốc quan trọng nào đã đạt được?", "Bài học kinh nghiệm lớn nhất từ những thành công và thất bại là gì?"],
    "12: Năng lực và đầu tư": ["Năng lực cốt lõi của doanh nghiệp là gì?", "Những lĩnh vực nào cần đầu tư thêm (công nghệ, nhân sự, tài sản)?", "Kế hoạch huy động vốn cho các khoản đầu tư này là gì?"],
    "13: Mục tiêu về việc Giảm chi phí": ["Những khoản chi phí nào có thể cắt giảm mà không ảnh hưởng đến chất lượng?", "Mục tiêu giảm chi phí hoạt động trong năm tới là bao nhiêu %?", "Có thể ứng dụng công nghệ để tự động hóa và giảm chi phí không?"],
    "14: Mục tiêu về nghiên cứu và phát triển": ["Mục tiêu R&D trong năm tới là gì (sản phẩm mới, cải tiến quy trình...)?", "Ngân sách dành cho R&D là bao nhiêu?", "Các chỉ số đo lường hiệu quả R&D (KPIs) là gì?"],
    "15: Đánh giá tổ chức": ["Cơ cấu tổ chức hiện tại có hiệu quả không?", "Năng lực và kỹ năng của đội ngũ nhân sự như thế nào?", "Văn hóa doanh nghiệp có hỗ trợ cho việc thực hiện chiến lược không?"],
    "16: Cân đối dòng tiền": ["Dự báo dòng tiền trong 12 tháng tới như thế nào?", "Những rủi ro chính đối với dòng tiền là gì?", "Biện pháp để duy trì dòng tiền dương là gì?"],
    "17: Thay đổi dòng tiền thâm hụt chi tiêu/ thặng dư": ["Những hoạt động nào đang gây thâm hụt dòng tiền lớn nhất?", "Làm thế nào để tăng dòng tiền từ các hoạt động thặng dư?", "Kế hoạch sử dụng dòng tiền thặng dư là gì (tái đầu tư, trả nợ...)?"],
    "18: Kế hoạch cân đối": ["Kế hoạch hành động cụ thể để cân đối các mục tiêu (thị phần, lợi nhuận, R&D...) là gì?", "Ai chịu trách nhiệm cho từng mục tiêu?", "Làm thế nào để theo dõi và điều chỉnh kế hoạch khi cần thiết?"],
};


export const INITIAL_STRATEGIC_MODEL: StrategicModel = Object.keys(STRATEGIC_MAP_QUESTIONS).reduce((acc, nodeId) => {
  acc[nodeId] = {
    id: nodeId,
    name: nodeId,
    questionAnswers: STRATEGIC_MAP_QUESTIONS[nodeId].map(q => ({ question: q, answer: '' })),
    initiatives: [],
    chatHistory: '',
  };
  return acc;
}, {} as StrategicModel);

export const INITIAL_SIX_VARIABLES_MODEL: SixVariablesModel = SIX_VARIABLES_QUESTIONS.reduce((acc, variable) => {
  acc[variable.id] = {
    id: variable.id,
    name: variable.name,
    questionAnswers: variable.questions.map(q => ({ question: q, answer: '' })),
    status: 'Neutral',
    aiAssessment: '',
    aiFullAnalysis: '',
  };
  return acc;
}, {} as SixVariablesModel);


// Mock Data for Task Matrix
export const MOCK_DEPARTMENTS: Department[] = [
    { code: 'BGD', name: 'Ban Giám đốc', priority: 1 },
    { code: 'KD', name: 'Kinh doanh', priority: 2 },
    { code: 'TC', name: 'Tài chính', priority: 3 },
    { code: 'NS', name: 'Nhân sự', priority: 4 },
];

export const MOCK_ROLES: Role[] = [
    { id: 'gd', name: 'Giám đốc', departmentCode: 'BGD', title: 'Giám đốc Điều hành', email: 'gd@company.com', phone: '090-111-2222' },
    { id: 'tkd', name: 'Trưởng phòng KD', departmentCode: 'KD', title: 'Trưởng phòng', email: 'tp.kd@company.com', phone: '090-222-3333' },
    { id: 'nvkd1', name: 'Nhân viên KD 1', departmentCode: 'KD', title: 'Nhân viên Kinh doanh', email: 'nv.kd1@company.com', phone: '090-333-4444' },
    { id: 'pkt', name: 'Kế toán trưởng', departmentCode: 'TC', title: 'Kế toán trưởng', email: 'ktt@company.com', phone: '090-444-5555' },
    { id: 'pns', name: 'Trưởng phòng NS', departmentCode: 'NS', title: 'Trưởng phòng', email: 'tp.ns@company.com', phone: '090-555-6666' },
];

export const MATRIX_BUILDER_INITIAL_INPUTS: MatrixContextInput[] = [
    {
        id: 1,
        question: "1. Tổng quan về Doanh nghiệp:",
        answer: "VD: Công ty TNHH Hằng Kiểm toán và Định giá ASCO, hoạt động trong lĩnh vực kiểm toán, kế toán và tư vấn thuế. Quy mô 50 nhân sự."
    },
    {
        id: 2,
        question: "2. Mục tiêu Chiến lược Cốt lõi:",
        answer: "VD: Trở thành top 10 công ty kiểm toán cho doanh nghiệp SME tại Hà Nội trong 2 năm tới."
    },
    {
        id: 3,
        question: "3. Quy trình Tạo ra Giá trị Chính:",
        answer: "VD: Marketing tìm kiếm khách hàng -> Tư vấn, báo giá -> Ký hợp đồng -> Thực hiện dịch vụ kiểm toán/kế toán -> Bàn giao báo cáo -> Chăm sóc sau dịch vụ."
    },
    {
        id: 4,
        question: "4. Vấn đề & Kỳ vọng về Phân công:",
        answer: "VD: Hiện tại phân công còn chồng chéo, không rõ ai chịu trách nhiệm chính (Q). Kỳ vọng ma trận mới sẽ làm rõ vai trò của từng phòng ban và cá nhân."
    }
];