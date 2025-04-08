
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pen, CloudUpload, User, Settings, BellRing } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSync = () => {
    toast({
      title: "Syncing",
      description: "Syncing your notes to the cloud",
    });
  };
  
  const handleSettings = () => {
    navigate('/settings');
  };
  
  const handleHome = () => {
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={handleHome}>
        <Pen className="h-6 w-6 text-pen-primary" />
        <span className="text-xl font-semibold text-pen-dark dark:text-white">ScribeSync</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleSync}
        >
          <CloudUpload className="h-4 w-4" />
          <span className="hidden sm:inline">Sync</span>
        </Button>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="relative">
            <BellRing className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-pen-accent animate-pulse-light" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSettings}
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-full bg-pen-light">
            <User className="h-5 w-5 text-pen-dark" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
