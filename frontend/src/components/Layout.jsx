import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import RouteTransition from './RouteTransition';
import logo from '../assets/CEYSEAT.png';
import FestiveOverlay from './FestivalOverlay';
import TimeGreeting from './TimeGreeting';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
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
        <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">
            <RouteTransition />
            <header className="relative overflow-hidden bg-brand-700 text-white shadow-lg shadow-brand-900/10 sticky top-0 z-30 border-b border-brand-800/50">
                <FestiveOverlay />
                <div className="relative z-10 max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center">
                            <img src={logo} alt="CeySeat" className="h-20 w-auto" />
                        </Link>
                        
                    </div>

                    <nav className="flex items-center gap-5 text-sm font-medium">
                        <select
                             value={i18n.language}
                             onChange={(e) => changeLanguage(e.target.value)}
                             aria-label="Change language"
                             className="bg-brand-600/70 text-white text-sm rounded-lg px-2 py-1.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-400 cursor-pointer"
>
                            <option value="en">English</option>
                            <option value="si">සිංහල</option>
                            <option value="ta">தமிழ்</option>
                        </select>

                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle dark mode"
                            className="w-8 h-8 rounded-lg bg-brand-600/70 border border-white/10 flex items-center justify-center hover:bg-brand-500/70 transition-colors"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.02 0l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

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
                                <TimeGreeting />
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
                    <div className="flex items-center">
                        <img src={logo} alt="CeySeat" className="h-10 w-auto" />
                    </div>
                    <p className="text-sm text-brand-300">© 2026 CeySeat — Book your journey across Sri Lanka</p>
                    <p className="text-sm text-brand-300">Design and Develop by <a href="https://galacticweb.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:underline">GalacticWeb</a></p>
                </div>
            </footer>
        </div>
    );
}