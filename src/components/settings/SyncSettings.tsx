
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import SettingItem from "./SettingItem";
import SettingsSection from "./SettingsSection";

const SyncSettings = () => {
  const [realtimeSync, setRealtimeSync] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  
  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedRealtimeSync = localStorage.getItem('realtimeSync');
    if (savedRealtimeSync !== null) {
      setRealtimeSync(savedRealtimeSync === 'true');
    }
    
    const savedAutoSave = localStorage.getItem('autoSave');
    if (savedAutoSave !== null) {
      setAutoSave(savedAutoSave === 'true');
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('realtimeSync', realtimeSync.toString());
    localStorage.setItem('autoSave', autoSave.toString());
    
    // Dispatch event to notify parent component of changes
    window.dispatchEvent(new Event('settings-changed'));
  }, [realtimeSync, autoSave]);
  
  // Handle toggle changes
  const handleRealtimeSyncChange = (checked: boolean) => {
    setRealtimeSync(checked);
    
    // Show confirmation toast
    const event = new CustomEvent('setting-changed', {
      detail: {
        setting: 'realtimeSync',
        value: checked,
        message: `Real-time sync ${checked ? 'enabled' : 'disabled'}`
      }
    });
    window.dispatchEvent(event);
  };
  
  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked);
    
    // Show confirmation toast
    const event = new CustomEvent('setting-changed', {
      detail: {
        setting: 'autoSave',
        value: checked,
        message: `Auto save ${checked ? 'enabled' : 'disabled'}`
      }
    });
    window.dispatchEvent(event);
  };
  
  return (
    <SettingsSection title="Sync & Storage" icon={<Download className="h-5 w-5 mr-2" />}>
      <SettingItem
        label="Real-time Sync"
        description="Sync notes as you write"
        control={
          <Switch 
            id="realtime-sync" 
            checked={realtimeSync}
            onCheckedChange={handleRealtimeSyncChange}
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
            onCheckedChange={handleAutoSaveChange}
          />
        }
      />
    </SettingsSection>
  );
};

export default SyncSettings;
