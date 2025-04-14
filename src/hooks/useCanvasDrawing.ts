
import { useState, useEffect, useRef, MutableRefObject } from 'react';
import { useToast } from '@/components/ui/use-toast';
import PenDataInterpreter, { PenStroke } from '@/services/PenDataInterpreter';
import { useNotebook } from '@/contexts/NotebookContext';

interface UseCanvasDrawingProps {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}

const useCanvasDrawing = ({ canvasRef }: UseCanvasDrawingProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [tool, setTool] = useState<"pen" | "finger" | "eraser" | "hand">("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [scale, setScale] = useState(1);
  const [redoStack, setRedoStack] = useState<PenStroke[]>([]);
  const { toast } = useToast();
  
  const { 
    strokes, 
    addStroke, 
    updateStrokes, 
    goToNextPage, 
    goToPreviousPage,
    getCurrentPageIndex,
    getTotalPages,
    currentPage,
    clearStrokes
  } = useNotebook();

  // Set up canvas and draw existing strokes
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set initial canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Redraw all strokes after resize
      redrawCanvas();
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Draw initial canvas
    redrawCanvas();
    
    // Set up pen data interpreter handlers
    PenDataInterpreter.setOnNewStroke((stroke) => {
      addStroke(stroke);
      drawStroke(stroke);
    });
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      PenDataInterpreter.setOnNewStroke(null);
    };
  }, [addStroke]);
  
  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [strokes]);
  
  // Redraw canvas when page changes
  useEffect(() => {
    redrawCanvas();
    setRedoStack([]);
  }, [currentPage]);
  
  // Redraw all strokes
  const redrawCanvas = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    
    for (let y = 40; y < canvasRef.current.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasRef.current.width, y);
      ctx.stroke();
    }
    
    // Draw all strokes
    strokes.forEach(stroke => {
      drawStroke(stroke);
    });
  };
  
  // Draw a single stroke
  const drawStroke = (stroke: PenStroke) => {
    if (!canvasRef.current || stroke.points.length === 0) return;
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    ctx.stroke();
  };
  
  // Drawing event handlers for mouse
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "hand") return; // Don't draw if in pan mode
    
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Start a new stroke
    const newStroke: PenStroke = {
      points: [{ x, y, pressure: 1, timestamp: Date.now() }],
      color: isErasing ? "#ffffff" : color,
      width: isErasing ? lineWidth * 3 : lineWidth,
      id: Date.now().toString()
    };
    
    // Add to strokes
    addStroke(newStroke);
    setRedoStack([]); // Clear redo stack on new drawing
    
    setIsDrawing(true);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === "hand" || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    ctx.strokeStyle = isErasing ? "#ffffff" : color;
    ctx.lineWidth = isErasing ? lineWidth * 3 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Update the current stroke
    const updatedStrokes = [...strokes];
    const currentStroke = updatedStrokes[updatedStrokes.length - 1];
    
    if (currentStroke) {
      currentStroke.points.push({ 
        x, y, pressure: 1, timestamp: Date.now() 
      });
      updateStrokes(updatedStrokes);
    }
  };
  
  // Touch events for mobile finger drawing
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (tool !== "finger" || !canvasRef.current) return;
    
    e.preventDefault(); // Prevent scrolling
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) / scale;
    const y = (touch.clientY - rect.top) / scale;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Start a new stroke
    const newStroke: PenStroke = {
      points: [{ x, y, pressure: 1, timestamp: Date.now() }],
      color: color,
      width: lineWidth,
      id: Date.now().toString()
    };
    
    // Add to strokes
    addStroke(newStroke);
    setRedoStack([]); // Clear redo stack on new drawing
    
    setIsDrawing(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== "finger" || !canvasRef.current) return;
    
    e.preventDefault(); // Prevent scrolling
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) / scale;
    const y = (touch.clientY - rect.top) / scale;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Update the current stroke
    const updatedStrokes = [...strokes];
    const currentStroke = updatedStrokes[updatedStrokes.length - 1];
    
    if (currentStroke) {
      currentStroke.points.push({ 
        x, y, pressure: 1, timestamp: Date.now() 
      });
      updateStrokes(updatedStrokes);
    }
  };
  
  const handleTouchEnd = () => {
    setIsDrawing(false);
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  // Undo last stroke
  const handleUndo = () => {
    if (strokes.length === 0) return;
    
    const lastStroke = strokes[strokes.length - 1];
    const newStrokes = strokes.slice(0, -1);
    updateStrokes(newStrokes);
    setRedoStack(prev => [...prev, lastStroke]);
    
    redrawCanvas();
  };
  
  // Redo last undone stroke
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const strokeToRedo = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    updateStrokes([...strokes, strokeToRedo]);
    
    redrawCanvas();
  };
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleToolChange = (newTool: "pen" | "finger" | "eraser" | "hand") => {
    setTool(newTool);
    setIsErasing(newTool === "eraser");
    
    if (newTool === "finger") {
      toast({
        title: "Finger drawing mode",
        description: "Use your finger to draw directly on the canvas",
      });
    }
  };
  
  const handleClear = () => {
    if (!canvasRef.current) return;
    
    clearStrokes();
    redrawCanvas();
    
    toast({
      title: "Canvas cleared",
      description: "Your canvas has been cleared",
    });
  };
  
  const handleSave = () => {
    if (!canvasRef.current) return;
    
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `scribe-note-${new Date().toISOString()}.png`;
    link.href = dataUrl;
    link.click();
    
    toast({
      title: "Note saved",
      description: "Your note has been saved to your device",
    });
  };

  // Handle color change
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
  };

  // Handle line width change
  const handleLineWidthChange = (newWidth: number) => {
    setLineWidth(newWidth);
  };
  
  // Get current page info
  const currentPageIndex = getCurrentPageIndex() + 1; // 1-based for display
  const totalPages = getTotalPages();

  return {
    isDrawing,
    isErasing,
    tool,
    color,
    lineWidth,
    scale,
    redoStack,
    strokes,
    currentPageIndex,
    totalPages,
    handleToolChange,
    handleColorChange,
    handleLineWidthChange,
    startDrawing,
    draw,
    stopDrawing,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleUndo,
    handleRedo,
    handleZoomIn,
    handleZoomOut,
    handleClear,
    handleSave,
    goToNextPage,
    goToPreviousPage
  };
};

export default useCanvasDrawing;
