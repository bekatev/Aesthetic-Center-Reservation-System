/**
 * Shared schedule date state.
 * The Layout date picker and SchedulePage both need the current date; this context
 * avoids prop drilling and keeps them in sync.
 */
import { createContext, useContext, useState } from 'react';
import { formatDateForInput } from '../utils/date';

const ScheduleDateContext = createContext(null);

export function ScheduleDateProvider({ children }) {
  const [currentDate, setCurrentDate] = useState(formatDateForInput(new Date()));
  return (
    <ScheduleDateContext.Provider value={{ currentDate, setCurrentDate }}>
      {children}
    </ScheduleDateContext.Provider>
  );
}

/** Hook to read/update the schedule date. Must be used inside ScheduleDateProvider. */
export function useScheduleDate() {
  const ctx = useContext(ScheduleDateContext);
  if (!ctx) throw new Error('useScheduleDate must be used within ScheduleDateProvider');
  return ctx;
}
