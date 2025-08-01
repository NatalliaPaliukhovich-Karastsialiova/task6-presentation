import React from 'react';
import RoleButton from './RoleButton';

export default function ParticipantsList({ participants, currentUser, onSetRole }) {
  return (
    <div>
      <h3>Participants:</h3>
      <ul>
        {participants.map((p) => (
          <li key={p.clientId}>
            {p.nickname} — <b>{p.role}</b>
            {currentUser?.role === 'owner' && p.role !== 'owner' && (
              <>
                <RoleButton onClick={() => onSetRole(p.clientId, 'editor')}>make Editor</RoleButton>
                <RoleButton onClick={() => onSetRole(p.clientId, 'viewer')}>make Viewer</RoleButton>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
