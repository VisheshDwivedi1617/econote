
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  FileText, FolderPlus, BookOpen, Tag, Star, 
  Archive, Trash2, PenTool, ChevronRight, ChevronDown 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useNotebook } from "@/contexts/NotebookContext";
import StorageService from "@/services/StorageService";

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

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleCreateNewNote = async () => {
    try {
      const newPage = await createPage("Untitled Note");
      
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
          className="w-full justify-start gap-2 bg-pen-primary hover:bg-pen-dark"
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
                      }
                    }}
                  >
                    {item.icon}
                    <span className="truncate">{item.name}</span>
                  </Button>
                ))}
                
                {section.title === "Tags" && (
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-pen-primary">
                    <Tag className="h-4 w-4" />
                    <span>Add Tag</span>
                  </Button>
                )}
                
                {section.title === "My Notes" && (
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-pen-primary">
                    <FolderPlus className="h-4 w-4" />
                    <span>New Folder</span>
                  </Button>
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
