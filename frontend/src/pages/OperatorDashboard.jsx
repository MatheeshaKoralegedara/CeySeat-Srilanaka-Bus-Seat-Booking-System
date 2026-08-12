import { useEffect, useState } from 'react';
import client from '../api/client';
import TownAutocomplete from '../components/TownAutocomplete';

export default function OperatorDashboard() {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    const [registrationNo, setRegistrationNo] = useState('');
    const [model, setModel] = useState('');
    const [seatCount, setSeatCount] = useState(40);
    const [schedules, setSchedules] = useState([]);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [selectedBusId, setSelectedBusId] = useState('');
    const [routeFrom, setRouteFrom] = useState('');
    const [routeTo, setRouteTo] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [fare, setFare] = useState('');
    const [scheduleError, setScheduleError] = useState('');
    const [layoutType, setLayoutType] = useState('2+2');
    const [hasRearBench, setHasRearBench] = useState(false);
    const [rearBenchSize, setRearBenchSize] = useState(5);

    function loadBuses() {
        setLoading(true);
        client.get('/buses/my')
            .then((res) => setBuses(res.data))
            .catch(() => setBuses([]))
            .finally(() => setLoading(false));
    }

    function loadSchedules() {
        client.get('/schedules/my')
            .then((res) => setSchedules(res.data))
            .catch(() => setSchedules([]));
    }

    useEffect(() => {
        loadBuses();
        loadSchedules();
    }, []);

    function generateSeatLayout(totalSeats, layoutType, hasRearBench, rearBenchSize) {
        const is3plus2 = layoutType === '3+2';
        const seatsPerRow = is3plus2 ? 5 : 4;
        const leftCount = is3plus2 ? 3 : 2;

        const benchCount = hasRearBench ? Number(rearBenchSize) : 0;
        const frontSeatTarget = Math.max(0, totalSeats - benchCount);

        const fullRows = Math.floor(frontSeatTarget / seatsPerRow);
        const remainder = frontSeatTarget - fullRows * seatsPerRow;

        const seats = [];
        let seatNum = 1;

        for (let row = 1; row <= fullRows; row++) {
            for (let pos = 0; pos < seatsPerRow; pos++) {
                const side = pos < leftCount ? 'left' : 'right';
                const posInSide = pos < leftCount ? pos : pos - leftCount;
                const sideSize = pos < leftCount ? leftCount : seatsPerRow - leftCount;
                const type =
                    posInSide === 0 ? 'window' :
                    posInSide === sideSize - 1 ? 'aisle' : 'middle';

                seats.push({
                    seatNo: String(seatNum).padStart(2, '0'),
                    type,
                    row,
                    side,
                    bookable: true,
                });
                seatNum++;
            }
        }

        let nextRow = fullRows + 1;
        for (let i = 0; i < remainder; i++) {
            seats.push({
                seatNo: String(seatNum).padStart(2, '0'),
                type: 'window',
                row: nextRow,
                side: 'right',
                bookable: true,
            });
            seatNum++;
        }
        if (remainder > 0) nextRow++;

        if (hasRearBench) {
            for (let i = 0; i < benchCount; i++) {
                seats.push({
                    seatNo: String(seatNum).padStart(2, '0'),
                    type: i === 0 || i === benchCount - 1 ? 'window' : 'middle',
                    row: nextRow,
                    side: 'rear',
                    bookable: true,
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
                layoutType,
                seatLayout: generateSeatLayout(Number(seatCount), layoutType, hasRearBench, rearBenchSize),
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

    async function createSchedule(e) {
        e.preventDefault();
        setScheduleError('');
        try {
            await client.post('/schedules', {
                busId: selectedBusId,
                routeId: `${routeFrom}-${routeTo}`,
                departureTime,
                arrivalTime,
                fare: Number(fare),
            });
            setSelectedBusId('');
            setRouteFrom('');
            setRouteTo('');
            setDepartureTime('');
            setArrivalTime('');
            setFare('');
            setShowScheduleForm(false);
            loadSchedules();
        } catch (err) {
            setScheduleError(err.response?.data?.error || 'Could not add schedule');
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
                           <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Layout</label>
                              <select
                                 value={layoutType}
                                 onChange={(e) => setLayoutType(e.target.value)}
                                 className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
                                 <option value="2+2">2+2 (AC / Luxury)</option>
                                 <option value="3+2">3+2 (Normal / Rural)</option>
                              </select>
                        </div>

                        <div className="flex items-center gap-3 md:col-span-3">
                            <input
                                type="checkbox"
                                id="rearBench"
                                checked={hasRearBench}
                                onChange={(e) => setHasRearBench(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="rearBench" className="text-sm text-gray-700">
                                Include rear bench seat (continuous row across the back)
                            </label>
                            {hasRearBench && (
                                <input
                                    type="number"
                                    value={rearBenchSize}
                                    onChange={(e) => setRearBenchSize(Number(e.target.value))}
                                    min={3}
                                    max={6}
                                    className="w-20 px-2 py-1 rounded-lg border border-gray-300 text-sm"
                                />
                            )}
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
            <div className="flex items-center justify-between mb-6 mt-16">
    <div>
        <h2 className="text-2xl font-bold text-gray-900">Schedules</h2>
        <p className="text-gray-500 text-sm">Assign your buses to routes and times</p>
    </div>
    <button
        onClick={() => setShowScheduleForm(!showScheduleForm)}
        disabled={buses.length === 0}
        className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
    >
        {showScheduleForm ? 'Cancel' : '+ Add Schedule'}
    </button>
</div>

{buses.length === 0 && (
    <p className="text-sm text-gray-400 mb-6">Add a bus first before creating schedules.</p>
)}

{showScheduleForm && (
    <form onSubmit={createSchedule} className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Bus</label>
                <select
                    value={selectedBusId}
                    onChange={(e) => setSelectedBusId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                    <option value="">Select a bus</option>
                    {buses.map((b) => (
                        <option key={b.id} value={b.id}>{b.model} — {b.registrationNo}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="grid grid-cols-2 gap-2">
                    <TownAutocomplete
                            value={routeFrom}
                            onChange={setRouteFrom}
                            placeholder="Colombo"
                            label="From"
                    />
                    <TownAutocomplete
                        value={routeTo}
                        onChange={setRouteTo}
                        placeholder="Kandy"
                        label="To"
                    />
                </div>
            
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Departure</label>
                <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Arrival</label>
                <input
                    type="datetime-local"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Fare (Rs.)</label>
                <input
                    type="number"
                    value={fare}
                    onChange={(e) => setFare(e.target.value)}
                    min={0}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>
        </div>
        {scheduleError && <p className="text-red-600 text-sm mb-4">{scheduleError}</p>}
        <button
            type="submit"
            className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
            Create Schedule
        </button>
    </form>
)}

<div className="grid gap-3">
    {schedules.map((s) => (
        <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
            <div>
                <p className="font-semibold text-gray-900">{s.routeId}</p>
                <p className="text-sm text-gray-500">
                    {new Date(s.departureTime).toLocaleString()} → {new Date(s.arrivalTime).toLocaleString()}
                </p>
            </div>
            <span className="font-bold text-brand-700">Rs. {s.fare}</span>
        </div>
    ))}
</div>
        </div>
    );
}
