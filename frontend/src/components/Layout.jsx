import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-brand-700 text-white shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold tracking-tight">
                        Cey<span className="text-accent-400">Seat</span>
                    </Link>

                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link to="/schedules" className="hover:text-accent-400 transition-colors">
                            Buses
                        </Link>

                        {user && (
                            <Link to="/bookings" className="hover:text-accent-400 transition-colors">
                                My Bookings
                            </Link>
                        )}

                        {user && user.role === 'ADMIN' && (
                            <Link to="/admin" className="hover:text-accent-400 transition-colors">
                                Admin
                            </Link>
                        )}

                        {user && (user.role === 'OPERATOR' || user.role === 'ADMIN') && (
                            <Link to="/dashboard" className="hover:text-accent-400 transition-colors">
                                Dashboard
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-brand-100">Hi, {user.fullName?.split(' ')[0]}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-lg transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="hover:text-accent-400 transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-4 py-2 rounded-lg transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
                © 2026 CeySeat — Book your journey across Sri Lanka
            </footer>
        </div>
    );
}