
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Save, Trash2, AlertTriangle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import CalibrationTool from "@/components/calibration/CalibrationTool";
import PenSettings from "@/components/settings/PenSettings";
import LanguageSettings from "@/components/settings/LanguageSettings";
import SyncSettings from "@/components/settings/SyncSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const [showCalibration, setShowCalibration] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  
  // Monitor for settings changes
  useEffect(() => {
    const checkForChanges = () => {
      const current = getSettingsSnapshot();
      const saved = localStorage.getItem('ecoNoteSettings');
      
      if (saved) {
        try {
          const savedSettings = JSON.parse(saved);
          // Compare saved settings with current state
          const hasChanges = JSON.stringify(current) !== JSON.stringify(savedSettings);
          setPendingChanges(hasChanges);
        } catch (e) {
          console.error("Error parsing saved settings:", e);
          setPendingChanges(true);
        }
      } else {
        // No saved settings yet, mark as having changes
        setPendingChanges(true);
      }
    };
    
    // Check for changes initially
    checkForChanges();
    
    // Set up event listener for child component changes
    window.addEventListener('settings-changed', checkForChanges);
    
    return () => {
      window.removeEventListener('settings-changed', checkForChanges);
    };
  }, []);
  
  // Retrieve last saved time on component mount
  useEffect(() => {
    const savedTimeStr = localStorage.getItem('ecoNoteSettingsSavedTime');
    if (savedTimeStr) {
      try {
        const savedTime = parseInt(savedTimeStr);
        const date = new Date(savedTime);
        setLastSavedTime(date.toLocaleString());
      } catch (e) {
        console.error("Error parsing saved time:", e);
      }
    }
  }, []);
  
  // Get current settings from all components
  const getSettingsSnapshot = () => {
    // Retrieve settings from localStorage where each component stores its state
    return {
      theme: localStorage.getItem('theme') || 'light',
      penCalibration: localStorage.getItem('penCalibration') || null,
      ocrLanguage: localStorage.getItem('ocrLanguage') || 'eng',
      realtimeSync: localStorage.getItem('realtimeSync') === 'true',
      autoSave: localStorage.getItem('autoSave') === 'true'
    };
  };
  
  const handleSaveSettings = () => {
    // Get current settings snapshot
    const currentSettings = getSettingsSnapshot();
    
    // Save to localStorage
    localStorage.setItem('ecoNoteSettings', JSON.stringify(currentSettings));
    
    // Save timestamp
    const now = Date.now();
    localStorage.setItem('ecoNoteSettingsSavedTime', now.toString());
    setLastSavedTime(new Date(now).toLocaleString());
    
    // Mark as saved
    setPendingChanges(false);
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };
  
  const handleClearData = () => {
    // We'll show a confirmation dialog before clearing data,
    // so this function just triggers the dialog
  };
  
  const confirmClearData = () => {
    // Perform actual data clearing
    const preservedSettings = {
      theme: localStorage.getItem('theme')
    };
    
    localStorage.clear();
    
    // Restore theme setting to prevent UI flash
    if (preservedSettings.theme) {
      localStorage.setItem('theme', preservedSettings.theme);
    }
    
    toast({
      title: "Data cleared",
      description: "All local data has been removed",
      variant: "destructive"
    });
    
    // Navigate back to home after a short delay
    setTimeout(() => navigate("/"), 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex-1 container max-w-3xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
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
          
          {lastSavedTime && (
            <p className="text-sm text-gray-500">
              Last saved: {lastSavedTime}
            </p>
          )}
        </div>
        
        <PenSettings onOpenCalibration={() => setShowCalibration(true)} />
        <LanguageSettings />
        <SyncSettings />
        <AppearanceSettings />
        
        <div className="flex justify-between mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                onClick={handleClearData}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Clear All Data?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your
                  notes, notebooks, and settings from this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmClearData} className="bg-red-600 hover:bg-red-700">
                  Yes, Clear All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button 
            onClick={handleSaveSettings} 
            disabled={!pendingChanges}
            className={pendingChanges ? "animate-pulse" : ""}
          >
            <Save className="h-4 w-4 mr-2" />
            {pendingChanges ? "Save Changes" : "Saved"}
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
