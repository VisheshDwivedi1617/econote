
import { jsPDF } from 'jspdf';

interface ExportOptions {
  filename?: string;
  format?: 'pdf' | 'image' | 'markdown' | 'text';
  quality?: number; // For images, 0-1
  includeMetadata?: boolean;
}

class ExportService {
  /**
   * Export canvas content to a file
   */
  exportCanvas = async (canvas: HTMLCanvasElement | null, options: ExportOptions = {}): Promise<string> => {
    try {
      if (!canvas) {
        throw new Error('Canvas element is required for export');
      }
      
      const format = options.format || 'pdf';
      const filename = options.filename || `note-${new Date().toISOString().substring(0, 10)}`;
      
      switch (format) {
        case 'pdf':
          return this.exportToPDF(canvas, filename);
        case 'image':
          return this.exportToImage(canvas, filename, options.quality || 0.9);
        case 'markdown':
        case 'text':
          throw new Error(`${format} export not implemented yet`);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Failed to export content: ${error}`);
    }
  };
  
  /**
   * Export canvas to PDF file
   */
  private exportToPDF = (canvas: HTMLCanvasElement, filename: string): string => {
    // Get canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Create PDF with appropriate dimensions
    const pdf = new jsPDF({
      orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvasWidth, canvasHeight]
    });
    
    // Add the canvas as an image to the PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    pdf.addImage(imgData, 'JPEG', 0, 0, canvasWidth, canvasHeight);
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
    return `${filename}.pdf`;
  };
  
  /**
   * Export canvas to image file
   */
  private exportToImage = (canvas: HTMLCanvasElement, filename: string, quality: number): string => {
    // Convert canvas to data URL
    const imgData = canvas.toDataURL('image/png', quality);
    
    // Create a download link
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${filename}.png`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return `${filename}.png`;
  };
  
  /**
   * Export note text content to file
   */
  exportNoteContent = async (content: string, options: ExportOptions = {}): Promise<string> => {
    try {
      const format = options.format || 'text';
      const filename = options.filename || `note-${new Date().toISOString().substring(0, 10)}`;
      
      switch (format) {
        case 'pdf':
          return this.contentToPDF(content, filename);
        case 'text':
          return this.contentToText(content, filename);
        case 'markdown':
          return this.contentToMarkdown(content, filename);
        default:
          throw new Error(`Unsupported content export format: ${format}`);
      }
    } catch (error) {
      console.error('Export content error:', error);
      throw new Error(`Failed to export content: ${error}`);
    }
  };
  
  /**
   * Export text content to PDF
   */
  private contentToPDF = (content: string, filename: string): string => {
    // Create PDF
    const pdf = new jsPDF();
    
    // Add text content
    pdf.text(content, 10, 10);
    
    // Save PDF
    pdf.save(`${filename}.pdf`);
    
    return `${filename}.pdf`;
  };
  
  /**
   * Export text content to text file
   */
  private contentToText = (content: string, filename: string): string => {
    // Create text blob
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.txt`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    return `${filename}.txt`;
  };
  
  /**
   * Export text content to markdown file
   */
  private contentToMarkdown = (content: string, filename: string): string => {
    // Convert content to markdown format if needed
    // For now, we'll just save the content as-is
    
    // Create markdown blob
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.md`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    return `${filename}.md`;
  };
}

export default new ExportService();
