import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/CEYSEAT.png';

export default function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/schedules');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-sm mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-brand-900/5 border border-gray-100 dark:border-gray-700 p-8">
                <img src={logo} alt="CeySeat" className="h-24 w-auto mx-auto mb-5 rounded-lg" />
                <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 text-center">{t('auth.welcomeBack')}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center">{t('auth.loginSubtitle')}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    {error && (
                        <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 rounded-lg px-4 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm shadow-brand-900/10"
                    >
                        {loading ? t('auth.loggingIn') : t('auth.logIn')}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    {t('auth.noAccount')}{' '}
                    <Link to="/register" className="text-brand-600 dark:text-brand-300 font-semibold hover:underline">
                        {t('auth.register')}
                    </Link>
                </p>
            </div>
        </div>
    );
}