import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, isAdminOrOperator, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-panel" style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            right: '1rem',
            height: 'var(--navbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            zIndex: 1000
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bus size={32} color="var(--accent-primary)" />
                    <h2 className="gradient-text" style={{ margin: 0, fontSize: '1.5rem' }}>CeySeat</h2>
                </Link>

                {isAuthenticated && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/search" style={{ color: 'var(--text-secondary)' }}>Find Buses</Link>
                        {isAdminOrOperator && (
                            <Link to="/admin" style={{ color: 'var(--accent-secondary)' }}>Dashboard</Link>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isAuthenticated ? (
                    <>
                        <button className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem' }}>
                            <User size={20} />
                        </button>
                        <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                            <LogOut size={18} /> Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="btn btn-primary">Sign In</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
