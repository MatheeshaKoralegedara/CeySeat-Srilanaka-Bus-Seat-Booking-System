import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import RouteTransition from './RouteTransition';
import logo from '../assets/CEYSEAT.png';
import FestiveOverlay from './FestivalOverlay';
import TimeGreeting from './TimeGreeting';
import PeraheraMarquee from './PeraheraMarquee';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const isHome = location.pathname === '/';
    const [scrolled, setScrolled] = useState(!isHome);

    useEffect(() => {
        if (!isHome) {
            setScrolled(true);
            return undefined;
        }
        function onScroll() {
            setScrolled(window.scrollY > 40);
        }
        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [isHome]);

    const transparentHeader = isHome && !scrolled;

    function handleLogout() {
        logout();
        setMenuOpen(false);
        navigate('/login');
    }

    function changeLanguage(lang) {
        i18n.changeLanguage(lang);
        localStorage.setItem('ceyseat_lang', lang);
    }

    return (
        <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">
            <RouteTransition />
            <header
                className={`overflow-hidden text-white transition-colors duration-300 z-40 border-b ${
                    isHome ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
                } ${
                    transparentHeader
                        ? 'bg-black/25 backdrop-blur-sm border-transparent shadow-none'
                        : 'bg-brand-700 shadow-lg shadow-brand-900/10 border-brand-800/50'
                }`}
            >
               <FestiveOverlay />

                <div className="relative z-10 max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    
                    <div className="flex items-center gap-4">
                        
                        <Link to="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
                            <img src={logo} alt="CeySeat" className={`h-16 md:h-24 w-auto ${transparentHeader ? 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]' : ''}`} />
                        </Link>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
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
                                <span className="text-brand-100 hidden lg:inline">{t('nav.hi')}, <span className="text-white font-semibold">{user.fullName?.split(' ')[0]}</span></span>
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

                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                        className="md:hidden w-9 h-9 rounded-lg bg-brand-600/70 border border-white/10 flex items-center justify-center hover:bg-brand-500/70 transition-colors"
                    >
                        {menuOpen ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                <PeraheraMarquee />

                {menuOpen && (
                    <div className="md:hidden relative z-10 border-t border-white/10 bg-brand-700 px-4 py-4 flex flex-col gap-4 text-sm font-medium">
                        <div className="flex items-center gap-3">
                            <select
                                value={i18n.language}
                                onChange={(e) => changeLanguage(e.target.value)}
                                aria-label="Change language"
                                className="flex-1 bg-brand-600/70 text-white text-sm rounded-lg px-2 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-400 cursor-pointer"
                            >
                                <option value="en">English</option>
                                <option value="si">සිංහල</option>
                                <option value="ta">தமிழ்</option>
                            </select>

                            <button
                                onClick={toggleTheme}
                                aria-label="Toggle dark mode"
                                className="w-9 h-9 flex-shrink-0 rounded-lg bg-brand-600/70 border border-white/10 flex items-center justify-center hover:bg-brand-500/70 transition-colors"
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
                        </div>

                        <Link to="/schedules" onClick={() => setMenuOpen(false)} className="text-brand-100 hover:text-accent-400 transition-colors">
                            {t('nav.buses')}
                        </Link>

                        {user && (
                            <Link to="/bookings" onClick={() => setMenuOpen(false)} className="text-brand-100 hover:text-accent-400 transition-colors">
                                {t('nav.myBookings')}
                            </Link>
                        )}

                        {user && user.role === 'ADMIN' && (
                            <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-brand-100 hover:text-accent-400 transition-colors">
                                {t('nav.admin')}
                            </Link>
                        )}

                        {user && (user.role === 'OPERATOR' || user.role === 'ADMIN') && (
                            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-brand-100 hover:text-accent-400 transition-colors">
                                {t('nav.dashboard')}
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center justify-between pt-3 border-t border-white/15">
                                <span className="text-brand-100">{t('nav.hi')}, <span className="text-white font-semibold">{user.fullName?.split(' ')[0]}</span></span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors font-semibold"
                                >
                                    {t('nav.logout')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 pt-3 border-t border-white/15">
                                <Link
                                    to="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 text-center text-brand-100 hover:text-accent-400 transition-colors py-2"
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 text-center bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-accent-700/30"
                                >
                                    {t('nav.signup')}
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </header>

            <main
                key={location.pathname}
                className={`flex-1 w-full fade-in ${isHome ? '' : 'max-w-6xl mx-auto px-4 py-8'}`}
            >
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