
// StorageService.ts - Handles local storage of pen strokes and notes

import { PenStroke } from './PenDataInterpreter';

export interface NotePage {
  id: string;
  title: string;
  strokes: PenStroke[];
  createdAt: number;
  updatedAt: number;
  imageData?: string; // Add this field for scanned notes
  isScanned?: boolean; // Flag to identify scanned notes
  ocrText?: string; // Store OCR text for scanned notes
  ocrLanguage?: string; // Store the language used for OCR
}

export interface Notebook {
  id: string;
  title: string;
  pages: string[]; // Array of page IDs
  createdAt: number;
  updatedAt: number;
}

class StorageService {
  private readonly NOTEBOOKS_KEY = 'scribe_notebooks';
  private readonly PAGES_KEY = 'scribe_pages';
  private readonly CURRENT_NOTEBOOK_KEY = 'scribe_current_notebook';
  private readonly CURRENT_PAGE_KEY = 'scribe_current_page';
  
  // Get all notebooks
  async getNotebooks(): Promise<Notebook[]> {
    const notebooks = localStorage.getItem(this.NOTEBOOKS_KEY);
    return notebooks ? JSON.parse(notebooks) : [];
  }
  
  // Get a specific notebook
  async getNotebook(id: string): Promise<Notebook | null> {
    const notebooks = await this.getNotebooks();
    return notebooks.find(notebook => notebook.id === id) || null;
  }
  
  // Save a notebook
  async saveNotebook(notebook: Notebook): Promise<void> {
    const notebooks = await this.getNotebooks();
    const index = notebooks.findIndex(n => n.id === notebook.id);
    
    if (index >= 0) {
      notebooks[index] = notebook;
    } else {
      notebooks.push(notebook);
    }
    
    localStorage.setItem(this.NOTEBOOKS_KEY, JSON.stringify(notebooks));
  }
  
  // Delete a notebook
  async deleteNotebook(id: string): Promise<void> {
    const notebooks = await this.getNotebooks();
    const filteredNotebooks = notebooks.filter(notebook => notebook.id !== id);
    localStorage.setItem(this.NOTEBOOKS_KEY, JSON.stringify(filteredNotebooks));
  }
  
  // Get all pages
  async getPages(): Promise<NotePage[]> {
    const pages = localStorage.getItem(this.PAGES_KEY);
    return pages ? JSON.parse(pages) : [];
  }
  
  // Get a specific page
  async getPage(id: string): Promise<NotePage | null> {
    const pages = await this.getPages();
    return pages.find(page => page.id === id) || null;
  }
  
  // Save a page
  async savePage(page: NotePage): Promise<void> {
    const pages = await this.getPages();
    const index = pages.findIndex(p => p.id === page.id);
    
    if (index >= 0) {
      pages[index] = page;
    } else {
      pages.push(page);
    }
    
    localStorage.setItem(this.PAGES_KEY, JSON.stringify(pages));
  }
  
  // Delete a page
  async deletePage(id: string): Promise<void> {
    const pages = await this.getPages();
    const filteredPages = pages.filter(page => page.id !== id);
    localStorage.setItem(this.PAGES_KEY, JSON.stringify(filteredPages));
    
    // Also remove from any notebook that contains this page
    const notebooks = await this.getNotebooks();
    let notebooksChanged = false;
    
    for (const notebook of notebooks) {
      const pageIndex = notebook.pages.indexOf(id);
      if (pageIndex >= 0) {
        notebook.pages.splice(pageIndex, 1);
        notebook.updatedAt = Date.now();
        notebooksChanged = true;
      }
    }
    
    if (notebooksChanged) {
      localStorage.setItem(this.NOTEBOOKS_KEY, JSON.stringify(notebooks));
    }
  }
  
  // Get current notebook and page IDs
  getCurrentNotebookId(): string | null {
    return localStorage.getItem(this.CURRENT_NOTEBOOK_KEY);
  }
  
  getCurrentPageId(): string | null {
    return localStorage.getItem(this.CURRENT_PAGE_KEY);
  }
  
  // Set current notebook and page
  setCurrentNotebookId(id: string): void {
    localStorage.setItem(this.CURRENT_NOTEBOOK_KEY, id);
  }
  
  setCurrentPageId(id: string): void {
    localStorage.setItem(this.CURRENT_PAGE_KEY, id);
  }
  
  // Get or create default notebook and page if none exist
  async ensureDefaultNotebookAndPage(): Promise<{ notebookId: string, pageId: string }> {
    let notebookId = this.getCurrentNotebookId();
    let pageId = this.getCurrentPageId();
    
    const notebooks = await this.getNotebooks();
    
    // Create default notebook if none exists
    if (notebooks.length === 0 || !notebookId) {
      const defaultNotebook: Notebook = {
        id: Date.now().toString(),
        title: 'My Notebook',
        pages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await this.saveNotebook(defaultNotebook);
      notebookId = defaultNotebook.id;
      this.setCurrentNotebookId(notebookId);
    }
    
    // Create default page if none exists
    const notebook = await this.getNotebook(notebookId!);
    if (notebook && (notebook.pages.length === 0 || !pageId)) {
      const defaultPage: NotePage = {
        id: Date.now().toString(),
        title: 'Page 1',
        strokes: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await this.savePage(defaultPage);
      notebook.pages.push(defaultPage.id);
      notebook.updatedAt = Date.now();
      await this.saveNotebook(notebook);
      
      pageId = defaultPage.id;
      this.setCurrentPageId(pageId);
    }
    
    return { notebookId: notebookId!, pageId: pageId! };
  }
  
  // Add a new method to create a page from a scanned image
  async createScannedPage(imageData: string, title: string = "Scanned Note", ocrText?: string, ocrLanguage?: string): Promise<NotePage> {
    const page: NotePage = {
      id: Date.now().toString(),
      title: title,
      strokes: [], // Empty strokes for a scanned page
      createdAt: Date.now(),
      updatedAt: Date.now(),
      imageData: imageData,
      isScanned: true,
      ocrText: ocrText,
      ocrLanguage: ocrLanguage
    };
    
    await this.savePage(page);
    
    // Also add to current notebook
    const notebookId = this.getCurrentNotebookId();
    if (notebookId) {
      const notebook = await this.getNotebook(notebookId);
      if (notebook) {
        notebook.pages.push(page.id);
        notebook.updatedAt = Date.now();
        await this.saveNotebook(notebook);
      }
    }
    
    return page;
  }
  
  // Update OCR text for a page
  async updateOCRText(pageId: string, ocrText: string, ocrLanguage: string): Promise<NotePage | null> {
    const page = await this.getPage(pageId);
    if (!page) return null;
    
    const updatedPage = {
      ...page,
      ocrText,
      ocrLanguage,
      updatedAt: Date.now()
    };
    
    await this.savePage(updatedPage);
    return updatedPage;
  }
}

export default new StorageService();
