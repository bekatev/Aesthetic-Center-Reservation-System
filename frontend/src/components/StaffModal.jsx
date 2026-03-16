/**
 * Modal for adding or editing a staff member.
 * Handles name fields and photo upload; uploads file on submit before calling onSubmit.
 */
import { useState, useEffect } from 'react';
import Modal from './Modal';
import { ImagePlusIcon, FileIcon } from './Icons';
import { uploadPhoto, getPhotoUrl } from '../api/uploadApi';
import './StaffModal.css';

export default function StaffModal({ mode, staff, onClose, onSubmit, onDelete }) {
  const [first_name, setFirstName] = useState(staff?.first_name ?? '');
  const [last_name, setLastName] = useState(staff?.last_name ?? '');
  const [photo_url, setPhotoUrl] = useState(staff?.photo_url ?? '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(staff?.photo_url ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (staff) {
      setPhotoPreview(staff.photo_url ?? null);
      setPhotoUrl(staff.photo_url ?? '');
    } else {
      setPhotoPreview(null);
      setPhotoUrl('');
    }
    setPhotoFile(null);
  }, [staff]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoUrl('');
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      let finalPhotoUrl = photo_url;
      if (photoFile) {
        finalPhotoUrl = await uploadPhoto(photoFile);
      }
      await onSubmit({ first_name, last_name, photo_url: finalPhotoUrl || null });
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
    <Modal title={mode === 'add' ? 'Add New Staff Member' : 'Edit Staff Member'} onClose={onClose} className="staff-modal">
      <form onSubmit={handleSubmit} className="staff-modal-form">
        {err && <div className="error-banner">{err}</div>}
        <div className="form-row-photo">
          <div className="form-fields-left">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Lastname</label>
              <input
                type="text"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group photo-upload-area">
            <label>Photo</label>
            <label className="photo-upload-box">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handlePhotoChange}
                className="photo-upload-input"
              />
              {(photoPreview || photo_url) ? (
                <div className="photo-upload-preview">
                  <img
                    src={
                      photoPreview?.startsWith?.('blob:')
                        ? photoPreview
                        : getPhotoUrl(photoPreview || photo_url)
                    }
                    alt="Preview"
                  />
                </div>
              ) : (
                <div className="photo-upload-placeholder">
                  <ImagePlusIcon size={40} />
                  <span>Add Photo</span>
                </div>
              )}
            </label>
            {photoFile && (
              <div className="photo-filename-row">
                <FileIcon size={16} />
                <span>{photoFile.name}</span>
              </div>
            )}
          </div>
        </div>
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
