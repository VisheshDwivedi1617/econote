
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  ChevronDown,
  ChevronUp, 
  ClipboardCopy, 
  FileText, 
  Loader2,
  Save
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import OCRService, { OCRLanguage } from "@/services/OCRService";
import { useNotebook } from "@/contexts/NotebookContext";
import { Progress } from "@/components/ui/progress";

const TextConversionPanel = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [convertedText, setConvertedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<OCRLanguage>('eng');
  const [processingProgress, setProcessingProgress] = useState(0);
  const { toast } = useToast();
  const { strokes, currentPage, updatePage } = useNotebook();
  
  // Get supported languages
  const languages = OCRService.getSupportedLanguages();
  
  // Simulate progress during OCR processing
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (isProcessing) {
      setProcessingProgress(0);
      intervalId = window.setInterval(() => {
        setProcessingProgress(prev => {
          // Don't go to 100% until actually done
          return prev >= 85 ? 85 : prev + 5;
        });
      }, 500);
    } else if (processingProgress < 100 && processingProgress > 0) {
      // Complete the progress bar when done
      setProcessingProgress(100);
    }
    
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isProcessing, processingProgress]);
  
  const handleConvertToText = async () => {
    // Reset state
    setError(null);
    setConvertedText(null);
    setIsProcessing(true);
    
    try {
      if (strokes.length === 0) {
        setError("No handwriting to convert. Please write something first.");
        setIsProcessing(false);
        return;
      }
      
      // Since we can't directly recognize handwriting from strokes,
      // we'll use the canvas to get an image URL and then use recognizeText
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        setError("Canvas not found. Please try again.");
        setIsProcessing(false);
        return;
      }
      
      // Get image data from canvas
      const imageUrl = canvas.toDataURL('image/png');
      const result = await OCRService.recognizeHandwriting(imageUrl, language);
      setConvertedText(result);
      
      // Expand panel to show result
      setIsExpanded(true);
      
    } catch (err) {
      console.error('OCR error:', err);
      setError(`Failed to convert handwriting to text: ${err}`);
      
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

  const saveToNote = async () => {
    if (!convertedText || !currentPage) return;
    
    try {
      // Update the current page to store the OCR text
      const updatedPage = {
        ...currentPage,
        ocrText: convertedText,
        ocrLanguage: language,
        updatedAt: Date.now()
      };
      
      await updatePage(updatedPage);
      
      toast({
        title: "Text saved",
        description: "The converted text has been saved to your note",
      });
    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: "Save failed",
        description: "Could not save the text to your note",
        variant: "destructive",
      });
    }
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
            
            {isProcessing && (
              <div className="mt-2">
                <Progress value={processingProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Processing handwriting... {processingProgress}%
                </p>
              </div>
            )}
            
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
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={copyToClipboard}
                      title="Copy to clipboard"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveToNote}
                      title="Save to note"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
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
