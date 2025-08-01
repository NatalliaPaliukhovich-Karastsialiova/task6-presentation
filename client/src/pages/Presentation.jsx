import { useEffect, useState, useRef  } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import CanvasManager from '../components/CanvasManager';
import ParticipantsManagerButton from '../components/ParticipantsManagerButton';
import ParticipantsPopup from '../components/ParticipantsPopup';
import SlidesPanel from '../components/SlidesPanel';
import Slideshow from '../components/Slideshow';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import { socket } from "../services/socket";
import { useLoader } from '../context/LoaderContext';
import './style.css';

export default function Presentation({ nickname }) {
  const { presentationId } = useParams();
  const [presentationName, setPresentationName] = useState();
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  const [role, setRole] = useState('viewer');
  const [open, setOpen] = useState(false);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRefs = useRef([]);
  const { setLoading } = useLoader();

  useEffect(() => {
    setLoading(true)
    const userId = localStorage.getItem('userId');
    if (!socket) return;
    socket.emit('joinPresentation', { presentationId, userId });

    socket.emit("getPresentationWithRole", { presentationId, userId }, (response) => {
      if (response.success) {
        if(response.presentation?.slides){
          setSlides(response.presentation.slides);
          if (response.presentation.slides?.length > 0) setActiveSlide(response.presentation.slides[0]);
        }
        setParticipants(response.presentation.participants);
        setPresentationName(response.presentation.title);
        setRole(response.role);
        const canEdit = (response.role !== 'viewer') ? true : false;
        const isOwner = (response.role === 'owner') ? true : false;
        setCurrentUser({nickname: localStorage.getItem('nickname'), role: response.role, canEdit, isOwner})
        setLoading(false)
      } else {
        toast.error('Failed to load presentation');
      }
    });

    const handleSlideAdded = (newSlide) => {
      setSlides((prev) => [...prev, newSlide]);
      setActiveSlide(newSlide);
      toast.success("Slide added!");
      setLoading(false)
    };

    const handleSlideUpdated = (slide) => {
      setSlides((prev) =>
        prev.map((s) => (s._id === slide._id ? { ...s, title: slide.title, elements: slide.elements } : s))
      );
      setActiveSlide((prev) =>
        prev && prev._id === slide._id ? { ...prev, title: slide.title, elements: slide.elements } : prev
      );
    };

    const handlePresentationUpdated = (slides) => {
      setSlides(slides)
      toast.success("Slides reordered!");
    };

    const handleSlideDelete = (slides) => {
      setSlides(slides)
      toast.success("Slide deleted!");
    };

    const handleSlidesRead = (slides) => {
      setSlides(slides);
    }

    const handleParticipantRoleUpdated = (participants) => {
      const userId = localStorage.getItem("userId");
      const nickname = localStorage.getItem("nickname");
      const currentParticipant = participants.find(p => p.user._id === userId);
      if (currentParticipant) {
        const { role } = currentParticipant;
        setCurrentUser({
          nickname,
          role,
          canEdit: role !== 'viewer',
          isOwner: role === 'owner'
        });
      }
      setParticipants(participants);
    };

    socket.on("slideAdded", handleSlideAdded);
    socket.on("slideUpdated", handleSlideUpdated);
    socket.on("presentationUpdated", handlePresentationUpdated);
    socket.on("slideDeleted", handleSlideDelete);
    socket.on("participantRoleUpdated", handleParticipantRoleUpdated);
    socket.on("slidesRead", handleSlidesRead);

    return () => {
      socket.emit('leavePresentation', { presentationId, userId });
      socket.off("getPresentationWithRole");
      socket.off("slideAdded", handleSlideAdded);
      socket.off("slideUpdated", handleSlideUpdated);
      socket.off("presentationUpdated", handlePresentationUpdated);
      socket.off("slideDeleted", handleSlideDelete);
      socket.off("slidesRead", handleSlidesRead);
    };

  }, [presentationId]);

  const addSlide = () => {
    setLoading(true)
    socket.emit("addSlide", { presentationId });
  };

  const handleSlidesReorder = async (slides) => {
    setSlides(slides);
    socket.emit("updatePresentation", { presentationId, slides });
  };

  const handleChangeSlide = async (slide) => {
    socket.emit("getSlides", { presentationId});
  };

  const deleteSlide = async (slideId) => {
    const newSlides = slides.filter((s) => s._id !== slideId);
    setSlides(newSlides);
    socket.emit("deleteSlide", { presentationId, slides: newSlides });
  };

  const handleSetRole = async (userId, newRole) => {
    setParticipants(prev =>
      prev.map(p =>
        p._id === userId ? { ...p, role: newRole } : p
      )
    );
    toast.success(`Role updated to ${newRole}`)
    socket.emit("updateParticipantRole", { presentationId, participantId: userId, role: newRole });
  };

  const handleRename = async (slideId, newTitle) => {
    socket.emit("updateSlide", { presentationId, slideId, title: newTitle });
  };


  const handleExportPDF = async () => {
    setLoading(true);
    setIsExporting(true);
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: 'a4' });

    for (let i = 0; i < slides.length; i++) {
      const stage = canvasRefs.current[i]?.getStage();
      if (stage) {
        const dataURL = stage.toDataURL({ pixelRatio: 2 });
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();
        pdf.addImage(dataURL, 'PNG', 0, 0, width, height);

        if (i < slides.length - 1) pdf.addPage();
      }
    }

    pdf.save(`${presentationName}.pdf`);
    setLoading(false);
    setIsExporting(false);
  };

  return (
    <div className="presentation-container">
      <header className="top-bar shadow-sm" style={{backgroundColor: 'gray'}}>
        <Link to="/presentations" className="text-decoration-none text-light fs-4">
          PresentShare
        </Link>
        <div className="d-flex align-items-center gap-2">
          <span className="text-light fs-4 me-3">Hello, {localStorage.getItem('nickname')}</span>
          <button className="btn btn-lg"
            style={{backgroundColor: '#f2f3f7'}}
            onClick={() => handleExportPDF()}
          >
            Export PDF
          </button>
          <button className="btn btn-lg"
            style={{backgroundColor: '#f2f3f7'}}
            onClick={() => setIsSlideshow(true)}
          >
            Start Slideshow
          </button>
          <div style={{ position: 'relative' }}>
            <ParticipantsManagerButton onClick={() => setOpen(!open)} />
            {open && (
              <ParticipantsPopup
                participants={participants}
                currentUser={currentUser}
                onSetRole={handleSetRole}
              />
            )}
          </div>
        </div>
      </header>
      {currentUser && (
        <div className="d-flex flex-grow-1">
          <CanvasManager
            presentationId={presentationId}
            canEdit={currentUser.canEdit}
            slide={activeSlide}
            width={1200}
            height={800}
            isSlideShow={false}
            onSelectShape={(shape, pos) => {
              setSelectedShape(shape);
            }}
          />

          <SlidesPanel
            slides={slides}
            activeSlide={activeSlide}
            setActiveSlide={setActiveSlide}
            onRename={handleRename}
            onAddSlide={addSlide}
            canEdit={currentUser.isOwner}
            addSlide={addSlide}
            setSlides={setSlides}
            onDelete={deleteSlide}
            onReorder={async (reorderedSlides) => {
              handleSlidesReorder(reorderedSlides);
            }}
            onSelectSlide={(slide) => {
              handleChangeSlide(slide)
            }}
          />
        </div>
      )}
      {isSlideshow && (
        <Slideshow
          slides={slides}
          activeSlide={activeSlide}
          setActiveSlide={setActiveSlide}
          onClose={() => setIsSlideshow(false)}
          presentationId={presentationId}
          currentUser={currentUser}
        />
      )}
      {setIsExporting && (
        <div style={{display: 'none'}}>
          {slides.map((slide, i) => (
            <CanvasManager
              key={slide._id}
              ref={(el) => (canvasRefs.current[i] = el)}
              slide={slide}
              canEdit={false}
              tool={null}
              width={1200}
              height={800}
              isSlideShow={true}
              selectedColor="#000000"
            />
          ))}
        </div>
      )}
    </div>
  );
}
