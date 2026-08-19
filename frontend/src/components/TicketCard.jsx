import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { toBcp47Locale } from '../utils/localeDate';
import logo from '../assets/CEYSEAT.png';

export default function TicketCard({
    groupBookingId,
    routeId,
    departureTime,
    arrivalTime,
    travelName,
    busModel,
    registrationNo,
    contactNumber,
    seatNumbers,
    amount,
}) {
    const { t, i18n } = useTranslation();
    const locale = toBcp47Locale(i18n.language);
    const ticketId = groupBookingId.slice(-8).toUpperCase();
    const qrValue = JSON.stringify({ groupBookingId, seats: seatNumbers });
    const [routeFrom, routeTo] = routeId ? routeId.split('-') : [];
    const dateTimeOpts = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const seatCount = seatNumbers?.length || 0;
    const seatLabel = t('payment.seat', { count: seatCount || 1 });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-brand-900/10 border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-brand-700 text-white px-6 py-4 flex items-center justify-between">
                <img src={logo} alt="CeySeat" className="h-8 w-auto bg-white rounded px-1.5 py-0.5" />
                <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-mono tracking-wide">
                    #{ticketId}
                </span>
            </div>

            {routeFrom && routeTo && (
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-display text-lg font-bold text-gray-900 dark:text-gray-100">
                        {routeFrom} <span className="text-gray-400 dark:text-gray-500 font-normal">→</span> {routeTo}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{t('payment.departure')}</p>
                            <p className="text-gray-900 dark:text-gray-100">{departureTime && new Date(departureTime).toLocaleString(locale, dateTimeOpts)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{t('payment.arrival')}</p>
                            <p className="text-gray-900 dark:text-gray-100">{arrivalTime && new Date(arrivalTime).toLocaleString(locale, dateTimeOpts)}</p>
                        </div>
                    </div>
                    {(travelName || busModel || registrationNo) && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                            {[travelName, busModel, registrationNo].filter(Boolean).join(' · ')}
                        </p>
                    )}
                    {contactNumber && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {contactNumber}
                        </p>
                    )}
                </div>
            )}

            <div className="relative p-6 flex flex-col items-center">
                <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-surface dark:bg-surface-dark"></div>
                <div className="absolute right-0 top-0 translate-x-1/2 w-6 h-6 rounded-full bg-surface dark:bg-surface-dark"></div>

                <div className="bg-white p-3 rounded-xl border border-gray-100 mb-4 shadow-sm">
                    <QRCodeSVG value={qrValue} size={160} fgColor="#551523" />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">{t('payment.showQr')}</p>

                <div className="w-full border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{seatLabel}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{seatNumbers?.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('payment.amountPaid')}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Rs. {amount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('payment.paymentId')}</span>
                        <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{groupBookingId.slice(-12)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">{t('payment.status')}</span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-green-600 dark:text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            {t('payment.confirmedStatus')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
