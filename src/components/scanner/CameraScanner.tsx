
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, CheckCircle, RefreshCw, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNotebook } from "@/contexts/NotebookContext";
import { detectEdges, enhanceImage } from "@/services/ImageProcessingService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OCRService, { OCRLanguage } from "@/services/OCRService";
import { useTheme } from "@/hooks/use-theme";

interface CameraScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageDataUrl: string, language?: OCRLanguage) => void;
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
  const [language, setLanguage] = useState<OCRLanguage>('eng');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { toast } = useToast();
  const { theme } = useTheme();
  
  const languages = OCRService.getSupportedLanguages();
  
  useEffect(() => {
    if (open) {
      initializeCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [open]);
  
  const initializeCamera = async () => {
    try {
      setCameraError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API is not supported in your browser");
        toast({
          title: "Error",
          description: "Camera API is not supported in your browser",
          variant: "destructive",
        });
        setHasPermission(false);
        return;
      }
      
      // Try to detect if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const constraints: MediaStreamConstraints = {
        video: isMobile ? {
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
          setHasPermission(true);
        }
      } catch (error) {
        console.warn("Failed with environment camera, trying default:", error);
        
        // If environment camera fails, try without specifying (fallback for mobile)
        const fallbackConstraints = {
          video: true
        };
        
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          setIsCameraReady(true);
          setHasPermission(true);
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Please allow camera access to scan notes");
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
      
      const processedImageDataUrl = await processImage(capturedImage);
      
      onCapture(processedImageDataUrl, language);
      
      onOpenChange(false);
      
      setCapturedImage(null);
      setIsProcessing(false);
      
      toast({
        title: "Success",
        description: "Note scanned and saved. OCR is processing in the background.",
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
  
  const processImage = async (imageDataUrl: string): Promise<string> => {
    try {
      const img = new Image();
      img.src = imageDataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Failed to get canvas context");
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      const cropRect = await detectEdges(canvas);
      
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
      
      const enhancedImageDataUrl = await enhanceImage(croppedCanvas);
      
      return enhancedImageDataUrl;
    } catch (error) {
      console.error("Error in image processing:", error);
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
          {cameraError && (
            <div className="text-center p-4 mb-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
              <p className="flex items-center justify-center gap-2">
                <X className="h-5 w-5" />
                {cameraError}
              </p>
            </div>
          )}
          
          {hasPermission === false && (
            <div className="text-center p-4">
              <Smartphone className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <p className="mb-4 dark:text-gray-300">Camera access is required to scan notes.</p>
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
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700"
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
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600"
                  />
                  
                  <div className="mt-4">
                    <div className="flex flex-col gap-3">
                      <Select 
                        value={language}
                        onValueChange={(val) => setLanguage(val as OCRLanguage)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="OCR Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(lang => (
                            <SelectItem key={lang.id} value={lang.id}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex justify-center space-x-4">
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
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  );
};

export default CameraScanner;
