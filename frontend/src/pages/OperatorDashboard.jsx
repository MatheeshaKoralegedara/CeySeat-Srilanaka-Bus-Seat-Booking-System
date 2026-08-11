import { useEffect, useState } from 'react';
import client from '../api/client';

export default function OperatorDashboard() {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    const [registrationNo, setRegistrationNo] = useState('');
    const [model, setModel] = useState('');
    const [seatCount, setSeatCount] = useState(40);

    function loadBuses() {
        setLoading(true);
        client.get('/buses/my')
            .then((res) => setBuses(res.data))
            .catch(() => setBuses([]))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadBuses();
    }, []);

    function generateSeatLayout(count) {
        const seats = [];
        const rows = Math.ceil(count / 4);
        let seatNum = 1;

        for (let r = 1; r <= rows && seatNum <= count; r++) {
            for (const col of ['A', 'B', 'C', 'D']) {
                if (seatNum > count) break;
                seats.push({
                    seatNo: `${col}${r}`,
                    type: col === 'A' || col === 'D' ? 'window' : 'aisle',
                });
                seatNum++;
            }
        }

        return seats;
    }

    async function createBus(e) {
        e.preventDefault();
        setError('');

        try {
            await client.post('/buses', {
                registrationNo,
                model,
                totalSeats: Number(seatCount),
                seatLayout: generateSeatLayout(Number(seatCount)),
            });

            setRegistrationNo('');
            setModel('');
            setSeatCount(40);
            setShowForm(false);
            loadBuses();
        } catch (err) {
            setError(err.response?.data?.error || 'Could not add bus');
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Fleet</h1>
                    <p className="text-gray-500">Manage your buses and schedules</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                    {showForm ? 'Cancel' : '+ Add Bus'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={createBus} className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                    <h2 className="font-semibold text-gray-900 mb-4">New Bus</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                                Registration No.
                            </label>
                            <input
                                value={registrationNo}
                                onChange={(e) => setRegistrationNo(e.target.value)}
                                placeholder="NB-1234"
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Model</label>
                            <input
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder="Volvo B11R"
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                                Total Seats
                            </label>
                            <input
                                type="number"
                                value={seatCount}
                                onChange={(e) => setSeatCount(e.target.value)}
                                min={4}
                                max={60}
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-6 py-2.5 rounded-lg transition-colors"
                    >
                        Create Bus
                    </button>
                </form>
            )}

            {loading && <div className="text-center py-12 text-gray-400">Loading fleet...</div>}

            {!loading && buses.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">No buses yet. Add your first one above.</p>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                {buses.map((bus) => (
                    <div key={bus.id} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{bus.model}</h3>
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {bus.registrationNo}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">{bus.totalSeats} seats</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
