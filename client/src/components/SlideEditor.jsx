import { Rnd } from 'react-rnd';
import { v4 as uuid } from 'uuid';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function SlideEditor({ slide, socket, presId }) {
  const [editing, setEditing] = useState(null);

  const updateElement = (el) => {
    socket.emit('edit_element', { presId, slideId: slide.id, element: el });
  };

  const addTextBlock = () => {
    const newEl = { id: uuid(), x: 50, y: 50, text: 'New Text' };
    updateElement(newEl);
  };

  if (!slide) return null;
  return (
    <div className="flex-1 bg-white relative">
      {slide.elements.map(el => (
        <Rnd key={el.id} bounds="parent" default={{ x: el.x, y: el.y, width: 200, height: 80 }}
          onDragStop={(e, d) => updateElement({ ...el, x: d.x, y: d.y })}>
          {editing === el.id ? (
            <textarea className="w-full h-full border"
              value={el.text}
              onChange={(e) => updateElement({ ...el, text: e.target.value })}
              onBlur={() => setEditing(null)} />
          ) : (
            <div onDoubleClick={() => setEditing(el.id)} className="bg-yellow-100 p-1 rounded">
              <ReactMarkdown>{el.text}</ReactMarkdown>
            </div>
          )}
        </Rnd>
      ))}
      <button className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded"
        onClick={addTextBlock}>+ Text</button>
    </div>
  );
}
