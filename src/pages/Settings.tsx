import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Save, Trash2, Bluetooth, PenTool, 
  Moon, Sun, Languages, Download
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { OCRLanguage } from "@/services/OCRService";
import OCRService from "@/services/OCRService";
import { useTheme } from "@/hooks/use-theme";
import CalibrationTool from "@/components/calibration/CalibrationTool";

const Settings = () => {
  const navigate = useNavigate();
  const [showCalibration, setShowCalibration] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState<OCRLanguage>('eng');
  const [realtimeSync, setRealtimeSync] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [penBattery, setPenBattery] = useState(85); // Would come from pen service
  const [penFirmware, setPenFirmware] = useState("v2.1.3"); // Would come from pen service
  const { theme, setTheme } = useTheme();
  
  // Supported languages from OCR service
  const languages = OCRService.getSupportedLanguages();
  
  const handleSaveSettings = () => {
    // In a real app, save settings to local storage or a backend
    localStorage.setItem('ocrLanguage', ocrLanguage);
    localStorage.setItem('realtimeSync', String(realtimeSync));
    localStorage.setItem('autoSave', String(autoSave));
    localStorage.setItem('theme', theme);
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };
  
  const handleFirmwareUpdate = () => {
    toast({
      title: "Firmware update",
      description: "Checking for updates...",
    });
    
    // Simulate update check
    setTimeout(() => {
      toast({
        title: "Firmware up to date",
        description: `Your pen is already on the latest firmware (${penFirmware})`,
      });
    }, 2000);
  };
  
  const handleClearData = () => {
    // This would show a confirmation dialog in a real app
    const confirm = window.confirm(
      "Are you sure you want to clear all local data? This cannot be undone."
    );
    
    if (confirm) {
      // Clear local storage
      localStorage.clear();
      
      toast({
        title: "Data cleared",
        description: "All local data has been removed",
        variant: "destructive"
      });
      
      // Navigate back to home page
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
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <PenTool className="h-5 w-5 mr-2" />
            Smart Pen Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label>Pen Battery</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current battery level: {penBattery}%
                </p>
              </div>
              <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    penBattery > 50 ? 'bg-green-500' : 
                    penBattery > 20 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} 
                  style={{ width: `${penBattery}%` }}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <Label>Firmware Version</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {penFirmware}
                </p>
              </div>
              <Button size="sm" onClick={handleFirmwareUpdate}>
                Check for Updates
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <Label>Calibrate Pen</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Align pen with digital canvas
                </p>
              </div>
              <Button 
                size="sm"
                onClick={() => setShowCalibration(true)}
              >
                Calibrate
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Languages className="h-5 w-5 mr-2" />
            Language & Recognition
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="ocr-language">OCR Language</Label>
              <Select 
                value={ocrLanguage} 
                onValueChange={(value) => setOcrLanguage(value as OCRLanguage)}
              >
                <SelectTrigger id="ocr-language" className="w-full mt-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Language used for handwriting recognition
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Sync & Storage
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="realtime-sync">Real-time Sync</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sync notes as you write
                </p>
              </div>
              <Switch 
                id="realtime-sync" 
                checked={realtimeSync}
                onCheckedChange={setRealtimeSync}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-save">Auto Save</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically save notes locally
                </p>
              </div>
              <Switch 
                id="auto-save" 
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 mr-2" />
            ) : (
              <Sun className="h-5 w-5 mr-2" />
            )}
            Appearance
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme-toggle">Dark Mode</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle dark theme
                </p>
              </div>
              <Switch 
                id="theme-toggle" 
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </div>
        </div>
        
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
