
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  FileText, FolderPlus, BookOpen, Tag, Star, 
  Archive, Trash2, PenTool, ChevronRight, ChevronDown,
  Plus
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useNotebook } from "@/contexts/NotebookContext";
import StorageService from "@/services/StorageService";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SidebarSection = {
  title: string;
  items: {
    name: string;
    icon: JSX.Element;
    active?: boolean;
    id?: string;
    path?: string;
  }[];
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { notebooks, currentNotebook, createPage } = useNotebook();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "My Notes": true,
    "Tags": true,
    "Recent Notes": true,
  });
  const [newFolderName, setNewFolderName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isNewTagDialogOpen, setIsNewTagDialogOpen] = useState(false);
  const [noteCounter, setNoteCounter] = useState(1);

  useEffect(() => {
    // Load note counter from localStorage
    const savedCounter = localStorage.getItem("noteCounter");
    if (savedCounter) {
      setNoteCounter(parseInt(savedCounter, 10));
    }
  }, []);

  const incrementNoteCounter = () => {
    const newCounter = noteCounter + 1;
    setNoteCounter(newCounter);
    localStorage.setItem("noteCounter", newCounter.toString());
    return newCounter;
  };

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleCreateNewNote = async () => {
    try {
      const counter = incrementNoteCounter();
      const newPage = await createPage(`NewNote_${counter}`);
      
      toast({
        title: "Note created",
        description: "New note has been created successfully",
      });
      
      // Navigate to the new note
      navigate(`/note/${newPage.id}`);
    } catch (error) {
      console.error("Error creating note:", error);
      
      toast({
        title: "Error",
        description: "Failed to create new note",
        variant: "destructive",
      });
    }
  };
  
  const handleNoteClick = (pageId: string) => {
    navigate(`/note/${pageId}`);
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Folder created",
      description: `New folder "${newFolderName}" has been created`,
    });
    
    setNewFolderName("");
    setIsNewFolderDialogOpen(false);
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Tag created",
      description: `New tag "${newTagName}" has been created`,
    });
    
    setNewTagName("");
    setIsNewTagDialogOpen(false);
  };

  const handleStarredClick = () => {
    toast({
      title: "Starred Notes",
      description: "Viewing your starred notes",
    });
  };

  const handleArchiveClick = () => {
    toast({
      title: "Archived Notes",
      description: "Viewing your archived notes",
    });
  };

  const handleTrashClick = () => {
    toast({
      title: "Trash",
      description: "Viewing your deleted notes",
    });
  };

  const handleTagClick = (tagName: string) => {
    toast({
      title: "Tag Selected",
      description: `Viewing notes with "${tagName}" tag`,
    });
  };

  // Get recent notes from the current notebook (safely handle undefined)
  const recentNotes = currentNotebook?.pages ? 
    currentNotebook.pages.slice(0, 5).map(pageId => ({
      name: pageId,
      icon: <FileText className="h-4 w-4" />,
      id: pageId
    })) : [];

  const sections: SidebarSection[] = [
    {
      title: "My Notes",
      items: [
        { 
          name: "All Notes", 
          icon: <FileText className="h-4 w-4" />, 
          active: location.pathname === "/notes",
          path: "/notes"
        },
        { 
          name: "Canvas", 
          icon: <PenTool className="h-4 w-4" />,
          active: location.pathname === "/",
          path: "/" 
        },
        { name: "Starred", icon: <Star className="h-4 w-4" /> },
        { name: "Archive", icon: <Archive className="h-4 w-4" /> },
        { name: "Trash", icon: <Trash2 className="h-4 w-4" /> },
      ],
    },
    {
      title: "Recent Notes",
      items: recentNotes,
    },
    {
      title: "Tags",
      items: [
        { name: "Work", icon: <Tag className="h-4 w-4 text-blue-500" /> },
        { name: "Personal", icon: <Tag className="h-4 w-4 text-green-500" /> },
        { name: "Ideas", icon: <Tag className="h-4 w-4 text-purple-500" /> },
      ],
    },
  ];

  return (
    <div className="w-64 border-r border-gray-200 h-[calc(100vh-64px)] bg-gray-50 py-4 overflow-y-auto dark:bg-gray-800 dark:border-gray-700 flex-shrink-0">
      <div className="px-4 mb-4">
        <Button 
          className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700"
          onClick={handleCreateNewNote}
        >
          <PenTool className="h-4 w-4" />
          <span>New Note</span>
        </Button>
      </div>
      
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="px-2">
            <button
              className="flex items-center justify-between w-full px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-300"
              onClick={() => toggleSection(section.title)}
            >
              <span>{section.title}</span>
              {expandedSections[section.title] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections[section.title] && (
              <div className="mt-1 space-y-1">
                {section.items.map((item) => (
                  <Button
                    key={item.name + (item.id || "")}
                    variant={item.active ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2 text-sm"
                    onClick={() => {
                      if (item.id) {
                        handleNoteClick(item.id);
                      } else if (item.path) {
                        handleNavigate(item.path);
                      } else if (item.name === "Starred") {
                        handleStarredClick();
                      } else if (item.name === "Archive") {
                        handleArchiveClick();
                      } else if (item.name === "Trash") {
                        handleTrashClick();
                      } else if (section.title === "Tags") {
                        handleTagClick(item.name);
                      }
                    }}
                  >
                    {item.icon}
                    <span className="truncate">{item.name}</span>
                  </Button>
                ))}
                
                {section.title === "Tags" && (
                  <Dialog open={isNewTagDialogOpen} onOpenChange={setIsNewTagDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-green-600">
                        <Plus className="h-4 w-4" />
                        <span>Add Tag</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Tag</DialogTitle>
                        <DialogDescription>
                          Enter a name for your new tag and choose a color.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="tagName" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="tagName"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="tagColor" className="text-right">
                            Color
                          </Label>
                          <Input
                            id="tagColor"
                            type="color"
                            value={newTagColor}
                            onChange={(e) => setNewTagColor(e.target.value)}
                            className="col-span-3 h-10"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddTag}>Add Tag</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                {section.title === "My Notes" && (
                  <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-green-600">
                        <FolderPlus className="h-4 w-4" />
                        <span>New Folder</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                        <DialogDescription>
                          Enter a name for your new folder.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="folderName" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="folderName"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddFolder}>Create Folder</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
            
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
