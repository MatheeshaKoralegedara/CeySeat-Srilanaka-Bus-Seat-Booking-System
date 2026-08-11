import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Schedules from './pages/Schedules';
import SeatSelect from './pages/SeatSelect';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';

export default function App() {
    return (
        <AuthProvider>
          
            <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Schedules />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/schedules" element={<Schedules />} />
                    <Route path="/seats/:scheduleId" element={<SeatSelect />} />
                    <Route path="/payment/:bookingId" element={<Payment />} />
                    <Route path="/bookings" element={<MyBookings />} />
                </Routes>
            </Layout>
            </BrowserRouter>
        </AuthProvider>
    );
}