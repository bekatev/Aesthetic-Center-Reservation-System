/**
 * Modal for creating or editing a reservation.
 * Specialist, date, time, duration, and multiple services with searchable checklist.
 * Computes total price from selected services.
 */
import { useState, useEffect } from 'react';
import { createReservation, updateReservation, deleteReservation } from '../api/reservationsApi';
import { getServices } from '../api/servicesApi';
import { getPhotoUrl } from '../api/uploadApi';
import { formatDateForInput } from '../utils/date';
import Modal from './Modal';
import { SearchIcon, CalendarIcon, ClockIcon, CloseIcon } from './Icons';
import './ReservationModal.css';

export default function ReservationModal({
  mode,
  reservation,
  initialSpecialistId,
  initialStartTime,
  initialDate,
  staff,
  timeSlots,
  onClose,
  onSaved,
  onDeleted,
}) {
  const [services, setServices] = useState([]);
  const [specialistId, setSpecialistId] = useState(initialSpecialistId ?? '');
  const [date, setDate] = useState(initialDate ?? '');
  const [startTime, setStartTime] = useState(initialStartTime ?? '');
  const [duration, setDuration] = useState(30);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getServices().then((res) => setServices(res.services || []));
  }, []);

  useEffect(() => {
    if (mode === 'edit' && reservation) {
      setSpecialistId(reservation.specialist_id);
      setDate(formatDateForInput(reservation.date));
      setStartTime((reservation.start_time || '').toString().substring(0, 5));
      setDuration(reservation.duration_minutes);
      setSelectedServiceIds(reservation.services?.map((s) => s.id) ?? []);
    } else {
      setSpecialistId(initialSpecialistId ?? (staff[0]?.id ?? ''));
      setDate(initialDate ?? '');
      setStartTime(initialStartTime ?? '');
      setDuration(30);
      setSelectedServiceIds([]);
    }
  }, [mode, reservation, initialSpecialistId, initialDate, initialStartTime, staff]);

  const durationOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 90, 120];

  /** Filter services by search; show checklist only when there are results to add. */
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );
  const availableToAdd = filteredServices.filter((s) => !selectedServiceIds.includes(s.id));
  const showServiceChecklist = serviceSearch.trim().length > 0 && availableToAdd.length > 0;

  const toggleService = (id) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeService = (id) => {
    setSelectedServiceIds((prev) => prev.filter((x) => x !== id));
  };

  const selectedServicesData = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalAmount = selectedServicesData.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await createReservation({
          specialist_id: Number(specialistId),
          date,
          start_time: startTime,
          duration_minutes: duration,
          service_ids: selectedServiceIds,
        });
      } else {
        await updateReservation(reservation.id, {
          specialist_id: Number(specialistId),
          date,
          start_time: startTime,
          duration_minutes: duration,
          service_ids: selectedServiceIds,
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    setSubmitting(true);
    try {
      await deleteReservation(reservation.id);
      onDeleted();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSpecialist = staff.find((s) => String(s.id) === String(specialistId));

  return (
    <Modal
      title={mode === 'create' ? 'New Reservation' : 'Edit Reservation'}
      onClose={onClose}
      className="reservation-modal"
    >
      <form className="reservation-modal-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}

        <div className="form-group">
          <label>Name</label>
          <div className="select-with-avatar">
            <span className="select-avatar">
              {selectedSpecialist?.photo_url ? (
                <img src={getPhotoUrl(selectedSpecialist.photo_url)} alt="" />
              ) : (
                <span className="avatar-initials">
                  {selectedSpecialist ? `${selectedSpecialist.first_name?.[0] || ''}${selectedSpecialist.last_name?.[0] || ''}` : '?'}
                </span>
              )}
            </span>
            <select value={specialistId} onChange={(e) => setSpecialistId(e.target.value)} required className="select-with-icon">
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row form-row-3">
          <div className="form-group">
            <label>Date</label>
            <div className="input-with-icon">
              <CalendarIcon size={18} />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Appt Time</label>
            <div className="input-with-icon">
              <ClockIcon size={18} />
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)} required>
                {timeSlots.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Duration</label>
            <div className="input-with-icon">
              <ClockIcon size={18} />
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {durationOptions.map((d) => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Services</label>
          <div className="search-with-icon">
            <SearchIcon size={18} />
            <input
              type="text"
              placeholder="Search"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="search-input"
            />
          </div>
          {showServiceChecklist && (
            <div className="service-checklist">
              {availableToAdd.map((s) => (
                <label key={s.id} className="service-check-item" onClick={() => toggleService(s.id)}>
                  <span className="service-check-name">{s.name} — ${(parseFloat(s.price) || 0).toFixed(2)}</span>
                  <input type="checkbox" checked={false} readOnly />
                </label>
              ))}
            </div>
          )}
          <div className="service-chips">
            {selectedServicesData.map((s) => (
              <span
                key={s.id}
                className="service-chip"
                style={{ backgroundColor: `${s.color}80` }}
              >
                <span className="chip-name">{s.name}</span>
                <span className="chip-right">
                  <span className="chip-price">${(parseFloat(s.price) || 0).toFixed(2)}</span>
                  <button type="button" className="chip-remove" onClick={() => removeService(s.id)}>
                    <CloseIcon size={14} />
                  </button>
                </span>
              </span>
            ))}
          </div>
          {selectedServicesData.length > 0 && (
            <div className="reservation-total">Total: ${totalAmount.toFixed(2)}</div>
          )}
        </div>

        <div className="modal-actions">
          {mode === 'edit' && (
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
              Delete
            </button>
          )}
          <div className="modal-actions-right">
            <button type="submit" className="btn btn-primary" disabled={submitting || selectedServiceIds.length === 0}>
              Save
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
