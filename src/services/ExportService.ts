
// ExportService.ts - Handles exporting notes to different formats

import { PenStroke } from './PenDataInterpreter';
import { NotePage } from './StorageService';
import { jsPDF } from 'jspdf';

export type ExportFormat = 'png' | 'jpg' | 'pdf' | 'docx' | 'svg';

class ExportService {
  // Export strokes as image
  async exportImage(
    strokes: PenStroke[], 
    format: 'png' | 'jpg' = 'png',
    filename: string = 'note'
  ): Promise<string> {
    // Create canvas and render strokes
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not supported');
    }
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw strokes
    this.renderStrokesToCanvas(strokes, ctx);
    
    // Convert to data URL
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.${format}`;
    link.click();
    
    return dataUrl;
  }
  
  // Export note as PDF
  async exportPDF(
    pages: NotePage[],
    filename: string = 'notes'
  ): Promise<void> {
    // Initialize jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Process each page
    pages.forEach((page, index) => {
      if (index > 0) {
        doc.addPage();
      }
      
      // Add title
      doc.setFontSize(16);
      doc.text(page.title, 20, 20);
      
      // Create temporary canvas to render strokes
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw strokes
      this.renderStrokesToCanvas(page.strokes, ctx);
      
      // Add canvas as image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      doc.addImage(imgData, 'PNG', 10, 30, 190, 150);
    });
    
    // Save PDF
    doc.save(`${filename}.pdf`);
  }
  
  // Export to DOCX (simplified - in a real app, integrate with a DOCX library)
  async exportDOCX(
    pages: NotePage[],
    ocrText: string[] = [],
    filename: string = 'notes'
  ): Promise<void> {
    alert('DOCX export would be implemented here with a proper DOCX library');
    
    // In a real implementation, we would use a library like docx.js 
    // to create a proper DOCX document with the images and OCR text
    
    console.log('Would export these pages:', pages);
    console.log('With OCR text:', ocrText);
  }
  
  // Utility to render strokes to canvas
  private renderStrokesToCanvas(
    strokes: PenStroke[],
    ctx: CanvasRenderingContext2D
  ): void {
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
  }
}

export default new ExportService();
