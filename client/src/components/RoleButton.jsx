import React from 'react';

export default function RoleButton({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ marginLeft: '10px', padding: '4px 8px', cursor: 'pointer' }}>
      {children}
    </button>
  );
}
