/**
 * Main layout: top nav (Schedule, Staff, Services) and date picker on the schedule page.
 * Renders child routes via Outlet.
 */
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useScheduleDate } from '../context/ScheduleDateContext';
import { formatDateDisplay } from '../utils/date';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const { currentDate, setCurrentDate } = useScheduleDate();
  const isSchedulePage = location.pathname === '/';

  /** Move the selected date by delta days (-1 or +1). */
  const changeDate = (delta) => {
    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setCurrentDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-left" />
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Schedule</Link>
          <Link to="/staff" className={location.pathname === '/staff' ? 'active' : ''}>Staff</Link>
          <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>Services</Link>
        </div>
        <div className="nav-right">
        {isSchedulePage && (
          <div className="nav-date-picker">
            <button type="button" className="date-nav-btn" onClick={() => changeDate(-1)}>
              <ChevronLeftIcon size={20} />
            </button>
            <label className="date-display">
              <CalendarIcon size={18} />
              <span>{formatDateDisplay(currentDate)}</span>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="date-input-hidden"
              />
            </label>
            <button type="button" className="date-nav-btn" onClick={() => changeDate(1)}>
              <ChevronRightIcon size={20} />
            </button>
          </div>
        )}
        </div>
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
