
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Share2, Clock, Tag, Save, Edit, Star, StarOff,
  Archive, Trash2, Mail, MessageCircle, X, Plus
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Tag {
  id: string;
  name: string;
  color?: string;
}

const NoteHeader = () => {
  const [title, setTitle] = useState("Untitled Note");
  const [isEditing, setIsEditing] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6"); // Default blue color
  const { toast } = useToast();
  const { theme } = useTheme();
  
  // Load saved tags from localStorage on component mount
  useEffect(() => {
    const savedTags = localStorage.getItem(`note_tags_${title}`);
    if (savedTags) {
      setTags(JSON.parse(savedTags));
    }
    
    const savedStarred = localStorage.getItem(`note_starred_${title}`);
    if (savedStarred) {
      setIsStarred(JSON.parse(savedStarred));
    }
  }, [title]);
  
  // Save tags to localStorage when they change
  useEffect(() => {
    if (tags.length > 0) {
      localStorage.setItem(`note_tags_${title}`, JSON.stringify(tags));
    }
  }, [tags, title]);
  
  // Save starred status to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`note_starred_${title}`, JSON.stringify(isStarred));
  }, [isStarred, title]);
  
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
  
  const handleAddTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: "Tag name required",
        description: "Please enter a name for your tag",
        variant: "destructive",
      });
      return;
    }
    
    const newTag: Tag = {
      id: Date.now().toString(),
      name: newTagName.trim(),
      color: newTagColor
    };
    
    setTags([...tags, newTag]);
    setNewTagName("");
    
    toast({
      title: "Tag added",
      description: `Tag "${newTag.name}" has been added to this note`,
    });
    
    setShowTagDialog(false);
  };
  
  const removeTag = (tagId: string) => {
    const updatedTags = tags.filter(tag => tag.id !== tagId);
    setTags(updatedTags);
    
    toast({
      title: "Tag removed",
      description: "Tag has been removed from this note",
    });
  };
  
  const tagColors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#6366f1", // indigo
    "#14b8a6", // teal
  ];
  
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
      
      {/* Tags section */}
      <div className="flex items-center gap-2 mx-2 overflow-x-auto max-w-xs hide-scrollbar">
        {tags.map(tag => (
          <Badge 
            key={tag.id} 
            style={{ backgroundColor: tag.color }}
            className="flex items-center gap-1 px-2 py-1"
          >
            {tag.name}
            <X 
              className="h-3 w-3 cursor-pointer hover:text-white" 
              onClick={() => removeTag(tag.id)}
            />
          </Badge>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
            >
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Tags</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Tags</DialogTitle>
              <DialogDescription>
                Add tags to organize your notes better.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
              
              <div>
                <p className="text-sm mb-2">Choose tag color:</p>
                <div className="flex flex-wrap gap-2">
                  {tagColors.map(color => (
                    <div
                      key={color}
                      className={`w-6 h-6 rounded-full cursor-pointer ${
                        newTagColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTagColor(color)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Current tags:</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge 
                      key={tag.id} 
                      style={{ backgroundColor: tag.color }}
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {tag.name}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-white" 
                        onClick={() => removeTag(tag.id)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTagDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTag}>
                <Plus className="h-4 w-4 mr-1" />
                Add Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
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
