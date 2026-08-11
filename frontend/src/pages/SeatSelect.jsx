import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SeatSelect() {
    const { scheduleId } = useParams();
    const [bookedSeats, setBookedSeats] = useState([]);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');
    const [reserving, setReserving] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        client.get(`/bookings/${scheduleId}/seats`)
            .then((res) => setBookedSeats(res.data.map((b) => b.seatNo)));
    }, [scheduleId]);

    async function reserve() {
        if (!user) {
            navigate('/login');
            return;
        }
        setError('');
        setReserving(true);
        try {
            const res = await client.post('/bookings/reserve', {
                scheduleId,
                seatNumbers: [selected],
            });
            navigate(`/payment/${res.data[0].id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Could not reserve seat');
            setReserving(false);
        }
    }

    // Adjust to match a real bus's seat layout — this is a placeholder grid
    const allSeats = ['A1', 'A2', 'B1', 'B2', 'B3', 'B4'];

    function seatState(seat) {
        if (bookedSeats.includes(seat)) return 'taken';
        if (selected === seat) return 'selected';
        return 'available';
    }

    const seatStyles = {
        available: 'bg-white border-2 border-gray-300 text-gray-700 hover:border-brand-500 hover:bg-brand-50 cursor-pointer',
        selected: 'bg-brand-600 border-2 border-brand-600 text-white cursor-pointer',
        taken: 'bg-gray-200 border-2 border-gray-200 text-gray-400 cursor-not-allowed',
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Select your seat</h1>
            <p className="text-gray-500 text-sm mb-8">Tap an available seat to select it</p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                {/* Driver indicator */}
                <div className="flex justify-end mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        🚌
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {allSeats.map((seat) => {
                        const state = seatState(seat);
                        return (
                            <button
                                key={seat}
                                disabled={state === 'taken'}
                                onClick={() => setSelected(seat)}
                                className={`h-14 rounded-lg font-semibold text-sm transition-colors ${seatStyles[state]}`}
                            >
                                {seat}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white"></div>
                        Available
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-brand-600"></div>
                        Selected
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-200"></div>
                        Taken
                    </div>
                </div>
            </div>

            {error && (
                <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
            )}

            <button
                disabled={!selected || reserving}
                onClick={reserve}
                className="w-full mt-6 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-brand-900 font-semibold py-4 rounded-xl transition-colors"
            >
                {reserving ? 'Reserving...' : selected ? `Reserve Seat ${selected}` : 'Select a seat to continue'}
            </button>
        </div>
    );
}