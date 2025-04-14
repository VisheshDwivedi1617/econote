
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { theme } = useTheme();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await resetPassword(email);
    
    if (!error) {
      setIsEmailSent(true);
    }
    
    setIsLoading(false);
  };
  
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
              {isEmailSent ? "Check Your Email" : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {isEmailSent 
                ? "We've sent you an email with instructions to reset your password."
                : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>
          
          {!isEmailSent ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit"
                  className="w-full bg-pen-primary hover:bg-pen-dark"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : "Send Reset Link"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex items-center justify-center"
                  onClick={() => navigate('/login')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Mail className="h-16 w-16 text-pen-primary" />
              </div>
              <p className="text-center">
                Check your email <strong>{email}</strong> for a link to reset your password.
                If it doesn't appear within a few minutes, check your spam folder.
              </p>
              <Button 
                className="w-full bg-pen-primary hover:bg-pen-dark"
                onClick={() => navigate('/login')}
              >
                Return to Login
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

export default ForgotPasswordPage;
