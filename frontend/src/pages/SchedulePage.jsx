/**
 * Schedule page: day view by staff.
 * Loads staff and reservations for the selected date, shows ScheduleGrid or empty state.
 * Clicking a slot opens create modal; clicking a reservation opens edit modal.
 */
import { useState, useEffect } from 'react';
import { getStaff } from '../api/staffApi';
import { getReservations } from '../api/reservationsApi';
import { getPhotoUrl } from '../api/uploadApi';
import { useScheduleDate } from '../context/ScheduleDateContext';
import { getDisplayHours, getTimeSlots } from '../utils/schedule';
import ScheduleGrid from '../components/ScheduleGrid';
import ReservationModal from '../components/ReservationModal';

export default function SchedulePage() {
  const { currentDate } = useScheduleDate();
  const [staff, setStaff] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState(null);

  const displayHours = getDisplayHours();
  const timeSlotsForSelection = getTimeSlots();

  const loadStaff = async () => {
    try {
      const data = await getStaff();
      setStaff(data);
    } catch (e) {
      setError(e.message);
    }
  };

  const loadReservations = async () => {
    if (!currentDate) return;
    setLoading(true);
    try {
      const data = await getReservations(currentDate);
      setReservations(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    loadReservations();
  }, [currentDate]);

  /** Open create modal, optionally pre-filled with specialist and time. */
  const openCreateModal = (specialistId, startTime) => {
    setModalState({
      mode: 'create',
      specialistId: specialistId ?? staff[0]?.id,
      startTime: startTime ?? timeSlotsForSelection[0],
      date: currentDate,
    });
  };

  const openEditModal = (reservation) => {
    setModalState({ mode: 'edit', reservation });
  };

  const closeModal = () => setModalState(null);

  const refreshAndClose = () => {
    closeModal();
    loadReservations();
  };

  return (
    <div className="schedule-page">
      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="loading">Loading schedule...</div>}

      {!loading && staff.length === 0 && (
        <p className="empty-state">Add staff members first to create reservations.</p>
      )}
      {!loading && staff.length > 0 && (
        <ScheduleGrid
          staff={staff}
          reservations={reservations}
          getPhotoUrl={getPhotoUrl}
          displayHours={displayHours}
          timeSlotsForSelection={timeSlotsForSelection}
          currentDate={currentDate}
          onSlotClick={openCreateModal}
          onReservationClick={openEditModal}
          onDrop={loadReservations}
        />
      )}

      {modalState && (
        <ReservationModal
          mode={modalState.mode}
          reservation={modalState.reservation}
          initialSpecialistId={modalState.specialistId}
          initialStartTime={modalState.startTime}
          initialDate={modalState.date}
          staff={staff}
          timeSlots={timeSlotsForSelection}
          onClose={closeModal}
          onSaved={refreshAndClose}
          onDeleted={refreshAndClose}
        />
      )}
    </div>
  );
}
