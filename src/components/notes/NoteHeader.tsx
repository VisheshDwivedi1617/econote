
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Clock } from "lucide-react";
import { useNotebook } from "@/contexts/NotebookContext";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const NoteHeader = () => {
  const { currentPage, updatePage } = useNotebook();
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  
  // Fix fluctuating input by using fixed width container
  const [inputWidth, setInputWidth] = useState(200);
  
  useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title || "Untitled Note");
      setLastSaved(formatSavedTime(currentPage.updatedAt));
    }
  }, [currentPage]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  // Calculate stable width for input based on container
  useEffect(() => {
    if (titleContainerRef.current) {
      // Set minimum width or container width, whichever is larger
      const containerWidth = Math.max(titleContainerRef.current.offsetWidth, 200);
      setInputWidth(containerWidth);
    }
  }, [title, currentPage]);
  
  const formatSavedTime = (timestamp?: number) => {
    if (!timestamp) return "Never saved";
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };
  
  const handleTitleClick = () => {
    setIsEditing(true);
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleTitleBlur = () => {
    saveTitle();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      if (currentPage) {
        setTitle(currentPage.title || "Untitled Note");
      }
    }
  };
  
  const saveTitle = async () => {
    setIsEditing(false);
    
    if (!currentPage || title === currentPage.title) return;
    
    try {
      const trimmedTitle = title.trim() || "Untitled Note";
      
      await updatePage({
        ...currentPage,
        title: trimmedTitle,
        updatedAt: Date.now()
      });
      
      setLastSaved(formatSavedTime(Date.now()));
      
      toast({
        title: "Note updated",
        description: "The note title has been updated."
      });
    } catch (error) {
      console.error("Failed to update note title:", error);
      
      toast({
        title: "Error",
        description: "Failed to update the note title.",
        variant: "destructive"
      });
    }
  };
  
  const goBack = () => {
    navigate("/notes");
  };
  
  if (!currentPage) return null;
  
  return (
    <div className="flex items-center justify-between p-2 sm:p-4 border-b bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="mr-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div 
          ref={titleContainerRef}
          className="min-w-[200px] flex-1"
          onClick={handleTitleClick}
        >
          {isEditing ? (
            <div className="w-full" style={{ minWidth: `${inputWidth}px` }}>
              <Input
                ref={inputRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleKeyDown}
                className="font-semibold text-lg w-full"
                style={{ width: '100%' }}
              />
            </div>
          ) : (
            <div className="cursor-pointer font-semibold text-lg truncate hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors">
              {title || "Untitled Note"}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          <span>{lastSaved}</span>
        </div>
      </div>
    </div>
  );
};

export default NoteHeader;
