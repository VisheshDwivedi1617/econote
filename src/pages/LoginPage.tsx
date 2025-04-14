
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import LoginForm from '@/components/auth/LoginForm';
import ErrorAlert from '@/components/auth/ErrorAlert';
import EmailVerificationAlert from '@/components/auth/EmailVerificationAlert';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { theme } = useTheme();
  
  // If user is already authenticated, redirect to main app
  if (user) {
    navigate('/');
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowEmailConfirmation(false);
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      console.log("Login error:", error.message);
      if (error.message.includes("Email not confirmed")) {
        setShowEmailConfirmation(true);
      } else if (error.message.includes("Invalid login credentials")) {
        setError("The email or password you entered is incorrect.");
      } else {
        setError(error.message);
      }
      setIsLoading(false);
      return;
    }
    
    navigate('/');
    setIsLoading(false);
  };

  const resendConfirmationEmail = async () => {
    try {
      setIsLoading(true);
      const { error } = await signIn(email, password, true);
      if (error) {
        setError(error.message);
      } else {
        setError(null);
        setShowEmailConfirmation(true);
      }
    } catch (err) {
      setError("Failed to resend confirmation email. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your notes
            </CardDescription>
          </CardHeader>
          
          {error && (
            <div className="px-6 pb-4">
              <ErrorAlert errorMessage={error} />
            </div>
          )}
          
          {showEmailConfirmation && (
            <div className="px-6 pb-4">
              <EmailVerificationAlert 
                onResendEmail={resendConfirmationEmail}
                isLoading={isLoading}
              />
            </div>
          )}
          
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </Card>
      </main>
      
      <footer className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} EcoNote. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
