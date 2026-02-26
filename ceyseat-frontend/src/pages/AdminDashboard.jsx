const AdminDashboard = () => {
    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
            <h2 style={{ marginBottom: '2rem' }}>Operator <span className="gradient-text">Dashboard</span></h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Manage Buses</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Add, Edit, or Remove Fleet</p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>Manage Routes</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Configure Source/Destinations</p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Manage Schedules</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Assign Buses to Routes</p>
                </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Full management interface backend integration in progress.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
