
// ImageProcessingService.ts - Image processing utilities for document scanning

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Detect document edges in an image
export const detectEdges = async (canvas: HTMLCanvasElement): Promise<CropRect> => {
  try {
    // This is a simplified edge detection algorithm
    // In a production app, you might want to use a more sophisticated computer vision library
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Failed to get canvas context");
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // For this simplified version, we'll look for the boundaries of the document
    // by finding the "frame" of the document based on pixel intensity differences
    
    // Convert to grayscale for easier processing
    const grayData = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Standard grayscale conversion formula
      grayData[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    
    // Simple edge detection
    // In a real implementation, you might use Canny edge detection or similar
    
    // For now, we'll just assume the document takes up most of the image
    // and add a small margin around the edges
    const margin = 0.1; // 10% margin
    
    const cropRect: CropRect = {
      x: Math.floor(width * margin),
      y: Math.floor(height * margin),
      width: Math.floor(width * (1 - 2 * margin)),
      height: Math.floor(height * (1 - 2 * margin))
    };
    
    return cropRect;
  } catch (error) {
    console.error("Error detecting edges:", error);
    
    // If edge detection fails, return the full image dimensions
    return {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    };
  }
};

// Enhance the image for better readability
export const enhanceImage = async (canvas: HTMLCanvasElement): Promise<string> => {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Failed to get canvas context");
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Simple contrast enhancement
    // This is a basic version - a more sophisticated approach would use adaptive algorithms
    
    // Find min and max values
    let min = 255;
    let max = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const value = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      
      if (value < min) min = value;
      if (value > max) max = value;
    }
    
    // Apply contrast stretching
    const range = max - min;
    if (range === 0) return canvas.toDataURL('image/jpeg');
    
    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        // Stretch each color channel
        data[i + j] = Math.min(255, Math.max(0, 
          Math.round(((data[i + j] - min) / range) * 255)
        ));
      }
    }
    
    // Put the modified image data back on the canvas
    ctx.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL('image/jpeg');
  } catch (error) {
    console.error("Error enhancing image:", error);
    
    // If enhancement fails, return the original image
    return canvas.toDataURL('image/jpeg');
  }
};

// Save a scanned image as a note
export const createNoteFromImage = async (
  imageDataUrl: string, 
  title: string = "Scanned Note"
): Promise<{ id: string, title: string, imageData: string }> => {
  // Generate a unique ID for the new note
  const id = Date.now().toString();
  
  return {
    id,
    title: `${title} ${new Date().toLocaleDateString()}`,
    imageData: imageDataUrl
  };
};
