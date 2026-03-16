/**
 * Day schedule grid: staff columns × time rows.
 * Renders reservation blocks, supports drag-and-drop to move reservations.
 * Uses 12 slots per hour (5 min each) for drop positioning.
 */
import { useState, useRef } from 'react';
import { updateReservation } from '../api/reservationsApi';
import { timeToMinutes, formatTimeHHMM } from '../utils/schedule';
import { PersonIcon } from './Icons';
import './ScheduleGrid.css';

const SLOTS_PER_HOUR = 12;

/** Compute how much of a reservation falls within this hour row (for multi-hour blocks). */
function getReservationSegmentInHour(reservation, hourStartMinutes) {
  const rStart = timeToMinutes(reservation.start_time);
  const rEnd = rStart + reservation.duration_minutes;
  const hourEnd = hourStartMinutes + 60;
  if (rEnd <= hourStartMinutes || rStart >= hourEnd) return null;
  const segStart = Math.max(rStart, hourStartMinutes);
  const segEnd = Math.min(rEnd, hourEnd);
  const topPct = ((segStart - hourStartMinutes) / 60) * 100;
  const heightPct = ((segEnd - segStart) / 60) * 100;
  return { topPct, heightPct, isFirstSegment: rStart >= hourStartMinutes };
}

/** Returns full-block geometry for a reservation spanning multiple hours. Only valid when isFirstSegment. */
function getReservationFullBlockGeometry(reservation, hourStartMinutes) {
  const rStart = timeToMinutes(reservation.start_time);
  const rEnd = rStart + reservation.duration_minutes;
  const hourEnd = hourStartMinutes + 60;
  if (rEnd <= hourStartMinutes || rStart >= hourEnd) return null;
  if (rStart < hourStartMinutes) return null; /* not first segment */
  const topPct = ((rStart - hourStartMinutes) / 60) * 100;
  const totalMinutes = rEnd - rStart;
  const heightPct = (totalMinutes / 60) * 100;
  return { topPct, heightPct };
}

