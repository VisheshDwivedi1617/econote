
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import DigitalCanvas from "@/components/canvas/DigitalCanvas";
import AIToolbar from "@/components/ai/AIToolbar";
import PenStatus from "@/components/pen/PenStatus";
import NoteHeader from "@/components/notes/NoteHeader";
import WelcomeTutorial from "@/components/onboarding/WelcomeTutorial";
import TextConversionPanel from "@/components/ocr/TextConversionPanel";
import ExportPanel from "@/components/export/ExportPanel";
import { toast } from "@/components/ui/use-toast";
import { NotebookProvider } from "@/contexts/NotebookContext";
import { ThemeProvider } from "@/hooks/use-theme";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [penData, setPenData] = useState<any>(null);
  const [showUtilityPanels, setShowUtilityPanels] = useState(false);
  
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
      title: "Welcome to ScribeSync!",
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
  
  return (
    <ThemeProvider>
      <NotebookProvider>
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
          
          <PenStatus onPenData={handlePenData} />
          <AIToolbar />
          
          {showWelcome && (
            <WelcomeTutorial onComplete={handleTutorialComplete} />
          )}
        </div>
      </NotebookProvider>
    </ThemeProvider>
  );
};

export default Index;
