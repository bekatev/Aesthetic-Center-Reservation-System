/**
 * Color picker dropdown for service color selection.
 * Closes when clicking outside (via useRef + click listener).
 */
import { useState, useEffect, useRef } from 'react';

export default function ColorDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  return (
    <div className="color-select-wrap" ref={wrapRef}>
      <button
        type="button"
        className="color-select-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="color-select-swatch" style={{ backgroundColor: value || '#999' }} />
        <span className="color-select-chevron" aria-hidden>▼</span>
      </button>
      {open && (
        <div className="color-select-dropdown">
          {options.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-select-option ${value === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              title={c}
            />
          ))}
        </div>
      )}
    </div>
  );
}
