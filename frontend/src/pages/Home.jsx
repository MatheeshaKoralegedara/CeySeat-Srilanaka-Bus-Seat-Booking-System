import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TownAutocomplete from '../components/TownAutocomplete';
import heroBanner from '../assets/home-hero.webp';

const destinationImages = {
    Kandy: 'https://images.unsplash.com/photo-1737008233483-20585f5fbc62',
    Galle: 'https://images.unsplash.com/photo-1566299597203-225f611b865f',
    Jaffna: 'https://images.unsplash.com/photo-1725680968792-c8dce6d6cf18',
    Ella: 'https://images.unsplash.com/photo-1580635849305-4399d586ac5c',
};

const popularRoutes = [
    { from: 'Colombo', to: 'Kandy', duration: '3h', fareFrom: 850 },
    { from: 'Colombo', to: 'Galle', duration: '2.5h', fareFrom: 750 },
    { from: 'Colombo', to: 'Jaffna', duration: '6h', fareFrom: 1800 },
    { from: 'Kandy', to: 'Ella', duration: '4h', fareFrom: 1200 },
];

const stats = [
    { value: '50,000+', label: 'Happy Travelers' },
    { value: '120+', label: 'Routes Covered' },
    { value: '30+', label: 'Buses Listed' },
    { value: '24/7', label: 'Customer Support' },
];

const howItWorks = [
    {
        title: 'Search Your Route',
        desc: 'Pick where you\'re going and when — we show every available bus instantly.',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        ),
    },
    {
        title: 'Pick Your Seat',
        desc: 'A real seat map, live availability, and gender-aware seating for comfort.',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7a2 2 0 012-2h2a2 2 0 012 2v10m-9 0h12a2 2 0 002-2v-2H5v2a2 2 0 002 2z" />
        ),
    },
    {
        title: 'Pay & Travel',
        desc: 'Secure checkout with instant e-ticket and QR code — no printing needed.',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        ),
    },
];

export default function Home() {
    const { t } = useTranslation();
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [searchError, setSearchError] = useState('');
    const navigate = useNavigate();

    function search(e) {
        e?.preventDefault();
        if (!from || !to) {
            setSearchError('Please choose both a departure and destination town.');
            return;
        }
        setSearchError('');
        navigate(`/schedules?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    }

    return (
        <div>
            {/* Hero — full-bleed, edge to edge, navbar overlays on top */}
            <div className="relative w-full min-h-[560px] md:min-h-[680px] flex items-center overflow-hidden">
                <img
                    src={heroBanner}
                    alt="CeySeat — Discover Sri Lanka's Wonders"
                    className="absolute inset-0 w-full h-full object-cover object-[center_50%]"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/75 via-brand-900/50 to-brand-900/40"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-900/40 via-transparent to-brand-900/50"></div>

                <div className="relative z-10 w-full max-w-3xl mx-auto px-6 md:px-10 pt-28 md:pt-24 pb-16 text-center">
                    <span className="inline-flex items-center gap-2 text-accent-400 text-xs font-bold tracking-widest uppercase mb-4 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                       Sri Lanka's Trusted Bus Network
                    </span>
                    <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                        {t('home.heroTitle')}
                    </h1>
                    <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto drop-shadow">
                        {t('home.heroSubtitle')}
                    </p>

                    {/* Opaque search card, floating inside the hero */}
                    <form
                        onSubmit={search}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-brand-900/50 p-4 md:p-6 max-w-2xl mx-auto flex flex-col md:flex-row gap-3 text-left"
                    >
                        <div className="flex-1">
                            <TownAutocomplete value={from} onChange={setFrom} placeholder="Colombo" label={t('home.from')} />
                        </div>
                        <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex-1">
                            <TownAutocomplete value={to} onChange={setTo} placeholder="Kandy" label={t('home.to')} />
                        </div>
                        <button
                            type="submit"
                            className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-8 py-3 rounded-xl transition-all whitespace-nowrap shadow-md shadow-accent-600/30 hover:scale-[1.03] active:scale-95 self-center md:self-stretch"
                        >
                            {t('home.search')}
                        </button>
                    </form>
                    {searchError && (
                        <p role="alert" className="text-sm text-red-100 bg-red-900/40 border border-red-400/30 rounded-lg px-4 py-2 max-w-2xl mx-auto mt-3">
                            {searchError}
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Trust stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 text-center">
                    {stats.map((s) => (
                        <div key={s.label}>
                            <p className="font-display text-3xl md:text-4xl font-bold text-brand-700 dark:text-brand-300">{s.value}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* How it works */}
                <div className="mb-16">
                    <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">How CeySeat Works</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Book your seat in three simple steps</p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {howItWorks.map((step, i) => (
                            <div key={step.title} className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-brand-900/10 hover:-translate-y-1 hover:border-brand-200 dark:hover:border-brand-500 transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                        {step.icon}
                                    </svg>
                                </div>
                                <span className="absolute top-4 right-5 font-display text-3xl font-bold text-gray-100 dark:text-gray-700">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{step.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular routes — visual destination cards */}
                <div>
                    <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('home.popularRoutes')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Book the journey, not just the ticket</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {popularRoutes.map((r) => (
                            <button
                                key={`${r.from}-${r.to}`}
                                onClick={() => navigate(`/schedules?from=${r.from}&to=${r.to}`)}
                                aria-label={`Book ${r.from} to ${r.to}`}
                                className="group relative h-64 rounded-2xl overflow-hidden text-left shadow-md shadow-brand-900/10 hover:shadow-2xl hover:shadow-brand-900/25 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 transition-all duration-300"
                            >
                                <img
                                    src={`${destinationImages[r.to]}?w=600&q=75&auto=format&fit=crop`}
                                    alt={r.to}
                                    loading="lazy"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/20 to-transparent"></div>

                                <div className="relative h-full flex flex-col justify-end p-5">
                                    <p className="text-xs font-semibold text-accent-400 uppercase tracking-wide mb-1">{r.from} →</p>
                                    <p className="font-display text-2xl font-bold text-white mb-1 drop-shadow">{r.to}</p>
                                    <p className="text-white/80 text-sm mb-3">{r.duration} journey</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-white">{t('home.fromPrice')} {r.fareFrom}</span>
                                        <span className="w-8 h-8 rounded-full bg-accent-500 text-brand-900 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
