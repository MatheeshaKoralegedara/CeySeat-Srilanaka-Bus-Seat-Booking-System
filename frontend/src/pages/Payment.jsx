import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import { SkeletonBlock } from '../components/Skeleton';
import { QRCodeSVG } from 'qrcode.react';
import BookingSteps from '../components/BookingSteps';

function useCountdown(deadline) {
    const [remainingMs, setRemainingMs] = useState(null);

    useEffect(() => {
        if (!deadline) return;
        const target = new Date(deadline).getTime();

        function tick() {
            setRemainingMs(Math.max(0, target - Date.now()));
        }
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [deadline]);

    if (remainingMs === null) return null;
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds, expired: remainingMs <= 0 };
}

export default function Payment() {
    const { t } = useTranslation();
    const { bookingId: groupBookingId } = useParams();
    const [hashData, setHashData] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [status, setStatus] = useState('idle'); // idle | processing | success | error | dismissed

    const countdown = useCountdown(hashData?.reservedUntil);

    useEffect(() => {
        setLoadError('');
        setHashData(null);
        client.post('/payments/hash', { groupBookingId })
            .then((res) => setHashData(res.data))
            .catch((err) => {
                setLoadError(err.response?.data?.error || 'Could not load this booking for payment. It may have expired or already been paid.');
            });
    }, [groupBookingId]);

    useEffect(() => {
        if (window.payhere) return;
        if (document.getElementById('payhere-sdk')) return;

        const script = document.createElement('script');
        script.id = 'payhere-sdk';
        script.src = 'https://www.payhere.lk/lib/payhere.js';
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!window.payhere) return;

        window.payhere.onCompleted = function () {
            setStatus('success');
        };
        window.payhere.onDismissed = function () {
            setStatus('dismissed');
        };
        window.payhere.onError = function (error) {
            setStatus('error');
            console.error('PayHere error:', error);
        };
    }, [hashData]);

    function pay() {
        setStatus('processing');
        window.payhere.startPayment({
            sandbox: true,
            merchant_id: hashData.merchantId,
            notify_url: hashData.notifyUrl,
            order_id: hashData.orderId,
            items: 'Bus seat booking',
            amount: hashData.amount,
            currency: hashData.currency,
            first_name: 'Test',
            last_name: 'User',
            email: 'passenger@example.com',
            phone: '0771234567',
            address: 'Colombo',
            city: 'Colombo',
            country: 'Sri Lanka',
            hash: hashData.hash,
        });
    }

    if (loadError) {
        return (
            <div className="max-w-md mx-auto text-center py-16">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M12 3l9 16.5H3L12 3z" />
                    </svg>
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Can't Load This Payment</h1>
                <p className="text-gray-500 mb-8">{loadError}</p>
                <Link
                    to="/bookings"
                    className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
                >
                    Back to My Bookings
                </Link>
            </div>
        );
    }

    if (!hashData) {
        return (
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                    <SkeletonBlock className="h-4 w-24 mx-auto mb-2" />
                    <SkeletonBlock className="h-10 w-32 mx-auto mb-8" />
                    <SkeletonBlock className="h-14 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    const seatLabel = hashData.seatNumbers?.length > 1 ? 'Seats' : 'Seat';

    if (status === 'success') {
        const ticketId = groupBookingId.slice(-8).toUpperCase();
        const qrValue = JSON.stringify({ groupBookingId, orderId: hashData.orderId, seats: hashData.seatNumbers });

        return (
            <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">{t('payment.confirmed')}</h1>
                    <p className="text-gray-500">{t('payment.ticketReady')}</p>
                </div>

                {/* Ticket card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-brand-900/10 border border-gray-100 overflow-hidden">
                    <div className="bg-brand-700 text-white px-6 py-4 flex items-center justify-between">
                        <img src="/CEYSEAT.png" alt="CeySeat" className="h-8 w-auto bg-white rounded px-1.5 py-0.5" />
                        <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-mono tracking-wide">
                            #{ticketId}
                        </span>
                    </div>

                    <div className="relative p-6 flex flex-col items-center">
                        <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-[#f8f7f5]"></div>
                        <div className="absolute right-0 top-0 translate-x-1/2 w-6 h-6 rounded-full bg-[#f8f7f5]"></div>

                        <div className="bg-white p-3 rounded-xl border border-gray-100 mb-4 shadow-sm">
                            <QRCodeSVG value={qrValue} size={160} fgColor="#551523" />
                        </div>
                        <p className="text-xs text-gray-400 mb-6">{t('payment.showQr')}</p>

                        <div className="w-full border-t-2 border-dashed border-gray-200 pt-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">{seatLabel}</span>
                                <span className="font-semibold text-gray-900">{hashData.seatNumbers?.join(', ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('payment.amountPaid')}</span>
                                <span className="font-semibold text-gray-900">Rs. {hashData.amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('payment.paymentId')}</span>
                                <span className="font-mono text-xs text-gray-700">{hashData.orderId.slice(-12)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">{t('payment.status')}</span>
                                <span className="inline-flex items-center gap-1.5 font-semibold text-green-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    {t('payment.confirmedStatus')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
                    >
                        {t('payment.download')}
                    </button>
                    <Link
                        to="/schedules"
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors text-center shadow-sm"
                    >
                        {t('payment.bookAnother')}
                    </Link>
                </div>
            </div>
        );
    }

    if (status === 'dismissed' || status === 'error') {
        return (
            <div className="max-w-md mx-auto text-center py-16">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
                    {status === 'dismissed' ? 'Payment Cancelled' : 'Something Went Wrong'}
                </h1>
                <p className="text-gray-500 mb-8">
                    {status === 'dismissed'
                        ? 'You closed the payment window before completing checkout.'
                        : 'Your payment could not be processed. Please try again.'}
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm shadow-accent-600/25"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <BookingSteps current={2} />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                {hashData.seatNumbers?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                        {hashData.seatNumbers.map((s) => (
                            <span key={s} className="text-xs font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md">
                                {seatLabel === 'Seats' ? `Seat ${s}` : s}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-gray-500 text-sm mb-1">{t('payment.totalAmount')}</p>
                <p className="font-display text-4xl font-bold text-brand-700 mb-3">Rs. {hashData.amount}</p>

                {countdown && !countdown.expired && (
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full mb-5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                        </svg>
                        Seats held for {String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                    </p>
                )}
                {countdown && countdown.expired && (
                    <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-full mb-5 inline-block">
                        Your seat hold has expired
                    </p>
                )}
                <div />

                <button
                    onClick={pay}
                    disabled={status === 'processing' || countdown?.expired}
                    className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 disabled:text-gray-400 text-brand-900 font-semibold py-4 rounded-xl transition-colors shadow-md shadow-accent-600/25 disabled:shadow-none"
                >
                    {status === 'processing' ? t('payment.processing') : t('payment.payWith')}
                </button>

                <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {t('payment.secureNote')}
                </p>
            </div>
        </div>
    );
}
