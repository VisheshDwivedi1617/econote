import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import StorageService, { NotePage, Notebook } from '@/services/StorageService';
import { PenStroke } from '@/services/PenDataInterpreter';
import { useToast } from '@/components/ui/use-toast';
import OCRService, { OCRLanguage } from '@/services/OCRService';

interface NotebookContextType {
  notebooks: Notebook[];
  currentNotebook: Notebook | null;
  currentPage: NotePage | null;
  strokes: PenStroke[];
  isLoading: boolean;
  
  // Notebook operations
  createNotebook: (title: string) => Promise<Notebook>;
  switchNotebook: (id: string) => Promise<void>;
  updateNotebook: (notebook: Notebook) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  
  // Page operations
  createPage: (title: string) => Promise<NotePage>;
  switchPage: (id: string) => Promise<void>;
  updatePage: (page: NotePage) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  
  // Stroke operations
  addStroke: (stroke: PenStroke) => Promise<void>;
  clearStrokes: () => Promise<void>;
  updateStrokes: (strokes: PenStroke[]) => Promise<void>;
  
  // Navigation
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  goToPage: (index: number) => Promise<void>;
  getCurrentPageIndex: () => number;
  getTotalPages: () => number;
  
  // Scanned notes operations
  createScannedPage: (imageData: string, title?: string) => Promise<NotePage>;
  
