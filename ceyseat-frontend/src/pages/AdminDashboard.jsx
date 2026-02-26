import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bus, MapPin, Loader2, Plus, Edit, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('buses');

    const { isAdminOrOperator } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdminOrOperator) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const [busesRes, routesRes] = await Promise.all([
                    api.get('/buses'),
                    api.get('/routes')
                ]);
                setBuses(busesRes.data);
                setRoutes(routesRes.data);
            } catch (error) {
                console.error("Failed to fetch admin data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAdminOrOperator, navigate]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
            <h2 style={{ marginBottom: '2rem' }}>Operator <span className="gradient-text">Dashboard</span></h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('buses')}
                    className={`btn ${activeTab === 'buses' ? 'btn-primary' : 'btn-outline'}`}
                >
                    <Bus size={20} /> Manage Fleet
                </button>
                <button
                    onClick={() => setActiveTab('routes')}
                    className={`btn ${activeTab === 'routes' ? 'btn-primary' : 'btn-outline'}`}
                >
                    <MapPin size={20} /> Manage Routes
                </button>
            </div>

            {activeTab === 'buses' && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3>Your Fleet ({buses.length})</h3>
                        <button className="btn btn-outline" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>
                            <Plus size={18} /> Add Bus
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {buses.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No buses connected. Add one to see it here.</p>
                        ) : buses.map(bus => (
                            <div key={bus.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                                <div>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{bus.registrationNo}</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{bus.model} • {bus.totalSeats} Seats</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn" style={{ background: 'transparent', color: 'var(--info)', padding: '0.5rem' }}><Edit size={18} /></button>
                                    <button className="btn" style={{ background: 'transparent', color: 'var(--error)', padding: '0.5rem' }}><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'routes' && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3>Active Routes ({routes.length})</h3>
                        <button className="btn btn-outline" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>
                            <Plus size={18} /> Add Route
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {routes.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No routes configured.</p>
                        ) : routes.map(route => (
                            <div key={route.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                                <div>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{route.source} → {route.destination}</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{route.distance} km • {route.estimatedTime}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn" style={{ background: 'transparent', color: 'var(--info)', padding: '0.5rem' }}><Edit size={18} /></button>
                                    <button className="btn" style={{ background: 'transparent', color: 'var(--error)', padding: '0.5rem' }}><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
