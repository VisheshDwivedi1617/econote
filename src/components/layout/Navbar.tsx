
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
  MenuSquare,
  ScanSearch
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotebook } from '@/contexts/NotebookContext';
import AIToolbar from '@/components/ai/AIToolbar';

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, signOut } = useAuth();
  const { syncNotebooks } = useNotebook();
  
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
    if (user?.displayName) {
      return user.displayName.split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'U';
  };
  
  return (
    <div className="h-16 border-b bg-white dark:bg-gray-800 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <MenuSquare className="h-6 w-6 text-green-600 mr-2" />
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">EcoNote</span>
        </Link>
        
        <div className="ml-4 hidden md:flex">
          <Link to="/notes">
            <Button variant="ghost" size="sm">
              Notes
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/notes', { state: { scanMode: true } })}
          >
            <ScanSearch className="h-4 w-4 mr-1" />
            Scan
          </Button>
          
          {/* Add AI Tools to Navbar */}
          <AIToolbar />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sync notes"
          onClick={handleSync}
          disabled={isSyncing}
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.photoURL || ''} 
                  alt={user?.displayName || 'User'} 
                />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.displayName || 'User'}
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
};

export default Navbar;
