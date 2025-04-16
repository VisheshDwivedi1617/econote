
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AIToolbar from "@/components/ai/AIToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import {
  Menu,
  Moon,
  Sun,
  Settings,
  LogOut,
  User,
  PanelLeft,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import FeedbackForm from "@/components/feedback/FeedbackForm";

const Navbar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const userInitials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  const navItems = [
    {
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      label: "My Notes",
      onClick: () => navigate("/notes"),
    },
    {
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          {isMobile && (
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="border-b p-4">
                  <SheetTitle className="text-left">
                    <div className="flex items-center space-x-2">
                      <img
                        src="/lovable-uploads/f4922f7f-b535-43b2-95c5-dd0d26787fc1.png"
                        alt="EcoNote Logo"
                        className="h-8 w-8"
                        style={{
                          objectFit: "contain",
                          filter:
                            theme === "dark"
                              ? "brightness(0) invert(1)"
                              : "brightness(0) invert(0)",
                        }}
                      />
                      <span className="font-bold">EcoNote</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-2">
                  {navItems.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        item.onClick();
                        setShowMobileMenu(false);
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          )}

          <a href="/" className="flex items-center space-x-2">
            <img
              src="/lovable-uploads/f4922f7f-b535-43b2-95c5-dd0d26787fc1.png"
              alt="EcoNote Logo"
              className="h-8 w-8"
              style={{
                objectFit: "contain",
                filter:
                  theme === "dark"
                    ? "brightness(0) invert(1)"
                    : "brightness(0) invert(0)",
              }}
            />
            <span className="font-bold hidden sm:inline-block">EcoNote</span>
          </a>

          {!isMobile && (
            <nav className="ml-4 flex items-center space-x-2">
              {navItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={item.onClick}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <FeedbackForm />
          
          <AIToolbar />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
