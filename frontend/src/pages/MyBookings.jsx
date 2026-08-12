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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

            {bookings.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500 text-lg mb-4">You haven't booked any trips yet.</p>
                    <Link
                        to="/schedules"
                        className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                        Browse Buses
                    </Link>
                </div>
            )}

            <div className="grid gap-4">
                {bookings.map((b) => (
                    <div
                        key={b.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between"
                    >
                        <div>
                            <p className="font-semibold text-gray-900">Seat {b.seatNo}</p>
                            <p className="text-sm text-gray-500">
                                {b.reservedUntil && new Date(b.reservedUntil).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                })}
                            </p>
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