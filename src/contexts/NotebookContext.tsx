
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import StorageService, { NotePage, Notebook } from '@/services/StorageService';
import { PenStroke } from '@/services/PenDataInterpreter';
import { useToast } from '@/components/ui/use-toast';

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
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider = ({ children }: { children: ReactNode }) => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [currentNotebook, setCurrentNotebook] = useState<Notebook | null>(null);
  const [currentPage, setCurrentPage] = useState<NotePage | null>(null);
  const [strokes, setStrokes] = useState<PenStroke[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Ensure we have a default notebook and page
        const { notebookId, pageId } = await StorageService.ensureDefaultNotebookAndPage();
        
        // Load notebooks
        const allNotebooks = await StorageService.getNotebooks();
        setNotebooks(allNotebooks);
        
        // Set current notebook
        const notebook = await StorageService.getNotebook(notebookId);
        setCurrentNotebook(notebook);
        
        // Set current page
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
  
  // Notebook operations
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
    
    // Switch to the first page of the notebook if available
    if (notebook.pages.length > 0) {
      await switchPage(notebook.pages[0]);
    } else {
      // Create a new page if no pages exist
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
    // Don't allow deleting the only notebook
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
    
    // If the deleted notebook was the current one, switch to another
    if (currentNotebook?.id === id) {
      const anotherNotebook = notebooks.find(n => n.id !== id);
      if (anotherNotebook) {
        await switchNotebook(anotherNotebook.id);
      }
    }
  };
  
  // Page operations
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
    
    // Add page to the current notebook
    const updatedNotebook = { ...currentNotebook };
    updatedNotebook.pages.push(newPage.id);
    updatedNotebook.updatedAt = Date.now();
    
    await StorageService.saveNotebook(updatedNotebook);
    setCurrentNotebook(updatedNotebook);
    
    // Update notebooks list
    setNotebooks(prev => prev.map(n => n.id === updatedNotebook.id ? updatedNotebook : n));
    
    return newPage;
  };
  
  const switchPage = async (id: string): Promise<void> => {
    // Save current page strokes if needed
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
    
    // Don't allow deleting the only page
    if (currentNotebook.pages.length <= 1) {
      toast({
        title: "Cannot delete page",
        description: "You need at least one page in a notebook.",
        variant: "destructive",
      });
      return;
    }
    
    // Remove page from current notebook
    const updatedNotebook = { ...currentNotebook };
    const pageIndex = updatedNotebook.pages.indexOf(id);
    
    if (pageIndex >= 0) {
      updatedNotebook.pages.splice(pageIndex, 1);
      updatedNotebook.updatedAt = Date.now();
      
      await StorageService.saveNotebook(updatedNotebook);
      setCurrentNotebook(updatedNotebook);
      
      // Update notebooks list
      setNotebooks(prev => prev.map(n => n.id === updatedNotebook.id ? updatedNotebook : n));
    }
    
    // Delete the page
    await StorageService.deletePage(id);
    
    // If the deleted page was the current one, switch to another
    if (currentPage?.id === id) {
      const nextPageIndex = Math.min(pageIndex, updatedNotebook.pages.length - 1);
      if (nextPageIndex >= 0) {
        await switchPage(updatedNotebook.pages[nextPageIndex]);
      }
    }
  };
  
  // Stroke operations
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
  
  // Save current strokes to storage
  const saveCurrentStrokes = async (): Promise<void> => {
    if (!currentPage) return;
    
    const updatedPage = { ...currentPage, strokes, updatedAt: Date.now() };
    await StorageService.savePage(updatedPage);
    setCurrentPage(updatedPage);
  };
  
  // Auto-save strokes periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (currentPage && strokes.length > 0) {
        saveCurrentStrokes();
      }
    }, 10000); // Save every 10 seconds
    
    return () => clearInterval(saveInterval);
  }, [currentPage, strokes]);
  
  // Navigation
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
      // Create a new page if we're at the last page
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
    getTotalPages
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
