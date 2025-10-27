// components/UserGuide.tsx
import React from 'react';
import { MapIcon, TableCellsIcon, CheckCircleIcon, ChatBubbleLeftRightIcon } from './icons.tsx';

// FIX: Replaced `JSX.Element` with `React.ReactNode` to resolve "Cannot find namespace 'JSX'" error.
const GuideCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
    <div className="flex items-center mb-4">
      <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    </div>
    <div className="text-slate-600 space-y-3 text-sm leading-relaxed prose prose-sm max-w-none prose-ul:my-2 prose-li:my-1 prose-p:my-2">
      {children}
    </div>
  </div>
);

const UserGuide: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-slate-200 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Hướng dẫn Sử dụng AI Assistant</h2>

      <div className="space-y-8 max-w-4xl mx-auto">
        <GuideCard icon={<ChatBubbleLeftRightIcon className="w-6 h-6"/>} title="Luồng làm việc Tổng thể">
            <p>Ứng dụng được thiết kế theo quy trình 3 bước logic để chuyển hóa chiến lược thành kết quả có thể đo lường:</p>
            <ol className="list-decimal list-inside space-y-2">
                <li>
                    <strong>Tư duy Chiến lược (Bản đồ):</strong> Sử dụng <strong>Bản đồ Chiến lược</strong> để xác định các yếu tố ảnh hưởng và chẩn đoán "sức khỏe" tổng thể của doanh nghiệp. Đây là bước định hướng vĩ mô.
                </li>
                <li>
                    <strong>Cấu trúc & Phân nhiệm (Ma trận):</strong> Dùng <strong>Ma trận Phân nhiệm</strong> để diễn giải chiến lược thành một danh sách công việc chi tiết và phân công trách nhiệm (ai làm gì, ai quyết định) cho từng phòng ban, cá nhân.
                </li>
                 <li>
                    <strong>Thực thi & Đo lường (Mục tiêu):</strong> Với <strong>Quản lý Mục tiêu</strong>, bạn đặt ra các KPI cụ thể cho nhân viên dựa trên các nhiệm vụ đã được giao trong ma trận, và theo dõi tiến độ thực hiện chúng.
                </li>
            </ol>
        </GuideCard>

        <GuideCard icon={<MapIcon />} title="1. Bản đồ Chiến lược - Từ Tư duy đến Định hướng">
          <h4>Mục đích:</h4>
          <p>Cung cấp một khung tư duy trực quan để bạn phân tích môi trường kinh doanh, xác định các yếu annhr hưởng và chẩn đoán các khía cạnh cốt lõi của doanh nghiệp.</p>
          <h4>Cách sử dụng:</h4>
          <ol className="list-decimal list-inside">
            <li><strong>Khám phá & Ghi chú:</strong> Nhấp vào một trong <strong>18 Yếu tố</strong> hoặc <strong>6 Biến số</strong> trên bản đồ. Các câu hỏi gợi ý sẽ xuất hiện ở bảng bên phải. Hãy điền câu trả lời và ghi chú của bạn vào đó.</li>
            <li><strong>Tận dụng Cố vấn AI:</strong>
                <ul className="list-disc list-inside ml-4">
                    <li>Đặt câu hỏi trực tiếp cho AI trong khung chat để có phân tích sâu hơn về yếu tố bạn đã chọn.</li>
                    <li>Sử dụng nút <strong>"AI Điền Dữ liệu"</strong> để AI tự động nghiên cứu và điền thông tin về một công ty hoặc chủ đề cụ thể.</li>
                </ul>
            </li>
            <li><strong>Nhận Báo cáo Phân tích:</strong> Sau khi đã có dữ liệu, hãy sử dụng các nút <strong>"AI Phân tích 18 Yếu tố"</strong>, <strong>"AI Chẩn đoán 6 Biến số"</strong>, và <strong>"AI Tổng hợp Bảng Chiến lược"</strong>. AI sẽ tạo ra các báo cáo chi tiết, giúp bạn nhận diện các trọng tâm và mâu thuẫn chiến lược.</li>
            <li><strong>Tạo Kế hoạch Hành động:</strong> Từ các phân tích của AI, bạn có thể nhanh chóng tạo ra các kế hoạch hành động cấp cao bằng cách nhấp vào nút <strong>"+ Tạo Sáng kiến"</strong>. Các sáng kiến này sẽ được quản lý trong tab "Kế hoạch Hành động".</li>
          </ol>
        </GuideCard>
        
        <GuideCard icon={<TableCellsIcon />} title="2. Ma trận Phân nhiệm - Cụ thể hóa Công việc">
          <h4>Mục đích:</h4>
          <p>Xây dựng một hệ thống phân công trách nhiệm rõ ràng (theo mô hình QTKBP) cho toàn bộ công ty, đảm bảo mọi nhiệm vụ đều có người quyết định, thực hiện, và kiểm soát.</p>
          <h4>Luồng làm việc với AI:</h4>
           <ol className="list-decimal list-inside">
                <li><strong>Cung cấp Bối cảnh:</strong> Tại bảng điều khiển AI bên phải, điền các thông tin ban đầu về doanh nghiệp, quy trình chính và kỳ vọng của bạn.</li>
                <li><strong>Tạo Danh sách Nhiệm vụ:</strong> Nhấn nút <strong>"Bước 1: AI Gợi ý Nhiệm vụ"</strong>. AI sẽ phân tích bối cảnh và tạo ra một danh sách công việc được phân cấp chi tiết. Bạn có thể xem và chỉnh sửa danh sách này trong tab "Danh sách Nhiệm vụ".</li>
                <li><strong>Phân nhiệm cho Phòng ban:</strong> Nhấn <strong>"Bước 2: AI Phân nhiệm Chức năng"</strong>. Một cửa sổ sẽ hiện ra, cho phép bạn yêu cầu AI gợi ý các quy tắc phân công. Sau khi xác nhận, AI sẽ tạo ra ma trận phân công cho các phòng ban, hiển thị trong tab "Ma trận Cấp Công ty".</li>
            </ol>
           <h4>Quản lý Phiên bản (Rất quan trọng!):</h4>
            <p>Tab "Quản lý Phiên bản" là trung tâm điều phối của bạn. Hãy hiểu rõ 3 hành động chính:</p>
            <ul className="list-disc list-inside ml-4">
                <li><strong>Lưu:</strong> Chụp lại toàn bộ trạng thái hiện tại của ma trận (danh sách nhiệm vụ, phân công...) và lưu lại với một cái tên.</li>
                <li><strong>Tải:</strong> Lấy một phiên bản đã lưu để xem lại hoặc tiếp tục chỉnh sửa. Hành động này sẽ <strong>ghi đè</strong> toàn bộ dữ liệu bạn đang làm việc.</li>
                <li><strong>Kích hoạt:</strong> Đánh dấu một phiên bản là <strong>chính thức</strong> cho toàn bộ ứng dụng. Chỉ có <strong>một phiên bản được kích hoạt</strong> tại một thời điểm. Chức năng <strong>Quản lý Mục tiêu</strong> sẽ chỉ hoạt động dựa trên phiên bản đã được kích hoạt này.</li>
            </ul>
        </GuideCard>

        <GuideCard icon={<CheckCircleIcon />} title="3. Quản lý Mục tiêu - Đo lường Hiệu suất">
          <h4>Điều kiện tiên quyết:</h4>
          <p>Bạn <strong>bắt buộc</strong> phải có một phiên bản Ma trận Phân nhiệm đã được <strong>Kích hoạt</strong>. Module này cần biết nhiệm vụ nào được giao cho ai (vai trò "T") để bạn có thể thiết lập mục tiêu.</p>
           <h4>Cách sử dụng:</h4>
           <ol className="list-decimal list-inside">
                <li><strong>Chọn Nhân viên và Nhiệm vụ:</strong> Trong tab "Thiết lập Mục tiêu", chọn phòng ban và nhân viên. Danh sách các nhiệm vụ mà nhân viên đó có vai trò <strong>"T" (Thực hiện)</strong> sẽ hiện ra. Hãy chọn một nhiệm vụ cụ thể.</li>
                <li><strong>Tạo Mục tiêu (Objective):</strong> Nhấn nút "Thêm Mục tiêu cho Nhiệm vụ này". Một mục tiêu mới sẽ được tạo, liên kết với nhiệm vụ bạn đã chọn. Bạn có thể sửa lại tên mục tiêu cho rõ ràng hơn.</li>
                <li><strong>Thêm Kết quả Then chốt (KPIs):</strong> Với mỗi mục tiêu, hãy thêm các chỉ số để đo lường. Bạn có thể chọn từ thư viện có sẵn hoặc nhấn <strong>"AI Gợi ý KPI"</strong> để AI đề xuất các chỉ số theo tiêu chí SMART. Đừng quên điền giá trị "Ban đầu" và "Mục tiêu".</li>
            </ol>
            <h4>Theo dõi và Báo cáo:</h4>
             <ul className="list-disc list-inside ml-4">
                <li>Sử dụng tab <strong>"Theo dõi Tiến độ"</strong> để cập nhật giá trị thực tế ("check-in") cho các KPI của bạn theo thời gian.</li>
                <li>Tab <strong>"Bảng tổng hợp"</strong> cung cấp các biểu đồ và bảng xếp hạng, cho bạn cái nhìn trực quan về hiệu suất của cá nhân, phòng ban và toàn công ty.</li>
            </ul>
        </GuideCard>
      </div>
    </div>
  );
};

export default UserGuide;
