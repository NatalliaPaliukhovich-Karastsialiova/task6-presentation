import { useReducer, useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer } from 'react-konva';
import { CanvasReducer } from './CanvasReducer';
import SelectableShape from './SelectableShape';
import { createShape } from '../utils/canvasUtils';
import { socket } from '../services/socket';
import TextToolbar from './TextToolbar';

const CanvasManager = forwardRef(function CanvasManager({
  presentationId, slide, canEdit, onSelectShape,
  width, height, readOnly, isSlideShow
}, ref) {
  const [shapes, dispatch] = useReducer(CanvasReducer, []);
  const [tool, setTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#0000ff');
  const [selectedId, selectShape] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedShape, setSelectedShape] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(null);
  const stageRef = useRef();

  const history = useRef([]);
  const historyStep = useRef(0);

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current,
    undo,
    redo,
  }));

  useEffect(() => {
    if (!slide) {
      dispatch({ type: 'SET_SHAPES', payload: [] });
      return;
    }
    if(!currentSlide) setCurrentSlide(slide._id);
    dispatch({ type: 'SET_SHAPES', payload: slide.elements || [] });
    if(!isSlideShow){
      if(history.current.length === 0 || currentSlide !== slide._id){
        setCurrentSlide(slide._id);
        history.current = [slide.elements || []];
        historyStep.current = 0;
      }
    }
  }, [slide]);


  const pushHistory = (newShapes) => {
    history.current = history.current.slice(0, historyStep.current + 1);
    history.current.push(newShapes);
    historyStep.current++;
  };

  const undo = () => {
    if (historyStep.current === 0) {
      return;
    }
    historyStep.current -= 1;
    const previous = history.current[historyStep.current];
    dispatch({ type: 'SET_SHAPES', payload: previous});
    saveSlide(previous);
  };

  const redo = () => {
    if (historyStep.current === history.current.length - 1) {
      return;
    }
    historyStep.current += 1;
    const next = history.current[historyStep.current];
    dispatch({ type: 'SET_SHAPES', payload: next });
    saveSlide(next);
  };

  const checkDeselect = (e) => {
    if (e.target === e.target.getStage()) {
      selectShape(null);
      setSelectedShape(null);
      if (onSelectShape) onSelectShape(null, null);
    }
  };

  useEffect(() => {
    if (!canEdit || !tool || tool === 'brush' || tool === 'eraser') return;
    const shape = createShape(tool, selectedColor);
    if (shape) {
      dispatch({ type: 'ADD_SHAPE', payload: shape });
      const updatedShapes = [...shapes, shape];
      pushHistory(updatedShapes);
      saveSlide(updatedShapes);
    }
    if (tool !== 'brush' && tool !== 'eraser') {
      setTool(null);
    }
  }, [tool, canEdit, selectedColor]);

  useEffect(() => {
    if (selectedId) {
      dispatch({ type: 'UPDATE_SHAPE', payload: { id: selectedId, updates: { fill: selectedColor } } });
      const updatedShapes = shapes.map(s => s.id === selectedId ? { ...s, fill: selectedColor } : s);
      pushHistory(updatedShapes);
      saveSlide(updatedShapes);
    }
  }, [selectedColor]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedId) {
        handleDeleteShape();
      }
      if (e.key === 'Escape') {
        setTool(null);
        selectShape(null);
        setSelectedShape(null);
        if (onSelectShape) onSelectShape(null, null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  const updateShapeProperties = (id, updates) => {
    dispatch({ type: 'UPDATE_SHAPE', payload: { id, updates } });
    const updatedShapes = shapes.map((shape) =>
      shape.id === id ? { ...shape, ...updates } : shape
    )
    pushHistory(updatedShapes);
    saveSlide(updatedShapes);
  };

  const handleDragEnd = (id, e) => {
    const { x, y } = e.target.position();
    updateShapeProperties(id, { x, y });
  };

  const handleSelectShape = (shape) => {
    selectShape(shape.id);
    if (onSelectShape) {
      const pos = { x: shape.x + (shape.width || 0) / 2, y: shape.y };
      onSelectShape({ ...shape, onUpdate: (u) => updateShapeProperties(shape.id, u) }, pos);
    }
    if (shape.type === 'text') {
      setSelectedShape(shape);
  } else {
      setSelectedShape(null);
  }
  };

  const handleDeleteShape = () => {
    if (selectedId) {
      const updatedShapes = shapes.filter((s) => s.id !== selectedId);
      dispatch({ type: 'DELETE_SHAPE', payload: selectedId });
      selectShape(null);
      pushHistory(updatedShapes)
      saveSlide(updatedShapes);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newImage = {
        id: Date.now().toString(),
        type: 'image',
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        src: reader.result
      };
      dispatch({ type: 'ADD_SHAPE', payload: newImage });
      const updatedShapes = [...shapes, newImage];
      pushHistory(updatedShapes);
      saveSlide(updatedShapes);
    };
    reader.readAsDataURL(file);
  };

  const saveSlide = (updatedShapes) => {
    socket.emit('updateSlide', {
      presentationId: presentationId,
      slideId: slide._id,
      elements: updatedShapes,
    });
  };

  const handleMouseDown = (e) => {
    if (!canEdit) return;
    checkDeselect(e);
    if (tool === 'brush' || tool === 'eraser') {
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      const newLine = {
        id: `line-${Date.now()}`,
        type: 'line',
        points: [pos.x, pos.y],
        stroke: tool === 'eraser' ? '#fff' : selectedColor,
        strokeWidth: tool === 'eraser' ? 20 : 3,
        lineCap: 'round',
        lineJoin: 'round',
        x: 0,
        y: 0,
      };
      dispatch({ type: 'ADD_SHAPE', payload: newLine });
      const updatedShapes = [...shapes, newLine];
      pushHistory(updatedShapes);
      saveSlide(updatedShapes);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    dispatch({ type: 'UPDATE_LAST_LINE', payload: point });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    pushHistory(shapes);
    saveSlide(shapes);
  };

  const handleZoom = (direction) => {
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition() || { x: width / 2, y: height / 2 };

    const scaleBy = 1.1;
    const newScale = direction === 'in' ? oldScale * scaleBy : oldScale / scaleBy;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  const zoomIn = () => handleZoom('in');
  const zoomOut = () => handleZoom('out');
  const resetZoom = () => {
    const stage = stageRef.current;
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.batchDraw();
  };

  const handleChangeText = (id, newText) => {
    dispatch({
      type: 'UPDATE_SHAPE',
      payload: { id, updates: { text: newText, fill: selectedColor } },
    });
    const updatedShapes = shapes.map((s) =>
      s.id === id ? { ...s, text: newText, fill: selectedColor } : s
    );
    pushHistory(updatedShapes);
    saveSlide(updatedShapes);
  };

  const handleTextToolbarChange = (res) => {
    const {id, changes} = res;
    dispatch({ type: 'UPDATE_SHAPE', payload: { id: selectedId, updates: changes } });
    setSelectedShape((prev) => ({ ...prev, ...changes }));
    const updatedShapes = shapes.map((s) =>
      s.id === id ? { ...s, ...changes, fill: selectedColor } : s
    );
    pushHistory(updatedShapes);
    saveSlide(updatedShapes);
  };

  return (
    <div className="d-flex flex-grow-1 flex-column custom-gap">
      <div className="d-flex h-100">
        {!readOnly && (
          <aside className="sidebar-container d-flex">
            <div className="sidebar shadow-sm">
              <div style={{ display: 'inline-block' }}>
                <label className="toolbar-btn" htmlFor="image-upload" style={{ cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.5 }}>
                  <i className="bi bi-upload"></i>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                  style={{ display: 'none' }}
                  disabled={!canEdit}
                />
              </div>

              <button className={`toolbar-btn ${tool === 'rect' ? 'active' : ''}`}
                      onClick={() => setTool('rect')}
                      disabled={!canEdit}>
                <i className="bi bi-square"></i>
              </button>
              <button className={`toolbar-btn ${tool === 'circ' ? 'active' : ''}`}
                      onClick={() => setTool('circ')}
                      disabled={!canEdit}>
                <i className="bi bi-circle"></i>
              </button>
              <button className={`toolbar-btn ${tool === 'star' ? 'active' : ''}`}
                      onClick={() => setTool('star')}
                      disabled={!canEdit}>
                <i className="bi bi-star"></i>
              </button>
              <button className={`toolbar-btn ${tool === 'text' ? 'active' : ''}`}
                      onClick={() => setTool('text')}
                      disabled={!canEdit}>
                <i className="bi bi-fonts"></i>
              </button>
              <button className={`toolbar-btn ${tool === 'brush' ? 'active' : ''}`}
                      onClick={() => setTool('brush')}
                      disabled={!canEdit}>
                <i className="bi bi-brush"></i>
              </button>
              <button className={`toolbar-btn ${tool === 'eraser' ? 'active' : ''}`}
                      onClick={() => setTool('eraser')}
                      disabled={!canEdit}>
                <i className="bi bi-eraser"></i>
              </button>

              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="toolbar-btn"
                disabled={!canEdit}
              />
            </div>

            <div className="sidebar shadow-sm">
              <button className="toolbar-btn"
                      onClick={undo}
                      disabled={!canEdit || historyStep.current <= 0}>
                <i className="bi bi-arrow-return-left"></i>
              </button>
              <button className="toolbar-btn"
                      onClick={redo}
                      disabled={!canEdit || historyStep.current >= history.current.length - 1}>
                <i className="bi bi-arrow-return-right"></i>
              </button>
            </div>

            <div className="sidebar shadow-sm">

              <button className="toolbar-btn"
                      onClick={handleDeleteShape}
                      disabled={!canEdit || !selectedId}>
                <i className="bi bi-trash3-fill"></i>
              </button>
            </div>
          </aside>
        )}

        <div className="canvas-area shadow-sm h-100" style={{ position: 'relative' }}>
          <Stage
            ref={stageRef}
            width={width}
            height={height}
            style={{border: '1px solid gray'}}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onMouseDownCapture={checkDeselect}
          >
            <Layer>
              {shapes.map((shape) => (
                <SelectableShape
                  key={shape.id}
                  shape={shape}
                  isSelected={shape.id === selectedId}
                  onSelect={() => handleSelectShape(shape)}
                  onDragEnd={handleDragEnd}
                  onTransformEnd={(id, updates) => {
                    updateShapeProperties(id, updates);
                  }}
                  onChange={(updates) => updateShapeProperties(shape.id, updates)}
                  canEdit={canEdit}
                  onChangeText={handleChangeText}
                />
              ))}
            </Layer>
          </Stage>
          {selectedShape?.type === 'text' && canEdit && (
            <TextToolbar
              textShape={selectedShape}
              onChange={handleTextToolbarChange}
            />
          )}
        </div>
      </div>

      {!readOnly && (
          <div>
            <div className="sidebar sidebar-hr shadow-sm">
                <button className="toolbar-btn" onClick={zoomIn}>
                  <i className="bi bi-zoom-in"></i>
                </button>
                <button className="toolbar-btn" onClick={resetZoom}>
                  <i className="bi bi-x-circle"></i>
                </button>
                <button className="toolbar-btn" onClick={zoomOut}>
                  <i className="bi bi-zoom-out"></i>
                </button>
              </div>
          </div>
      )}
    </div>
  );
});

export default CanvasManager;
