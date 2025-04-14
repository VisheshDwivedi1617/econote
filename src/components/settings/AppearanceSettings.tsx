
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import SettingItem from "./SettingItem";
import SettingsSection from "./SettingsSection";

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <SettingsSection 
      title="Appearance" 
      icon={theme === 'dark' ? <Moon className="h-5 w-5 mr-2" /> : <Sun className="h-5 w-5 mr-2" />}
    >
      <SettingItem
        label="Dark Mode"
        description="Toggle dark theme"
        control={
          <Switch 
            id="theme-toggle" 
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        }
      />
    </SettingsSection>
  );
};

export default AppearanceSettings;
