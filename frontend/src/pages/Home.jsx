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

    const trustIcons = {
        secure: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
        ),
        instant: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" />
        ),
        verified: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        ),
        support: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.06 0-2.077-.162-3.02-.46L3 21l1.53-4.09A7.86 7.86 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        ),
    };

    return (
        <div>
            {/* Hero */}
            <div className="relative bg-brand-700 rounded-3xl overflow-hidden mb-16 -mt-2 shadow-xl shadow-brand-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900"></div>
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                        backgroundSize: '28px 28px',
                    }}
                ></div>
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-32 -left-16 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl"></div>

                <div className="relative px-8 py-16 md:py-24 text-center">
                    <span className="inline-block text-accent-400 text-xs font-bold tracking-widest uppercase mb-4 bg-white/10 px-3 py-1 rounded-full">
                        Sri Lanka's Trusted Bus Network
                    </span>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                        {t('home.heroTitle')}
                    </h1>
                    <p className="text-brand-100 text-lg mb-10 max-w-xl mx-auto">
                        {t('home.heroSubtitle')}
                    </p>

                    <form
                        onSubmit={search}
                        className="bg-white rounded-2xl shadow-2xl shadow-brand-900/30 p-4 md:p-6 max-w-2xl mx-auto flex flex-col md:flex-row gap-3"
                    >
                        <div className="flex-1 text-left">
                            <TownAutocomplete value={from} onChange={setFrom} placeholder="Colombo" label={t('home.from')} />
                        </div>
                        <div className="hidden md:block w-px bg-gray-200"></div>
                        <div className="flex-1 text-left">
                            <TownAutocomplete value={to} onChange={setTo} placeholder="Kandy" label={t('home.to')} />
                        </div>
                        <button
                            type="submit"
                            className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-8 py-3 rounded-xl transition-colors whitespace-nowrap shadow-md shadow-accent-600/30"
                        >
                            {t('home.search')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 text-center">
                {[
                    { key: 'secure', label: t('home.secure') },
                    { key: 'instant', label: t('home.instant') },
                    { key: 'verified', label: t('home.verified') },
                    { key: 'support', label: t('home.support') },
                ].map((item) => (
                    <div key={item.key} className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                {trustIcons[item.key]}
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Popular routes */}
            <div className="mb-16">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">{t('home.popularRoutes')}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {popularRoutes.map((r) => (
                        <button
                            key={`${r.from}-${r.to}`}
                            onClick={() => navigate(`/schedules?from=${r.from}&to=${r.to}`)}
                            className="group bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-lg hover:shadow-brand-900/5 hover:border-brand-300 hover:-translate-y-0.5 transition-all"
                        >
                            <p className="font-semibold text-gray-900 flex items-center justify-between">
                                {r.from} → {r.to}
                                <span className="text-accent-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{r.duration} journey</p>
                            <p className="text-brand-700 font-bold mt-3">{t('home.fromPrice')} {r.fareFrom}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}