
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import CalibrationTool from "@/components/calibration/CalibrationTool";
import PenSettings from "@/components/settings/PenSettings";
import LanguageSettings from "@/components/settings/LanguageSettings";
import SyncSettings from "@/components/settings/SyncSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";

const Settings = () => {
  const navigate = useNavigate();
  const [showCalibration, setShowCalibration] = useState(false);
  
  const handleSaveSettings = () => {
    // Save settings logic (from original Settings.tsx)
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };
  
  const handleClearData = () => {
    const confirm = window.confirm(
      "Are you sure you want to clear all local data? This cannot be undone."
    );
    
    if (confirm) {
      localStorage.clear();
      
      toast({
        title: "Data cleared",
        description: "All local data has been removed",
        variant: "destructive"
      });
      
      setTimeout(() => navigate("/"), 1500);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex-1 container max-w-3xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        <PenSettings onOpenCalibration={() => setShowCalibration(true)} />
        <LanguageSettings />
        <SyncSettings />
        <AppearanceSettings />
        
        <div className="flex justify-between mt-6">
          <Button 
            variant="destructive" 
            onClick={handleClearData}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
          
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
      
      <CalibrationTool 
        isOpen={showCalibration}
        onClose={() => setShowCalibration(false)}
      />
    </div>
  );
};

export default Settings;
