
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
import { Camera } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useNotebook } from "@/contexts/NotebookContext";
import { ThemeProvider } from "@/hooks/use-theme";

const Index = () => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [penData, setPenData] = useState<any>(null);
  const [showUtilityPanels, setShowUtilityPanels] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const { createScannedPage } = useNotebook();
  
  useEffect(() => {
    // Show welcome tutorial the first time only
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    
    if (!hasSeenTutorial) {
      // Small delay to let the page render first
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
  
  // Handle pen data from the PenStatus component
  const handlePenData = (data: any) => {
    setPenData(data);
    
    // Show utility panels after getting some pen data
    if (data.type === 'stroke' && !showUtilityPanels) {
      setShowUtilityPanels(true);
    }
  };
  
  // Handle captured image from camera
  const handleCapturedImage = async (imageDataUrl: string) => {
    try {
      // Create a new page from the scanned image
      const newPage = await createScannedPage(imageDataUrl);
      
      // Show success message
      toast({
        title: "Note Scanned",
        description: "Your scanned note has been added successfully",
      });
      
      // Navigate to the new note
      navigate(`/note/${newPage.id}`);
    } catch (error) {
      console.error("Error saving scanned note:", error);
      
      toast({
        title: "Error",
        description: "Failed to save the scanned note",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <NoteHeader />
          
          <div className="flex-1 flex flex-col">
            <DigitalCanvas className="flex-1" />
            
            {/* OCR and Export Panels */}
            {showUtilityPanels && (
              <div className="p-4 space-y-2">
                <TextConversionPanel />
                <ExportPanel />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating "Scan Note" button */}
      <div className="fixed bottom-24 right-6 z-10">
        <Button 
          onClick={() => setShowCameraScanner(true)}
          className="rounded-full h-14 w-14 bg-green-600 hover:bg-green-700 shadow-lg"
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>
      
      <PenStatus onPenData={handlePenData} />
      <AIToolbar />
      
      {showWelcome && (
        <WelcomeTutorial onComplete={handleTutorialComplete} />
      )}
      
      {/* Camera scanner dialog */}
      <CameraScanner
        open={showCameraScanner}
        onOpenChange={setShowCameraScanner}
        onCapture={handleCapturedImage}
      />
    </div>
  );
};

export default Index;
