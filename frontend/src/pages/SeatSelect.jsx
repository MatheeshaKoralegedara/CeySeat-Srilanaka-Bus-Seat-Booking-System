import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SeatSelect() {
    const { scheduleId } = useParams();
    const [bookedSeats, setBookedSeats] = useState([]);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');
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
        try {
            const res = await client.post('/bookings/reserve', {
                scheduleId,
                seatNumbers: [selected],
            });
            navigate(`/payment/${res.data[0].id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Could not reserve seat');
        }
    }

    // Adjust to match your actual bus's seat layout
    const allSeats = ['A1', 'A2', 'B1', 'B2', 'B3', 'B4'];

    return (
        <div>
            <h2>Select a Seat</h2>
            <div style={{ display: 'flex', gap: 8 }}>
                {allSeats.map((seat) => {
                    const taken = bookedSeats.includes(seat);
                    return (
                        <button key={seat} disabled={taken}
                            onClick={() => setSelected(seat)}
                            style={{
                                background: taken ? '#ccc' : selected === seat ? '#4CAF50' : '#fff',
                                padding: 12,
                            }}>
                            {seat}
                        </button>
                    );
                })}
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button disabled={!selected} onClick={reserve}>Reserve {selected}</button>
        </div>
    );
}