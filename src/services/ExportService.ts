
// ExportService.ts - Handles exporting notes to different formats

import { NotePage } from '@/services/StorageService';
import { PenStroke } from '@/services/PenDataInterpreter';

export type ExportFormat = 'png' | 'jpg' | 'pdf' | 'docx' | 'svg';

class ExportService {
  // Export a note as an image
  async exportImage(strokes: PenStroke[], format: 'png' | 'jpg' | 'svg', filename: string): Promise<void> {
    // Get canvas or create a new one
    let canvas = document.querySelector('canvas');
    
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Clear the canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines (if it's a note canvas)
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    for (let y = 40; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length === 0) return;
      
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.stroke();
    });
    
    // Convert canvas to data URL based on format
    let mimeType;
    switch (format) {
      case 'jpg':
        mimeType = 'image/jpeg';
        break;
      case 'svg':
        // This is simplified; actual SVG export would need more work
        mimeType = 'image/svg+xml';
        break;
      case 'png':
      default:
        mimeType = 'image/png';
        break;
    }
    
    const dataUrl = canvas.toDataURL(mimeType);
    
    // Create a download link and trigger it
    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = dataUrl;
    link.click();
  }
  
  // Export one or more notes as a PDF document
  async exportPDF(pages: NotePage[], title: string): Promise<void> {
    // This is a simplified implementation
    // In a real app, you would use a PDF library like jsPDF
    
    // Create a hidden container for the PDF content
    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.width = '800px';
    document.body.appendChild(pdfContainer);
    
    try {
      // Add title
      const titleElement = document.createElement('h1');
      titleElement.textContent = title;
      pdfContainer.appendChild(titleElement);
      
      // Add each page
      for (const page of pages) {
        // Page title
        const pageTitle = document.createElement('h2');
        pageTitle.textContent = page.title;
        pdfContainer.appendChild(pageTitle);
        
        // Page content (simplified)
        if (page.isScanned && page.imageData) {
          const img = document.createElement('img');
          img.src = page.imageData;
          img.style.width = '100%';
          pdfContainer.appendChild(img);
          
          if (page.ocrText) {
            const textElem = document.createElement('pre');
            textElem.textContent = page.ocrText;
            pdfContainer.appendChild(textElem);
          }
        } else if (page.strokes && page.strokes.length > 0) {
          // Create a canvas to render the strokes
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 600;
          pdfContainer.appendChild(canvas);
          
          // Render the strokes (simplified)
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            page.strokes.forEach(stroke => {
              if (stroke.points.length === 0) return;
              
              ctx.strokeStyle = stroke.color;
              ctx.lineWidth = stroke.width;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              
              ctx.beginPath();
              ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
              
              for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
              }
              
              ctx.stroke();
            });
          }
        }
        
        // Add page break
        const pageBreak = document.createElement('div');
        pageBreak.style.pageBreakAfter = 'always';
        pdfContainer.appendChild(pageBreak);
      }
      
      // In a real implementation, you would use a library like jsPDF to convert this to PDF
      // For demo purposes, we'll just show an alert
      alert("In a full implementation, this would generate a PDF with all the notes. For the demo, we'll just simulate this feature.");
      
      // For demo, just export the first page as a PNG
      if (pages.length > 0 && pages[0].strokes) {
        await this.exportImage(pages[0].strokes, 'png', title);
      }
    } finally {
      // Clean up
      document.body.removeChild(pdfContainer);
    }
  }
  
  // Export notes as a DOCX document
  async exportDOCX(pages: NotePage[], images: string[], filename: string): Promise<void> {
    // This is a simplified implementation for the demo
    // In a real app, you would use a DOCX library
    
    alert("In a full implementation, this would generate a DOCX file with the note content. For the demo, we'll just simulate this feature.");
    
    // For demo, just export the first page as a PNG
    if (pages.length > 0 && pages[0].strokes) {
      await this.exportImage(pages[0].strokes, 'png', filename);
    }
  }
}

export default new ExportService();
