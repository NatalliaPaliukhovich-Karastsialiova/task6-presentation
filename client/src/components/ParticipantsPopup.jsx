export default function ParticipantsPopup({ participants, currentUser, onSetRole }) {
  return (
    <div
      className="position-absolute bg-white shadow rounded p-3"
      style={{ top: '50px', right: '0', width: '350px', zIndex: 1000 }}
    >
      <h6 className="mb-3 fw-semibold">People with access</h6>
      <ul className="list-unstyled mb-0">
        {participants.map((p) => (
          <li
            key={p._id}
            className="d-flex align-items-center mb-3"
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle me-3"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#d1c4e9',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {p.user.nickname.charAt(0).toUpperCase()}
            </div>

            <div className="flex-grow-1">
              <div className="fw-medium">
                {p.user.nickname}{' '}
                {currentUser.nickname === p.user.nickname && (
                  <span className="text-muted">(you)</span>
                )}
              </div>
              <div>
                {p.role}
              </div>

            </div>

            <div className="text-muted fw-semibold small">

              {currentUser?.role === 'owner' && p.role === 'editor' && (
                <button
                  onClick={() => onSetRole(p._id, 'viewer')}
                  className="btn p-0 small"
                >
                  Make Viewer
                </button>
              )}
              {currentUser?.role === 'owner' && p.role === 'viewer' && (
                <button
                  onClick={() => onSetRole(p._id, 'editor')}
                  className="btn p-0 small"
                >
                  Make Editor
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