  // OCR operations
  performOCR: (pageId: string, language?: OCRLanguage) => Promise<string>;
  updateOCRText: (pageId: string, text: string, language: OCRLanguage) => Promise<void>;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider = ({ children }: { children: ReactNode }) => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [currentNotebook, setCurrentNotebook] = useState<Notebook | null>(null);
  const [currentPage, setCurrentPage] = useState<NotePage | null>(null);
  const [strokes, setStrokes] = useState<PenStroke[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const initializeData = async () => {
      try {
        const { notebookId, pageId } = await StorageService.ensureDefaultNotebookAndPage();
        
        const allNotebooks = await StorageService.getNotebooks();
        setNotebooks(allNotebooks);
        
        const notebook = await StorageService.getNotebook(notebookId);
        setCurrentNotebook(notebook);
        
        const page = await StorageService.getPage(pageId);
        if (page) {
          setCurrentPage(page);
          setStrokes(page.strokes);
        }
      } catch (error) {
        console.error('Error initializing notebook data:', error);
        toast({
          title: "Error loading notebooks",
          description: "There was a problem loading your notebooks.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [toast]);
  
  const createNotebook = async (title: string): Promise<Notebook> => {
    const newNotebook: Notebook = {
      id: Date.now().toString(),
      title,
      pages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await StorageService.saveNotebook(newNotebook);
    setNotebooks(prev => [...prev, newNotebook]);
    return newNotebook;
  };
  
  const switchNotebook = async (id: string): Promise<void> => {
    const notebook = await StorageService.getNotebook(id);
    if (!notebook) {
      toast({
        title: "Notebook not found",
        description: "The selected notebook could not be found.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentNotebook(notebook);
    StorageService.setCurrentNotebookId(id);
    
    if (notebook.pages.length > 0) {
      await switchPage(notebook.pages[0]);
    } else {
      const newPage = await createPage(`Page 1`);
      notebook.pages.push(newPage.id);
      await StorageService.saveNotebook(notebook);
      setCurrentNotebook(notebook);
    }
  };
  
  const updateNotebook = async (notebook: Notebook): Promise<void> => {
    notebook.updatedAt = Date.now();
    await StorageService.saveNotebook(notebook);
    setNotebooks(prev => prev.map(n => n.id === notebook.id ? notebook : n));
    
    if (currentNotebook?.id === notebook.id) {
      setCurrentNotebook(notebook);
    }
  };
  
  const deleteNotebook = async (id: string): Promise<void> => {
    if (notebooks.length <= 1) {
      toast({
        title: "Cannot delete notebook",
        description: "You need at least one notebook.",
        variant: "destructive",
      });
      return;
    }
    
    await StorageService.deleteNotebook(id);
    setNotebooks(prev => prev.filter(n => n.id !== id));
    
    if (currentNotebook?.id === id) {
      const anotherNotebook = notebooks.find(n => n.id !== id);
      if (anotherNotebook) {
        await switchNotebook(anotherNotebook.id);
      }
    }
  };
  
  const createPage = async (title: string): Promise<NotePage> => {
    if (!currentNotebook) {
      throw new Error("No current notebook selected");
    }
    
    const newPage: NotePage = {
      id: Date.now().toString(),
      title,
      strokes: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await StorageService.savePage(newPage);
    
    const updatedNotebook = { ...currentNotebook };
    updatedNotebook.pages.push(newPage.id);
    updatedNotebook.updatedAt = Date.now();
    
    await StorageService.saveNotebook(updatedNotebook);
    setCurrentNotebook(updatedNotebook);
    
    setNotebooks(prev => prev.map(n => n.id === updatedNotebook.id ? updatedNotebook : n));
    
    return newPage;
  };
  
  const switchPage = async (id: string): Promise<void> => {
    if (currentPage && currentPage.id !== id) {
      await saveCurrentStrokes();
    }
    
    const page = await StorageService.getPage(id);
    if (!page) {
      toast({
        title: "Page not found",
        description: "The selected page could not be found.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentPage(page);
    setStrokes(page.strokes);
    StorageService.setCurrentPageId(id);
  };
  
  const updatePage = async (page: NotePage): Promise<void> => {
    page.updatedAt = Date.now();
    await StorageService.savePage(page);
    
    if (currentPage?.id === page.id) {
      setCurrentPage(page);
    }
  };
  
  const deletePage = async (id: string): Promise<void> => {
    if (!currentNotebook) return;
    
    if (currentNotebook.pages.length <= 1) {
      toast({
        title: "Cannot delete page",
        description: "You need at least one page in a notebook.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedNotebook = { ...currentNotebook };
    const pageIndex = updatedNotebook.pages.indexOf(id);
    
    if (pageIndex >= 0) {
      updatedNotebook.pages.splice(pageIndex, 1);
      updatedNotebook.updatedAt = Date.now();
      
      await StorageService.saveNotebook(updatedNotebook);
      setCurrentNotebook(updatedNotebook);
      
      setNotebooks(prev => prev.map(n => n.id === updatedNotebook.id ? updatedNotebook : n));
    }
    
    await StorageService.deletePage(id);
    
    if (currentPage?.id === id) {
      const nextPageIndex = Math.min(pageIndex, updatedNotebook.pages.length - 1);
      if (nextPageIndex >= 0) {
        await switchPage(updatedNotebook.pages[nextPageIndex]);
      }
    }
  };
  
  const addStroke = async (stroke: PenStroke): Promise<void> => {
    setStrokes(prev => [...prev, stroke]);
  };
  
  const clearStrokes = async (): Promise<void> => {
    if (!currentPage) return;
    
    const updatedPage = { ...currentPage, strokes: [] };
    await StorageService.savePage(updatedPage);
    setCurrentPage(updatedPage);
    setStrokes([]);
  };
  
  const updateStrokes = async (newStrokes: PenStroke[]): Promise<void> => {
    setStrokes(newStrokes);
  };
  
  const saveCurrentStrokes = async (): Promise<void> => {
    if (!currentPage) return;
    
    const updatedPage = { ...currentPage, strokes, updatedAt: Date.now() };
    await StorageService.savePage(updatedPage);
    setCurrentPage(updatedPage);
  };
  
  const createScannedPage = async (imageData: string, title = "Scanned Note") => {
    try {
      const newPage = await StorageService.createScannedPage(imageData, title);
      
      setCurrentPage(newPage);
      
      if (currentNotebook) {
        const updatedNotebook = { ...currentNotebook };
        updatedNotebook.pages.push(newPage.id);
        updatedNotebook.updatedAt = Date.now();
        setCurrentNotebook(updatedNotebook);
        
        await StorageService.saveNotebook(updatedNotebook);
      }
      
      // Perform OCR in the background
      performOCR(newPage.id).catch(error => {
        console.error("Background OCR failed:", error);
      });
      
      return newPage;
    } catch (error) {
      console.error("Error creating scanned page:", error);
      throw error;
    }
  };
  
  const performOCR = async (pageId: string, language: OCRLanguage = 'eng'): Promise<string> => {
    try {
      const page = await StorageService.getPage(pageId);
      
      if (!page || !page.imageData || !page.isScanned) {
        throw new Error("Invalid page or not a scanned page");
      }
      
      // Process the image with OCR
      const ocrText = await OCRService.recognizeText(page.imageData, language);
      
      // Save the OCR text back to the page
      const updatedPage = await StorageService.updateOCRText(pageId, ocrText, language);
      
      if (currentPage?.id === pageId) {
        setCurrentPage(updatedPage);
      }
      
      return ocrText;
    } catch (error) {
      console.error("OCR processing error:", error);
      toast({
        title: "OCR Failed",
        description: "Could not process text from the image",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const updateOCRText = async (pageId: string, text: string, language: OCRLanguage): Promise<void> => {
    try {
      const updatedPage = await StorageService.updateOCRText(pageId, text, language);
      
      if (currentPage?.id === pageId && updatedPage) {
        setCurrentPage(updatedPage);
      }
      
      toast({
        title: "Text Updated",
        description: "OCR text has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating OCR text:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the OCR text",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const getCurrentPageIndex = (): number => {
    if (!currentNotebook || !currentPage) return -1;
    return currentNotebook.pages.indexOf(currentPage.id);
  };
  
  const getTotalPages = (): number => {
    if (!currentNotebook) return 0;
    return currentNotebook.pages.length;
  };
  
  const goToPage = async (index: number): Promise<void> => {
    if (!currentNotebook) return;
    
    if (index >= 0 && index < currentNotebook.pages.length) {
      await switchPage(currentNotebook.pages[index]);
    }
  };
  
  const goToNextPage = async (): Promise<void> => {
    const currentIndex = getCurrentPageIndex();
    const totalPages = getTotalPages();
    
    if (currentIndex < totalPages - 1) {
      await goToPage(currentIndex + 1);
    } else if (currentIndex === totalPages - 1) {
      const newPage = await createPage(`Page ${totalPages + 1}`);
      await switchPage(newPage.id);
    }
  };
  
  const goToPreviousPage = async (): Promise<void> => {
    const currentIndex = getCurrentPageIndex();
    if (currentIndex > 0) {
      await goToPage(currentIndex - 1);
    }
  };
  
  const contextValue: NotebookContextType = {
    notebooks,
    currentNotebook,
    currentPage,
    strokes,
    isLoading,
    createNotebook,
    switchNotebook,
    updateNotebook,
    deleteNotebook,
    createPage,
    switchPage,
    updatePage,
    deletePage,
    addStroke,
    clearStrokes,
    updateStrokes,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    getCurrentPageIndex,
    getTotalPages,
    createScannedPage,
    performOCR,
    updateOCRText
  };
  
  return (
    <NotebookContext.Provider value={contextValue}>
      {children}
    </NotebookContext.Provider>
  );
};

export const useNotebook = (): NotebookContextType => {
  const context = useContext(NotebookContext);
  if (context === undefined) {
    throw new Error('useNotebook must be used within a NotebookProvider');
  }
  return context;
};
