import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import TownAutocomplete from '../components/TownAutocomplete';
import { SkeletonCard } from '../components/Skeleton';
import Badge from '../components/Badge';
import DetailsModal from '../components/DetailsModal';
import { LOW_SEATS_THRESHOLD } from '../constants';
import { toBcp47Locale } from '../utils/localeDate';

const busTypeLabels = {
    NORMAL: 'Normal',
    SEMI_LUXURY: 'Semi Luxury',
    LUXURY: 'Luxury',
};

export default function Schedules() {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const [from, setFrom] = useState(searchParams.get('from') || '');
    const [to, setTo] = useState(searchParams.get('to') || '');
    const [date, setDate] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('departure');
    const [timetableSchedule, setTimetableSchedule] = useState(null);
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

    const locale = toBcp47Locale(i18n.language);

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleString(locale, {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit',
        });
    }

    function formatDateOnly(dateStr) {
        return new Date(dateStr).toLocaleString(locale, {
            weekday: 'short', month: 'short', day: 'numeric',
        });
    }

    function formatTime(dateStr) {
        return new Date(dateStr).toLocaleString(locale, {
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('schedules.busesFound', { count: schedules.length })}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold hidden sm:inline">{t('schedules.sortBy')}</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label={t('schedules.sortBy')}
                            className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                        >
                            <option value="departure">{t('schedules.sortDeparture')}</option>
                            <option value="price">{t('schedules.sortPrice')}</option>
                            <option value="duration">{t('schedules.sortDuration')}</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {sortedSchedules.map((s) => {
                    const [routeFrom, routeTo] = s.routeId.split('-');
                    const soldOut = s.availableSeats === 0;
                    const lowSeats = s.availableSeats > 0 && s.availableSeats <= LOW_SEATS_THRESHOLD;
                    const sameDay = new Date(s.departureTime).toDateString() === new Date(s.arrivalTime).toDateString();

                    return (
                        <div
                            key={s.id}
                            className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:shadow-brand-900/5 hover:border-brand-200 dark:hover:border-brand-500 transition-all"
                        >
                            <div className="p-5">
                                {/* Full-width header: route + tags */}
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <h2 className="font-display text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {routeFrom} <span className="text-gray-400 dark:text-gray-500 font-normal">→</span> {routeTo}
                                    </h2>
                                </div>
                                {(s.travelName || s.busType) && (
                                    <div className="flex items-center gap-2 flex-wrap mb-4">
                                        {s.travelName && <Badge variant="orange">{s.travelName.toUpperCase()}</Badge>}
                                        {s.busType && <Badge variant="brand">{busTypeLabels[s.busType] || s.busType}</Badge>}
                                    </div>
                                )}

                                <div className="flex flex-col lg:flex-row lg:items-stretch gap-5">
                                {/* Time strip */}
                                <div className="flex-1 min-w-0">
                                    <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50/50 dark:bg-gray-900/20 h-full">
                                        <div className="px-3 sm:px-4 py-3 min-w-0">
                                            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{t('schedules.departureLabel')}</p>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-0.5 truncate">{formatDateOnly(s.departureTime)}</p>
                                            <p className="font-display text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                                                {formatTime(s.departureTime)}
                                            </p>
                                        </div>
                                        <div className="px-2 sm:px-4 py-3 flex flex-col items-center justify-center text-center">
                                            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{t('schedules.durationLabel')}</p>
                                            <div className="flex items-center gap-1 text-brand-600 dark:text-brand-300 font-bold text-xs sm:text-sm whitespace-nowrap">
                                                <span>{formatDuration(durationMs(s))}</span>
                                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="px-3 sm:px-4 py-3 min-w-0 text-right">
                                            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{t('schedules.arrivalLabel')}</p>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-0.5 truncate">
                                                {sameDay ? t('schedules.sameDay') : formatDateOnly(s.arrivalTime)}
                                            </p>
                                            <p className="font-display text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                                                {formatTime(s.arrivalTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden lg:block w-px bg-gray-100 dark:bg-gray-700"></div>

                                {/* Seats, price, actions */}
                                <div className="flex flex-col gap-3 w-full lg:w-auto lg:flex-shrink-0 lg:justify-center">
                                    <div className="flex items-center justify-between lg:flex-col lg:items-end lg:gap-1.5">
                                        {typeof s.availableSeats === 'number' ? (
                                            <p className={`flex items-center gap-1.5 text-sm ${lowSeats ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-6.13a4 4 0 11-4 0 4 4 0 014 0zm6 2a4 4 0 11-2.83-3.83" />
                                                </svg>
                                                {soldOut ? (
                                                    t('schedules.fullyBooked')
                                                ) : (
                                                    <>
                                                        {t('schedules.availableSeats')} <span className="font-bold text-gray-900 dark:text-gray-100">{s.availableSeats}</span>
                                                        {typeof s.totalSeats === 'number' && <span> / {s.totalSeats}</span>}
                                                    </>
                                                )}
                                            </p>
                                        ) : <span />}
                                        <span className="text-xl sm:text-2xl font-bold text-brand-700 dark:text-brand-300">
                                            Rs. {s.fare}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 w-full">
                                        <button
                                            onClick={() => navigate(`/seats/${s.id}`)}
                                            disabled={soldOut}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-brand-900 font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm shadow-accent-600/20 disabled:shadow-none whitespace-nowrap"
                                        >
                                            {soldOut ? t('schedules.soldOut') : t('schedules.selectSeats')}
                                        </button>
                                        <button
                                            onClick={() => setTimetableSchedule(s)}
                                            aria-label={t('schedules.viewTimetableAria')}
                                            className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold px-3.5 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                                        >
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                            <span className="hidden sm:inline">{t('schedules.timetable')}</span>
                                        </button>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <DetailsModal
                open={!!timetableSchedule}
                onClose={() => setTimetableSchedule(null)}
                title={timetableSchedule ? timetableSchedule.routeId.replace('-', ' → ') : ''}
                rows={timetableSchedule ? [
                    { label: t('schedules.operator'), value: timetableSchedule.travelName },
                    { label: t('schedules.bus'), value: timetableSchedule.busModel },
                    { label: t('schedules.type'), value: busTypeLabels[timetableSchedule.busType] || timetableSchedule.busType },
                    { label: t('schedules.departureLabel'), value: formatDate(timetableSchedule.departureTime) },
                    { label: t('schedules.arrivalLabel'), value: formatDate(timetableSchedule.arrivalTime) },
                    { label: t('schedules.durationLabel'), value: formatDuration(durationMs(timetableSchedule)) },
                    { label: t('schedules.fare'), value: `Rs. ${timetableSchedule.fare}` },
                    { label: t('schedules.contact'), value: timetableSchedule.contactNumber },
                ] : []}
            />
        </div>
    );
}