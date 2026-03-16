/**
 * Modal for adding or editing a service.
 * Includes name, price, color picker, and dynamic custom fields from columns.
 */
import { useState } from 'react';
import Modal from './Modal';
import ColorDropdown from './ColorDropdown';

export default function ServiceModal({ mode, service, columns, colorPalette, onClose, onSubmit, onDelete }) {
  const [name, setName] = useState(service?.name ?? '');
  const [price, setPrice] = useState(service?.price ?? '');
  const [color, setColor] = useState(service?.color ?? colorPalette[0]);
  const [customFields, setCustomFields] = useState(service?.custom_fields ?? {});
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  /** Only show custom field columns (not base columns like name/price/color). */
  const customCols = columns.filter((c) => c.field_id != null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, price, color, custom_fields: customFields });
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure?')) onDelete();
  };

  return (
    <Modal title={mode === 'add' ? 'New service' : 'Edit service'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="service-modal-form">
        {err && <div className="error-banner">{err}</div>}
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price</label>
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Color</label>
            <ColorDropdown value={color} options={colorPalette} onChange={setColor} />
          </div>
        </div>
        {customCols.map((col) => (
          <div key={col.column_key} className="form-group">
            <label>{col.name}</label>
            <input
              type="text"
              value={customFields[col.column_key] ?? ''}
              onChange={(e) => setCustomFields((prev) => ({ ...prev, [col.column_key]: e.target.value }))}
            />
          </div>
        ))}
        <div className="modal-actions">
          {onDelete && (
            <button type="button" className="btn btn-danger" onClick={handleDeleteClick}>Delete</button>
          )}
          <div className="modal-actions-right">
            <button type="submit" className="btn btn-primary" disabled={submitting}>Save</button>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
