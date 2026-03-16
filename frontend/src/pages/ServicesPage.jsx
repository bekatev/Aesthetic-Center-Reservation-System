/**
 * Services management page: table with search, add/edit/delete, custom columns.
 * Filtering is done client-side; column order and custom fields are persisted via API.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getServices,
  createService,
  updateService,
  deleteService,
  createCustomField,
  deleteCustomField,
  updateColumnOrder,
} from '../api/servicesApi';
import { useDebounce } from '../hooks/useDebounce';
import { SearchIcon } from '../components/Icons';
import ServiceModal from '../components/ServiceModal';
import AddColumnModal from '../components/AddColumnModal';
import ServicesTable from '../components/ServicesTable';

/** Predefined colors for service color picker. */
const COLOR_PALETTE = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e', '#e91e63', '#00bcd4',
];

export default function ServicesPage() {
  const [data, setData] = useState({ services: [], columns: [] });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [addColumnModal, setAddColumnModal] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getServices();
      setData({ services: res.services || [], columns: res.columns || [] });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Filter services by search (name, price, custom fields). */
  const filteredServices = data.services.filter((s) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    const base = `${s.name} ${s.price}`.toLowerCase();
    const custom = Object.values(s.custom_fields || {}).join(' ').toLowerCase();
    return base.includes(q) || custom.includes(q);
  });

  const handleAdd = () => setModal({ mode: 'add' });
  const handleEdit = (s) => setModal({ mode: 'edit', service: s });
  const handleClose = () => setModal(null);

  const handleSubmit = async (formData) => {
    try {
      if (modal.mode === 'add') {
        await createService(formData);
      } else {
        await updateService(modal.service.id, formData);
      }
      handleClose();
      load();
    } catch (e) {
      throw e;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteService(id);
      handleClose();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddColumn = async (name) => {
    try {
      await createCustomField(name);
      setAddColumnModal(false);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleColumnOrderChange = async (newOrder) => {
    try {
      await updateColumnOrder(newOrder);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRemoveColumn = async (fieldId) => {
    if (!window.confirm('Remove this column? All values in this column will be deleted.')) return;
    try {
      await deleteCustomField(fieldId);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="services-page">
      <div className="page-container">
        <div className="page-header">
          <h2>Services</h2>
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
          <ServicesTable
            services={filteredServices}
            columns={data.columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddColumn={() => setAddColumnModal(true)}
            onColumnOrderChange={handleColumnOrderChange}
            onRemoveColumn={handleRemoveColumn}
          />
        )}
      </div>

      {modal && (
        <ServiceModal
          mode={modal.mode}
          service={modal.service}
          columns={data.columns}
          colorPalette={COLOR_PALETTE}
          onClose={handleClose}
          onSubmit={handleSubmit}
          onDelete={modal.mode === 'edit' ? () => handleDelete(modal.service.id) : null}
        />
      )}

      {addColumnModal && (
        <AddColumnModal
          onClose={() => setAddColumnModal(false)}
          onAdd={handleAddColumn}
        />
      )}
    </div>
  );
}
