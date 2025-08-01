export const CanvasReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SHAPES':
      return action.payload;

    case 'ADD_SHAPE':
      return [...state, action.payload];

    case 'UPDATE_SHAPE':
      return state.map((shape) =>
        shape.id === action.payload.id ? { ...shape, ...action.payload.updates } : shape
      );
    case 'UPDATE_LAST_LINE':
      const updatedShapes = [...state];
      const lastLine = updatedShapes[updatedShapes.length - 1];
      if (lastLine && lastLine.type === 'line') {
        lastLine.points = [...lastLine.points, action.payload.x, action.payload.y];
      }
      return updatedShapes;
    case 'DELETE_SHAPE':
      return state.filter((shape) => shape.id !== action.payload);

    case 'CLEAR_CANVAS':
      return [];

    default:
      return state;
  }
};
