import { useState } from 'react';
import { createPresentation } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CreatePresentationModal({ onCreated }) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return alert('Please enter a title');
    const newPresentation = await createPresentation(title);
    onCreated(newPresentation);
    setTitle('');
    setShow(false);
  };

  return (
    <>
      <button className="btn me-2 btn-lg"
        style={{backgroundColor: '#e8c8f8'}}
        onClick={() => setShow(true)}>
        + Create New
      </button>

      {show && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          onClick={() => setShow(false)}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Presentation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShow(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-lg" onClick={() => setShow(false)}>
                  Cancel
                </button>
                <button className="btn btn-lg" style={{backgroundColor: '#e8c8f8'}} onClick={handleCreate}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
