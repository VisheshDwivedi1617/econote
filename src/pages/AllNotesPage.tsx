
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  FileText, 
  PenTool, 
  Search, 
  Calendar, 
  SortDesc, 
  Star, 
  MoreVertical, 
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useNotebook } from "@/contexts/NotebookContext";
import { useToast } from "@/components/ui/use-toast";
import { Page } from "@/contexts/NotebookContext";

const AllNotesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pages, deletePage } = useNotebook();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPages, setFilteredPages] = useState<Page[]>(pages);
  
  useEffect(() => {
    // Filter pages based on search term
    const filtered = pages.filter(page => 
      page.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPages(filtered);
  }, [searchTerm, pages]);
  
  const handleCreateNewNote = async () => {
    navigate('/');
    toast({
      title: "Create new note",
      description: "Starting a new note on the canvas",
    });
  };
  
  const handleDeleteNote = async (pageId: string) => {
    try {
      await deletePage(pageId);
      
      toast({
        title: "Note deleted",
        description: "The note has been moved to trash",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              All Notes
            </h1>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  className="pl-10 w-60"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button onClick={handleCreateNewNote}>
                <PenTool className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.length > 0 ? (
              filteredPages.map((page) => (
                <Card key={page.id} className="overflow-hidden h-64 flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle 
                        className="text-lg cursor-pointer hover:text-primary truncate" 
                        onClick={() => navigate(`/note/${page.id}`)}
                      >
                        {page.title || "Untitled Note"}
                      </CardTitle>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/note/${page.id}`)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" />
                            Star
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500" 
                            onClick={() => handleDeleteNote(page.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="flex items-center text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(page.lastModified || page.created)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 overflow-hidden">
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <p className="text-sm text-center">
                        {page.strokes && page.strokes.length > 0 ? (
                          <span>Preview not available</span>
                        ) : (
                          <span>Empty note</span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 pb-2 border-t text-xs text-muted-foreground">
                    <div className="flex justify-between w-full">
                      <span>{page.strokes?.length || 0} strokes</span>
                      <span>{page.ocr ? "OCR available" : "No OCR data"}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No notes found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? `No notes matching "${searchTerm}"` : "You haven't created any notes yet"}
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreateNewNote}>
                    <PenTool className="h-4 w-4 mr-2" />
                    Create Your First Note
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllNotesPage;
