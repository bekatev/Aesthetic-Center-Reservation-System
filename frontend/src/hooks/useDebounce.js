/**
 * Debounces a value so it only updates after the user stops typing for `delay` ms.
 * Used for search inputs to avoid firing API calls on every keystroke.
 */
import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}
