/**
 * Staff management page: list of specialists with search, add/edit/delete.
 * Search is debounced; list refreshes on modal save/delete.
 */
import { useState, useEffect, useCallback } from 'react';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../api/staffApi';
import { getPhotoUrl } from '../api/uploadApi';
import { useDebounce } from '../hooks/useDebounce';
import { EditIcon, DeleteIcon, SearchIcon } from '../components/Icons';
import StaffModal from '../components/StaffModal';

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStaff(debouncedSearch);
      setStaff(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => setModal({ mode: 'add' });
  const handleEdit = (s) => setModal({ mode: 'edit', staff: s });
  const handleClose = () => setModal(null);

  const handleSubmit = async (data) => {
    try {
      if (modal.mode === 'add') {
        await createStaff(data);
      } else {
        await updateStaff(modal.staff.id, data);
      }
      handleClose();
      load();
    } catch (e) {
      throw e;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await deleteStaff(id);
      handleClose();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="staff-page">
      <div className="page-container">
        <div className="page-header">
          <h2>Staff</h2>
          <button type="button" className="btn btn-outline" onClick={handleAdd}>+ Add New</button>
        </div>

        <div className="search-bar">
          <span className="search-icon-wrap">
            <SearchIcon size={18} />
          </span>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="loading">Loading...</div>}

        {!loading && (
          <div className="staff-list-wrap">
            {staff.length === 0 && <p className="empty-state">No staff members found. Add one to get started.</p>}
            {staff.map((s) => (
              <div key={s.id} className="staff-row">
                <div className="staff-row-photo">
                  {s.photo_url ? (
                    <img src={getPhotoUrl(s.photo_url)} alt={`${s.first_name} ${s.last_name}`} />
                  ) : (
                    <div className="staff-photo-placeholder">
                      {s.first_name?.[0]}{s.last_name?.[0]}
                    </div>
                  )}
                </div>
                <span className="staff-row-name content-row-text">{s.first_name} {s.last_name}</span>
                <div className="staff-row-actions">
                  <button type="button" className="icon-btn icon-btn-edit" onClick={() => handleEdit(s)} title="Edit">
                    <EditIcon size={18} />
                  </button>
                  <button type="button" className="icon-btn icon-btn-danger" onClick={() => handleDelete(s.id)} title="Delete">
                    <DeleteIcon size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <StaffModal
          mode={modal.mode}
          staff={modal.staff}
          onClose={handleClose}
          onSubmit={handleSubmit}
          onDelete={modal.mode === 'edit' ? () => handleDelete(modal.staff.id) : null}
        />
      )}
    </div>
  );
}
