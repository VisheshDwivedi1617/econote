
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, Check, RefreshCw, Upload, FileImage, Smartphone
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { OCRLanguage } from "@/services/OCRService";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface CameraScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageDataUrl: string, language?: OCRLanguage) => void;
}

// List of supported OCR languages
const languageOptions: { value: OCRLanguage; label: string }[] = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "ita", label: "Italian" },
  { value: "por", label: "Portuguese" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "chi_tra", label: "Chinese (Traditional)" },
  { value: "jpn", label: "Japanese" },
  { value: "kor", label: "Korean" },
];

const CameraScanner = ({ open, onOpenChange, onCapture }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<OCRLanguage>("eng");
  const [applyCropping, setApplyCropping] = useState(true);
  const [applyEnhancement, setApplyEnhancement] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("camera");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Start camera when dialog opens
  useEffect(() => {
    if (open && activeTab === "camera") {
      startCamera();
    } else if (!open && stream) {
      stopCamera();
    }
    
    return () => {
      if (stream) {
        stopCamera();
      }
    };
  }, [open, activeTab]);
  
  // Handle errors
  const handleError = (error: any) => {
    console.error("Camera error:", error);
    
    let errorMessage = "Error accessing camera";
    
    if (error.name === "NotAllowedError") {
      errorMessage = "Camera access denied. Please allow camera access to scan documents.";
    } else if (error.name === "NotFoundError") {
      errorMessage = "No camera found on your device. Try uploading an image instead.";
    } else if (error.name === "NotReadableError") {
      errorMessage = "Camera is in use by another application.";
    } else {
      errorMessage = `Camera error: ${error.message || error.name || "Unknown error"}`;
    }
    
    toast({
      title: "Camera Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    // Switch to file upload tab if camera fails
    setActiveTab("upload");
  };
  
  // Start camera stream
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setIsCameraReady(false);
        
        // Define constraints - prefer environment camera (rear camera) if available
        const constraints = {
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              setIsCameraReady(true);
            }
          };
        }
      } else {
        throw new Error("Your browser doesn't support camera access");
      }
    } catch (error) {
      handleError(error);
    }
  };
  
  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setIsCameraReady(false);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    console.info("Stopping camera stream");
  };
  
  // Switch camera (useful on mobile devices)
  const switchCamera = async () => {
    if (stream) {
      stopCamera();
      
      try {
        const currentFacingMode = stream.getVideoTracks()[0].getSettings().facingMode;
        const newFacingMode = currentFacingMode === "environment" ? "user" : "environment";
        
        const constraints = {
          video: {
            facingMode: newFacingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              setIsCameraReady(true);
            }
          };
        }
        
        toast({
          title: "Camera Switched",
          description: `Now using ${newFacingMode === "environment" ? "back" : "front"} camera`,
        });
      } catch (error) {
        handleError(error);
      }
    }
  };
  
  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data URL
        const imageDataUrl = canvas.toDataURL("image/png");
        setCapturedImage(imageDataUrl);
      }
    } else {
      toast({
        title: "Camera Not Ready",
        description: "Please wait for the camera to initialize or try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG).",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image less than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCapturedImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Confirm and use the captured image
  const confirmImage = () => {
    if (capturedImage) {
      onCapture(capturedImage, selectedLanguage);
      resetScanner();
      onOpenChange(false);
    }
  };
  
  // Retake the image
  const retakeImage = () => {
    setCapturedImage(null);
  };
  
  // Reset the scanner state
  const resetScanner = () => {
    setCapturedImage(null);
    setSelectedLanguage("eng");
    setApplyCropping(true);
    setApplyEnhancement(true);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    resetScanner();
    stopCamera();
    onOpenChange(false);
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "camera") {
      startCamera();
    } else if (stream) {
      stopCamera();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className={`max-w-[90vw] w-full sm:max-w-[600px] h-[80vh] max-h-[800px] flex flex-col p-0 ${isMobile ? 'sm:max-h-[90vh]' : ''}`}>
        <DialogHeader className="p-4 sm:p-6">
          <DialogTitle>Document Scanner</DialogTitle>
          <DialogDescription>
            Capture or upload a document to add to your notes.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1">
          <div className="px-4">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="camera" className="flex-1 gap-2">
                <Camera className="h-4 w-4" />
                <span>Camera</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex-1 gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="camera" className="flex-1 flex flex-col m-0 data-[state=active]:flex-1">
            <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
              {!capturedImage ? (
                <>
                  {/* Camera view */}
                  <video 
                    ref={videoRef} 
                    className="h-full w-full object-contain"
                    autoPlay 
                    playsInline
                  />
                  
                  {/* Capture button */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <Button 
                      size="lg" 
                      className="rounded-full h-16 w-16 p-0 bg-white hover:bg-gray-100"
                      onClick={captureImage}
                      disabled={!isCameraReady}
                    >
                      <span className="sr-only">Capture</span>
                      <div className="h-12 w-12 rounded-full border-2 border-gray-900" />
                    </Button>
                  </div>
                  
                  {/* Switch camera button (on mobile) */}
                  {isMobile && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                      onClick={switchCamera}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      <span>Switch</span>
                    </Button>
                  )}
                </>
              ) : (
                // Captured image preview
                <img 
                  src={capturedImage} 
                  alt="Captured document" 
                  className="max-h-full max-w-full object-contain"
                />
              )}
              
              {/* Hidden canvas for image capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            {capturedImage && (
              <div className="p-4 space-y-4">
                <div className="flex justify-between space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={retakeImage}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    <span>Retake</span>
                  </Button>
                  
                  <Button 
                    onClick={confirmImage}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    <span>Use Image</span>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="language-select">OCR Language</Label>
                    <select
                      id="language-select"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value as OCRLanguage)}
                      className="w-40 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    >
                      {languageOptions.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="autocrop-switch">Auto-crop Document</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Automatically detect and crop document edges
                      </p>
                    </div>
                    <Switch
                      id="autocrop-switch"
                      checked={applyCropping}
                      onCheckedChange={setApplyCropping}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="enhance-switch">Enhance Readability</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Improve contrast and clarity for better OCR results
                      </p>
                    </div>
                    <Switch
                      id="enhance-switch"
                      checked={applyEnhancement}
                      onCheckedChange={setApplyEnhancement}
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload" className="flex-1 flex flex-col m-0 data-[state=active]:flex-1">
            {!capturedImage ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center w-full max-w-md">
                  <FileImage className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium">Upload Document Image</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                    Drag and drop your file here, or click to select a file
                  </p>
                  <Button onClick={triggerFileUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    <span>Select File</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    Supported formats: JPEG, PNG, HEIC
                  </p>
                </div>
                
                {isMobile && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      Or capture directly with your device's camera:
                    </p>
                    <Button variant="outline" onClick={() => handleTabChange("camera")}>
                      <Smartphone className="h-4 w-4 mr-2" />
                      <span>Use Camera</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
                  <img 
                    src={capturedImage} 
                    alt="Uploaded document" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex justify-between space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={retakeImage}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      <span>Choose Another</span>
                    </Button>
                    
                    <Button 
                      onClick={confirmImage}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      <span>Use Image</span>
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="language-select">OCR Language</Label>
                      <select
                        id="language-select"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value as OCRLanguage)}
                        className="w-40 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                      >
                        {languageOptions.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="autocrop-switch">Auto-crop Document</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Automatically detect and crop document edges
                        </p>
                      </div>
                      <Switch
                        id="autocrop-switch"
                        checked={applyCropping}
                        onCheckedChange={setApplyCropping}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="enhance-switch">Enhance Readability</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Improve contrast and clarity for better OCR results
                        </p>
                      </div>
                      <Switch
                        id="enhance-switch"
                        checked={applyEnhancement}
                        onCheckedChange={setApplyEnhancement}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CameraScanner;