export default function ScheduleGrid({
  staff,
  reservations,
  displayHours,
  timeSlotsForSelection,
  currentDate,
  onSlotClick,
  onReservationClick,
  onDrop,
  getPhotoUrl = (url) => url,
}) {
  const [dragging, setDragging] = useState(null);
  const [ghostPos, setGhostPos] = useState(null);
  const [dropValid, setDropValid] = useState(false);
  const cellRefs = useRef({});

  /** Group reservations by specialist for overlap checks and rendering. */
  const reservationsBySpecialist = {};
  for (const r of reservations) {
    if (!reservationsBySpecialist[r.specialist_id]) reservationsBySpecialist[r.specialist_id] = [];
    reservationsBySpecialist[r.specialist_id].push(r);
  }

  /** Find reservations that overlap with the given time slot (used for drag validation). */
  const getOverlapping = (specialistId, startTime, durationMinutes, excludeId) => {
    const startMinVal = timeToMinutes(startTime);
    const endMinVal = startMinVal + durationMinutes;
    const list = reservationsBySpecialist[specialistId] || [];
    return list.filter((r) => {
      if (r.id === excludeId) return false;
      const rStart = timeToMinutes(r.start_time);
      const rEnd = rStart + r.duration_minutes;
      return rStart < endMinVal && rEnd > startMinVal;
    });
  };

  const handleReservationDragStart = (e, reservation) => {
    setDragging(reservation);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(reservation));
    e.dataTransfer.setData('text/plain', String(reservation.id));
  };

  const handleDragEnd = () => {
    setDragging(null);
    setGhostPos(null);
  };

  /** Find which row (hourIndex) contains the cursor for a specialist column */
  const getCellUnderCursor = (e, specialistId) => {
    const y = e.clientY;
    for (let i = 0; i < displayHours.length; i++) {
      const key = `${specialistId}-${i}`;
      const el = cellRefs.current[key];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) return { hourIndex: i, rect };
    }
    return null;
  };

  /** Map mouse Y position within a cell to a 5‑min slot (e.g. 09:15). */
  const getDropTimeFromEvent = (e, specialistId, hourIndex, rect) => {
    const r = rect ?? cellRefs.current[`${specialistId}-${hourIndex}`]?.getBoundingClientRect?.();
    if (!r) return displayHours[hourIndex];
    const relativeY = (e.clientY - r.top) / r.height;
    const slotInHour = Math.min(11, Math.max(0, Math.floor(relativeY * SLOTS_PER_HOUR)));
    const [h] = displayHours[hourIndex].split(':').map(Number);
    const dropMinutes = slotInHour * 5;
    return `${String(h).padStart(2, '0')}:${String(dropMinutes).padStart(2, '0')}`;
  };

  const handleSlotDragOver = (e, specialistId, hourIndex) => {
    e.preventDefault();
    if (!dragging) return;
    const cellUnder = getCellUnderCursor(e, specialistId);
    const targetHourIndex = cellUnder?.hourIndex ?? hourIndex;
    const dropTime = getDropTimeFromEvent(e, specialistId, targetHourIndex, cellUnder?.rect);
    const overlaps = getOverlapping(specialistId, dropTime, dragging.duration_minutes, dragging.id);
    setDropValid(overlaps.length === 0);
    setGhostPos({ specialistId, hourIndex: targetHourIndex, dropTime });
  };

  const handleSlotDrop = async (e, specialistId, hourIndex) => {
    e.preventDefault();
    if (!dragging) return;
    const cellUnder = getCellUnderCursor(e, specialistId);
    const targetHourIndex = cellUnder?.hourIndex ?? hourIndex;
    const dropTime = getDropTimeFromEvent(e, specialistId, targetHourIndex, cellUnder?.rect);
    const overlaps = getOverlapping(specialistId, dropTime, dragging.duration_minutes, dragging.id);
    if (overlaps.length > 0) {
      setDragging(null);
      setGhostPos(null);
      return;
    }
    try {
      await updateReservation(dragging.id, {
        specialist_id: specialistId,
        start_time: dropTime,
        duration_minutes: dragging.duration_minutes,
        service_ids: dragging.services.map((s) => s.id),
      });
      onDrop();
    } catch (err) {
      console.error(err);
      onDrop();
    }
    setDragging(null);
    setGhostPos(null);
  };

  const handleGridDragLeave = () => {
    setGhostPos(null);
  };

  return (
    <div className="schedule-grid-wrap">
      <table className="schedule-grid">
        <thead>
          <tr>
            <th className="time-col"></th>
            {staff.map((s) => (
              <th key={s.id} className="specialist-col">
                <div className="specialist-header">
                  <div className="specialist-header-photo">
                    {s.photo_url ? (
                      <img src={getPhotoUrl(s.photo_url)} alt="" />
                    ) : (
                      <span className="header-initials">{s.first_name?.[0]}{s.last_name?.[0]}</span>
                    )}
                  </div>
                  <span>{s.first_name} {s.last_name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayHours.map((hourLabel, hourIndex) => {
            const hourStartMinutes = timeToMinutes(hourLabel);
            return (
              <tr key={hourLabel}>
                <td className="time-cell">{hourLabel}</td>
                {staff.map((s) => {
                  const overlappingReservations = (reservationsBySpecialist[s.id] || []).filter(
                    (r) => getReservationSegmentInHour(r, hourStartMinutes)
                  );
                  const hasSpanningReservation = overlappingReservations.some((r) => {
                    const seg = getReservationSegmentInHour(r, hourStartMinutes);
                    if (!seg || !seg.isFirstSegment) return false;
                    const rEnd = timeToMinutes(r.start_time) + r.duration_minutes;
                    return rEnd > hourStartMinutes + 60;
                  });
                  const showGhost =
                    ghostPos?.specialistId === s.id && ghostPos?.hourIndex === hourIndex;
                  const ghostDropTime = ghostPos?.dropTime;
                  const ghostSpansMultipleHours = (dragging?.duration_minutes || 30) > 60;
                  /* Earlier rows get higher z-index so extending blocks stay visible over rows below */
                  const rowZIndex = 1000 - hourIndex;

                  return (
                    <td
                      key={s.id}
                      ref={(el) => { cellRefs.current[`${s.id}-${hourIndex}`] = el; }}
                      className="schedule-cell"
                      data-spanning={hasSpanningReservation || (showGhost && ghostSpansMultipleHours) ? 'true' : undefined}
                      style={{ zIndex: rowZIndex }}
                      onDragOver={(e) => handleSlotDragOver(e, s.id, hourIndex)}
                      onDrop={(e) => handleSlotDrop(e, s.id, hourIndex)}
                      onDragLeave={handleGridDragLeave}
                      onClick={() => onSlotClick(s.id, hourLabel)}
                    >
                      {overlappingReservations.map((reservation) => {
                        const seg = getReservationSegmentInHour(reservation, hourStartMinutes);
                        if (!seg || !seg.isFirstSegment) return null;
                        const full = getReservationFullBlockGeometry(reservation, hourStartMinutes);
                        const geom = full || seg;
                        return (
                          <div
                            key={reservation.id}
                            className={`reservation-block ${dragging?.id === reservation.id ? 'dragging' : ''}`}
                            style={{
                              top: `${geom.topPct}%`,
                              height: `calc(${geom.heightPct}% - 4px)`,
                              '--reservation-color': reservation.main_service_color,
                              '--reservation-accent': reservation.main_service_color,
                            }}
                            draggable
                            onDragStart={(e) => handleReservationDragStart(e, reservation)}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => {
                              e.stopPropagation();
                              onReservationClick(reservation);
                            }}
                          >
                            <div className="reservation-scroll">
                              <div className="reservation-main">{reservation.main_service_name}</div>
                              {reservation.additional_services?.length > 0 && (
                                <ul className="reservation-extras">
                                  {reservation.additional_services.map((svc, i) => (
                                    <li key={i}>{svc}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div className="reservation-footer">
                              <span className="reservation-time">
                                {formatTimeHHMM(reservation.start_time)} – {formatTimeHHMM(reservation.end_time)}
                              </span>
                              <span className="reservation-badge">
                                <PersonIcon size={12} />
                                <span>{reservation.specialist_short_name}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {showGhost && ghostDropTime && (
                        <div
                          className={`reservation-ghost ${dropValid ? 'valid' : 'invalid'}`}
                          style={{
                            top: `${(timeToMinutes(ghostDropTime) - hourStartMinutes) / 60 * 100}%`,
                            height: `calc(${(dragging?.duration_minutes || 30) / 60 * 100}% - 4px)`,
                          }}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
