// components/UserProfilePage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { UserCircleIcon, PencilIcon, CheckCircleIcon } from './icons.tsx';

const UserProfilePage: React.FC = () => {
    const [name, setName] = useState('Admin');
    const [title, setTitle] = useState('Quản trị viên');
    const [email, setEmail] = useState('admin@asco.com.vn');
    const [phone, setPhone] = useState('0123456789');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        setSaveStatus('saving');
        // In a real app, this would call an API
        setTimeout(() => {
            setSaveStatus('success');
            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000); // Hide message after 3 seconds
        }, 1000); // Simulate network delay
    };
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="h-full flex flex-col bg-slate-200 p-6">
            <header className="flex-shrink-0 bg-white p-4 border-b border-slate-200 rounded-t-lg">
                <h2 className="text-xl font-bold text-slate-800">Hồ sơ của bạn</h2>
            </header>
            <main className="flex-1 bg-white p-6 rounded-b-lg shadow-sm">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-24 h-24 text-slate-400" />
                            )}
                            <button 
                                onClick={triggerFileSelect} 
                                className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow border hover:bg-slate-100"
                                aria-label="Sửa ảnh đại diện"
                            >
                                <PencilIcon className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{name}</h3>
                            <p className="text-slate-500">{title}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Họ và Tên</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border rounded-md"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Chức danh</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border rounded-md"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-2 border rounded-md"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Số điện thoại</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full mt-1 p-2 border rounded-md"/>
                        </div>
                    </div>
                     <div className="flex justify-end items-center pt-4 gap-4">
                        {saveStatus === 'success' && (
                            <div className="text-green-600 flex items-center gap-2 transition-opacity duration-300" role="status">
                                <CheckCircleIcon className="w-5 h-5" />
                                <span className="font-semibold">Đã lưu thành công!</span>
                            </div>
                        )}
                        <button 
                            onClick={handleSave} 
                            disabled={saveStatus === 'saving'}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-wait"
                        >
                            {saveStatus === 'saving' ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfilePage;