
export type ToolType = 'pencil' | 'eraser' | 'rainbow' | 'multi-rainbow' | 'crayon';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingState {
  isDrawing: boolean;
  tool: ToolType;
  brushSize: number;
  opacity: number;
}

export interface HistoryAction {
  imageData: ImageData;
}
