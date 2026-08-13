import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import TownAutocomplete from '../components/TownAutocomplete';
import { SkeletonCard } from '../components/Skeleton';

export default function Schedules() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [from, setFrom] = useState(searchParams.get('from') || '');
    const [to, setTo] = useState(searchParams.get('to') || '');
    const [date, setDate] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
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

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">{t('schedules.title')}</h1>
                <p className="text-gray-500">{t('schedules.subtitle')}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div>
                        <TownAutocomplete value={from} onChange={setFrom} placeholder="Colombo" label={t('home.from')} />
                    </div>
                    <div>
                        <TownAutocomplete value={to} onChange={setTo} placeholder="Kandy" label={t('home.to')} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">{t('schedules.date')}</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500 text-lg">{t('schedules.noResults')}</p>
                    <p className="text-gray-400 text-sm mt-1">{t('schedules.tryDifferent')}</p>
                </div>
            )}

            <div className="grid gap-4">
                {schedules.map((s) => (
                    <div
                        key={s.id}
                        className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between hover:shadow-lg hover:shadow-brand-900/5 hover:border-brand-200 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex w-11 h-11 rounded-lg bg-brand-50 text-brand-600 items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-display text-xl font-semibold text-gray-900 mb-1">
                                    {s.routeId}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {formatDate(s.departureTime)} → {formatDate(s.arrivalTime)}
                                </p>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                            <span className="text-2xl font-bold text-brand-700">
                                Rs. {s.fare}
                            </span>
                            <button
                                onClick={() => navigate(`/seats/${s.id}`)}
                                className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm shadow-accent-600/20"
                            >
                                {t('schedules.selectSeats')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}