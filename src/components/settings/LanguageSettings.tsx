
import { useState } from "react";
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
  
  return (
    <SettingsSection title="Language & Recognition" icon={<Languages className="h-5 w-5 mr-2" />}>
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
    </SettingsSection>
  );
};

export default LanguageSettings;
