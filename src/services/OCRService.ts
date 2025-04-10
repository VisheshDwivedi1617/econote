
/**
 * OCR Service for text recognition from images
 */

import { createWorker } from 'tesseract.js';

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
    // Convert 'en' to 'eng' for tesseract
    const tesseractLang = lang === 'en' ? 'eng' : lang;
    
    if (this.worker && this.isWorkerInitialized && this.language === tesseractLang) {
      return this.worker;
    }
    
    // If worker exists but different language, terminate it
    if (this.worker) {
      await this.worker.terminate();
    }
    
    // Create and initialize new worker
    this.worker = await createWorker();
    await this.worker.loadLanguage(tesseractLang);
    await this.worker.initialize(tesseractLang);
    
    this.isWorkerInitialized = true;
    this.language = tesseractLang;
    
    return this.worker;
  };
  
  /**
   * Recognize text from an image URL
   */
  recognizeText = async (imageUrl: string, language: OCRLanguage = 'eng'): Promise<string> => {
    try {
      const worker = await this.initializeWorker(language);
      const result = await worker.recognize(imageUrl);
      return result.data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error(`Failed to recognize text: ${error}`);
    }
  };
  
  /**
   * Recognize handwriting from an image URL
   * This uses the same OCR engine but with optimized settings for handwriting
   */
  recognizeHandwriting = async (imageUrl: string, language: OCRLanguage = 'eng'): Promise<string> => {
    try {
      const worker = await this.initializeWorker(language);
      // Set parameters optimized for handwriting
      await worker.setParameters({
        tessedit_ocr_engine_mode: 2, // Use LSTM only
        tessjs_create_hocr: '0',
        tessjs_create_tsv: '0',
        tessjs_create_box: '0',
        tessjs_create_unlv: '0',
        tessjs_create_osd: '0',
      });
      
      const result = await worker.recognize(imageUrl);
      return result.data.text;
    } catch (error) {
      console.error('Handwriting OCR Error:', error);
      throw new Error(`Failed to recognize handwriting: ${error}`);
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
      await this.worker.terminate();
      this.worker = null;
      this.isWorkerInitialized = false;
    }
  };
}

export default new OCRService();
