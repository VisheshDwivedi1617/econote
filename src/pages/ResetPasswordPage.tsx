
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const { theme } = useTheme();
  
  // Password strength criteria
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword;
  
  useEffect(() => {
    // Check if the URL contains the recovery token
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        setError("Invalid or expired password reset link. Please request a new one.");
      }
    };
    
    checkSession();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordsMatch || !hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const { error: updateError } = await updatePassword(password);
    
    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
    
    setIsLoading(false);
  };
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <header className="p-4 flex justify-center">
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
        </header>
        
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Reset Failed</CardTitle>
              <CardDescription className="text-center">
                There was a problem with your reset link
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">{error}</p>
              <Button 
                onClick={() => navigate('/forgot-password')}
                className="bg-pen-primary hover:bg-pen-dark"
              >
                Request New Link
              </Button>
            </CardContent>
          </Card>
        </main>
        
        <footer className="p-4 text-center text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} EcoNote. All rights reserved.</p>
        </footer>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="p-4 flex justify-center">
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
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {success ? "Password Updated" : "Create New Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {success 
                ? "Your password has been successfully reset."
                : "Set a new password for your account"}
            </CardDescription>
          </CardHeader>
          
          {!success ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      tabIndex={-1}
                    >
                      {showPassword ? 
                        <EyeOff className="h-4 w-4 text-gray-500" /> : 
                        <Eye className="h-4 w-4 text-gray-500" />
                      }
                    </button>
                  </div>
                  
                  {/* Password strength indicators */}
                  <div className="space-y-1 mt-2 text-xs">
                    <div className="flex items-center space-x-2">
                      {hasMinLength ? 
                        <Check className="h-3 w-3 text-green-500" /> : 
                        <X className="h-3 w-3 text-red-500" />
                      }
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasUpperCase ? 
                        <Check className="h-3 w-3 text-green-500" /> : 
                        <X className="h-3 w-3 text-red-500" />
                      }
                      <span>At least one uppercase letter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasLowerCase ? 
                        <Check className="h-3 w-3 text-green-500" /> : 
                        <X className="h-3 w-3 text-red-500" />
                      }
                      <span>At least one lowercase letter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasNumber ? 
                        <Check className="h-3 w-3 text-green-500" /> : 
                        <X className="h-3 w-3 text-red-500" />
                      }
                      <span>At least one number</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 ${!passwordsMatch && confirmPassword ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit"
                  className="w-full bg-pen-primary hover:bg-pen-dark"
                  disabled={isLoading || !passwordsMatch || !hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : "Reset Password"}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Check className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-center">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
              <Button 
                className="w-full bg-pen-primary hover:bg-pen-dark"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </CardContent>
          )}
        </Card>
      </main>
      
      <footer className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} EcoNote. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ResetPasswordPage;
