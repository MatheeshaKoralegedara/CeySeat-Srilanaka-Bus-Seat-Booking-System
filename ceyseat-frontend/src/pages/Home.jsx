import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Bus, Map, Clock, Search } from 'lucide-react';

const Home = () => {
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState('');
    const [date, setDate] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch available routes for the dropdown
        const fetchRoutes = async () => {
            try {
                const response = await api.get('/routes');
                setRoutes(response.data);
            } catch (error) {
                console.error("Error fetching routes:", error);
            }
        };
        fetchRoutes();

        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (selectedRoute && date) {
            navigate(`/search?routeId=${selectedRoute}&date=${date}`);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', marginTop: '2rem' }}>
            {/* Hero Section */}
            <section className="glass-panel animate-fade-in" style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(255,51,102,0.1), rgba(255,136,51,0.05))',
                border: '1px solid var(--border-glass)'
            }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                    Welcome to <span className="gradient-text">CeySeat</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Experience premium bus travel across Sri Lanka. Book your seats instantly with our modern and secure platform.
                </p>

                {/* Search Widget */}
                <form onSubmit={handleSearch} style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'var(--bg-secondary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    maxWidth: '800px',
                    margin: '0 auto',
                    flexWrap: 'wrap'
                }}>
                    <div className="input-group" style={{ marginBottom: 0, flex: '1', minWidth: '200px' }}>
                        <select
                            className="glass-input"
                            value={selectedRoute}
                            onChange={(e) => setSelectedRoute(e.target.value)}
                            required
                            style={{ color: selectedRoute ? 'var(--text-primary)' : 'var(--text-muted)' }}
                        >
                            <option value="" disabled>Select Route</option>
                            {routes.map(r => (
                                <option key={r.id} value={r.id} style={{ color: '#000' }}>
                                    {r.source} to {r.destination}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group" style={{ marginBottom: 0, flex: '1', minWidth: '200px' }}>
                        <input
                            type="date"
                            className="glass-input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', height: '100%' }}>
                        <Search size={20} /> Search
                    </button>
                </form>
            </section>

            {/* Features Section */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ background: 'var(--bg-secondary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-primary)' }}>
                        <Bus size={32} />
                    </div>
                    <h3 style={{ marginBottom: '1rem' }}>Premium Fleet</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Travel in comfort with our modern, air-conditioned buses equipped with modern amenities.</p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ background: 'var(--bg-secondary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-secondary)' }}>
                        <Map size={32} />
                    </div>
                    <h3 style={{ marginBottom: '1rem' }}>Extensive Routes</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Connecting major cities and towns across Sri Lanka with reliable daily schedules.</p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ background: 'var(--bg-secondary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--success)' }}>
                        <Clock size={32} />
                    </div>
                    <h3 style={{ marginBottom: '1rem' }}>Instant Booking</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Secure your favorite seats in seconds with our beautiful and intuitive booking system.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
