
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  ChevronDown,
  ChevronUp, 
  ClipboardCopy, 
  FileText, 
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import OCRService, { OCRLanguage } from "@/services/OCRService";
import { useNotebook } from "@/contexts/NotebookContext";

const TextConversionPanel = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [convertedText, setConvertedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<OCRLanguage>('en');
  const { toast } = useToast();
  const { strokes } = useNotebook();
  
  // Get supported languages
  const languages = OCRService.getSupportedLanguages();
  
  const handleConvertToText = async () => {
    // Reset state
    setError(null);
    setConvertedText(null);
    setIsProcessing(true);
    
    try {
      if (strokes.length === 0) {
        setError("No handwriting to convert. Please write something first.");
        return;
      }
      
      // Process handwriting with OCR service
      const result = await OCRService.recognizeHandwriting(strokes, language);
      setConvertedText(result);
      
      // Expand panel to show result
      setIsExpanded(true);
      
    } catch (err) {
      console.error('OCR error:', err);
      setError(`Failed to convert handwriting: ${err}`);
      
      toast({
        title: "Conversion failed",
        description: "Could not convert handwriting to text",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const copyToClipboard = () => {
    if (!convertedText) return;
    
    navigator.clipboard.writeText(convertedText);
    
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard",
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-4">
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Text Conversion
          </h3>
        </div>
        <div className="flex items-center">
          {isProcessing && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" />
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Select 
                value={language}
                onValueChange={(val) => setLanguage(val as OCRLanguage)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleConvertToText}
                disabled={isProcessing || strokes.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Convert to Text'
                )}
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {convertedText && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    Converted Text:
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={copyToClipboard}
                    title="Copy to clipboard"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm">
                  {convertedText}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextConversionPanel;
