import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('ceyseat_user');
        return saved ? JSON.parse(saved) : null;
    });

    async function login(email, password) {
        const res = await client.post('/auth/login', { email, password });
        localStorage.setItem('ceyseat_token', res.data.token);
        const userData = { userId: res.data.userId, fullName: res.data.fullName, role: res.data.role };
        localStorage.setItem('ceyseat_user', JSON.stringify(userData));
        setUser(userData);
    }

    async function register(fullName, email, password, phone) {
        const res = await client.post('/auth/register', { fullName, email, password, phone });
        localStorage.setItem('ceyseat_token', res.data.token);
        const userData = { userId: res.data.userId, fullName: res.data.fullName, role: res.data.role };
        localStorage.setItem('ceyseat_user', JSON.stringify(userData));
        setUser(userData);
    }

    function logout() {
        localStorage.removeItem('ceyseat_token');
        localStorage.removeItem('ceyseat_user');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}