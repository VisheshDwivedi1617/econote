
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Share2, Clock, Tag, Save, Edit, Star, StarOff,
  Archive, Trash2, Mail, MessageCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NoteHeader = () => {
  const [title, setTitle] = useState("Untitled Note");
  const [isEditing, setIsEditing] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  
  const handleTitleSave = () => {
    setIsEditing(false);
    toast({
      title: "Title updated",
      description: `Note renamed to "${title}"`,
    });
  };
  
  const toggleStar = () => {
    setIsStarred(!isStarred);
    toast({
      title: isStarred ? "Removed from starred" : "Added to starred",
      description: isStarred 
        ? "Note removed from your starred list" 
        : "Note added to your starred list",
    });
  };
  
  const handleShare = () => {
    toast({
      title: "Share options",
      description: "Choose how you want to share this note",
    });
  };
  
  const handleTagsClick = () => {
    toast({
      title: "Tags",
      description: "Add or manage tags for this note",
    });
  };
  
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-3 flex-1">
        {isEditing ? (
          <div className="flex gap-2 flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="max-w-md"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={handleTitleSave}>
              <Save className="h-4 w-4 mr-1" />
              <span>Save</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1">
          <Clock className="h-3 w-3" />
          <span>Last edited: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleTagsClick}
        >
          <Tag className="h-4 w-4" />
          <span className="hidden sm:inline">Tags</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`mailto:?subject=${title}&body=Check out my note: ${title}`)}>
              <Mail className="h-4 w-4 mr-2" />
              <span>Email</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`https://wa.me/?text=Check out my note: ${title}`)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              <span>WhatsApp</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleStar}
        >
          {isStarred ? (
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          ) : (
            <StarOff className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default NoteHeader;
