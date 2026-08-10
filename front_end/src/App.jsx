import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import BookingCalendarPage from './pages/BookingCalendarPage';
import BookingDetailPage from './pages/BookingDetailPage';
import BookingFormPage from './pages/BookingFormPage';
import BookingsPage from './pages/BookingsPage';
import CustomersPage from './pages/CustomersPage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/bookings/new" element={<BookingFormPage />} />
        <Route path="/bookings/:id" element={<BookingDetailPage />} />
        <Route path="/calendar" element={<BookingCalendarPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
