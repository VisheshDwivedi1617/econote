
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CloudUpload, User, Settings, BellRing } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Navbar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    toast({
      title: "Theme Changed",
      description: `Switched to ${theme === 'light' ? 'dark' : 'light'} mode`,
    });
  };

  return (
    <nav className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={handleHome}>
        <img 
          src="/lovable-uploads/f4922f7f-b535-43b2-95c5-dd0d26787fc1.png" 
          alt="EcoNote Logo" 
          className="h-8 w-8"
          style={{ 
            objectFit: 'contain',
            filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'brightness(0) invert(0)'
          }}
        />
        <span className="text-xl font-semibold text-pen-dark dark:text-white">EcoNote</span>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellRing className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-pen-accent animate-pulse-light" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Welcome to EcoNote! Explore all features.
              </DropdownMenuItem>
              <DropdownMenuItem>
                Try the new Study Mode on your notes.
              </DropdownMenuItem>
              <DropdownMenuItem>
                Your notes are synced across all devices.
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSettings}
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-pen-light dark:bg-gray-700">
                <User className="h-5 w-5 text-pen-dark dark:text-gray-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
