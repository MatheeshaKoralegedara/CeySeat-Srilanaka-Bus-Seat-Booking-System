import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import TownAutocomplete from '../components/TownAutocomplete';
import { SkeletonCard } from '../components/Skeleton';

const busTypeLabels = {
    NORMAL: 'Normal',
    SEMI_LUXURY: 'Semi Luxury',
    LUXURY: 'Luxury',
};

export default function Schedules() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [from, setFrom] = useState(searchParams.get('from') || '');
    const [to, setTo] = useState(searchParams.get('to') || '');
    const [date, setDate] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('departure');
    const navigate = useNavigate();

    function search() {
        setLoading(true);
        const routeId = from.trim() && to.trim() ? `${from.trim()}-${to.trim()}` : '';
        const params = routeId ? { routeId } : {};
        client.get('/schedules', { params })
            .then((res) => {
                let results = res.data;
                if (date) {
                    results = results.filter((s) =>
                        s.departureTime.startsWith(date)
                    );
                }
                setSchedules(results);
            })
            .catch(() => setSchedules([]))
            .finally(() => setLoading(false));
    }

    useEffect(() => { search(); }, []);

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit',
        });
    }

    function durationMs(s) {
        return new Date(s.arrivalTime) - new Date(s.departureTime);
    }

    function formatDuration(ms) {
        const totalMinutes = Math.round(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }

    const sortedSchedules = [...schedules].sort((a, b) => {
        if (sortBy === 'price') return a.fare - b.fare;
        if (sortBy === 'duration') return durationMs(a) - durationMs(b);
        return new Date(a.departureTime) - new Date(b.departureTime);
    });

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('schedules.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('schedules.subtitle')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div>
                        <TownAutocomplete value={from} onChange={setFrom} placeholder="Colombo" label={t('home.from')} />
                    </div>
                    <div>
                        <TownAutocomplete value={to} onChange={setTo} placeholder="Kandy" label={t('home.to')} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">{t('schedules.date')}</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <div>
                        <button
                            onClick={search}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm"
                        >
                            {t('schedules.search')}
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="grid gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {!loading && schedules.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">{t('schedules.noResults')}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{t('schedules.tryDifferent')}</p>
                </div>
            )}

            {!loading && schedules.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{schedules.length} bus{schedules.length > 1 ? 'es' : ''} found</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold hidden sm:inline">Sort by</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                        >
                            <option value="departure">Earliest Departure</option>
                            <option value="price">Lowest Price</option>
                            <option value="duration">Shortest Duration</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {sortedSchedules.map((s) => (
                    <div
                        key={s.id}
                        className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between hover:shadow-lg hover:shadow-brand-900/5 hover:border-brand-200 dark:hover:border-brand-500 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex w-11 h-11 rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        {s.routeId}
                                    </h2>
                                    {s.busType && (
                                        <span className="text-xs font-semibold bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 px-2 py-0.5 rounded-full">
                                            {busTypeLabels[s.busType] || s.busType}
                                        </span>
                                    )}
                                </div>
                                {(s.travelName || s.busModel) && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                        {s.travelName}{s.travelName && s.busModel ? ' · ' : ''}{s.busModel}
                                    </p>
                                )}
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {formatDate(s.departureTime)} → {formatDate(s.arrivalTime)}
                                    <span className="text-gray-400 dark:text-gray-500"> · {formatDuration(durationMs(s))}</span>
                                </p>
                                {typeof s.availableSeats === 'number' && (
                                    <p className={`text-xs font-semibold mt-1 ${s.availableSeats <= 8 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {s.availableSeats > 0 ? `${s.availableSeats} seats left` : 'Fully booked'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                            <span className="text-2xl font-bold text-brand-700 dark:text-brand-300">
                                Rs. {s.fare}
                            </span>
                            <button
                                onClick={() => navigate(`/seats/${s.id}`)}
                                disabled={s.availableSeats === 0}
                                className="bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-brand-900 font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm shadow-accent-600/20 disabled:shadow-none"
                            >
                                {s.availableSeats === 0 ? 'Sold Out' : t('schedules.selectSeats')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}