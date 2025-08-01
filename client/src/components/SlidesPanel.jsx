import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import SlideThumb from './SlideThumb';
import '../pages/style.css';

export default function SlidesPanel({ slides, setSlides, activeSlide, setActiveSlide, onRename, canEdit, addSlide, onReorder, onDelete, onSelectSlide }) {

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedSlides = Array.from(slides);
    const [movedSlide] = reorderedSlides.splice(result.source.index, 1);
    reorderedSlides.splice(result.destination.index, 0, movedSlide);
    if (onReorder) onReorder(reorderedSlides);
  };

  return (
    <aside className="slides-panel shadow-sm p-2" >
      <h6 className="fw-semibold mb-3">Slides</h6>
      <div className="slides-scroll m-0 p-0"  style={{ height: 'calc(100% - 100px)', overflowY: 'auto' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {slides.map((slide, index) => (
                <Draggable className="w-100" key={slide._id} draggableId={slide._id} index={index} isDragDisabled={!canEdit}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <SlideThumb
                        slide={slide}
                        isActive={activeSlide?._id === slide._id}
                        onSelect={(selectedSlide) => {
                          setActiveSlide(selectedSlide);
                          if (onSelectSlide) onSelectSlide(selectedSlide);
                        }}
                        onRename={onRename}
                        canEdit={canEdit}
                        index={index}
                        onDelete={onDelete}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      </div>

      <button
        className="btn btn-lg my-3 w-100"
        style={{backgroundColor: '#e8c8f8', color: '#000'}}
        onClick={addSlide}
        disabled={!canEdit}
      >
        + Add Slide
      </button>
    </aside>
  );
}
