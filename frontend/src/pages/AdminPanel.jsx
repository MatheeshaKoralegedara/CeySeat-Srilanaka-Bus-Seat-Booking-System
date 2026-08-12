import { useEffect, useState } from 'react';
import client from '../api/client';

const roleOptions = ['USER', 'OPERATOR', 'ADMIN'];

export default function AdminPanel() {
    const [tab, setTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            client.get('/admin/stats'),
            client.get('/admin/users'),
            client.get('/admin/bookings'),
        ]).then(([statsRes, usersRes, bookingsRes]) => {
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setBookings(bookingsRes.data);
        }).finally(() => setLoading(false));
    }, []);

    async function changeRole(userId, newRole) {
        try {
            await client.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
        } catch {
            alert('Could not update role');
        }
    }

    if (loading) return <div className="text-center py-16 text-gray-400">Loading admin data...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

            <div className="flex gap-2 mb-8 border-b border-gray-200">
                {['stats', 'users', 'bookings'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 font-medium text-sm capitalize border-b-2 transition-colors ${
                            tab === t
                                ? 'border-brand-600 text-brand-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'stats' && stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Users', value: stats.totalUsers },
                        { label: 'Total Bookings', value: stats.totalBookings },
                        { label: 'Paid Bookings', value: stats.paidBookings },
                        { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}` },
                    ].map((s) => (
                        <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'users' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="px-4 py-3">{u.fullName}</td>
                                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={u.role}
                                            onChange={(e) => changeRole(u.id, e.target.value)}
                                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                                        >
                                            {roleOptions.map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'bookings' && (
                <div className="grid gap-3">
                    {bookings.map((b) => (
                        <div key={b.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between text-sm">
                            <span className="font-mono text-gray-500">{b.id.slice(-8)}</span>
                            <span>Seat {b.seatNo}</span>
                            <span className="font-semibold">Rs. {b.fare}</span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                b.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                b.status === 'RESERVED' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-500'
                            }`}>
                                {b.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}