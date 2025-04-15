import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import DigitalCanvas from "@/components/canvas/DigitalCanvas";
import AIToolbar from "@/components/ai/AIToolbar";
import PenStatus from "@/components/pen/PenStatus";
import NoteHeader from "@/components/notes/NoteHeader";
import WelcomeTutorial from "@/components/onboarding/WelcomeTutorial";
import TextConversionPanel from "@/components/ocr/TextConversionPanel";
import ExportPanel from "@/components/export/ExportPanel";
import CameraScanner from "@/components/scanner/CameraScanner";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useNotebook } from "@/contexts/NotebookContext";
import { OCRLanguage } from "@/services/OCRService";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [penData, setPenData] = useState<any>(null);
  const [showUtilityPanels, setShowUtilityPanels] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [isCreatingScannedPage, setIsCreatingScannedPage] = useState(false);
  const { createScannedPage } = useNotebook();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      navigate('/welcome');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleTutorialComplete = () => {
    setShowWelcome(false);
    localStorage.setItem("hasSeenTutorial", "true");
    
    toast({
      title: "Welcome to EcoNote!",
      description: "Start by connecting your smart pen and creating your first note.",
    });
  };
  
  const handlePenData = (data: any) => {
    setPenData(data);
    
    if (data.type === 'stroke' && !showUtilityPanels) {
      setShowUtilityPanels(true);
    }
  };
  
  const handleCapturedImage = async (imageDataUrl: string, language?: OCRLanguage) => {
    if (isCreatingScannedPage) return;
    
    try {
      setIsCreatingScannedPage(true);
      
      toast({
        title: "Processing Image",
        description: "Please wait while we process your scanned note...",
      });
      
      const title = `Scanned Note ${new Date().toLocaleDateString()}`;
      const newPage = await createScannedPage(imageDataUrl, title);
      
      if (!newPage || !newPage.id) {
        throw new Error("Failed to create scanned page");
      }
      
      toast({
        title: "Note Scanned",
        description: "Your scanned note has been added successfully. OCR processing in background.",
      });
      
      setTimeout(() => {
        navigate(`/note/${newPage.id}`);
      }, 100);
    } catch (error) {
      console.error("Error saving scanned note:", error);
      
      toast({
        title: "Error",
        description: "Failed to save the scanned note",
        variant: "destructive",
      });
    } finally {
      setIsCreatingScannedPage(false);
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      handleCapturedImage(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        
        <div className="flex-1 flex flex-col">
          <NoteHeader />
          
          <div className="flex-1 flex flex-col">
            <DigitalCanvas className="flex-1" />
            
            {showUtilityPanels && (
              <div className={`p-2 sm:p-4 space-y-2 ${isMobile ? 'max-h-[40vh] overflow-y-auto' : ''}`}>
                <TextConversionPanel />
                <ExportPanel />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={`fixed ${isMobile ? 'bottom-36 right-4' : 'bottom-28 right-6'} z-10`}>
        <PenStatus onPenData={handlePenData} />
      </div>
      
      <div className="fixed bottom-0 right-0 p-4 space-y-4 z-20">
        <div className={`fixed ${isMobile ? 'bottom-0 left-0 right-0' : 'bottom-0 left-0 right-0'} z-10`}>
          <AIToolbar />
        </div>
        
        <div className={`fixed ${isMobile ? 'bottom-20 right-4' : 'bottom-6 right-6'} z-10`}>
          <Button 
            onClick={() => setShowCameraScanner(true)}
            className={`rounded-full ${isMobile ? 'h-12 w-12' : 'h-14 w-14'} bg-green-600 hover:bg-green-700 shadow-lg`}
            disabled={isCreatingScannedPage}
          >
            {isCreatingScannedPage ? (
              <Loader2 className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} animate-spin`} />
            ) : (
              <Camera className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
            )}
          </Button>
        </div>
        
        <div className={`fixed ${isMobile ? 'bottom-20 right-20' : 'bottom-6 right-24'} z-10`}>
          <label htmlFor="image-upload">
            <Button 
              className={`rounded-full ${isMobile ? 'h-12 w-12' : 'h-14 w-14'} bg-blue-600 hover:bg-blue-700 shadow-lg cursor-pointer`}
              asChild
              disabled={isCreatingScannedPage}
            >
              <div>
                {isCreatingScannedPage ? (
                  <Loader2 className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} animate-spin`} />
                ) : (
                  <Upload className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                )}
              </div>
            </Button>
          </label>
          <input 
            id="image-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={isCreatingScannedPage}
          />
        </div>
      </div>
      
      {showWelcome && (
        <WelcomeTutorial onComplete={handleTutorialComplete} />
      )}
      
      <CameraScanner
        open={showCameraScanner}
        onOpenChange={setShowCameraScanner}
        onCapture={handleCapturedImage}
      />
      
      {isMobile && (
        <Sidebar className="hidden" />
      )}
    </div>
  );
};

export default Index;
