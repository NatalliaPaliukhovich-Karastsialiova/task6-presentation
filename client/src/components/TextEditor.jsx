import { Html } from 'react-konva-utils';
import { useEffect, useRef } from 'react';

export default function TextEditor({ textNode, onClose, onChange }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textNode) return;

    const timeoutId = setTimeout(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const stage = textNode.getStage();
      const textPosition = textNode.absolutePosition();
      const stageBox = stage.container().getBoundingClientRect();
      const areaPosition = {
        x: textPosition.x,
        y: textPosition.y,
      };

      textarea.value = textNode.text();
      Object.assign(textarea.style, {
        position: 'absolute',
        top: `${areaPosition.y}px`,
        left: `${areaPosition.x}px`,
        width: `${textNode.width() - textNode.padding() * 2}px`,
        height: `${textNode.height() - textNode.padding() * 2 + 5}px`,
        fontSize: `${textNode.fontSize()}px`,
        border: 'none',
        padding: '0px',
        margin: '0px',
        overflow: 'hidden',
        background: 'none',
        outline: 'none',
        resize: 'none',
        lineHeight: textNode.lineHeight(),
        fontFamily: textNode.fontFamily(),
        transformOrigin: 'left top',
        textAlign: textNode.align(),
        color: textNode.fill(),
        transform: textNode.rotation() ? `rotateZ(${textNode.rotation()}deg)` : '',
      });

      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight + 3}px`;
      textarea.focus();

      let ignoreClick = true;

      const handleOutsideClick = (e) => {
        if (e.target !== textarea) {
          onChange(textarea.value);
          onClose();
        }
      };

      const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onChange(textarea.value);
          onClose();
        }
        if (e.key === 'Escape') {
          onClose();
        }
      };

      const handleInput = () => {
        const scale = textNode.getAbsoluteScale().x;
        textarea.style.width = `${textNode.width() * scale}px`;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight + textNode.fontSize()}px`;
      };

      setTimeout(() => {
        window.addEventListener('click', handleOutsideClick);
      });
      textarea.addEventListener('keydown', handleKeyDown);
      textarea.addEventListener('input', handleInput);

      return () => {
        textarea.removeEventListener('keydown', handleKeyDown);
        textarea.removeEventListener('input', handleInput);
        window.removeEventListener('click', handleOutsideClick);
      };
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [textNode, onChange, onClose]);

  return (
    <Html>
      <textarea
        ref={textareaRef}
        style={{ minHeight: '1em', position: 'absolute' }}
      />
    </Html>
  );
}
