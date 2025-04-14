
import { Button } from "@/components/ui/button";
import { 
  PenTool, Eraser, Hand, Undo, Redo, 
  Smartphone, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Trash2, Download
} from "lucide-react";

interface CanvasToolbarProps {
  tool: "pen" | "finger" | "eraser" | "hand";
  onToolChange: (tool: "pen" | "finger" | "eraser" | "hand") => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onClear: () => void;
  onSave: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  currentPageIndex: number;
  totalPages: number;
  canUndo: boolean;
  canRedo: boolean;
  color: string;
  onColorChange: (color: string) => void;
  lineWidth: number;
  onLineWidthChange: (width: number) => void;
  scale: number;
}

const CanvasToolbar = ({
  tool,
  onToolChange,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onClear,
  onSave,
  onPreviousPage,
  onNextPage,
  currentPageIndex,
  totalPages,
  canUndo,
  canRedo,
  color,
  onColorChange,
  lineWidth,
  onLineWidthChange,
  scale
}: CanvasToolbarProps) => {
  return (
    <div className="bg-white border-b border-gray-200 p-2 flex justify-between items-center overflow-x-auto">
      <div className="flex items-center space-x-1">
        <Button
          variant={tool === "pen" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("pen")}
          title="Pen"
        >
          <PenTool className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === "finger" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("finger")}
          title="Finger Drawing"
        >
          <Smartphone className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === "eraser" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("eraser")}
          title="Eraser"
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === "hand" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onToolChange("hand")}
          title="Hand (Pan)"
        >
          <Hand className="h-4 w-4" />
        </Button>
        
        <div className="h-4 border-r border-gray-300 mx-1" />
        
        <Button
          variant="ghost"
          size="icon"
          title="Undo"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Redo"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <div className="h-4 border-r border-gray-300 mx-1" />
        
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-300"
          title="Color"
        />
        
        <select
          value={lineWidth}
          onChange={(e) => onLineWidthChange(Number(e.target.value))}
          className="h-8 rounded border border-gray-300 text-sm px-1"
          title="Line Width"
        >
          <option value="1">Thin</option>
          <option value="2">Medium</option>
          <option value="4">Thick</option>
          <option value="8">Very Thick</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousPage}
          disabled={currentPageIndex <= 1}
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-xs font-medium">
          Page {currentPageIndex} of {totalPages}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextPage}
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="h-4 border-r border-gray-300 mx-1" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium">{Math.round(scale * 100)}%</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <div className="h-4 border-r border-gray-300 mx-1" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          title="Clear"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSave}
          title="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CanvasToolbar;
