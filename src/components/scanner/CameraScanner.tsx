
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, CheckCircle, RefreshCw, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNotebook } from "@/contexts/NotebookContext";
import { detectEdges, enhanceImage } from "@/services/ImageProcessingService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OCRService, { OCRLanguage } from "@/services/OCRService";
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [language, setLanguage] = useState<OCRLanguage>('eng');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [usingFileUpload, setUsingFileUpload] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  const languages = OCRService.getSupportedLanguages();
  
  useEffect(() => {
    if (open) {
      initializeCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setUsingFileUpload(false);
    }
    
    return () => {
      stopCamera();
    };
  }, [open]);
  
  const initializeCamera = async () => {
    try {
      setCameraError(null);
      setUsingFileUpload(false);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("Camera API not supported, falling back to file upload");
        setCameraError("Camera API is not supported in your browser");
        setUsingFileUpload(true);
        setHasPermission(false);
        return;
      }
      
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // First try with ideal settings
      try {
        const constraints: MediaStreamConstraints = {
          video: isMobileDevice ? {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } : {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        console.log("Attempting to access camera with constraints:", JSON.stringify(constraints));
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
          setHasPermission(true);
        }
      } catch (error) {
        console.log("Failed with first attempt, trying simpler constraints");
        
        try {
          // Try with very basic constraints if the first attempt failed
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraReady(true);
            setHasPermission(true);
          }
        } catch (finalError) {
          console.error("All camera access attempts failed:", finalError);
          setCameraError("Could not access your camera. Please check permissions.");
          setUsingFileUpload(true);
          setHasPermission(false);
        }
      }
    } catch (error) {
      console.error("Error in camera initialization:", error);
      setCameraError("Camera access failed. You can upload an image instead.");
      setUsingFileUpload(true);
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
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setCapturedImage(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };
  
  const retakePhoto = () => {
    setCapturedImage(null);
    if (usingFileUpload) {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      initializeCamera();
    }
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
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-full sm:max-w-lg p-3 sm:p-6' : 'sm:max-w-xl'}`}>
        <DialogHeader>
          <DialogTitle>Scan Note</DialogTitle>
          <DialogDescription>
            Take a photo of your note or upload an image
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center">
          {cameraError && !usingFileUpload && (
            <div className="text-center p-4 mb-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
              <p className="flex items-center justify-center gap-2">
                <X className="h-5 w-5" />
                {cameraError}
              </p>
            </div>
          )}
          
          {hasPermission === false && !usingFileUpload && (
            <div className="text-center p-4">
              <Smartphone className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <p className="mb-4 dark:text-gray-300">Camera access is required to scan notes.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  onClick={initializeCamera}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Request Camera Access
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setUsingFileUpload(true)}
                >
                  Upload Image Instead
                </Button>
              </div>
            </div>
          )}
          
          {usingFileUpload && !capturedImage && (
            <div className="w-full p-4 text-center">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
              />
              <label 
                htmlFor="image-upload" 
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Camera className="w-12 h-12 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG or JPEG
                </p>
              </label>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUsingFileUpload(false);
                    initializeCamera();
                  }}
                  className="w-full sm:w-auto"
                >
                  Try Camera Instead
                </Button>
              </div>
            </div>
          )}
          
          {hasPermission === true && !usingFileUpload && (
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
                  
                  <div className="mt-2 text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => setUsingFileUpload(true)}
                      size="sm"
                    >
                      Upload Image Instead
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
          
          {capturedImage && usingFileUpload && (
            <div className="relative w-full">
              <img 
                src={capturedImage} 
                alt="Uploaded" 
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
                      Choose Different
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
        </div>
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  );
};

export default CameraScanner;
