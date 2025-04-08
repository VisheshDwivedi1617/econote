
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, FolderPlus, BookOpen, Tag, Star, 
  Archive, Trash2, PenTool, ChevronRight, ChevronDown 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

type SidebarSection = {
  title: string;
  items: {
    name: string;
    icon: JSX.Element;
    active?: boolean;
  }[];
};

const Sidebar = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "My Notes": true,
    "Tags": true,
  });

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const sections: SidebarSection[] = [
    {
      title: "My Notes",
      items: [
        { name: "All Notes", icon: <FileText className="h-4 w-4" />, active: true },
        { name: "Recent", icon: <BookOpen className="h-4 w-4" /> },
        { name: "Starred", icon: <Star className="h-4 w-4" /> },
        { name: "Archive", icon: <Archive className="h-4 w-4" /> },
        { name: "Trash", icon: <Trash2 className="h-4 w-4" /> },
      ],
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
    <div className="w-64 border-r border-gray-200 h-[calc(100vh-64px)] bg-gray-50 py-4">
      <div className="px-4 mb-4">
        <Button className="w-full justify-start gap-2 bg-pen-primary hover:bg-pen-dark">
          <PenTool className="h-4 w-4" />
          <span>New Note</span>
        </Button>
      </div>
      
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="px-2">
            <button
              className="flex items-center justify-between w-full px-2 py-1 text-sm font-medium text-gray-600"
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
                    key={item.name}
                    variant={item.active ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2 text-sm"
                  >
                    {item.icon}
                    <span>{item.name}</span>
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
