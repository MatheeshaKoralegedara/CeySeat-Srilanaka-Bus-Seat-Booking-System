import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function Schedules() {
    const [routeId, setRouteId] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    function search() {
        setLoading(true);
        const params = routeId.trim() ? { routeId: routeId.trim() } : {};
        client.get('/schedules', { params })
            .then((res) => setSchedules(res.data))
            .catch(() => setSchedules([]))
            .finally(() => setLoading(false));
    }

    useEffect(() => { search(); }, []);

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit',
        });
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Find your bus</h1>
                <p className="text-gray-500">Search available routes across Sri Lanka</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8 flex gap-3">
                <input
                    type="text"
                    value={routeId}
                    onChange={(e) => setRouteId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && search()}
                    placeholder="e.g. Colombo-Kandy"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button
                    onClick={search}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                    Search
                </button>
            </div>

            {loading && (
                <div className="text-center py-12 text-gray-400">Loading schedules...</div>
            )}

            {!loading && schedules.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500 text-lg">No schedules found.</p>
                    <p className="text-gray-400 text-sm mt-1">Try a different route or clear the search.</p>
                </div>
            )}

            <div className="grid gap-4">
                {schedules.map((s) => (
                    <div
                        key={s.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                {s.routeId}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {formatDate(s.departureTime)} → {formatDate(s.arrivalTime)}
                            </p>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                            <span className="text-2xl font-bold text-brand-700">
                                Rs. {s.fare}
                            </span>
                            <button
                                onClick={() => navigate(`/seats/${s.id}`)}
                                className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-5 py-2 rounded-lg transition-colors"
                            >
                                Select Seats
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}