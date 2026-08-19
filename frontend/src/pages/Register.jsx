import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/CEYSEAT.png';

export default function Register() {
    const { t } = useTranslation();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [nic, setNic] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const phonePattern = /^(0|\+94)7[0-9]{8}$/;
    const nicPattern = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!phonePattern.test(phone)) {
            setError(t('auth.invalidPhone'));
            return;
        }
        if (!nicPattern.test(nic)) {
            setError(t('auth.invalidNic'));
            return;
        }

        setLoading(true);
        try {
            await register(fullName, email, password, phone, nic);
            navigate('/schedules');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-sm mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-brand-900/5 border border-gray-100 dark:border-gray-700 p-8">
                <img src={logo} alt="CeySeat" className="h-24 w-auto mx-auto mb-5 rounded-lg" />
                <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 text-center">{t('auth.createAccount')}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center">{t('auth.registerSubtitle')}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.fullName')}</label>
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                        />
                    </div>

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
                            minLength={8}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('auth.minChars')}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.phone')}</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="07XXXXXXXX"
                            required
                            pattern="^(0|\+94)7[0-9]{8}$"
                            title={t('auth.invalidPhone')}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.nic')}</label>
                        <input
                            value={nic}
                            onChange={(e) => setNic(e.target.value)}
                            placeholder="200012345678 / 991234567V"
                            required
                            pattern="^([0-9]{9}[vVxX]|[0-9]{12})$"
                            title={t('auth.invalidNic')}
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
                        {loading ? t('auth.creatingAccount') : t('auth.register')}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    {t('auth.haveAccount')}{' '}
                    <Link to="/login" className="text-brand-600 dark:text-brand-300 font-semibold hover:underline">
                        {t('auth.logIn')}
                    </Link>
                </p>
            </div>
        </div>
    );
}