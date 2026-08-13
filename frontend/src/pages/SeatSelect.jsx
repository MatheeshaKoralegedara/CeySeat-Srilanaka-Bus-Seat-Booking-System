import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import { SkeletonBlock } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import GenderModal from '../components/GenderModal';
import BookingSteps from '../components/BookingSteps';

const MAX_SEATS = 6;

function groupByRow(seatLayout) {
    const rows = {};
    seatLayout.forEach((seat) => {
        if (!rows[seat.row]) rows[seat.row] = [];
        rows[seat.row].push(seat);
    });
    return Object.keys(rows)
        .sort((a, b) => Number(a) - Number(b))
        .map((rowNum) => rows[rowNum]);
}

export default function SeatSelect() {
    const { t } = useTranslation();
    const { scheduleId } = useParams();
    const [seatLayout, setSeatLayout] = useState([]);
    const [busInfo, setBusInfo] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [seatGenders, setSeatGenders] = useState({});
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [reserving, setReserving] = useState(false);
    const [showGenderModal, setShowGenderModal] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const scheduleRes = await client.get(`/schedules/${scheduleId}`);
                const busRes = await client.get(`/buses/${scheduleRes.data.busId}`);
                const seatsRes = await client.get(`/bookings/${scheduleId}/seats`);

                setSchedule(scheduleRes.data);
                setBusInfo(busRes.data);
                setSeatLayout(busRes.data.seatLayout || []);
                setBookedSeats(seatsRes.data.map((b) => b.seatNo));
                const genderMap = {};
                seatsRes.data.forEach((b) => { genderMap[b.seatNo] = b.passengerGender; });
                setSeatGenders(genderMap);
            } catch (err) {
                setError('Could not load seat map for this bus.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [scheduleId]);

    function toggleSeat(seatNo) {
        setSelectedSeats((prev) => {
            if (prev.includes(seatNo)) return prev.filter((s) => s !== seatNo);
            if (prev.length >= MAX_SEATS) return prev;
            return [...prev, seatNo];
        });
    }

    function handleReserveClick() {
        if (!user) {
            navigate('/login');
            return;
        }
        setShowGenderModal(true);
    }

    async function confirmReserve(passengerGenders) {
        setShowGenderModal(false);
        setError('');
        setReserving(true);
        try {
            const res = await client.post('/bookings/reserve', {
                scheduleId,
                seatNumbers: selectedSeats,
                passengerGenders,
            });
            navigate(`/payment/${res.data[0].groupBookingId}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Could not reserve seat(s)');
            setReserving(false);
        }
    }

    function seatState(seatNo) {
        if (bookedSeats.includes(seatNo)) return 'taken';
        if (selectedSeats.includes(seatNo)) return 'selected';
        return 'available';
    }

    const seatStyles = {
        available: 'bg-white border-2 border-gray-300 text-gray-700 hover:border-brand-500 hover:bg-brand-50 hover:-translate-y-0.5 cursor-pointer shadow-sm',
        selected: 'bg-brand-600 border-2 border-brand-600 text-white cursor-pointer shadow-md shadow-brand-600/30 scale-105',
        taken: 'bg-gray-100 border-2 border-gray-100 text-gray-300 cursor-not-allowed',
    };

    const totalSeats = seatLayout.length;
    const seatsLeft = totalSeats - bookedSeats.length;
    const fare = schedule?.fare || 0;
    const total = fare * selectedSeats.length;

    if (loading) {
        return (
            <div className="max-w-md mx-auto">
                <SkeletonBlock className="h-8 w-48 mb-2" />
                <SkeletonBlock className="h-4 w-32 mb-8" />
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="flex flex-col gap-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex justify-center gap-3">
                                <SkeletonBlock className="w-11 h-11" />
                                <SkeletonBlock className="w-11 h-11" />
                                <div className="w-6" />
                                <SkeletonBlock className="w-11 h-11" />
                                <SkeletonBlock className="w-11 h-11" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (seatLayout.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 max-w-md mx-auto">
                <p className="text-gray-500">Seat layout unavailable for this bus.</p>
            </div>
        );
    }

    const rows = groupByRow(seatLayout);

    return (
        <div className="max-w-md mx-auto pb-28">
            <BookingSteps current={1} />

            <div className="flex items-center justify-between mb-1">
                <h1 className="font-display text-2xl font-bold text-gray-900">{t('seats.title')}</h1>
                {seatsLeft <= 8 && (
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                        Only {seatsLeft} seats left
                    </span>
                )}
            </div>
            <p className="text-gray-500 text-sm mb-8">
                {busInfo?.model} · {busInfo?.totalSeats} seats
                {selectedSeats.length < MAX_SEATS ? '' : ` · max ${MAX_SEATS} seats per booking`}
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex justify-end mb-4 pr-1">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="8" />
                            <path strokeLinecap="round" d="M12 4v4m0 8v4m8-8h-4M8 12H4" />
                        </svg>
                        {t('seats.driver')}
                    </div>
                </div>

                <div className="flex flex-col gap-2 mb-6">
                    {rows.map((rowSeats, i) => {
                        const isRearBench = rowSeats[0]?.side === 'rear';

                        if (isRearBench) {
                            return (
                                <div key={i} className="flex justify-center gap-2 mt-3 pt-3 border-t border-dashed border-gray-200">
                                    {rowSeats.map((seat) => {
                                        const state = seatState(seat.seatNo);
                                        return (
                                            <button
                                                key={seat.seatNo}
                                                disabled={state === 'taken'}
                                                onClick={() => toggleSeat(seat.seatNo)}
                                                className={`w-11 h-11 rounded-lg font-semibold text-xs transition-all relative ${seatStyles[state]}`}
                                            >
                                                {seat.seatNo}
                                                {state === 'taken' && seatGenders[seat.seatNo] && (
                                                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                                        seatGenders[seat.seatNo] === 'FEMALE' ? 'bg-pink-500' : 'bg-blue-500'
                                                    }`} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        }

                        const left = rowSeats.filter((s) => s.side === 'left');
                        const right = rowSeats.filter((s) => s.side === 'right');

                        return (
                            <div key={i} className="flex items-center justify-center gap-3">
                                <div className="flex gap-2">
                                    {left.map((seat) => {
                                        const state = seatState(seat.seatNo);
                                        return (
                                            <button
                                                key={seat.seatNo}
                                                disabled={state === 'taken'}
                                                onClick={() => toggleSeat(seat.seatNo)}
                                                className={`w-11 h-11 rounded-lg font-semibold text-xs transition-all relative ${seatStyles[state]}`}
                                            >
                                                {seat.seatNo}
                                                {state === 'taken' && seatGenders[seat.seatNo] && (
                                                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                                        seatGenders[seat.seatNo] === 'FEMALE' ? 'bg-pink-500' : 'bg-blue-500'
                                                    }`} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="w-6"></div> {/* aisle */}

                                <div className="flex gap-2">
                                    {right.map((seat) => {
                                        const state = seatState(seat.seatNo);
                                        return (
                                            <button
                                                key={seat.seatNo}
                                                disabled={state === 'taken'}
                                                onClick={() => toggleSeat(seat.seatNo)}
                                                className={`w-11 h-11 rounded-lg font-semibold text-xs transition-all relative ${seatStyles[state]}`}
                                            >
                                                {seat.seatNo}
                                                {state === 'taken' && seatGenders[seat.seatNo] && (
                                                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                                        seatGenders[seat.seatNo] === 'FEMALE' ? 'bg-pink-500' : 'bg-blue-500'
                                                    }`} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white"></div>
                        {t('seats.available')}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-brand-600"></div>
                        {t('seats.selected')}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-200"></div>
                        {t('seats.taken')}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                        Female
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        Male
                    </div>
                </div>
            </div>

            {error && (
                <p className="text-red-600 text-sm mt-4 text-center bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</p>
            )}

            {/* Sticky selection summary bar */}
            <div className="fixed bottom-0 left-0 right-0 z-20">
                <div className="max-w-md mx-auto px-4 pb-4">
                    <div className="bg-white rounded-2xl shadow-2xl shadow-brand-900/20 border border-gray-200 p-4">
                        {selectedSeats.length > 0 ? (
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedSeats.map((s) => (
                                        <span key={s} className="text-xs font-bold bg-brand-50 text-brand-700 px-2 py-1 rounded-md">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-right flex-shrink-0 pl-3">
                                    <p className="text-xs text-gray-400">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
                                    <p className="font-display text-lg font-bold text-brand-700">Rs. {total}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center mb-3">{t('seats.selectToContinue')}</p>
                        )}
                        <button
                            disabled={selectedSeats.length === 0 || reserving}
                            onClick={handleReserveClick}
                            className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-brand-900 font-semibold py-3.5 rounded-xl transition-colors shadow-md shadow-accent-600/25 disabled:shadow-none"
                        >
                            {reserving
                                ? t('seats.reserving')
                                : selectedSeats.length > 0
                                ? `${t('seats.reserveSeat')} · Rs. ${total}`
                                : t('seats.selectToContinue')}
                        </button>
                    </div>
                </div>
            </div>

            <GenderModal
                open={showGenderModal}
                seats={selectedSeats}
                onConfirm={confirmReserve}
                onCancel={() => setShowGenderModal(false)}
            />
        </div>
    );
}
