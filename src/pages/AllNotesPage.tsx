
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotebook } from "@/contexts/NotebookContext";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool, Search, Trash, Clock, Camera, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import StorageService, { NotePage } from "@/services/StorageService";

const AllNotesPage = () => {
  const navigate = useNavigate();
  const { currentNotebook, deletePage } = useNotebook();
  const [searchQuery, setSearchQuery] = useState("");

  // In a real implementation, we would load all pages here
  // For now, we'll just show the pages in the current notebook
  const [loadedPages, setLoadedPages] = useState<NotePage[]>([]);

  // Load note pages from the current notebook
  const loadNotePagesFromIds = async () => {
    if (!currentNotebook) return;
    
    const pagePromises = currentNotebook.pages.map(async (pageId) => {
      const page = await StorageService.getPage(pageId);
      return page;
    });
    
    const pages = await Promise.all(pagePromises);
    setLoadedPages(pages.filter(Boolean) as NotePage[]);
  };

  // Filter pages based on search query
  const filteredPages = loadedPages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewNote = (noteId: string) => {
    navigate(`/note/${noteId}`);
  };

  const handleDeleteNote = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await deletePage(noteId);
    // Refresh the list after deleting
    await loadNotePagesFromIds();
  };
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  // Load notes when the component mounts
  useEffect(() => {
    loadNotePagesFromIds();
  }, [currentNotebook]);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Notes</h1>
            <Button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <PenTool className="h-4 w-4" />
              New Note
            </Button>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search notes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Separator className="mb-6" />
          
          {filteredPages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No notes found</p>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="flex items-center gap-2 mx-auto"
              >
                <PenTool className="h-4 w-4" />
                Create your first note
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPages.map((page) => (
                <Card 
                  key={page.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleViewNote(page.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg truncate flex items-center gap-2">
                      {page.isScanned ? (
                        <Camera className="h-4 w-4 text-green-600" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      {page.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {page.isScanned ? (
                      <div className="h-32 overflow-hidden rounded-md bg-gray-100">
                        {page.imageData && (
                          <img 
                            src={page.imageData} 
                            alt={page.title}
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {page.strokes.length} {page.strokes.length === 1 ? 'stroke' : 'strokes'}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(page.updatedAt)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                      onClick={(e) => handleDeleteNote(page.id, e)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllNotesPage;
