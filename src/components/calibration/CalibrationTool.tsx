
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X, Check, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PenDataInterpreter from "@/services/PenDataInterpreter";

interface CalibrationPoint {
  x: number;
  y: number;
  label: string;
  captured?: { x: number; y: number };
}

interface CalibrationToolProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalibrationTool = ({ isOpen, onClose }: CalibrationToolProps) => {
  const [step, setStep] = useState(0);
  const [currentPoint, setCurrentPoint] = useState<CalibrationPoint | null>(null);
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  // Initialize calibration points
  useEffect(() => {
    if (isOpen) {
      // Reset state
      setStep(0);
      
      // Define calibration points (screen coordinates)
      const points: CalibrationPoint[] = [
        { x: 50, y: 50, label: "Top Left" },
        { x: 300, y: 50, label: "Top Right" },
        { x: 300, y: 200, label: "Bottom Right" },
        { x: 50, y: 200, label: "Bottom Left" }
      ];
      
      setCalibrationPoints(points);
      setCurrentPoint(points[0]);
    }
  }, [isOpen]);
  
  // Draw the calibration canvas
  useEffect(() => {
    if (!canvasRef.current || !currentPoint) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all points
    calibrationPoints.forEach((point, index) => {
      ctx.fillStyle = index === step ? '#3b82f6' : '#d1d5db';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw label
      ctx.fillStyle = '#374151';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, point.x, point.y - 20);
      
      // Draw checkmark if captured
      if (point.captured) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw instructions
    ctx.fillStyle = '#374151';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Tap the ${currentPoint.label} point on your paper`, canvas.width / 2, canvas.height - 30);
  }, [calibrationPoints, currentPoint, step]);
  
  // Handle point capture
  const capturePoint = (rawX: number, rawY: number) => {
    if (!currentPoint) return;
    
    // Update the captured point
    const updatedPoints = [...calibrationPoints];
    updatedPoints[step] = {
      ...updatedPoints[step],
      captured: { x: rawX, y: rawY }
    };
    
    setCalibrationPoints(updatedPoints);
    
    // Move to next point or finish
    if (step < calibrationPoints.length - 1) {
      setStep(step + 1);
      setCurrentPoint(updatedPoints[step + 1]);
    } else {
      // All points captured, calculate calibration
      calculateCalibration(updatedPoints);
    }
  };
  
  // Calculate and apply calibration
  const calculateCalibration = (points: CalibrationPoint[]) => {
    // Make sure all points are captured
    if (!points.every(p => p.captured)) {
      toast({
        title: "Calibration incomplete",
        description: "Not all points were captured",
        variant: "destructive"
      });
      return;
    }
    
    // Extract screen and pen coordinates
    const screenPoints = points.map(p => ({ x: p.x, y: p.y }));
    const penPoints = points.map(p => p.captured!);
    
    // Calculate transformation matrix (simplified for this example)
    // In a real implementation, we would use a more sophisticated algorithm
    
    // Calculate average offsets
    let offsetX = 0;
    let offsetY = 0;
    let scaleX = 0;
    let scaleY = 0;
    
    for (let i = 0; i < points.length; i++) {
      offsetX += screenPoints[i].x - penPoints[i].x;
      offsetY += screenPoints[i].y - penPoints[i].y;
      
      // Rough scale estimation
      if (i > 0) {
        const screenDist = Math.sqrt(
          Math.pow(screenPoints[i].x - screenPoints[0].x, 2) + 
          Math.pow(screenPoints[i].y - screenPoints[0].y, 2)
        );
        const penDist = Math.sqrt(
          Math.pow(penPoints[i].x - penPoints[0].x, 2) + 
          Math.pow(penPoints[i].y - penPoints[0].y, 2)
        );
        
        if (penDist > 0) {
          scaleX += screenDist / penDist;
          scaleY += screenDist / penDist;
        }
      }
    }
    
    // Average the calculations
    offsetX /= points.length;
    offsetY /= points.length;
    scaleX /= (points.length - 1);
    scaleY /= (points.length - 1);
    
    // Apply calibration to the interpreter
    PenDataInterpreter.setCalibration({
      offsetX,
      offsetY,
      scaleX,
      scaleY,
      rotation: 0 // Simple calibration doesn't handle rotation
    });
    
    toast({
      title: "Calibration complete",
      description: "Your pen is now calibrated with the screen"
    });
    
    // Close the dialog
    onClose();
  };
  
  // Simulate point capture (in a real app, this would come from the pen)
  const simulateCapture = () => {
    // Generate random offset from the target point (as if the pen had some error)
    const randomOffsetX = (Math.random() - 0.5) * 10;
    const randomOffsetY = (Math.random() - 0.5) * 10;
    
    capturePoint(
      (currentPoint?.x || 0) + randomOffsetX, 
      (currentPoint?.y || 0) + randomOffsetY
    );
  };
  
  // Reset calibration
  const resetCalibration = () => {
    PenDataInterpreter.setCalibration({
      offsetX: 0,
      offsetY: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0
    });
    
    setStep(0);
    setCurrentPoint(calibrationPoints[0]);
    setCalibrationPoints(calibrationPoints.map(p => ({ ...p, captured: undefined })));
    
    toast({
      title: "Calibration reset",
      description: "Calibration has been reset to default values"
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Calibrate Your Smart Pen</DialogTitle>
        </DialogHeader>
        
        <div className="my-2">
          <p className="text-sm text-muted-foreground mb-4">
            Follow the steps below to calibrate your pen with the screen.
            Mark each point on your paper as indicated.
          </p>
          
          <div className="border rounded-md overflow-hidden">
            <canvas 
              ref={canvasRef}
              width={350}
              height={250}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-between mt-4">
            <div className="text-sm font-medium">
              Step {step + 1} of {calibrationPoints.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentPoint?.label}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={resetCalibration}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            {/* For demo purposes - in a real app, this button wouldn't exist */}
            <Button
              onClick={simulateCapture}
            >
              <Check className="h-4 w-4 mr-2" />
              Capture Point
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalibrationTool;
