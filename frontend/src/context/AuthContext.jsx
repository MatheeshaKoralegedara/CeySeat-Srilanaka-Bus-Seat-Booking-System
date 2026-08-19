import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

function getTokenExpiryMs(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

function isTokenExpired(token) {
    const expiryMs = getTokenExpiryMs(token);
    return expiryMs !== null && expiryMs <= Date.now();
}

function clearStoredSession() {
    localStorage.removeItem('ceyseat_token');
    localStorage.removeItem('ceyseat_user');
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('ceyseat_token');
        const saved = localStorage.getItem('ceyseat_user');
        if (!token || !saved || isTokenExpired(token)) {
            clearStoredSession();
            return null;
        }
        return JSON.parse(saved);
    });

    async function login(email, password) {
        const res = await client.post('/auth/login', { email, password });
        localStorage.setItem('ceyseat_token', res.data.token);
        const userData = { userId: res.data.userId, fullName: res.data.fullName, role: res.data.role };
        localStorage.setItem('ceyseat_user', JSON.stringify(userData));
        setUser(userData);
    }

    async function register(fullName, email, password, phone, nic) {
        const res = await client.post('/auth/register', { fullName, email, password, phone, nic });
        localStorage.setItem('ceyseat_token', res.data.token);
        const userData = { userId: res.data.userId, fullName: res.data.fullName, role: res.data.role };
        localStorage.setItem('ceyseat_user', JSON.stringify(userData));
        setUser(userData);
    }

    function logout() {
        clearStoredSession();
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