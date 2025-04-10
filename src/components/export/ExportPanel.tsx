
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  FileImage,
  File,
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
import { useToast } from "@/components/ui/use-toast";
import ExportService from "@/services/ExportService";
import { useNotebook } from "@/contexts/NotebookContext";
import StorageService from "@/services/StorageService";

// Define the export format type locally
type ExportFormat = 'png' | 'jpg' | 'pdf' | 'docx' | 'svg';

const ExportPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const { toast } = useToast();
  const { strokes, currentPage, currentNotebook, notebooks } = useNotebook();
  
  const handleExport = async () => {
    if (!currentPage) return;
    
    setIsExporting(true);
    
    try {
      const filename = `${currentPage.title}_${new Date().toISOString().slice(0, 10)}`;
      
      switch (exportFormat) {
        case 'png':
        case 'jpg':
          await ExportService.export(strokes, exportFormat, filename);
          break;
          
        case 'pdf':
          // Export all pages in the current notebook
          if (currentNotebook) {
            const pages = await Promise.all(
              currentNotebook.pages.map(async pageId => {
                const page = await StorageService.getPage(pageId);
                return page!;
              })
            );
            await ExportService.exportDocument(pages.filter(Boolean), currentNotebook.title, 'pdf');
          } else {
            // Just export current page if no notebook
            await ExportService.exportDocument([currentPage], filename, 'pdf');
          }
          break;
          
        case 'docx':
          // This would integrate with a DOCX library in a real implementation
          await ExportService.exportDocument([currentPage], filename, 'docx');
          break;
          
        default:
          throw new Error(`Unsupported export format: ${exportFormat}`);
      }
      
      toast({
        title: "Export complete",
        description: `Your note has been exported as ${exportFormat.toUpperCase()}`,
      });
      
    } catch (err) {
      console.error('Export error:', err);
      
      toast({
        title: "Export failed",
        description: "There was an error exporting your note",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Get icon based on format
  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'png':
      case 'jpg':
      case 'svg':
        return <FileImage className="h-4 w-4 mr-1" />;
      case 'pdf':
        return <File className="h-4 w-4 mr-1" />;
      case 'docx':
        return <FileText className="h-4 w-4 mr-1" />;
      default:
        return <Download className="h-4 w-4 mr-1" />;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-4">
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Download className="h-5 w-5 mr-2 text-green-500" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Export Note
          </h3>
        </div>
        <div>
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
                value={exportFormat}
                onValueChange={(val) => setExportFormat(val as ExportFormat)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG Image</SelectItem>
                  <SelectItem value="jpg">JPG Image</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="docx">Word Document</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleExport}
                disabled={isExporting || !currentPage}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    {getFormatIcon(exportFormat)}
                    Export as {exportFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {exportFormat === 'pdf' 
                ? "Exports all pages in the current notebook as a single PDF file."
                : exportFormat === 'docx' 
                ? "Exports with OCR text if available."
                : `Exports the current page as a ${exportFormat.toUpperCase()} image.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
