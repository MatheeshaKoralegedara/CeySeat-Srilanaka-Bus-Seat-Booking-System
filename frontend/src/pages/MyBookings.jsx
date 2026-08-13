import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { SkeletonBlock, SkeletonCard } from '../components/Skeleton';

const statusStyles = {
    PAID: 'bg-green-100 text-green-700',
    RESERVED: 'bg-amber-100 text-amber-700',
    EXPIRED: 'bg-gray-100 text-gray-500',
    CANCELLED: 'bg-red-100 text-red-600',
};

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

    return (
        <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

            {bookings.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-lg mb-4">You haven't booked any trips yet.</p>
                    <Link
                        to="/schedules"
                        className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
                    >
                        Browse Buses
                    </Link>
                </div>
            )}

            <div className="grid gap-4">
                {bookings.map((b) => (
                    <div
                        key={b.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between hover:shadow-md hover:border-brand-200 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                {b.seatNo}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Seat {b.seatNo}</p>
                                <p className="text-sm text-gray-500">
                                    {b.reservedUntil && new Date(b.reservedUntil).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="font-bold text-brand-700">Rs. {b.fare}</span>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[b.status] || 'bg-gray-100 text-gray-500'}`}>
                                {b.status}
                            </span>
                            {b.status === 'RESERVED' && (
                                <Link
                                    to={`/payment/${b.id}`}
                                    className="text-sm text-accent-600 font-semibold hover:underline"
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