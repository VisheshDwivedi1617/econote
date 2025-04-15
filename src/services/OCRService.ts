
/**
 * OCR Service for text recognition from images
 */

import { createWorker } from 'tesseract.js';
import { useToast } from '@/hooks/use-toast';

// Define the valid OCR languages
export type OCRLanguage = 
  'eng' | 'fra' | 'deu' | 'ita' | 'spa' | 'por' | 
  'chi_sim' | 'chi_tra' | 'jpn' | 'kor' | 'rus' | 
  'ara' | 'hin' | 'en';

type LanguageOption = {
  id: OCRLanguage;
  name: string;
};

class OCRService {
  private worker: any = null;
  private isWorkerInitialized = false;
  private language: OCRLanguage = 'eng';
  private isProcessing = false;
  
  private languageOptions: LanguageOption[] = [
    { id: 'eng', name: 'English' },
    { id: 'en', name: 'English (Short)' },
    { id: 'fra', name: 'French' },
    { id: 'deu', name: 'German' },
    { id: 'ita', name: 'Italian' },
    { id: 'spa', name: 'Spanish' },
    { id: 'por', name: 'Portuguese' },
    { id: 'chi_sim', name: 'Chinese (Simplified)' },
    { id: 'chi_tra', name: 'Chinese (Traditional)' },
    { id: 'jpn', name: 'Japanese' },
    { id: 'kor', name: 'Korean' },
    { id: 'rus', name: 'Russian' },
    { id: 'ara', name: 'Arabic' },
    { id: 'hin', name: 'Hindi' }
  ];
  
  /**
   * Initialize Tesseract worker with the specified language
   */
  private initializeWorker = async (lang: OCRLanguage = 'eng'): Promise<any> => {
    console.log("Initializing OCR worker with language:", lang);
    
    // Convert 'en' to 'eng' for tesseract
    const tesseractLang = lang === 'en' ? 'eng' : lang;
    
    if (this.worker && this.isWorkerInitialized && this.language === tesseractLang) {
      console.log("Reusing existing worker");
      return this.worker;
    }
    
    // If worker exists but different language, terminate it
    if (this.worker) {
      console.log("Terminating existing worker");
      await this.worker.terminate();
      this.worker = null;
      this.isWorkerInitialized = false;
    }
    
    try {
      // Create and initialize new worker
      console.log("Creating new worker");
      this.worker = await createWorker();
      console.log("Loading language:", tesseractLang);
      await this.worker.loadLanguage(tesseractLang);
      console.log("Initializing worker with language:", tesseractLang);
      await this.worker.initialize(tesseractLang);
      
      this.isWorkerInitialized = true;
      this.language = tesseractLang;
      console.log("Worker initialized successfully");
      
      return this.worker;
    } catch (error) {
      console.error("Error initializing worker:", error);
      throw new Error(`Failed to initialize OCR: ${error}`);
    }
  };
  
  /**
   * Recognize text from an image URL
   */
  recognizeText = async (imageUrl: string, language: OCRLanguage = 'eng'): Promise<string> => {
    if (this.isProcessing) {
      console.log("OCR process already running, waiting...");
      // Wait for current process to finish
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.recognizeText(imageUrl, language);
    }
    
    try {
      this.isProcessing = true;
      console.log("Starting OCR recognition with language:", language);
      
      const worker = await this.initializeWorker(language);
      console.log("Worker initialized, recognizing text...");
      
      // Process image in smaller chunks if it's a data URL (for performance)
      if (imageUrl.startsWith('data:image')) {
        console.log("Processing data URL image");
        // Convert data URL to image for better handling
        const img = new Image();
        img.src = imageUrl;
        await new Promise(resolve => {
          img.onload = resolve;
        });
        
        // Create a canvas to resize if needed
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }
        
        // Resize if image is too large
        const MAX_SIZE = 2000; // Maximum dimension
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_SIZE;
            width = MAX_SIZE;
          } else {
            width = (width / height) * MAX_SIZE;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get optimized image data
        const optimizedImageUrl = canvas.toDataURL('image/jpeg', 0.7);
        console.log("Image optimized for OCR processing");
        
        // Recognize text
        console.log("Processing with Tesseract...");
        const result = await worker.recognize(optimizedImageUrl);
        console.log("OCR completed successfully");
        return result.data.text;
      } else {
        // Process regular URL
        console.log("Processing URL image");
        const result = await worker.recognize(imageUrl);
        console.log("OCR completed successfully");
        return result.data.text;
      }
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error(`Failed to recognize text: ${error}`);
    } finally {
      this.isProcessing = false;
    }
  };
  
  /**
   * Recognize handwriting from an image URL
   * This uses the same OCR engine but with optimized settings for handwriting
   */
  recognizeHandwriting = async (imageUrl: string, language: OCRLanguage = 'eng'): Promise<string> => {
    if (this.isProcessing) {
      console.log("OCR process already running, waiting...");
      // Wait for current process to finish
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.recognizeHandwriting(imageUrl, language);
    }
    
    try {
      this.isProcessing = true;
      console.log("Starting handwriting OCR recognition with language:", language);
      
      const worker = await this.initializeWorker(language);
      console.log("Worker initialized for handwriting, setting parameters...");
      
      // Set parameters optimized for handwriting
      await worker.setParameters({
        tessedit_ocr_engine_mode: 2, // Use LSTM only
        tessjs_create_hocr: '0',
        tessjs_create_tsv: '0',
        tessjs_create_box: '0',
        tessjs_create_unlv: '0',
        tessjs_create_osd: '0',
      });
      
      console.log("Processing handwriting with Tesseract...");
      const result = await worker.recognize(imageUrl);
      console.log("Handwriting OCR completed successfully");
      return result.data.text;
    } catch (error) {
      console.error('Handwriting OCR Error:', error);
      throw new Error(`Failed to recognize handwriting: ${error}`);
    } finally {
      this.isProcessing = false;
    }
  };
  
  /**
   * Get supported languages for OCR
   */
  getSupportedLanguages = (): LanguageOption[] => {
    return this.languageOptions;
  };
  
  /**
   * Clean up resources
   */
  terminateWorker = async (): Promise<void> => {
    if (this.worker) {
      console.log("Terminating OCR worker");
      await this.worker.terminate();
      this.worker = null;
      this.isWorkerInitialized = false;
    }
  };
}

export default new OCRService();
