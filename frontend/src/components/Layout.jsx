import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    function changeLanguage(lang) {
        i18n.changeLanguage(lang);
        localStorage.setItem('ceyseat_lang', lang);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-brand-700 text-white shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold tracking-tight">
                        Cey<span className="text-accent-400">Seat</span>
                    </Link>

                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <select
                             value={i18n.language}
                             onChange={(e) => changeLanguage(e.target.value)}
                             className="bg-brand-600 text-white text-sm rounded-lg px-2 py-1.5 border border-brand-500"
>
                            <option value="en">English</option>
                            <option value="si">සිංහල</option>
                            <option value="ta">தமிழ்</option>
                        </select>

                        <Link to="/schedules" className="hover:text-accent-400 transition-colors">
                            {t('nav.buses')}
                        </Link>

                        {user && (
                            <Link to="/bookings" className="hover:text-accent-400 transition-colors">
                                {t('nav.myBookings')}
                            </Link>
                        )}

                        {user && user.role === 'ADMIN' && (
                            <Link to="/admin" className="hover:text-accent-400 transition-colors">
                                {t('nav.admin')}
                            </Link>
                        )}

                        {user && (user.role === 'OPERATOR' || user.role === 'ADMIN') && (
                            <Link to="/dashboard" className="hover:text-accent-400 transition-colors">
                                {t('nav.dashboard')}
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-brand-100">{t('nav.hi')}, {user.fullName?.split(' ')[0]}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-lg transition-colors"
                                >
                                    {t('nav.logout')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="hover:text-accent-400 transition-colors"
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-4 py-2 rounded-lg transition-colors"
                                >
                                    {t('nav.signup')}
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