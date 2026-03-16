/**
 * Modal to add a new custom column to the services table.
 * Creates a service_custom_field and adds it to column_preferences.
 */
import { useState } from 'react';
import Modal from './Modal';

export default function AddColumnModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [err, setErr] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr('Field name is required');
      return;
    }
    onAdd(name.trim());
  };

  return (
    <Modal title="Add New Column" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {err && <div className="error-banner">{err}</div>}
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}
