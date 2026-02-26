import { useParams } from 'react-router-dom';

const Booking = () => {
    const { scheduleId } = useParams();

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
            <h2 style={{ marginBottom: '2rem' }}>Book <span className="gradient-text">Seats</span></h2>
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Seat selection and booking flow for Schedule ID: <strong>{scheduleId}</strong> coming soon.
                </p>
            </div>
        </div>
    );
};

export default Booking;
