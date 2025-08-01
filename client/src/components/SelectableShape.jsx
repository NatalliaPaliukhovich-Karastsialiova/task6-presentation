import { useEffect, useRef, useState } from 'react';
import { Rect, Circle, Star, Text, Transformer, Image, Line } from 'react-konva';
import useImage from 'use-image';
import TextEditor from './TextEditor';

export default function SelectableShape({ shape, isSelected, onSelect, onDragEnd, onTransformEnd, canEdit, onChangeText }) {
  const shapeRef = useRef();
  const trRef = useRef();
  const [img] = useImage(shape.type === 'image' ? shape.src : null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleTransform = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    node.scaleX(1);
    node.scaleY(1);

    if (shape.type === 'rect') {
      onTransformEnd(shape.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(20, node.width() * scaleX),
        height: Math.max(20, node.height() * scaleY),
        rotation,
      });
    } else if (shape.type === 'text') {
        const newWidth = node.width() * scaleX;

        node.setAttrs({
          width: newWidth,
          scaleX: 1,
        });

        const tempText = new window.Konva.Text({
          text: node.text(),
          fontSize: node.fontSize(),
          fontFamily: node.fontFamily(),
          width: newWidth,
          lineHeight: node.lineHeight(),
          align: node.align(),
        });

        const newHeight = tempText.height();
        onTransformEnd(shape.id, {
          x: node.x(),
          y: node.y(),
          width: newWidth,
          height: newHeight,
          rotation,
        });
    } else if (shape.type === 'circ') {
      onTransformEnd(shape.id, {
        x: node.x(),
        y: node.y(),
        radius: Math.max(20, shape.radius * (scaleX + scaleY) / 2),
        rotation,
      });
    } else if (shape.type === 'star') {
      onTransformEnd(shape.id, {
        x: node.x(),
        y: node.y(),
        numPoints: shape.numPoints,
        innerRadius: Math.max(20, shape.innerRadius * (scaleX + scaleY) / 2),
        outerRadius: Math.max(20, shape.outerRadius * (scaleX + scaleY) / 2),
        rotation,
      });
    } else if (shape.type === 'image') {
      onTransformEnd(shape.id, {
        x: node.x(),
        y: node.y(),
        width: node.width() * scaleX,
        height: node.height() * scaleY,
        rotation,
      });
    }  else if (shape.type === 'line') {
      onTransformEnd(shape.id, {
        x: node.x(),
        y: node.y(),
        scaleX,
        scaleY,
        rotation,
      });
    }
  };

  const commonProps = {
    ...shape,
    ref: shapeRef,
    draggable: canEdit,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e) => onDragEnd(shape.id, e),
    onTransformEnd: handleTransform,
  };

  const renderShape = () => {
    switch (shape.type) {
      case 'rect':
        return <Rect {...commonProps} />;
      case 'circ':
        return <Circle {...commonProps} />;
      case 'star':
        return <Star {...commonProps} />;
      case 'line':
        return <Line {...commonProps} tension={0.5} lineCap="round" lineJoin="round" />;
      case 'text':
        return (
          <>
          <Text
            {...commonProps}
            visible={!isEditing}
            onDblClick={() => {
              if (canEdit) {
                setIsEditing(false);
                setTimeout(() => setIsEditing(true), 0);
              }
            }}
            onDblTap={() => {
              if (canEdit) {
                setIsEditing(false);
                setTimeout(() => setIsEditing(true), 0);
              }
            }}
          />
          {isEditing && (
              <TextEditor
                initialText={shape.text}
                textNode={shapeRef.current}
                onClose={() => setIsEditing(false)}
                onChange={(newText) => {
                  if (newText !== shape.text) {
                  onChangeText(shape.id, newText);
                }
                }}
              />
            )}
          </>
        );
      case 'image':
        return (
          <Image
            {...commonProps}
            image={img}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderShape()}
      {isSelected && canEdit && shape.type !== 'text' && <Transformer ref={trRef} rotateEnabled={true} />}
      {isSelected && canEdit && shape.type === 'text' &&
        <Transformer ref={trRef} rotateEnabled={true}
            enabledAnchors={['middle-left', 'middle-right']}
            boundBoxFunc={(oldBox, newBox) => ({
              ...newBox,
              width: Math.max(30, newBox.width),
            })}/>
      }
    </>
  );
}
