
// OCRService.ts - Handles text recognition from images

import { createWorker } from 'tesseract.js';
import { toast } from "@/components/ui/use-toast";

export type OCRLanguage = 'eng' | 'hin' | 'tam' | 'ben' | 'spa' | 'fra' | 'deu' | 'jpn' | 'kor' | 'chi_sim';

class OCRService {
  private worker: any = null;
  private isProcessing = false;
  private currentLanguage: OCRLanguage = 'eng'; // Default to English

  // Initialize the OCR worker with a specific language
  private async getWorker(language: OCRLanguage = 'eng'): Promise<any> {
    if (this.worker && this.currentLanguage === language) {
      return this.worker;
    }
    
    // If worker exists but with different language, terminate it
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
    
    // Create a new worker with the requested language
    this.worker = await createWorker();
    
    await this.worker.loadLanguage(language);
    await this.worker.initialize(language);
    this.currentLanguage = language;
    
    return this.worker;
  }
  
  // Recognize text from an image URL
  async recognizeText(
    imageUrl: string, 
    language: OCRLanguage = 'eng'
  ): Promise<string> {
    if (this.isProcessing) {
      return Promise.reject('OCR is already processing an image');
    }
    
    this.isProcessing = true;
    
    try {
      const worker = await this.getWorker(language);
      const result = await worker.recognize(imageUrl);
      return result.data.text;
    } catch (error) {
      console.error('OCR error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }
  
  // Clean up resources when done
  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
  
  // Get the supported languages
  getSupportedLanguages(): {id: OCRLanguage, name: string}[] {
    return [
      { id: 'eng', name: 'English' },
      { id: 'hin', name: 'Hindi' },
      { id: 'tam', name: 'Tamil' },
      { id: 'ben', name: 'Bengali' },
      { id: 'spa', name: 'Spanish' },
      { id: 'fra', name: 'French' },
      { id: 'deu', name: 'German' },
      { id: 'jpn', name: 'Japanese' },
      { id: 'kor', name: 'Korean' },
      { id: 'chi_sim', name: 'Chinese (Simplified)' }
    ];
  }
}

export default new OCRService();
