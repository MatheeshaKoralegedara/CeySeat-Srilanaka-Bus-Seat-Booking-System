import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock, MapPin, Loader2, ArrowRight } from 'lucide-react';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const routeId = searchParams.get('routeId');
    const date = searchParams.get('date');
    const navigate = useNavigate();

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!routeId || !date) {
            setError('Please provide a valid route and date to search.');
            setLoading(false);
            return;
        }

        const fetchSchedules = async () => {
            try {
                // Construct ISO start and end times to query the Backend ScheduleController
                const start = `${date}T00:00:00`;
                const end = `${date}T23:59:59`;

                const response = await api.get(`/schedules?routeId=${routeId}&start=${start}&end=${end}`);
                setSchedules(response.data);
            } catch (err) {
                setError('Failed to fetch schedules. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [routeId, date]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Available <span className="gradient-text">Buses</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Showing schedules for <strong>{new Date(date).toLocaleDateString()}</strong>
            </p>

            {error ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--error)' }}>
                    <p style={{ color: 'var(--error)' }}>{error}</p>
                </div>
            ) : schedules.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                    <BusIconPlaceholder />
                    <h3 style={{ marginTop: '1rem', color: 'var(--text-primary)' }}>No Buses found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Try searching for a different date or route.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {schedules.map(schedule => (
                        <div key={schedule.id} className="glass-panel" style={{
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ color: 'var(--accent-primary)', margin: 0 }}>
                                            {new Date(schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </h3>
                                        <ArrowRight size={16} color="var(--text-secondary)" />
                                        <h3 style={{ margin: 0 }}>
                                            {new Date(schedule.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </h3>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} /> Duration: {
                                            Math.round((new Date(schedule.arrivalTime) - new Date(schedule.departureTime)) / 60000 / 60)
                                        }h {
                                            Math.round(((new Date(schedule.arrivalTime) - new Date(schedule.departureTime)) / 60000) % 60)
                                        }m
                                    </p>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <h2 style={{ color: 'var(--success)', margin: '0 0 0.5rem 0' }}>Rs. {schedule.fare}</h2>
                                    <button
                                        onClick={() => navigate(`/booking/${schedule.id}`)}
                                        className="btn btn-primary"
                                    >
                                        Select Seats
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const BusIconPlaceholder = () => (
    <div style={{ width: '64px', height: '64px', margin: '0 auto', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
    </div>
);

export default SearchResults;
