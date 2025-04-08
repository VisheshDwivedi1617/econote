
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Share2, Clock, Tag, Save, Edit, Star, StarOff
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const NoteHeader = () => {
  const [title, setTitle] = useState("Untitled Note");
  const [isEditing, setIsEditing] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const { toast } = useToast();
  
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
      title: "Share link created",
      description: "Share link copied to clipboard",
    });
  };
  
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
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
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center text-xs text-gray-500 gap-1">
          <Clock className="h-3 w-3" />
          <span>Last edited: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Tag className="h-4 w-4" />
          <span className="hidden sm:inline">Tags</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        
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
