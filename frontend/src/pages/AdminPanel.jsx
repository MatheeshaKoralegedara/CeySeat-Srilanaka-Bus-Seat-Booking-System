import { useEffect, useState } from 'react';
import client from '../api/client';
import { SkeletonBlock } from '../components/Skeleton';

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

    if (loading) {
        return (
            <div>
                <SkeletonBlock className="h-9 w-48 mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                            <SkeletonBlock className="h-4 w-20 mb-2" />
                            <SkeletonBlock className="h-8 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const statIcons = {
        'Total Users': 'M12 4.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM5 19c0-3 3-5.5 7-5.5s7 2.5 7 5.5',
        'Total Bookings': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        'Paid Bookings': 'M5 13l4 4L19 7',
        'Total Revenue': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m9-6a9 9 0 11-18 0 9 9 0 0118 0z',
    };

    return (
        <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

            <div className="flex gap-2 mb-8 border-b border-gray-200">
                {['stats', 'users', 'bookings'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2.5 font-medium text-sm capitalize border-b-2 transition-colors ${
                            tab === t
                                ? 'border-accent-500 text-brand-700'
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
                        <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                            <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={statIcons[s.label]} />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                            <p className="font-display text-2xl font-bold text-gray-900">{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'users' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={u.role}
                                            onChange={(e) => changeRole(u.id, e.target.value)}
                                            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
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
                        <div key={b.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between text-sm hover:border-brand-200 transition-colors">
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