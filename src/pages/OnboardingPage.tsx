
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  
  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
    } else {
      setIsLoading(true);
      
      // Update user profile
      const { error } = await updateProfile({
        first_name: firstName,
        last_name: lastName,
      });
      
      if (!error) {
        // Navigate to the main app
        navigate('/');
      }
      
      setIsLoading(false);
    }
  };
  
  const handleSkip = () => {
    navigate('/');
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
        <Button variant="ghost" onClick={handleSkip}>
          Skip
        </Button>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-4">
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                  step >= 1 ? 'bg-pen-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > 1 ? <Check className="h-4 w-4" /> : 1}
                </div>
                <div className={`h-1 w-10 ${
                  step > 1 ? 'bg-pen-primary' : 'bg-gray-200'
                }`}></div>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                  step >= 2 ? 'bg-pen-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > 2 ? <Check className="h-4 w-4" /> : 2}
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {step === 1 ? "Welcome to EcoNote!" : "Tell us about yourself"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 
                ? "Let's set up your account to get started" 
                : "This helps us personalize your experience"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 ? (
              <div className="flex flex-col items-center space-y-6">
                <Sparkles className="h-16 w-16 text-pen-primary" />
                <p className="text-center">
                  Thanks for joining EcoNote! We're excited to help you transform your handwritten notes into digital content.
                </p>
                <p className="text-center text-sm text-gray-500">
                  In just a few quick steps, we'll get you all set up and ready to take amazing notes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              className="w-full bg-pen-primary hover:bg-pen-dark"
              onClick={handleContinue}
              disabled={isLoading || (step === 2 && !firstName)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {step === 1 ? "Let's Get Started" : "Complete Setup"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      <footer className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} EcoNote. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OnboardingPage;
