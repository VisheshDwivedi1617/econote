
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  Settings, 
  User, 
  Moon, 
  Sun, 
  Loader2,
  BookOpen,
  ScanSearch,
  NotebookPen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotebook } from '@/contexts/NotebookContext';
import AIToolbar from '@/components/ai/AIToolbar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, signOut } = useAuth();
  const { syncNotebooks } = useNotebook();
  const isMobile = useIsMobile();
  
  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSync = async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      await syncNotebooks();
    } catch (error) {
      console.error('Error syncing notebooks:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  const getUserInitials = () => {
    if (user?.first_name || user?.last_name) {
      const firstInitial = user.first_name ? user.first_name[0] : '';
      const lastInitial = user.last_name ? user.last_name[0] : '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'U';
  };
  
  const renderDesktopNav = () => (
    <div className="h-16 border-b bg-white dark:bg-gray-800 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center">
          <NotebookPen className="h-7 w-7 text-green-600 mr-2" />
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">EcoNote</span>
        </Link>
        
        <NavigationMenu className="hidden md:flex ml-4">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/notes">
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>Notes</span>
                </Button>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => navigate('/notes', { state: { scanMode: true } })}
              >
                <ScanSearch className="h-4 w-4" />
                <span>Scan</span>
              </Button>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <AIToolbar />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      
      <div className="flex items-center gap-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full"
              >
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sync notes"
                onClick={handleSync}
                disabled={isSyncing}
                className="rounded-full"
              >
                {isSyncing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M17.5 11.5H22v-4" />
                    <path d="M22 11.5A10 10 0 1 1 8 3" />
                  </svg>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sync Notes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenu>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2 p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Avatar className="h-9 w-9">
                      <AvatarImage 
                        src={user?.avatar_url || ''} 
                        alt={`${user?.first_name || ''} ${user?.last_name || ''}`} 
                      />
                      <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Account</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user ? `${user.first_name || ''} ${user.last_name || ''}` : 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderMobileNav = () => (
    <div className="h-16 border-b bg-white dark:bg-gray-800 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center">
          <NotebookPen className="h-6 w-6 text-green-600 mr-1" />
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">EcoNote</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-1">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 rounded-full"
              >
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Study Mode"
                onClick={() => navigate('/notes', { state: { studyMode: true } })}
                className="h-8 w-8 rounded-full"
              >
                <BookOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Study Mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenu>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user?.avatar_url || ''} 
                        alt={`${user?.first_name || ''} ${user?.last_name || ''}`} 
                      />
                      <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Account</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent className="w-52" align="end" forceMount>
            <DropdownMenuItem onClick={() => navigate('/notes')}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Notes</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/notes', { state: { scanMode: true } })}>
              <ScanSearch className="mr-2 h-4 w-4" />
              <span>Scan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
  
  return (
    <TooltipProvider>
      {isMobile ? renderMobileNav() : renderDesktopNav()}
    </TooltipProvider>
  );
};

export default Navbar;
