
import { useState } from "react";
import { Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import SettingItem from "./SettingItem";
import SettingsSection from "./SettingsSection";

const SyncSettings = () => {
  const [realtimeSync, setRealtimeSync] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  
  return (
    <SettingsSection title="Sync & Storage" icon={<Download className="h-5 w-5 mr-2" />}>
      <SettingItem
        label="Real-time Sync"
        description="Sync notes as you write"
        control={
          <Switch 
            id="realtime-sync" 
            checked={realtimeSync}
            onCheckedChange={setRealtimeSync}
          />
        }
      />
      
      <SettingItem
        label="Auto Save"
        description="Automatically save notes locally"
        control={
          <Switch 
            id="auto-save" 
            checked={autoSave}
            onCheckedChange={setAutoSave}
          />
        }
      />
    </SettingsSection>
  );
};

export default SyncSettings;
