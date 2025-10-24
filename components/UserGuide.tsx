// components/UserGuide.tsx
import React from 'react';
import { MapIcon, TableCellsIcon, CheckCircleIcon } from './icons.tsx';

// FIX: Replaced `JSX.Element` with `React.ReactNode` to resolve "Cannot find namespace 'JSX'" error.
const GuideCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
    <div className="flex items-center mb-3">
      <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    </div>
    <div className="text-slate-600 space-y-2 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

const UserGuide: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-slate-50 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Hướng dẫn Sử dụng AI Assistant</h2>

      <div className="space-y-6 max-w-4xl mx-auto">
        <GuideCard icon={<MapIcon />} title="1. Bản đồ Chiến lược">
          <p>Chức năng này giúp bạn hệ thống hóa tư duy chiến lược dựa trên hai mô hình quản trị hiện đại:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Bản đồ 18 Yếu tố:</strong> Cung cấp một cái nhìn toàn cảnh về các yếu tố bên trong (có thể kiểm soát) và bên ngoài (không thể kiểm soát) ảnh hưởng đến doanh nghiệp.</li>
            <li><strong>6 Biến số Kiểm soát:</strong> Giúp chẩn đoán "sức khỏe" của doanh nghiệp dựa trên 6 khía cạnh cốt lõi: Vị thế thị trường, Đổi mới, Năng suất, Con người, Thanh khoản và Lợi nhuận.</li>
          </ul>
          <p><strong>Cách sử dụng:</strong> Chọn từng yếu tố trên bản đồ, điền ghi chú của bạn vào bảng bên phải. Sử dụng Cố vấn AI để được phân tích sâu hơn hoặc để AI tự động điền dữ liệu dựa trên nghiên cứu về một chủ đề.</p>
        </GuideCard>
        
        <GuideCard icon={<TableCellsIcon />} title="2. Ma trận Phân nhiệm">
          <p>Đây là công cụ cốt lõi để chuyển đổi chiến lược thành hành động cụ thể thông qua việc xây dựng Ma trận Trách nhiệm (QTKBP - Quyết định, Thực hiện, Kiểm soát, Báo cáo, Phối hợp).</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Bước 1:</strong> Cung cấp thông tin ban đầu về doanh nghiệp và nhấn "AI Gợi ý Nhiệm vụ". AI sẽ tạo ra một danh sách công việc chi tiết.</li>
            <li><strong>Bước 2:</strong> Rà soát và chỉnh sửa danh sách công việc. Sau đó, nhấn "Tạo Ma trận Cấp Công ty" để AI phân công vai trò cho các phòng ban.</li>
            <li><strong>Bước 3:</strong> Chuyển sang tab "Phân nhiệm Chi tiết" để gán vai trò cụ thể cho từng nhân viên trong mỗi phòng ban.</li>
            <li><strong>Quản lý Phiên bản:</strong> Lưu lại các phiên bản ma trận khác nhau và "Kích hoạt" phiên bản bạn muốn sử dụng làm ma trận chính thức.</li>
          </ul>
        </GuideCard>

        <GuideCard icon={<CheckCircleIcon />} title="3. Quản lý Mục tiêu Năm">
          <p>Chức năng này giúp bạn thiết lập và theo dõi các mục tiêu theo phương pháp OKR (Objectives and Key Results), liên kết trực tiếp với các nhiệm vụ trong Ma trận Phân nhiệm.</p>
           <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Thiết lập Mục tiêu:</strong> Chọn nhân viên và nhiệm vụ họ phải thực hiện (vai trò "T"), sau đó tạo Mục tiêu (Objective) và các Kết quả Then chốt (KPI/KR) để đo lường.</li>
            <li><strong>Theo dõi Tiến độ:</strong> Ghi nhận ("check-in") tiến độ thực tế cho từng KPI theo ngày, tuần, hoặc tháng.</li>
            <li><strong>Bảng tổng hợp:</strong> Xem dashboard trực quan về tiến độ hoàn thành mục tiêu của cá nhân, phòng ban và toàn công ty.</li>
            <li><strong>Thư viện KPI:</strong> Tùy chỉnh danh sách các KPI mẫu để phù hợp với đặc thù của doanh nghiệp bạn.</li>
          </ul>
        </GuideCard>
      </div>
    </div>
  );
};

export default UserGuide;
