
import { jsPDF } from 'jspdf';

interface ExportOptions {
  filename?: string;
  format?: 'pdf' | 'image' | 'markdown' | 'text';
  quality?: number; // For images, 0-1
  includeMetadata?: boolean;
}

interface Page {
  id: string;
  title: string;
  content: string;
  strokes?: any[];
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
   * Export strokes to a file in the specified format
   */
  export = async (strokes: any[], format: string, filename: string): Promise<string> => {
    try {
      // Create a temporary canvas to render strokes
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 900;
      
      // In a real implementation, we would render the strokes to the canvas
      // This is a simplified version where we just draw a placeholder
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '24px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText('Note Export', 20, 50);
        
        // Draw some sample strokes
        if (strokes.length > 0) {
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          strokes.forEach((stroke: any) => {
            if (stroke.points && stroke.points.length > 1) {
              ctx.beginPath();
              ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
              stroke.points.slice(1).forEach((point: {x: number, y: number}) => {
                ctx.lineTo(point.x, point.y);
              });
              ctx.stroke();
            }
          });
        } else {
          ctx.fillText('No strokes available', 20, 100);
        }
      }
      
      // Export using the appropriate format
      if (format === 'png' || format === 'jpg') {
        return this.exportToImage(canvas, filename, 0.9);
      } else {
        return this.exportToPDF(canvas, filename);
      }
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Failed to export content: ${error}`);
    }
  };
  
  /**
   * Export multiple pages to a document
   */
  exportDocument = async (pages: Page[], title: string, format: string): Promise<string> => {
    try {
      const filename = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`;
      
      if (format === 'pdf') {
        return this.exportPagesToPDF(pages, filename);
      } else if (format === 'docx') {
        return this.exportPagesToDocx(pages, filename);
      } else {
        throw new Error(`Unsupported document format: ${format}`);
      }
    } catch (error) {
      console.error('Export document error:', error);
      throw new Error(`Failed to export document: ${error}`);
    }
  };
  
  /**
   * Export pages to PDF
   */
  private exportPagesToPDF = (pages: Page[], filename: string): string => {
    // Create PDF with standard dimensions
    const pdf = new jsPDF();
    
    pages.forEach((page, index) => {
      // Add a new page for all but the first page
      if (index > 0) {
        pdf.addPage();
      }
      
      // Add the page title
      pdf.setFontSize(16);
      pdf.text(page.title, 20, 20);
      
      // Add the page content
      pdf.setFontSize(12);
      
      // Simple text wrapping
      const content = page.content || '';
      const textLines = pdf.splitTextToSize(content, 170);
      pdf.text(textLines, 20, 40);
    });
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
    return `${filename}.pdf`;
  };
  
  /**
   * Export pages to DOCX (simplified implementation)
   */
  private exportPagesToDocx = (pages: Page[], filename: string): string => {
    // In a real implementation, we would use a library like docx.js
    // For now, we'll just create a text file with the contents
    
    const content = pages.map(page => {
      return `# ${page.title}\n\n${page.content || ''}\n\n`;
    }).join('---\n\n');
    
    // Create text blob
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.txt`; // .docx in real implementation
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    return `${filename}.txt`;
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
