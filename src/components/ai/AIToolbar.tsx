
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Text, FileText, BrainCircuit, ListTodo, ArrowDown, 
  RotateCcw, Sparkles, MessageSquare, Wand2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AIToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
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
    
    setIsOpen(false);
  };
  
  return (
    <div className="fixed right-6 bottom-6 flex flex-col items-end space-y-2 z-10">
      {isOpen && (
        <div className="flex flex-col space-y-2 mb-2 animate-fade-in">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full pr-4 pl-3 bg-white shadow-md flex gap-2 text-xs"
            onClick={() => handleAIAction("Transcribe")}
          >
            <Text className="h-4 w-4 text-purple-500" />
            <span>Transcribe to Text</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="rounded-full pr-4 pl-3 bg-white shadow-md flex gap-2 text-xs"
            onClick={() => handleAIAction("Summarize")}
          >
            <FileText className="h-4 w-4 text-green-500" />
            <span>Summarize Content</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="rounded-full pr-4 pl-3 bg-white shadow-md flex gap-2 text-xs"
            onClick={() => handleAIAction("Structure")}
          >
            <ListTodo className="h-4 w-4 text-blue-500" />
            <span>Structure Notes</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="rounded-full pr-4 pl-3 bg-white shadow-md flex gap-2 text-xs"
            onClick={() => handleAIAction("Enhance")}
          >
            <Wand2 className="h-4 w-4 text-amber-500" />
            <span>Enhance Content</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="rounded-full pr-4 pl-3 bg-white shadow-md flex gap-2 text-xs"
            onClick={() => handleAIAction("Analyze")}
          >
            <BrainCircuit className="h-4 w-4 text-red-500" />
            <span>Analyze Content</span>
          </Button>
        </div>
      )}
      
      <Button
        size="lg"
        className={`rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-gradient-to-r from-pen-primary to-pen-dark hover:opacity-90"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <RotateCcw className="h-5 w-5" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        <span className="ml-2">{isOpen ? "Close" : "AI Tools"}</span>
      </Button>
    </div>
  );
};

export default AIToolbar;
