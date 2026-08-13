import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import RouteTransition from './RouteTransition';
import logo from '../assets/CEYSEAT.png';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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
        <div className="min-h-screen bg-[#f8f7f5] flex flex-col">
            <RouteTransition />
            <header className="bg-brand-700 text-white shadow-lg shadow-brand-900/10 sticky top-0 z-30 border-b border-brand-800/50">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1 shadow-sm">
                        <img src={logo} alt="CeySeat" className="h-11 w-auto" />
                    </Link>

                    <nav className="flex items-center gap-5 text-sm font-medium">
                        <select
                             value={i18n.language}
                             onChange={(e) => changeLanguage(e.target.value)}
                             className="bg-brand-600/70 text-white text-sm rounded-lg px-2 py-1.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-400 cursor-pointer"
>
                            <option value="en">English</option>
                            <option value="si">සිංහල</option>
                            <option value="ta">தமிழ்</option>
                        </select>

                        <Link to="/schedules" className="text-brand-100 hover:text-accent-400 transition-colors">
                            {t('nav.buses')}
                        </Link>

                        {user && (
                            <Link to="/bookings" className="text-brand-100 hover:text-accent-400 transition-colors">
                                {t('nav.myBookings')}
                            </Link>
                        )}

                        {user && user.role === 'ADMIN' && (
                            <Link to="/admin" className="text-brand-100 hover:text-accent-400 transition-colors">
                                {t('nav.admin')}
                            </Link>
                        )}

                        {user && (user.role === 'OPERATOR' || user.role === 'ADMIN') && (
                            <Link to="/dashboard" className="text-brand-100 hover:text-accent-400 transition-colors">
                                {t('nav.dashboard')}
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-white/15">
                                <span className="text-brand-100 hidden sm:inline">{t('nav.hi')}, <span className="text-white font-semibold">{user.fullName?.split(' ')[0]}</span></span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors font-semibold"
                                >
                                    {t('nav.logout')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 pl-4 border-l border-white/15">
                                <Link
                                    to="/login"
                                    className="text-brand-100 hover:text-accent-400 transition-colors"
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-accent-700/30"
                                >
                                    {t('nav.signup')}
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main key={location.pathname} className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 fade-in">
                {children}
            </main>

            <footer className="bg-brand-900 text-brand-200 py-8 mt-8">
                <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1">
                        <img src={logo} alt="CeySeat" className="h-8 w-auto" />
                    </div>
                    <p className="text-sm text-brand-300">© 2026 CeySeat — Book your journey across Sri Lanka</p>
                </div>
            </footer>
        </div>
    );
}