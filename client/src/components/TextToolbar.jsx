import React from 'react';

const fonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];
const fontSizes = ['12', '16', '24', '32', '42', '48', '60', '72', '92'];

export default function TextToolbar({ textShape, onChange }) {
  if (!textShape) return null;

  const handleChange = (prop, value) => {
    onChange({ id: textShape.id, changes: {[prop]: value }});
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

      <select className="toolbar-btn" style={{ width: 'auto' }}
        value={textShape.fontSize || '24'}
        onChange={(e) => handleChange('fontSize', e.target.value)}
      >
        {fontSizes.map((fontsize) => (
          <option key={fontsize} value={fontsize}>{fontsize}</option>
        ))}
      </select>

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
