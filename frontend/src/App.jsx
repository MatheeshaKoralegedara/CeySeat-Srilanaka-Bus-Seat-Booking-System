import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Schedules from './pages/Schedules';
import SeatSelect from './pages/SeatSelect';
import Payment from './pages/Payment';
import Ticket from './pages/Ticket';
import MyBookings from './pages/MyBookings';
import OperatorDashboard from './pages/OperatorDashboard';
import AdminPanel from './pages/AdminPanel';

export default function App() {
    return (
        <ThemeProvider>
        <AuthProvider>

            <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/schedules" element={<Schedules />} />
                    <Route path="/seats/:scheduleId" element={<SeatSelect />} />
                    <Route path="/payment/:bookingId" element={<Payment />} />
                    <Route path="/bookings" element={
                            <ProtectedRoute><MyBookings /></ProtectedRoute>
                    } />
                    <Route path="/ticket/:groupBookingId" element={
                            <ProtectedRoute><Ticket /></ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                            <ProtectedRoute roles={['OPERATOR', 'ADMIN']}><OperatorDashboard /></ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                            <ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>
                    } />
                </Routes>
            </Layout>
            </BrowserRouter>
        </AuthProvider>
        </ThemeProvider>
    );
}