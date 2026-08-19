import { useEffect, useState } from 'react';
import client from '../api/client';
import { SkeletonBlock } from '../components/Skeleton';
import DetailsModal from '../components/DetailsModal';

const roleOptions = ['USER', 'OPERATOR', 'ADMIN'];

const scheduleStatusStyles = {
    PENDING: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
    APPROVED: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400',
    REJECTED: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400',
};

const busTypeLabels = {
    NORMAL: 'Normal',
    SEMI_LUXURY: 'Semi Luxury',
    LUXURY: 'Luxury',
};

export default function AdminPanel() {
    const [tab, setTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [buses, setBuses] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ fullName: '', email: '', phone: '', password: '', role: 'USER' });
    const [addUserError, setAddUserError] = useState('');
    const [addingUser, setAddingUser] = useState(false);

    function loadSchedules() {
        client.get('/admin/schedules').then((res) => setSchedules(res.data)).catch(() => setSchedules([]));
    }

    function loadBuses() {
        client.get('/admin/buses').then((res) => setBuses(res.data)).catch(() => setBuses([]));
    }

    function loadAuditLogs() {
        client.get('/admin/audit-logs').then((res) => setAuditLogs(res.data)).catch(() => setAuditLogs([]));
    }

    useEffect(() => {
        Promise.all([
            client.get('/admin/stats'),
            client.get('/admin/users'),
            client.get('/admin/bookings'),
            client.get('/admin/schedules'),
            client.get('/admin/buses'),
            client.get('/admin/audit-logs'),
        ]).then(([statsRes, usersRes, bookingsRes, schedulesRes, busesRes, auditLogsRes]) => {
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setBookings(bookingsRes.data);
            setSchedules(schedulesRes.data);
            setBuses(busesRes.data);
            setAuditLogs(auditLogsRes.data);
        }).finally(() => setLoading(false));
    }, []);

    function viewBusDetails(bus) {
        setDetails({
            title: bus.travelName || bus.model,
            rows: [
                { label: 'Travel Name', value: bus.travelName },
                { label: 'Model', value: bus.model },
                { label: 'Registration No.', value: bus.registrationNo },
                { label: 'Bus Type', value: busTypeLabels[bus.busType] || bus.busType },
                { label: 'Layout', value: bus.layoutType },
                { label: 'Total Seats', value: bus.totalSeats },
                { label: 'Contact Number', value: bus.contactNumber },
                { label: 'Operator', value: bus.operatorName },
                { label: 'Operator Email', value: bus.operatorEmail },
            ],
        });
    }

    function viewScheduleDetails(s) {
        setDetails({
            title: s.routeId,
            rows: [
                { label: 'Status', value: s.status },
                { label: 'Travel Name', value: s.travelName },
                { label: 'Bus', value: s.busModel },
                { label: 'Bus Type', value: busTypeLabels[s.busType] || s.busType },
                { label: 'Contact Number', value: s.contactNumber },
                { label: 'Departure', value: new Date(s.departureTime).toLocaleString() },
                { label: 'Arrival', value: new Date(s.arrivalTime).toLocaleString() },
                { label: 'Fare', value: `Rs. ${s.fare}` },
                { label: 'Seats Available', value: `${s.availableSeats} / ${s.totalSeats}` },
            ],
        });
    }

    function viewUserDetails(u) {
        setDetails({
            title: u.fullName || u.email,
            rows: [
                { label: 'Full Name', value: u.fullName },
                { label: 'Email', value: u.email },
                { label: 'Phone', value: u.phone },
                { label: 'Role', value: u.role },
            ],
        });
    }

    function openAddUser() {
        setNewUser({ fullName: '', email: '', phone: '', password: '', role: 'USER' });
        setAddUserError('');
        setShowAddUser(true);
    }

    async function submitAddUser(e) {
        e.preventDefault();
        setAddUserError('');
        setAddingUser(true);
        try {
            const res = await client.post('/admin/users', newUser);
            setUsers((prev) => [...prev, res.data]);
            setShowAddUser(false);
            loadAuditLogs();
        } catch (err) {
            setAddUserError(err.response?.data?.error || 'Could not create user');
        } finally {
            setAddingUser(false);
        }
    }

    async function changeRole(userId, newRole) {
        if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
        try {
            await client.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
            loadAuditLogs();
        } catch {
            alert('Could not update role');
        }
    }

    async function setScheduleStatus(scheduleId, status) {
        try {
            await client.put(`/admin/schedules/${scheduleId}/status`, { status });
            setSchedules((prev) => prev.map((s) => s.id === scheduleId ? { ...s, status } : s));
            loadAuditLogs();
        } catch {
            alert('Could not update schedule status');
        }
    }

    async function deleteSchedule(scheduleId) {
        if (!window.confirm('Delete this schedule?')) return;
        try {
            await client.delete(`/schedules/${scheduleId}`);
            loadSchedules();
        } catch (err) {
            alert(err.response?.data?.error || 'Could not delete schedule');
        }
    }

    async function deleteBus(busId) {
        if (!window.confirm('Delete this bus? Its schedules will no longer be manageable.')) return;
        try {
            await client.delete(`/buses/${busId}`);
            loadBuses();
        } catch (err) {
            alert(err.response?.data?.error || 'Could not delete bus');
        }
    }

    const pendingCount = schedules.filter((s) => s.status === 'PENDING').length;

    if (loading) {
        return (
            <div>
                <SkeletonBlock className="h-9 w-48 mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
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
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Admin Panel</h1>

            <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {['stats', 'users', 'bookings', 'buses', 'schedules', 'audit log'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2.5 font-medium text-sm capitalize border-b-2 transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                            tab === t
                                ? 'border-accent-500 text-brand-700 dark:text-brand-300'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        {t}
                        {t === 'schedules' && pendingCount > 0 && (
                            <span className="text-[10px] font-bold bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center leading-none">
                                {pendingCount}
                            </span>
                        )}
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
                        <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-sm transition-shadow">
                            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={statIcons[s.label]} />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
                            <p className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'users' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={openAddUser}
                            className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm shadow-accent-700/30"
                        >
                            + Add User
                        </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                    <th className="px-4 py-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{u.fullName}</td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={u.role}
                                                onChange={(e) => changeRole(u.id, e.target.value)}
                                                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                                            >
                                                {roleOptions.map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => viewUserDetails(u)} className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline">
                                                Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'bookings' && (
                <div className="grid gap-3">
                    {bookings.map((b) => (
                        <div key={b.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap items-center justify-between gap-2 text-sm hover:border-brand-200 dark:hover:border-brand-500 transition-colors">
                            <span className="font-mono text-gray-500 dark:text-gray-400">{b.id.slice(-8)}</span>
                            <span className="text-gray-900 dark:text-gray-100">Seat {b.seatNo}</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Rs. {b.fare}</span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                b.status === 'PAID' ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' :
                                b.status === 'RESERVED' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                                {b.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'buses' && (
                <div className="grid gap-3">
                    {buses.length === 0 && (
                        <p className="text-sm text-gray-400 dark:text-gray-500">No buses yet.</p>
                    )}
                    {buses.map((bus) => (
                        <div key={bus.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap items-center justify-between gap-4 hover:border-brand-200 dark:hover:border-brand-500 transition-colors">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{bus.travelName || bus.model}</p>
                                    {bus.busType && (
                                        <span className="text-xs font-semibold bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 px-2 py-0.5 rounded-full">
                                            {busTypeLabels[bus.busType] || bus.busType}
                                        </span>
                                    )}
                                    <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                                        {bus.registrationNo}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{bus.model} · {bus.totalSeats} seats</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                    Added by {bus.operatorName}{bus.operatorEmail ? ` (${bus.operatorEmail})` : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <button onClick={() => viewBusDetails(bus)} className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline">
                                    View Details
                                </button>
                                <button onClick={() => deleteBus(bus.id)} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'schedules' && (
                <div className="grid gap-3">
                    {schedules.length === 0 && (
                        <p className="text-sm text-gray-400 dark:text-gray-500">No schedules yet.</p>
                    )}
                    {schedules.map((s) => (
                        <div key={s.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap items-center justify-between gap-4 hover:border-brand-200 dark:hover:border-brand-500 transition-colors">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{s.routeId}</p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scheduleStatusStyles[s.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                        {s.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {s.travelName ? `${s.travelName} — ` : ''}{s.busModel}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(s.departureTime).toLocaleString()} → {new Date(s.arrivalTime).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {s.availableSeats}/{s.totalSeats} seats available · Rs. {s.fare}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => viewScheduleDetails(s)} className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline">
                                        View Details
                                    </button>
                                    {s.status !== 'APPROVED' && (
                                        <button onClick={() => setScheduleStatus(s.id, 'APPROVED')} className="text-xs font-semibold text-green-600 dark:text-green-400 hover:underline">
                                            Approve
                                        </button>
                                    )}
                                    {s.status !== 'REJECTED' && (
                                        <button onClick={() => setScheduleStatus(s.id, 'REJECTED')} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                                            Reject
                                        </button>
                                    )}
                                    <button onClick={() => deleteSchedule(s.id)} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'audit log' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">When</th>
                                <th className="px-4 py-3 font-medium">Admin</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                                <th className="px-4 py-3 font-medium">Target</th>
                                <th className="px-4 py-3 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {auditLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500">No admin actions recorded yet.</td>
                                </tr>
                            )}
                            {auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{log.adminEmail || log.adminId}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-semibold bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 px-2 py-0.5 rounded-full">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{log.targetType} · {log.targetId?.slice(-8)}</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <DetailsModal
                open={!!details}
                title={details?.title}
                rows={details?.rows || []}
                onClose={() => setDetails(null)}
            />

            {showAddUser && (
                <div className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddUser(false)}>
                    <form
                        onSubmit={submitAddUser}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 scale-in max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-gray-100">Add User</h2>
                            <button
                                type="button"
                                onClick={() => setShowAddUser(false)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <input
                                required
                                placeholder="Full name"
                                value={newUser.fullName}
                                onChange={(e) => setNewUser((p) => ({ ...p, fullName: e.target.value }))}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <input
                                required
                                type="email"
                                placeholder="Email"
                                value={newUser.email}
                                onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <input
                                placeholder="Phone"
                                value={newUser.phone}
                                onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <input
                                required
                                type="password"
                                minLength={8}
                                placeholder="Password (min 8 characters)"
                                value={newUser.password}
                                onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                            >
                                {roleOptions.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {addUserError && (
                            <p className="text-red-600 dark:text-red-400 text-sm mt-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">{addUserError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={addingUser}
                            className="w-full mt-6 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-brand-900 font-semibold py-2.5 rounded-xl transition-colors"
                        >
                            {addingUser ? 'Creating...' : 'Create User'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}