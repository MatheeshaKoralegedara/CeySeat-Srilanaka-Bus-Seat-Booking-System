import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function Schedules() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        client.get('/schedules')
            .then((res) => setSchedules(res.data))
            .catch(() => setSchedules([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Available Buses</h2>
            {schedules.length === 0 && <p>No schedules available.</p>}
            {schedules.map((s) => (
                <div key={s.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 8 }}>
                    <p><strong>{s.routeId}</strong></p>
                    <p>{new Date(s.departureTime).toLocaleString()} → {new Date(s.arrivalTime).toLocaleString()}</p>
                    <p>Rs. {s.fare}</p>
                    <button onClick={() => navigate(`/seats/${s.id}`)}>Select Seats</button>
                </div>
            ))}
        </div>
    );
}