import { v4 } from 'uuid';

export const createShape = (type, color = '#000000') => {
  const base = {
    id: v4(),
    x: 50,
    y: 50,
    draggable: true,
    fill: color,
  };

  switch (type) {
    case 'rect':
      return { ...base, type: 'rect', width: 100, height: 80 };
    case 'circ':
      return { ...base, type: 'circ', radius: 50 };
    case 'star':
      return { ...base, type: 'star', numPoints: 5, innerRadius: 30, outerRadius: 50 };
    case 'text':
      return {
        ...base,
        type: 'text',
        text: 'Sample Text',
        fontSize: 24,
        fontFamily: 'Arial',
        fontStyle: 'normal',
        align: 'left',
        width: 300
      };
    case 'image':
      return { id, type: 'image', x: 100, y: 100, width: 150, height: 150, src: '' };
    default:
      return null;
  }
};
