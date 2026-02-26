import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Loader2, ArrowLeft, Armchair, CheckCircle } from 'lucide-react';

const Booking = () => {
    const { scheduleId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [schedule, setSchedule] = useState(null);
    const [bus, setBus] = useState(null);
    const [bookedSeats, setBookedSeats] = useState([]);

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchBookingDetails = async () => {
            try {
                const scheduleRes = await api.get(`/schedules/${scheduleId}`);
                const scheduleData = scheduleRes.data;
                setSchedule(scheduleData);

                const [busRes, bookedRes] = await Promise.all([
                    api.get(`/buses/${scheduleData.busId}`),
                    api.get(`/bookings/${scheduleId}/seats`)
                ]);

                setBus(busRes.data);
                setBookedSeats(bookedRes.data);
            } catch (err) {
                console.error("Failed to load layout", err);
                setError('Failed to load bus layout or schedule details.');
            } finally {
                setLoading(false);
            }
        };
        fetchBookingDetails();
    }, [scheduleId, isAuthenticated, navigate]);

    const toggleSeat = (seatId) => {
        if (bookedSeats.includes(seatId)) return;

        setSelectedSeats(prev =>
            prev.includes(seatId)
                ? prev.filter(s => s !== seatId)
                : [...prev, seatId]
        );
    };

    const handleBook = async () => {
        if (selectedSeats.length === 0) return;

        try {
            setLoading(true);
            await api.post('/bookings/reserve', {
                scheduleId: scheduleId,
                seatNumbers: selectedSeats
            });
            setBookingSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book seats.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !bookingSuccess) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            </div>
        );
    }

    if (bookingSuccess) {
        return (
            <div className="glass-panel animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
                <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
                <h2 style={{ marginBottom: '1rem' }}>Booking <span className="gradient-text">Confirmed!</span></h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    You have successfully booked {selectedSeats.length} seats.
                </p>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    Return to Home
                </button>
            </div>
        );
    }

    if (error || !bus) {
        return (
            <div style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--error)' }}>
                    <p style={{ color: 'var(--error)' }}>{error || 'Schedule not found'}</p>
                    <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginTop: '1rem' }}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '1000px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
                <ArrowLeft size={18} /> Back
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 300px', gap: '2rem' }}>

                {/* Seat Map Area */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Select Your Seats</h3>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                            <Armchair size={20} /> Available
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                            <Armchair size={20} /> Selected
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <Armchair size={20} /> Booked
                        </div>
                    </div>

                    <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '2rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid var(--border-glass)',
                        position: 'relative'
                    }}>
                        {/* Mock Steering Wheel */}
                        <div style={{ position: 'absolute', top: '2rem', right: '2rem', width: '40px', height: '40px', border: '4px solid var(--text-muted)', borderRadius: '50%', borderBottomColor: 'transparent' }}></div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '4rem', justifyItems: 'center' }}>
                            {/* 
                 Assuming a basic 2x2 layout up to totalSeats. 
                 Since bus layout format wasn't strictly defined, we generate a grid based on totalSeats string length.
               */}
                            {Array.from({ length: bus.totalSeats || 40 }).map((_, i) => {
                                const seatId = `S${i + 1}`;
                                const isBooked = bookedSeats.includes(seatId);
                                const isSelected = selectedSeats.includes(seatId);

                                let color = 'var(--text-secondary)';
                                if (isBooked) color = 'var(--text-muted)';
                                if (isSelected) color = 'var(--accent-primary)';

                                return (
                                    <button
                                        key={seatId}
                                        onClick={() => toggleSeat(seatId)}
                                        disabled={isBooked}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            background: isSelected ? 'rgba(255, 51, 102, 0.1)' : 'transparent',
                                            border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'}`,
                                            color: color,
                                            transition: 'all 0.2s ease',
                                            cursor: isBooked ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <Armchair size={32} />
                                        <div style={{ fontSize: '0.7rem', marginTop: '0.2rem', fontWeight: 'bold' }}>{seatId}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Trip Summary</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Bus</span>
                            <span style={{ fontWeight: '500' }}>{bus.registrationNo}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Fare per seat</span>
                            <span style={{ fontWeight: '500' }}>Rs. {schedule.fare}</span>
                        </div>
                        <hr style={{ borderColor: 'var(--border-glass)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Selected Seats</span>
                            <span style={{ fontWeight: '500', color: 'var(--accent-primary)' }}>{selectedSeats.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginTop: '1rem' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Total</strong>
                            <strong style={{ color: 'var(--success)' }}>Rs. {schedule.fare * selectedSeats.length}</strong>
                        </div>
                    </div>

                    <button
                        onClick={handleBook}
                        disabled={selectedSeats.length === 0}
                        className="btn btn-primary btn-block"
                    >
                        Confirm & Pay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Booking;
