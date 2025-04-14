
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Pen, PenTool, BrainCircuit, CloudUpload, ArrowRight } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    // If user is already authenticated, redirect to main app
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const features = [
    {
      title: "Seamless Note-Taking",
      description: "Transform your handwriting into digital notes instantly with our smart pen technology.",
      icon: <Pen className="h-12 w-12 text-pen-primary" />,
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      title: "Write Anywhere",
      description: "Write on any paper and watch your notes appear instantly on the digital canvas.",
      icon: <PenTool className="h-12 w-12 text-amber-500" />,
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      title: "AI Enhancement",
      description: "Use our AI tools to transcribe, summarize, and enhance your handwritten notes.",
      icon: <BrainCircuit className="h-12 w-12 text-purple-500" />,
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      title: "Cloud Sync",
      description: "Your notes are automatically saved and synced across all your devices.",
      icon: <CloudUpload className="h-12 w-12 text-blue-500" />,
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
  ];
  
  const nextSlide = () => {
    if (currentSlide < features.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // On the last slide, navigate to login page
      navigate('/login');
    }
  };
  
  const skipToLogin = () => {
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/f4922f7f-b535-43b2-95c5-dd0d26787fc1.png" 
            alt="EcoNote Logo" 
            className="h-10 w-10"
            style={{ 
              objectFit: 'contain',
              filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'brightness(0) invert(0)'
            }}
          />
          <span className="text-2xl font-bold text-pen-dark dark:text-white">EcoNote</span>
        </div>
        <Button variant="ghost" onClick={skipToLogin}>
          Skip
        </Button>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md relative overflow-hidden rounded-xl shadow-xl bg-white dark:bg-gray-800">
          {/* Feature image */}
          <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {features[currentSlide].icon}
          </div>
          
          {/* Feature content */}
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-center">{features[currentSlide].title}</h2>
            <p className="text-center text-gray-600 dark:text-gray-300">
              {features[currentSlide].description}
            </p>
            
            {/* Slide indicators */}
            <div className="flex justify-center space-x-2 py-2">
              {features.map((_, index) => (
                <div 
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-300",
                    index === currentSlide 
                      ? "bg-pen-primary"
                      : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              ))}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={nextSlide}
                className="w-full bg-pen-primary hover:bg-pen-dark"
              >
                {currentSlide < features.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} EcoNote. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WelcomePage;
