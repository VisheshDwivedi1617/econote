
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Text, FileText, BrainCircuit, ListTodo, 
  RotateCcw, Sparkles, Wand2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
    
    setIsOpen(false);
  };
  
  return (
    <div className={`flex items-center justify-center ${isMobile ? 'py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="relative flex flex-col items-center">
        {isOpen && (
          <div className={`flex ${isMobile ? 'flex-row flex-wrap justify-center gap-2 px-4 mb-2' : 'flex-col space-y-2 mb-2'} animate-fade-in`}>
            <Button
              variant="outline"
              size="sm"
              className={`${isMobile ? 'py-1 px-2' : 'rounded-full pr-4 pl-3'} bg-white shadow-md flex gap-2 text-xs`}
              onClick={() => handleAIAction("Transcribe")}
            >
              <Text className="h-4 w-4 text-purple-500" />
              <span className={isMobile ? 'hidden' : ''}>Transcribe to Text</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={`${isMobile ? 'py-1 px-2' : 'rounded-full pr-4 pl-3'} bg-white shadow-md flex gap-2 text-xs`}
              onClick={() => handleAIAction("Summarize")}
            >
              <FileText className="h-4 w-4 text-green-500" />
              <span className={isMobile ? 'hidden' : ''}>Summarize Content</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={`${isMobile ? 'py-1 px-2' : 'rounded-full pr-4 pl-3'} bg-white shadow-md flex gap-2 text-xs`}
              onClick={() => handleAIAction("Structure")}
            >
              <ListTodo className="h-4 w-4 text-blue-500" />
              <span className={isMobile ? 'hidden' : ''}>Structure Notes</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={`${isMobile ? 'py-1 px-2' : 'rounded-full pr-4 pl-3'} bg-white shadow-md flex gap-2 text-xs`}
              onClick={() => handleAIAction("Enhance")}
            >
              <Wand2 className="h-4 w-4 text-amber-500" />
              <span className={isMobile ? 'hidden' : ''}>Enhance Content</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={`${isMobile ? 'py-1 px-2' : 'rounded-full pr-4 pl-3'} bg-white shadow-md flex gap-2 text-xs`}
              onClick={() => handleAIAction("Analyze")}
            >
              <BrainCircuit className="h-4 w-4 text-red-500" />
              <span className={isMobile ? 'hidden' : ''}>Analyze Content</span>
            </Button>
          </div>
        )}
        
        <Button
          size={isMobile ? "sm" : "lg"}
          className={`rounded-full shadow-lg transition-all duration-300 ${
            isOpen 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-gradient-to-r from-pen-primary to-pen-dark hover:opacity-90"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <RotateCcw className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          ) : (
            <Sparkles className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          )}
          <span className={`ml-2 ${isMobile ? 'text-xs' : ''}`}>{isOpen ? "Close" : "AI Tools"}</span>
        </Button>
      </div>
    </div>
  );
};

export default AIToolbar;
