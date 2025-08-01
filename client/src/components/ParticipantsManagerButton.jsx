import { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { IoChevronDown } from 'react-icons/io5';

export default function ParticipantsManagerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#f2f3f7',
        border: 'none',
        borderRadius: '22px',
        padding: '4px 15px',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#e8c8f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '4px'
        }}
      >
        <FaUser color="#b341c6" size={14}/>
      </div>
      <IoChevronDown size={16} color="#333" />
    </button>
  );
}
