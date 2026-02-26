import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SearchResults from './pages/SearchResults';
import Booking from './pages/Booking';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { isAdminOrOperator } = useAuth();

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/booking/:scheduleId" element={<Booking />} />

          {isAdminOrOperator && (
            <Route path="/admin/*" element={<AdminDashboard />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
