import React from 'react';

const fonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];

export default function TextToolbar({ textShape, onChange }) {
  if (!textShape) return null;

  const handleChange = (prop, value) => {
    onChange({ [prop]: value });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: textShape.y - 80,
        left: textShape.x,
        backgroundColor: 'gray'
      }}
      className='sidebar sidebar-hr shadow-lg'
    >
      <button className="toolbar-btn"
        onClick={() => handleChange('fontStyle', textShape.fontStyle?.includes('bold') ? '' : 'bold')}
        style={{ fontWeight: 'bold' }}
      >B</button>

      <button className="toolbar-btn"
        onClick={() => handleChange('fontStyle', textShape.fontStyle?.includes('italic') ? '' : 'italic')}
        style={{ fontStyle: 'italic' }}
      >I</button>

      <button className="toolbar-btn" onClick={() => handleChange('align', 'left')}>⯇</button>
      <button className="toolbar-btn" onClick={() => handleChange('align', 'center')}>≡</button>
      <button className="toolbar-btn" onClick={() => handleChange('align', 'right')}>⯈</button>

      <input className="toolbar-btn"
        type="number"
        value={textShape.fontSize}
        onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
        style={{ width: '60px', textAlign: 'center' }}
      />

      <select className="toolbar-btn" style={{ width: 'auto' }}
        value={textShape.fontFamily || 'Arial'}
        onChange={(e) => handleChange('fontFamily', e.target.value)}
      >
        {fonts.map((font) => (
          <option key={font} value={font}>{font}</option>
        ))}
      </select>
    </div>
  );
}
