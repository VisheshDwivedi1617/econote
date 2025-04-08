
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Pen, PenTool, ArrowRight, X, 
  Wifi, BrainCircuit, CloudUpload 
} from "lucide-react";

const tutorialSteps = [
  {
    title: "Welcome to ScribeSync",
    description: "Your smart pen companion for real-time digital note-taking.",
    icon: <Pen className="h-10 w-10 text-pen-primary" />,
  },
  {
    title: "Connect Your Smart Pen",
    description: "Pair your pen device to start capturing your handwriting in real-time.",
    icon: <Wifi className="h-10 w-10 text-green-500" />,
  },
  {
    title: "Write Anywhere",
    description: "Write on any paper and watch your notes appear instantly on the digital canvas.",
    icon: <PenTool className="h-10 w-10 text-amber-500" />,
  },
  {
    title: "AI Enhancement",
    description: "Use our AI tools to transcribe, summarize, and enhance your handwritten notes.",
    icon: <BrainCircuit className="h-10 w-10 text-purple-500" />,
  },
  {
    title: "Cloud Sync",
    description: "Your notes are automatically saved and synced across all your devices.",
    icon: <CloudUpload className="h-10 w-10 text-blue-500" />,
  },
];

interface WelcomeTutorialProps {
  onComplete: () => void;
}

const WelcomeTutorial = ({ onComplete }: WelcomeTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2"
          onClick={onComplete}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 p-4 bg-gray-50 rounded-full">
            {tutorialSteps[currentStep].icon}
          </div>
          
          <h2 className="text-xl font-bold mb-2">
            {tutorialSteps[currentStep].title}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {tutorialSteps[currentStep].description}
          </p>
          
          <div className="flex items-center justify-between w-full">
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep 
                      ? "bg-pen-primary" 
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            
            <Button 
              onClick={handleNext}
              className="bg-pen-primary hover:bg-pen-dark"
            >
              {currentStep < tutorialSteps.length - 1 ? (
                <>
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                <span>Get Started</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeTutorial;
