/**
 * Services table with draggable column headers.
 * Column order is persisted via onColumnOrderChange; custom columns can be removed.
 */
import { useState, useEffect } from 'react';
import { EditIcon, DeleteIcon, CloseIcon } from './Icons';

export default function ServicesTable({ services, columns, onEdit, onDelete, onAddColumn, onColumnOrderChange, onRemoveColumn }) {
  const [draggedCol, setDraggedCol] = useState(null);
  const [colOrder, setColOrder] = useState(columns);

  useEffect(() => {
    setColOrder(columns);
  }, [columns]);

  const handleColumnDragStart = (e, idx) => {
    setDraggedCol(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idx);
  };

  const handleColumnDragOver = (e) => e.preventDefault();

  const handleColumnDrop = (e, dropIdx) => {
    e.preventDefault();
    if (draggedCol == null) return;
    const newOrder = [...colOrder];
    const [removed] = newOrder.splice(draggedCol, 1);
    newOrder.splice(dropIdx, 0, removed);
    setColOrder(newOrder);
    setDraggedCol(null);
    onColumnOrderChange(newOrder.map((c) => ({ column_key: c.column_key, field_id: c.field_id })));
  };

  /** Hide color column in table (it's shown as a dot next to the name). */
  const displayCols = colOrder.filter((col) => col.column_key !== 'color');
  const nameCol = displayCols.find((c) => c.column_key === 'name');
  const otherCols = displayCols.filter((c) => c.column_key !== 'name');

  return (
    <div className="services-table-wrap">
      <div className="services-table-inner">
        <table className="services-table">
          <thead>
            <tr>
              {nameCol && (
                <th
                  key={nameCol.column_key}
                  draggable
                  onDragStart={(e) => handleColumnDragStart(e, colOrder.indexOf(nameCol))}
                  onDragOver={handleColumnDragOver}
                  onDrop={(e) => handleColumnDrop(e, colOrder.indexOf(nameCol))}
                  className="draggable-header col-service"
                >
                  <span className="drag-handle">⋮⋮</span> Service
                </th>
              )}
              <th className="col-spacer" aria-hidden />
              {otherCols.map((col) => {
                const origIdx = colOrder.indexOf(col);
                const isRemovable = col.field_id != null;
                return (
                  <th
                    key={col.column_key}
                    draggable
                    onDragStart={(e) => handleColumnDragStart(e, origIdx)}
                    onDragOver={handleColumnDragOver}
                    onDrop={(e) => handleColumnDrop(e, origIdx)}
                    className={`draggable-header col-right ${isRemovable ? 'col-with-remove' : ''}`}
                  >
                    <span className="drag-handle">⋮⋮</span> {col.name}
                    {isRemovable && onRemoveColumn && (
                      <button
                        type="button"
                        className="col-remove-btn"
                        onClick={(e) => { e.stopPropagation(); onRemoveColumn(col.field_id); }}
                        title="Remove column"
                        aria-label={`Remove ${col.name} column`}
                      >
                        <CloseIcon size={14} />
                      </button>
                    )}
                  </th>
                );
              })}
              <th className="add-col-header col-right">
                <button type="button" className="btn btn-outline btn-add-col" onClick={onAddColumn} title="Add column">+</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr>
                <td colSpan={displayCols.length + 2} className="empty-cell">No services found. Add one to get started.</td>
              </tr>
            )}
            {services.map((s) => (
              <tr key={s.id}>
                {nameCol && (
                  <td key={nameCol.column_key} className="col-service">
                    <span className="service-name-with-color content-row-text">
                      <span className="color-indicator" style={{ backgroundColor: s.color || '#999' }} />
                      {s.name}
                    </span>
                  </td>
                )}
                <td className="col-spacer" aria-hidden />
                {otherCols.map((col) => (
                  <td key={col.column_key} className="col-right content-row-text">
                    {col.column_key === 'price' && (
                      <span className="price-cell">${typeof s.price === 'number' ? s.price.toFixed(2) : s.price}</span>
                    )}
                    {col.field_id != null && (s.custom_fields?.[col.column_key] ?? '')}
                  </td>
                ))}
                <td className="actions-cell col-right">
                  <div className="actions-cell-inner">
                    <button type="button" className="icon-btn icon-btn-edit" onClick={() => onEdit(s)} title="Edit">
                      <EditIcon size={18} />
                    </button>
                    <button type="button" className="icon-btn icon-btn-danger" onClick={() => onDelete(s.id)} title="Delete">
                      <DeleteIcon size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
