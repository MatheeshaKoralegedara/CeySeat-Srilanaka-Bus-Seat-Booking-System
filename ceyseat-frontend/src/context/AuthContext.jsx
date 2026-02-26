import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for existing session
        const storedUser = localStorage.getItem('ceyseat_user');
        const storedToken = localStorage.getItem('ceyseat_token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = (userData, jwt) => {
        setUser(userData);
        setToken(jwt);
        localStorage.setItem('ceyseat_user', JSON.stringify(userData));
        localStorage.setItem('ceyseat_token', jwt);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('ceyseat_user');
        localStorage.removeItem('ceyseat_token');
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isAdminOrOperator: user?.role === 'ADMIN' || user?.role === 'OPERATOR',
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
