import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import { SkeletonBlock } from '../components/Skeleton';
import StatusScreen from '../components/StatusScreen';
import TicketCard from '../components/TicketCard';

export default function Ticket() {
    const { t } = useTranslation();
    const { groupBookingId } = useParams();
    const [bookings, setBookings] = useState(null);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        client.get(`/bookings/${groupBookingId}`)
            .then((res) => setBookings(res.data))
            .catch((err) => {
                setLoadError(err.response?.data?.error || t('payment.loadErrorFallback'));
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupBookingId]);

    if (loadError) {
        return (
            <StatusScreen
                variant="error"
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M12 3l9 16.5H3L12 3z" />}
                title={t('payment.loadErrorTitle')}
                message={loadError}
                action={
                    <Link
                        to="/bookings"
                        className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
                    >
                        {t('payment.backToBookings')}
                    </Link>
                }
            />
        );
    }

    if (!bookings) {
        return (
            <div className="max-w-md mx-auto">
                <SkeletonBlock className="h-8 w-48 mb-6 mx-auto" />
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <SkeletonBlock className="h-40 w-40 mx-auto mb-6" />
                    <SkeletonBlock className="h-4 w-full mb-2" />
                    <SkeletonBlock className="h-4 w-full mb-2" />
                    <SkeletonBlock className="h-4 w-full" />
                </div>
            </div>
        );
    }

    if (bookings[0]?.status !== 'PAID') {
        return (
            <StatusScreen
                variant="error"
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M12 3l9 16.5H3L12 3z" />}
                title={t('ticket.notPaidTitle')}
                message={t('ticket.notPaidMessage')}
                action={
                    <Link
                        to="/bookings"
                        className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
                    >
                        {t('payment.backToBookings')}
                    </Link>
                }
            />
        );
    }

    const first = bookings[0];
    const seatNumbers = bookings.map((b) => b.seatNo);
    const amount = bookings.reduce((sum, b) => sum + b.fare, 0);

    return (
        <div className="max-w-md mx-auto">
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">{t('ticket.title')}</h1>

            <TicketCard
                groupBookingId={groupBookingId}
                routeId={first.routeId}
                departureTime={first.departureTime}
                arrivalTime={first.arrivalTime}
                travelName={first.travelName}
                busModel={first.busModel}
                registrationNo={first.registrationNo}
                contactNumber={first.contactNumber}
                seatNumbers={seatNumbers}
                amount={amount}
            />

            <div className="flex gap-3 mt-6 no-print">
                <button
                    onClick={() => window.print()}
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl transition-colors"
                >
                    {t('payment.download')}
                </button>
                <Link
                    to="/bookings"
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors text-center shadow-sm"
                >
                    {t('payment.backToBookings')}
                </Link>
            </div>
        </div>
    );
}
