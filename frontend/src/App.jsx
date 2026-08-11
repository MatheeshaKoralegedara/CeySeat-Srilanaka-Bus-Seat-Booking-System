import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Schedules from './pages/Schedules';
import SeatSelect from './pages/SeatSelect';
import Payment from './pages/Payment';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Schedules />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/schedules" element={<Schedules />} />
                    <Route path="/seats/:scheduleId" element={<SeatSelect />} />
                    <Route path="/payment/:bookingId" element={<Payment />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}