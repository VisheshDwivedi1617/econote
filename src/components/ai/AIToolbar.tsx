
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Text, FileText, BrainCircuit, ListTodo, 
  Sparkles, Wand2, Bot
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AIToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const handleAIAction = (action: string) => {
    toast({
      title: `AI ${action} started`,
      description: `Processing your handwritten content...`,
    });
    
    // Simulate AI processing delay
    setTimeout(() => {
      toast({
        title: `AI ${action} complete`,
        description: `Your content has been ${action.toLowerCase()}d successfully!`,
      });
    }, 2000);
    
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  const AIActions = () => (
    <div className="flex flex-col space-y-2 min-w-[230px] p-1">
      <Button
        variant="outline"
        size="sm"
        className="justify-start gap-2 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20"
        onClick={() => handleAIAction("Transcribe")}
      >
        <Text className="h-4 w-4 text-purple-500" />
        <span>Transcribe to Text</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="justify-start gap-2 text-xs hover:bg-green-50 dark:hover:bg-green-900/20"
        onClick={() => handleAIAction("Summarize")}
      >
        <FileText className="h-4 w-4 text-green-500" />
        <span>Summarize Content</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="justify-start gap-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
        onClick={() => handleAIAction("Structure")}
      >
        <ListTodo className="h-4 w-4 text-blue-500" />
        <span>Structure Notes</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="justify-start gap-2 text-xs hover:bg-amber-50 dark:hover:bg-amber-900/20"
        onClick={() => handleAIAction("Enhance")}
      >
        <Wand2 className="h-4 w-4 text-amber-500" />
        <span>Enhance Content</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="justify-start gap-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={() => handleAIAction("Analyze")}
      >
        <BrainCircuit className="h-4 w-4 text-red-500" />
        <span>Analyze Content</span>
      </Button>
    </div>
  );
  
  // For mobile view, we'll use a dropdown in the navbar
  if (isMobile) {
    return (
      <div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Bot className="h-4 w-4 text-blue-500" />
              <span className="sr-only">AI Tools</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="end" sideOffset={5}>
            <AIActions />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
  
  // For desktop, return a component that is placed in the navbar
  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
              >
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span>AI Tools</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>AI Tools</p>
            </TooltipContent>
          </Tooltip>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-0" align="end">
          <div className="p-3 border-b">
            <h3 className="font-medium">AI Assistants</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Transform your notes with AI-powered tools
            </p>
          </div>
          <div className="p-2">
            <AIActions />
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};

export default AIToolbar;
