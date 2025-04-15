
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Text, FileText, BrainCircuit, ListTodo, 
  RotateCcw, Sparkles, Wand2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-col space-y-2'} min-w-[180px] p-1`}>
      <Button
        variant="outline"
        size="sm"
        className="justify-start gap-2 text-xs"
        onClick={() => handleAIAction("Transcribe")}
      >
        <Text className="h-4 w-4 text-purple-500" />
        <span>Transcribe to Text</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="justify-start gap-2 text-xs"
        onClick={() => handleAIAction("Summarize")}
      >
        <FileText className="h-4 w-4 text-green-500" />
        <span>Summarize Content</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="justify-start gap-2 text-xs"
        onClick={() => handleAIAction("Structure")}
      >
        <ListTodo className="h-4 w-4 text-blue-500" />
        <span>Structure Notes</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="justify-start gap-2 text-xs"
        onClick={() => handleAIAction("Enhance")}
      >
        <Wand2 className="h-4 w-4 text-amber-500" />
        <span>Enhance Content</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="justify-start gap-2 text-xs"
        onClick={() => handleAIAction("Analyze")}
      >
        <BrainCircuit className="h-4 w-4 text-red-500" />
        <span>Analyze Content</span>
      </Button>
    </div>
  );
  
  // For mobile view, show the button at the bottom but with a popover that doesn't overlap
  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              className="rounded-full shadow-lg bg-gradient-to-r from-pen-primary to-pen-dark hover:opacity-90"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              <span className="text-xs">AI Tools</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="end" sideOffset={5}>
            <AIActions />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
  
  // For desktop, return a component that can be placed in the navbar
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Tools</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <AIActions />
      </PopoverContent>
    </Popover>
  );
};

export default AIToolbar;
