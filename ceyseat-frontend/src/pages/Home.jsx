import { Link } from 'react-router-dom';
import { Bus, Map, Clock } from 'lucide-react';

const Home = () => {
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

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/search" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        Find Buses Now
                    </Link>
                    <Link to="/login" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        Partner Login
                    </Link>
                </div>
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
