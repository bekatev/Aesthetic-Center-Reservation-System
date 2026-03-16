/**
 * Root App component.
 * Sets up routing (Schedule, Staff, Services) and wraps everything in ScheduleDateProvider
 * so the selected schedule date is shared across the layout and schedule page.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScheduleDateProvider } from './context/ScheduleDateContext';
import Layout from './components/Layout';
import SchedulePage from './pages/SchedulePage';
import StaffPage from './pages/StaffPage';
import ServicesPage from './pages/ServicesPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <ScheduleDateProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SchedulePage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="services" element={<ServicesPage />} />
        </Route>
      </Routes>
      </ScheduleDateProvider>
    </BrowserRouter>
  );
}
