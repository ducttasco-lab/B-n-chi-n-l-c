// components/matrix/MatrixAuditTab.tsx
import React from 'react';

const MatrixAuditTab: React.FC = () => {
    return (
        <div className="p-4 text-center text-slate-500">
            <h3 className="text-lg font-semibold">Kiểm tra Ma trận</h3>
            <p className="mt-2">Chức năng kiểm tra các lỗi logic trong ma trận (ví dụ: thiếu vai trò Quyết định, có nhiều hơn 1 vai trò Quyết định) sẽ được xây dựng tại đây.</p>
            <p className="mt-2 text-xs">(Đang phát triển)</p>
        </div>
    );
};

export default MatrixAuditTab;