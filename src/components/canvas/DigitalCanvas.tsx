
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Undo, Redo, PenTool, Eraser, Download, 
  ZoomIn, ZoomOut, Hand, Maximize2, Trash2 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface DigitalCanvasProps {
  className?: string;
}

const DigitalCanvas = ({ className }: DigitalCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser" | "hand">("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [scale, setScale] = useState(1);
  const { toast } = useToast();
  
  // Simulated data for demonstration of pen input
  const simulateRealTimeInput = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    let x = Math.random() * canvasRef.current.width;
    let y = Math.random() * canvasRef.current.height;
    
    const simulateStroke = () => {
      if (!canvasRef.current || !ctx) return;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      // Simulate a natural writing flow with slight randomness
      for (let i = 0; i < 10; i++) {
        x += (Math.random() - 0.5) * 20;
        y += (Math.random() - 0.5) * 5;
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };
    
    // Simulate writing for demonstration
    const interval = setInterval(simulateStroke, 100);
    setTimeout(() => clearInterval(interval), 2000);
  };
  
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
      
      // Redraw content after resize if needed
      // ...
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Initialize with some sample handwriting
    const init = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add a line to show the paper baseline
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      
      for (let y = 40; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };
    
    init();
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);
  
  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    setIsDrawing(true);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
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
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleToolChange = (newTool: "pen" | "eraser" | "hand") => {
    setTool(newTool);
    setIsErasing(newTool === "eraser");
  };
  
  const handleClear = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
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
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="bg-white border-b border-gray-200 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Button
            variant={tool === "pen" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => handleToolChange("pen")}
            title="Pen"
          >
            <PenTool className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === "eraser" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => handleToolChange("eraser")}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === "hand" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => handleToolChange("hand")}
            title="Hand (Pan)"
          >
            <Hand className="h-4 w-4" />
          </Button>
          
          <div className="h-4 border-r border-gray-300 mx-1" />
          
          <Button
            variant="ghost"
            size="icon"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          <div className="h-4 border-r border-gray-300 mx-1" />
          
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-gray-300"
            title="Color"
          />
          
          <select
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="h-8 rounded border border-gray-300 text-sm px-1"
            title="Line Width"
          >
            <option value="1">Thin</option>
            <option value="2">Medium</option>
            <option value="4">Thick</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium">{Math.round(scale * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="h-4 border-r border-gray-300 mx-1" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            title="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          
          <div className="h-4 border-r border-gray-300 mx-1 hidden sm:block" />
          
          <Button 
            variant="ghost"
            size="sm"
            className="hidden sm:flex items-center gap-1 text-pen-primary"
            onClick={simulateRealTimeInput}
          >
            <span className="text-xs">Simulate Pen</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `scale(${scale})` }}
        >
          <canvas
            ref={canvasRef}
            className="bg-white shadow-md"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};

export default DigitalCanvas;
