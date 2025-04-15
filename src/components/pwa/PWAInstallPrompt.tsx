
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Download, X } from 'lucide-react';
import analyticsService from '@/services/AnalyticsService';

interface PWAInstallPromptProps {
  onClose: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

const PWAInstallPrompt = ({ onClose }: PWAInstallPromptProps) => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    analyticsService.trackEvent('pwa_install_prompt', {
      event_category: 'engagement',
      event_label: 'dismissed',
      action: 'dismiss'
    });
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
    onClose();
  };
  
  const handleInstall = async () => {
    if (!installPrompt) {
      // If install prompt is not available, provide alternative
      toast({
        title: "Installation",
        description: "To install as an app, use your browser's 'Add to Home Screen' feature.",
      });
      return;
    }
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    // Track the outcome
    analyticsService.trackEvent('pwa_install_prompt', {
      event_category: 'engagement',
      event_label: choiceResult.outcome,
      action: choiceResult.outcome,
      platform: choiceResult.platform
    });
    
    // We no longer need the prompt, clear it
    setInstallPrompt(null);
    setIsVisible(false);
    onClose();
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-sm px-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">Install EcoNote</h3>
          <Button variant="ghost" size="icon" onClick={handleClose} className="-mr-2 -mt-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Install EcoNote on your device for faster access and offline use.
        </p>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Not now
          </Button>
          <Button 
            onClick={handleInstall} 
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Install
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
