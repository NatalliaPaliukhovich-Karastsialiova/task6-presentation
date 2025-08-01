import { useState, useEffect } from 'react';
import { X } from 'react-bootstrap-icons';

export default function SlideThumb({ slide, index, isActive, onSelect, onRename, onDelete, canEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(slide.title || 'Untitled Slide');

  const handleSave = () => {
    setIsEditing(false);
    if (title.trim() !== slide.title) {
      onRename(slide._id, title.trim());
    }
  };

  useEffect(() => {
    setTitle(slide.title || 'Untitled Slide');
  }, [slide.title]);

  return (
    <div
      className={`m-3 ${isActive ? 'fw-bold' : ''}`}
      onClick={() => onSelect(slide)}
      style={{ cursor: 'pointer' }}
    >
      <div
        className={`position-relative bg-white`}
        style={{
          height: '120px',
          border: isActive ? '2px solid #b341c6' : '2px solid gray',
          borderRadius: '12px',
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          canEdit && setIsEditing(true);
        }}
      >
        <span
          className="position-absolute top-0 start-0 m-2 "
          style={{ fontWeight: '500',
            color: isActive ? '#b341c6' : 'gray',
           }}
        >
          {index + 1}
        </span>

        {canEdit && (
          <button
            className="btn btn-sm btn-light position-absolute bottom-0 end-0 m-1 p-1"
            style={{ lineHeight: 1,
            color: isActive ? '#b341c6' : 'gray',
           }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(slide._id);
            }}
          >
            <X size={14} />
          </button>
        )}

        <div className="d-flex justify-content-center align-items-center h-100">
          {isEditing && canEdit ? (
            <input
              type="text"
              className="form-control form-control-sm text-center"
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              style={{ maxWidth: '150px' }}
            />
          ) : (
            <span className="text-center"
            style={{
              color: isActive ? '#b341c6' : 'gray',
            }}
            >{title}</span>
          )}
        </div>
      </div>
    </div>
  );
}
