import { Html } from 'react-konva-utils';
import { useEffect, useRef } from 'react';

export default function TextEditor({ textNode, onClose, onChange }) {
  const textareaRef = useRef(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!textNode) return;

    const timeoutId = setTimeout(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const stage = textNode.getStage();
      const textPosition = textNode.absolutePosition();

      textarea.value = textNode.text();

      Object.assign(textarea.style, {
        position: 'absolute',
        top: `${textPosition.y}px`,
        left: `${textPosition.x}px`,
        width: `${textNode.width() - textNode.padding() * 2}px`,
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

      const finishEditing = () => {
        if (hasSubmitted.current) return;
        hasSubmitted.current = true;
        const newText = textarea.value;
        const oldText = textNode.text();

        onClose();
        if (newText !== oldText) {
          onChange(newText);
        }
      };

      const handleOutsideClick = (e) => {
        if (e.target !== textarea) finishEditing();
      };

      const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          finishEditing();
        }
        if (e.key === 'Escape') {
          hasSubmitted.current = true;
          onClose();
        }
      };

      const handleInput = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight + textNode.fontSize()}px`;
      };

      window.addEventListener('click', handleOutsideClick);
      textarea.addEventListener('keydown', handleKeyDown);
      textarea.addEventListener('input', handleInput);

      return () => {
        window.removeEventListener('click', handleOutsideClick);
        textarea.removeEventListener('keydown', handleKeyDown);
        textarea.removeEventListener('input', handleInput);
      };
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [textNode, onChange, onClose]);

  return (
    <Html>
      <textarea ref={textareaRef} style={{ minHeight: '1em', position: 'absolute' }} />
    </Html>
  );
}
