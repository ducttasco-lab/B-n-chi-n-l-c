// services/authService.ts

const AUTH_KEY = 'is_authenticated';

export const login = (user: string, pass: string): boolean => {
    // In a real application, you'd call an API.
    // For this demo, we'll use a simple check.
    if (user === 'admin' && pass === 'admin') {
        localStorage.setItem(AUTH_KEY, 'true');
        return true;
    }
    return false;
};

export const logout = () => {
    localStorage.removeItem(AUTH_KEY);
};

export const checkAuth = (): boolean => {
    return localStorage.getItem(AUTH_KEY) === 'true';
};
