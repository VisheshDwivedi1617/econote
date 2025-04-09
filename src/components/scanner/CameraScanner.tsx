
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, CheckCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNotebook } from "@/contexts/NotebookContext";
import { detectEdges, enhanceImage } from "@/services/ImageProcessingService";

interface CameraScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ 
  open, 
  onOpenChange,
  onCapture 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  // Initialize camera when the dialog opens
  useEffect(() => {
    if (open) {
      initializeCamera();
    } else {
      // Stop camera when dialog closes
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [open]);
  
  const initializeCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Error",
          description: "Camera API is not supported in your browser",
          variant: "destructive",
        });
        setHasPermission(false);
        return;
      }
      
      const constraints = {
        video: {
          facingMode: "environment", // Use the back camera if available
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
        setHasPermission(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Permission Denied",
        description: "Please allow camera access to scan notes",
        variant: "destructive",
      });
      setHasPermission(false);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsCameraReady(false);
  };
  
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageDataUrl);
    stopCamera();
  };
  
  const retakePhoto = () => {
    setCapturedImage(null);
    initializeCamera();
  };
  
  const saveImage = async () => {
    if (!capturedImage) return;
    
    try {
      setIsProcessing(true);
      
      // Process the image (edge detection and enhancement)
      const processedImageDataUrl = await processImage(capturedImage);
      
      // Call the parent component's onCapture callback with the processed image
      onCapture(processedImageDataUrl);
      
      // Close the dialog
      onOpenChange(false);
      
      // Reset state
      setCapturedImage(null);
      setIsProcessing(false);
      
      toast({
        title: "Success",
        description: "Note scanned and saved successfully",
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "Failed to process the scanned image",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  
  // Process the captured image
  const processImage = async (imageDataUrl: string): Promise<string> => {
    try {
      // Create an image element for processing
      const img = new Image();
      img.src = imageDataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Detect edges to find the document boundaries
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Failed to get canvas context");
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      // Use our image processing service (we'll create this next)
      const cropRect = await detectEdges(canvas);
      
      // Crop the image to the document boundaries
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');
      if (!croppedCtx) throw new Error("Failed to get canvas context");
      
      croppedCanvas.width = cropRect.width;
      croppedCanvas.height = cropRect.height;
      
      croppedCtx.drawImage(
        canvas, 
        cropRect.x, cropRect.y, cropRect.width, cropRect.height,
        0, 0, cropRect.width, cropRect.height
      );
      
      // Enhance the image contrast for better readability
      const enhancedImageDataUrl = await enhanceImage(croppedCanvas);
      
      return enhancedImageDataUrl;
    } catch (error) {
      console.error("Error in image processing:", error);
      // If processing fails, return the original image as a fallback
      return imageDataUrl;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Scan Note</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center">
          {hasPermission === false && (
            <div className="text-center p-4">
              <p className="mb-4">Camera access is required to scan notes.</p>
              <Button 
                onClick={initializeCamera}
                className="bg-green-600 hover:bg-green-700"
              >
                Request Camera Access
              </Button>
            </div>
          )}
          
          {hasPermission === true && (
            <>
              {!capturedImage ? (
                <div className="relative w-full">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline
                    className="w-full rounded-md border border-gray-300"
                    style={{ display: isCameraReady ? 'block' : 'none' }}
                    onCanPlay={() => setIsCameraReady(true)}
                  />
                  
                  <div className="absolute inset-0 border-2 border-dashed border-green-500 m-6 pointer-events-none" />
                  
                  <div className="mt-4 mb-2 flex justify-center">
                    <Button 
                      onClick={captureImage}
                      disabled={!isCameraReady}
                      size="lg"
                      className="rounded-full p-3 bg-green-600 hover:bg-green-700"
                    >
                      <Camera className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full rounded-md border border-gray-300"
                  />
                  
                  <div className="mt-4 flex justify-center space-x-4">
                    <Button 
                      onClick={retakePhoto} 
                      variant="outline"
                      disabled={isProcessing}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retake
                    </Button>
                    <Button 
                      onClick={saveImage} 
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save Note
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  );
};

export default CameraScanner;
