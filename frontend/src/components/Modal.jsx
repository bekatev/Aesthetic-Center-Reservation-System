/**
 * Reusable modal overlay.
 * Clicking the backdrop calls onClose; clicking the inner content does not (stopPropagation).
 */
import './Modal.css';

export default function Modal({ title, children, onClose, className }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${className || ''}`.trim()} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
