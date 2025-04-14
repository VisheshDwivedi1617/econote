
import { useRef } from "react";
import { cn } from "@/lib/utils";
import CanvasToolbar from "./CanvasToolbar";
import useCanvasDrawing from "@/hooks/useCanvasDrawing";

interface DigitalCanvasProps {
  className?: string;
}

const DigitalCanvas = ({ className }: DigitalCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    tool, 
    color, 
    lineWidth, 
    scale,
    strokes,
    redoStack,
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
    goToPreviousPage,
    goToNextPage
  } = useCanvasDrawing({ canvasRef });
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <CanvasToolbar 
        tool={tool}
        color={color}
        lineWidth={lineWidth}
        scale={scale}
        onToolChange={handleToolChange}
        onColorChange={handleColorChange}
        onLineWidthChange={handleLineWidthChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onClear={handleClear}
        onSave={handleSave}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        currentPageIndex={currentPageIndex}
        totalPages={totalPages}
        canUndo={strokes.length > 0}
        canRedo={redoStack.length > 0}
      />
      
      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `scale(${scale})` }}
        >
          <canvas
            ref={canvasRef}
            className="bg-white shadow-md touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>
      </div>
    </div>
  );
};

export default DigitalCanvas;
