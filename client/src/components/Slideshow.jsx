import { useEffect, useState } from 'react';
import CanvasManager from './CanvasManager';
import '../pages/style.css';

export default function Slideshow({ slides, activeSlide, setActiveSlide, onClose, presentationId, currentUser }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleKey = (e) => {
      const currentIndex = slides.findIndex((s) => s._id === activeSlide._id);

      if (e.key === 'ArrowRight' && currentIndex < slides.length - 1) {
        setActiveSlide(slides[currentIndex + 1]);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setActiveSlide(slides[currentIndex - 1]);
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [slides, activeSlide, setActiveSlide, onClose]);

  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / 1200;
      const scaleY = window.innerHeight / 800;
      setScale(Math.min(scaleX, scaleY));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="slideshow-overlay" onClick={onClose}>
      <div className="slideshow-content" style={{ transform: `scale(${scale})` }}>
        <CanvasManager
          presentationId={presentationId}
          currentUser={currentUser}
          slide={activeSlide}
          tool={null}
          width={1200}
          height={800}
          selectedColor={null}
          onToolUsed={() => {}}
          onSave={() => {}}
          readOnly={true}
        />
      </div>
    </div>
  );
}
