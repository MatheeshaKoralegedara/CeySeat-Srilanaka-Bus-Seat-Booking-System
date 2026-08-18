import { useEffect, useState } from 'react';
import client from '../api/client';
import TownAutocomplete from '../components/TownAutocomplete';
import { SkeletonBlock, SkeletonCard } from '../components/Skeleton';
import DetailsModal from '../components/DetailsModal';

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

const emptyBusForm = { registrationNo: '', model: '', travelName: '', busType: 'NORMAL', contactNumber: '', seatCount: 40, layoutType: '2+2', hasRearBench: false, rearBenchSize: 5 };
const emptyScheduleForm = { busId: '', routeFrom: '', routeTo: '', departureTime: '', arrivalTime: '', fare: '' };

export default function OperatorDashboard() {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [editingBusId, setEditingBusId] = useState(null);
    const [busForm, setBusForm] = useState(emptyBusForm);

    const [schedules, setSchedules] = useState([]);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [editingScheduleId, setEditingScheduleId] = useState(null);
    const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm);
    const [scheduleError, setScheduleError] = useState('');
    const [details, setDetails] = useState(null);

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
            ],
        });
    }

    function viewScheduleDetails(s) {
        setDetails({
            title: s.routeId,
            rows: [
                { label: 'Status', value: s.status },
                { label: 'Bus', value: s.busModel },
                { label: 'Departure', value: new Date(s.departureTime).toLocaleString() },
                { label: 'Arrival', value: new Date(s.arrivalTime).toLocaleString() },
                { label: 'Fare', value: `Rs. ${s.fare}` },
                { label: 'Seats Available', value: `${s.availableSeats} / ${s.totalSeats}` },
            ],
        });
    }

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
        // Sri Lankan buses are right-hand drive, so on a 3+2 layout the
        // 3-seat block sits on the right (driver's side) and the 2-seat
        // block on the left — not the other way around.
        const leftCount = is3plus2 ? 2 : 2;

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

    function startEditBus(bus) {
        setEditingBusId(bus.id);
        setBusForm({
            registrationNo: bus.registrationNo,
            model: bus.model,
            travelName: bus.travelName || '',
            busType: bus.busType || 'NORMAL',
            contactNumber: bus.contactNumber || '',
            seatCount: bus.totalSeats,
            layoutType: bus.layoutType || '2+2',
            hasRearBench: false,
            rearBenchSize: 5,
        });
        setShowForm(true);
    }

    function cancelBusForm() {
        setShowForm(false);
        setEditingBusId(null);
        setBusForm(emptyBusForm);
        setError('');
    }

    async function saveBus(e) {
        e.preventDefault();
        setError('');

        try {
            const payload = {
                registrationNo: busForm.registrationNo,
                model: busForm.model,
                travelName: busForm.travelName,
                busType: busForm.busType,
                contactNumber: busForm.contactNumber,
                totalSeats: Number(busForm.seatCount),
                layoutType: busForm.layoutType,
            };

            if (editingBusId) {
                // Keep the existing seat map on edit — regenerating it here
                // would reshuffle every already-booked seat number.
                await client.put(`/buses/${editingBusId}`, payload);
            } else {
                payload.seatLayout = generateSeatLayout(
                    Number(busForm.seatCount), busForm.layoutType, busForm.hasRearBench, busForm.rearBenchSize
                );
                await client.post('/buses', payload);
            }

            cancelBusForm();
            loadBuses();
        } catch (err) {
            setError(err.response?.data?.error || 'Could not save bus');
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

    function startEditSchedule(s) {
        const [routeFrom, routeTo] = s.routeId.split('-');
        setEditingScheduleId(s.id);
        setScheduleForm({
            busId: s.busId,
            routeFrom: routeFrom || '',
            routeTo: routeTo || '',
            departureTime: s.departureTime?.slice(0, 16) || '',
            arrivalTime: s.arrivalTime?.slice(0, 16) || '',
            fare: s.fare,
        });
        setShowScheduleForm(true);
    }

    function cancelScheduleForm() {
        setShowScheduleForm(false);
        setEditingScheduleId(null);
        setScheduleForm(emptyScheduleForm);
        setScheduleError('');
    }

    async function saveSchedule(e) {
        e.preventDefault();
        setScheduleError('');
        try {
            const payload = {
                busId: scheduleForm.busId,
                routeId: `${scheduleForm.routeFrom}-${scheduleForm.routeTo}`,
                departureTime: scheduleForm.departureTime,
                arrivalTime: scheduleForm.arrivalTime,
                fare: Number(scheduleForm.fare),
            };

            if (editingScheduleId) {
                await client.put(`/schedules/${editingScheduleId}`, payload);
            } else {
                await client.post('/schedules', payload);
            }

            cancelScheduleForm();
            loadSchedules();
        } catch (err) {
            setScheduleError(err.response?.data?.error || 'Could not save schedule');
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

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">My Fleet</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your buses and schedules</p>
                </div>
                <button
                    onClick={() => (showForm ? cancelBusForm() : setShowForm(true))}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
                >
                    {showForm ? 'Cancel' : '+ Add Bus'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={saveBus} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{editingBusId ? 'Edit Bus' : 'New Bus'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">
                                Travel Name
                            </label>
                            <input
                                value={busForm.travelName}
                                onChange={(e) => setBusForm((f) => ({ ...f, travelName: e.target.value }))}
                                placeholder="Ceylon Express"
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">
                                Registration No.
                            </label>
                            <input
                                value={busForm.registrationNo}
                                onChange={(e) => setBusForm((f) => ({ ...f, registrationNo: e.target.value }))}
                                placeholder="NB-1234"
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Model</label>
                            <input
                                value={busForm.model}
                                onChange={(e) => setBusForm((f) => ({ ...f, model: e.target.value }))}
                                placeholder="Volvo B11R"
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Bus Type</label>
                            <select
                                value={busForm.busType}
                                onChange={(e) => setBusForm((f) => ({ ...f, busType: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="NORMAL">Normal</option>
                                <option value="SEMI_LUXURY">Semi Luxury</option>
                                <option value="LUXURY">Luxury</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Contact Number</label>
                            <input
                                type="tel"
                                value={busForm.contactNumber}
                                onChange={(e) => setBusForm((f) => ({ ...f, contactNumber: e.target.value }))}
                                placeholder="0771234567"
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Layout</label>
                              <select
                                 value={busForm.layoutType}
                                 onChange={(e) => setBusForm((f) => ({ ...f, layoutType: e.target.value }))}
                                 disabled={!!editingBusId}
                                 className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
                                 <option value="2+2">2+2 (AC / Luxury)</option>
                                 <option value="3+2">3+2 (Normal / Rural)</option>
                              </select>
                        </div>

                        {!editingBusId && (
                            <div className="flex flex-wrap items-center gap-3 md:col-span-3">
                                <input
                                    type="checkbox"
                                    id="rearBench"
                                    checked={busForm.hasRearBench}
                                    onChange={(e) => setBusForm((f) => ({ ...f, hasRearBench: e.target.checked }))}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="rearBench" className="text-sm text-gray-700 dark:text-gray-300">
                                    Include rear bench seat (continuous row across the back)
                                </label>
                                {busForm.hasRearBench && (
                                    <input
                                        type="number"
                                        value={busForm.rearBenchSize}
                                        onChange={(e) => setBusForm((f) => ({ ...f, rearBenchSize: Number(e.target.value) }))}
                                        min={3}
                                        max={6}
                                        className="w-20 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
                                    />
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">
                                Total Seats
                            </label>
                            <input
                                type="number"
                                value={busForm.seatCount}
                                onChange={(e) => setBusForm((f) => ({ ...f, seatCount: e.target.value }))}
                                min={4}
                                max={60}
                                disabled={!!editingBusId}
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>
                    {editingBusId && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                            Layout and total seats can't be changed once a bus exists, since it would reshuffle already-booked seat numbers. Delete and re-add the bus if you need a different layout.
                        </p>
                    )}
                    {error && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm shadow-accent-600/20"
                    >
                        {editingBusId ? 'Save Changes' : 'Create Bus'}
                    </button>
                </form>
            )}

            {loading && (
                <div className="grid md:grid-cols-2 gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {!loading && buses.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No buses yet. Add your first one above.</p>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                {buses.map((bus) => (
                    <div key={bus.id} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-brand-200 dark:hover:border-brand-500 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{bus.travelName || bus.model}</h3>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{bus.model}</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                {bus.registrationNo}
                            </span>
                        </div>
                        <div className="pl-12 flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{bus.totalSeats} seats</span>
                            {bus.busType && (
                                <span className="text-xs font-semibold bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 px-2 py-0.5 rounded-full">
                                    {busTypeLabels[bus.busType] || bus.busType}
                                </span>
                            )}
                            {bus.contactNumber && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">{bus.contactNumber}</span>
                            )}
                        </div>
                        <div className="pl-12 flex items-center gap-4 mt-3">
                            <button onClick={() => viewBusDetails(bus)} className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:underline">
                                View Details
                            </button>
                            <button onClick={() => startEditBus(bus)} className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline">
                                Edit
                            </button>
                            <button onClick={() => deleteBus(bus.id)} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between mb-6 mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100">Schedules</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Assign your buses to routes and times — new schedules need admin approval before they're visible to passengers</p>
                </div>
                <button
                    onClick={() => (showScheduleForm ? cancelScheduleForm() : setShowScheduleForm(true))}
                    disabled={buses.length === 0}
                    className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm disabled:shadow-none flex-shrink-0"
                >
                    {showScheduleForm ? 'Cancel' : '+ Add Schedule'}
                </button>
            </div>

            {buses.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Add a bus first before creating schedules.</p>
            )}

            {showScheduleForm && (
                <form onSubmit={saveSchedule} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Bus</label>
                            <select
                                value={scheduleForm.busId}
                                onChange={(e) => setScheduleForm((f) => ({ ...f, busId: e.target.value }))}
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="">Select a bus</option>
                                {buses.map((b) => (
                                    <option key={b.id} value={b.id}>{b.travelName ? `${b.travelName} — ` : ''}{b.model} — {b.registrationNo}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <TownAutocomplete
                                value={scheduleForm.routeFrom}
                                onChange={(v) => setScheduleForm((f) => ({ ...f, routeFrom: v }))}
                                placeholder="Colombo"
                                label="From"
                            />
                            <TownAutocomplete
                                value={scheduleForm.routeTo}
                                onChange={(v) => setScheduleForm((f) => ({ ...f, routeTo: v }))}
                                placeholder="Kandy"
                                label="To"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Departure</label>
                            <input
                                type="datetime-local"
                                value={scheduleForm.departureTime}
                                onChange={(e) => setScheduleForm((f) => ({ ...f, departureTime: e.target.value }))}
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Arrival</label>
                            <input
                                type="datetime-local"
                                value={scheduleForm.arrivalTime}
                                onChange={(e) => setScheduleForm((f) => ({ ...f, arrivalTime: e.target.value }))}
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Fare (Rs.)</label>
                            <input
                                type="number"
                                value={scheduleForm.fare}
                                onChange={(e) => setScheduleForm((f) => ({ ...f, fare: e.target.value }))}
                                min={0}
                                required
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>
                    {scheduleError && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{scheduleError}</p>}
                    <button
                        type="submit"
                        className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm shadow-accent-600/20"
                    >
                        {editingScheduleId ? 'Save Changes' : 'Create Schedule'}
                    </button>
                </form>
            )}

            {!loading && schedules.length === 0 && buses.length > 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">No schedules yet. Add one above.</p>
            )}

            <div className="grid gap-3">
                {schedules.map((s) => (
                    <div key={s.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:border-brand-200 dark:hover:border-brand-500 transition-colors">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{s.routeId}</p>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scheduleStatusStyles[s.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                    {s.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(s.departureTime).toLocaleString()} → {new Date(s.arrivalTime).toLocaleString()}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                                <button onClick={() => viewScheduleDetails(s)} className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:underline">
                                    View Details
                                </button>
                                <button onClick={() => startEditSchedule(s)} className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline">
                                    Edit
                                </button>
                                <button onClick={() => deleteSchedule(s.id)} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
                                    Delete
                                </button>
                            </div>
                        </div>
                        <span className="font-bold text-brand-700 dark:text-brand-300">Rs. {s.fare}</span>
                    </div>
                ))}
            </div>

            <DetailsModal
                open={!!details}
                title={details?.title}
                rows={details?.rows || []}
                onClose={() => setDetails(null)}
            />
        </div>
    );
}
