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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(fullName, email, password, phone);
            navigate('/schedules');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-sm mx-auto">
            <div className="bg-white rounded-2xl shadow-lg shadow-brand-900/5 border border-gray-100 p-8">
                <img src={logo} alt="CeySeat" className="h-24 w-auto mx-auto mb-5" />
                <h1 className="font-display text-2xl font-bold text-gray-900 mb-1 text-center">{t('auth.createAccount')}</h1>
                <p className="text-gray-500 text-sm mb-6 text-center">{t('auth.registerSubtitle')}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label>
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                        />
                        <p className="text-xs text-gray-400 mt-1">{t('auth.minChars')}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone')}</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="07XXXXXXXX"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm shadow-brand-900/10"
                    >
                        {loading ? t('auth.creatingAccount') : t('auth.register')}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    {t('auth.haveAccount')}{' '}
                    <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                        {t('auth.logIn')}
                    </Link>
                </p>
            </div>
        </div>
    );
}