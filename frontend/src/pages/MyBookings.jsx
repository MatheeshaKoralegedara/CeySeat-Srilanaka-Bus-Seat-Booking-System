import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { SkeletonBlock, SkeletonCard } from '../components/Skeleton';

const statusStyles = {
    PAID: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400',
    RESERVED: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
    EXPIRED: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    CANCELLED: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400',
};

function groupBookings(bookings) {
    const groups = new Map();
    for (const b of bookings) {
        const key = b.groupBookingId || b.id;
        if (!groups.has(key)) {
            groups.set(key, { groupBookingId: key, seats: [], status: b.status, reservedUntil: b.reservedUntil, totalFare: 0, firstId: b.id });
        }
        const g = groups.get(key);
        g.seats.push(b.seatNo);
        g.totalFare += b.fare;
        // If any seat in the group is still RESERVED, treat the whole group as RESERVED for display.
        if (b.status === 'RESERVED') g.status = 'RESERVED';
    }
    return Array.from(groups.values());
}

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.get('/bookings/my')
            .then((res) => setBookings(res.data))
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div>
                <SkeletonBlock className="h-9 w-48 mb-8" />
                <div className="grid gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    const groups = groupBookings(bookings).sort((a, b) =>
        new Date(b.reservedUntil || 0) - new Date(a.reservedUntil || 0)
    );

    return (
        <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">My Bookings</h1>

            {groups.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="w-14 h-14 rounded-xl bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">You haven't booked any trips yet.</p>
                    <Link
                        to="/schedules"
                        className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
                    >
                        Browse Buses
                    </Link>
                </div>
            )}

            <div className="grid gap-4">
                {groups.map((g) => (
                    <div
                        key={g.groupBookingId}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-wrap items-center justify-between gap-4 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-500 transition-all"
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="flex -space-x-2 flex-shrink-0">
                                {g.seats.slice(0, 3).map((seatNo) => (
                                    <div
                                        key={seatNo}
                                        className="w-11 h-11 rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 border-2 border-white dark:border-gray-800 flex items-center justify-center font-bold text-xs"
                                    >
                                        {seatNo}
                                    </div>
                                ))}
                                {g.seats.length > 3 && (
                                    <div className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-2 border-white dark:border-gray-800 flex items-center justify-center font-bold text-xs">
                                        +{g.seats.length - 3}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {g.seats.length > 1 ? `${g.seats.length} seats` : 'Seat'} {g.seats.length === 1 ? g.seats[0] : `(${g.seats.join(', ')})`}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {g.reservedUntil && new Date(g.reservedUntil).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <span className="font-bold text-brand-700 dark:text-brand-300">Rs. {g.totalFare}</span>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[g.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                {g.status}
                            </span>
                            {g.status === 'RESERVED' && (
                                <Link
                                    to={`/payment/${g.groupBookingId}`}
                                    className="text-sm text-accent-600 dark:text-accent-400 font-semibold hover:underline"
                                >
                                    Pay Now
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
