
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
import { Badge } from "@/components/ui/badge";

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
  
  // Format options with icons
  const formatOptions = [
    { value: 'png', label: 'PNG Image', icon: <FileImage className="h-4 w-4 mr-2" /> },
    { value: 'jpg', label: 'JPG Image', icon: <FileImage className="h-4 w-4 mr-2" /> },
    { value: 'pdf', label: 'PDF Document', icon: <File className="h-4 w-4 mr-2" /> },
    { value: 'docx', label: 'Word Document', icon: <FileText className="h-4 w-4 mr-2" /> }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-4 overflow-hidden transition-all duration-200">
      <div 
        className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full mr-3">
            <Download className="h-5 w-5 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Export Note
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Save your notes in different formats
            </p>
          </div>
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
        <div className="p-5 pt-0 border-t border-gray-200 dark:border-gray-700 animate-accordion-down">
          <div className="mt-4">
            <div className="flex flex-col md:flex-row md:items-end gap-3 mb-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                  Export Format
                </label>
                <Select
                  value={exportFormat}
                  onValueChange={(val) => setExportFormat(val as ExportFormat)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleExport}
                disabled={isExporting || !currentPage}
                className="bg-green-600 hover:bg-green-700"
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
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mt-3">
              <div className="flex items-start">
                <File className="h-4 w-4 mt-1 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Format Details
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {exportFormat === 'pdf' 
                      ? "Exports all pages in the current notebook as a single PDF file."
                      : exportFormat === 'docx' 
                      ? "Exports with OCR text if available for searchable documents."
                      : `Exports the current page as a ${exportFormat.toUpperCase()} image.`}
                  </p>
                </div>
              </div>
            </div>

            {currentNotebook && exportFormat === 'pdf' && (
              <Badge className="mt-3 bg-blue-500">
                Notebook export: {currentNotebook.pages.length} pages
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
