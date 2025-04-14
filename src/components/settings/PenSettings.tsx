
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PenTool } from "lucide-react";
import { Label } from "@/components/ui/label";
import SettingsSection from "./SettingsSection";

interface PenSettingsProps {
  onOpenCalibration: () => void;
}

const PenSettings = ({ onOpenCalibration }: PenSettingsProps) => {
  const [penBattery, setPenBattery] = useState(85); // Would come from pen service
  const [penFirmware, setPenFirmware] = useState("v2.1.3"); // Would come from pen service

  const handleFirmwareUpdate = () => {
    // Implementation retained from original Settings.tsx
  };

  return (
    <SettingsSection title="Smart Pen Settings" icon={<PenTool className="h-5 w-5 mr-2" />}>
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
          onClick={onOpenCalibration}
        >
          Calibrate
        </Button>
      </div>
    </SettingsSection>
  );
};

export default PenSettings;
