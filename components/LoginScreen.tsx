// components/LoginScreen.tsx
import React, { useState } from 'react';
import { login } from '../services/authService.ts';
import { ASCO_LOGO_BASE64 } from '../constants.tsx';

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (login(username, password)) {
            onLoginSuccess();
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-slate-100">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
                <img src={ASCO_LOGO_BASE64} alt="ASCO Logo" className="w-32 mx-auto" />
                <h1 className="text-2xl font-bold text-center text-blue-800">AI Assistant Login</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tên đăng nhập</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="text-xs text-slate-500">
                        <p>Demo credentials:</p>
                        <p>Username: <strong>admin</strong></p>
                        <p>Password: <strong>admin</strong></p>
                    </div>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-900">
                        Đăng nhập
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;