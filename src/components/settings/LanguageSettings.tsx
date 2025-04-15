
import { useState, useEffect } from "react";
import { Languages } from "lucide-react";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import OCRService, { OCRLanguage } from "@/services/OCRService";
import SettingsSection from "./SettingsSection";

const LanguageSettings = () => {
  const [ocrLanguage, setOcrLanguage] = useState<OCRLanguage>('eng');
  const languages = OCRService.getSupportedLanguages();
  
  // Load saved language from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ocrLanguage');
    if (savedLanguage) {
      setOcrLanguage(savedLanguage as OCRLanguage);
    }
  }, []);
  
  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('ocrLanguage', ocrLanguage);
    
    // Dispatch event to notify parent component of changes
    window.dispatchEvent(new Event('settings-changed'));
  }, [ocrLanguage]);
  
  const handleLanguageChange = (value: OCRLanguage) => {
    setOcrLanguage(value);
    
    // Show confirmation toast
    const event = new CustomEvent('setting-changed', {
      detail: {
        setting: 'ocrLanguage',
        value: value,
        message: `OCR Language set to ${
          languages.find(lang => lang.id === value)?.name || value
        }`
      }
    });
    window.dispatchEvent(event);
  };
  
  return (
    <SettingsSection title="Language & Recognition" icon={<Languages className="h-5 w-5 mr-2" />}>
      <div>
        <Label htmlFor="ocr-language">OCR Language</Label>
        <Select 
          value={ocrLanguage} 
          onValueChange={(value) => handleLanguageChange(value as OCRLanguage)}
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
    </SettingsSection>
  );
};

export default LanguageSettings;
