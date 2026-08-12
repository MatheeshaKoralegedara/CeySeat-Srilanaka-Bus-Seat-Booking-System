import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TownAutocomplete from '../components/TownAutocomplete';

const popularRoutes = [
    { from: 'Colombo', to: 'Kandy', duration: '3h', fareFrom: 850 },
    { from: 'Colombo', to: 'Galle', duration: '2.5h', fareFrom: 750 },
    { from: 'Colombo', to: 'Jaffna', duration: '6h', fareFrom: 1800 },
    { from: 'Kandy', to: 'Ella', duration: '4h', fareFrom: 1200 },
];

export default function Home() {
    const { t } = useTranslation();
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const navigate = useNavigate();

    function search(e) {
        e?.preventDefault();
        if (!from || !to) return;
        navigate(`/schedules?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    }

    return (
        <div>
            {/* Hero */}
            <div className="relative bg-brand-700 rounded-3xl overflow-hidden mb-16 -mt-2">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 opacity-95"></div>
                <div className="relative px-8 py-16 md:py-24 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {t('home.heroTitle')}
                    </h1>
                    <p className="text-brand-100 text-lg mb-10 max-w-xl mx-auto">
                        {t('home.heroSubtitle')}
                    </p>

                    <form
                        onSubmit={search}
                        className="bg-white rounded-2xl shadow-xl p-4 md:p-6 max-w-2xl mx-auto flex flex-col md:flex-row gap-3"
                    >
                        <div className="flex-1 text-left">
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">{t('home.from')}</label>
                                <TownAutocomplete value={from} onChange={setFrom} placeholder="Colombo" label={t('home.from')} />
                        </div>
                    <div className="hidden md:block w-px bg-gray-200"></div>
                        <div className="flex-1 text-left">
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">{t('home.to')}</label>
                                <TownAutocomplete value={to} onChange={setTo} placeholder="Kandy" label={t('home.to')} />
                        </div>
                        <button
                            type="submit"
                            className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-8 py-3 rounded-xl transition-colors whitespace-nowrap"
                        >
                            {t('home.search')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 text-center">
                {[
                    { label: t('home.secure'), icon: '🔒' },
                    { label: t('home.instant'), icon: '⚡' },
                    { label: t('home.verified'), icon: '✓' },
                    { label: t('home.support'), icon: '💬' },
                ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-2">
                        <span className="text-3xl">{item.icon}</span>
                        <span className="text-sm font-medium text-gray-600">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Popular routes */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('home.popularRoutes')}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {popularRoutes.map((r) => (
                        <button
                            key={`${r.from}-${r.to}`}
                            onClick={() => navigate(`/schedules?from=${r.from}&to=${r.to}`)}
                            className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md hover:border-brand-300 transition-all"
                        >
                            <p className="font-semibold text-gray-900">{r.from} → {r.to}</p>
                            <p className="text-sm text-gray-500 mt-1">{r.duration} journey</p>
                            <p className="text-brand-700 font-bold mt-3">{t('home.fromPrice')} {r.fareFrom}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}