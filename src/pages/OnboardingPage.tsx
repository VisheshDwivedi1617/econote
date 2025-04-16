
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, User, Sparkles, ArrowRight, Check, 
  PenTool, Notebook, BrainCircuit, Wifi 
} from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [usageType, setUsageType] = useState('personal');
  const [hasPen, setHasPen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  
  const totalSteps = 4;
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Update user profile with all collected information
      const { error } = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        usage_type: usageType,
        has_smart_pen: hasPen === 'yes',
        onboarding_completed: true,
      });
      
      if (error) {
        throw error;
      }
      
      // Navigate to the main app
      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSkip = () => {
    navigate('/');
  };
  
  const canProceed = () => {
    switch (step) {
      case 1:
        return true; // Welcome screen can always proceed
      case 2:
        return firstName.trim() !== ''; // Require at least first name
      case 3:
        return usageType !== ''; // Require usage type selection
      case 4:
        return hasPen !== null; // Require smart pen selection
      default:
        return true;
    }
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
              <div className="flex items-center">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className={cn(
                        "rounded-full h-8 w-8 flex items-center justify-center transition-colors",
                        step > index + 1 
                          ? "bg-pen-primary text-white" 
                          : step === index + 1
                            ? "bg-pen-primary text-white"
                            : "bg-gray-200 text-gray-500"
                      )}
                    >
                      {step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < totalSteps - 1 && (
                      <div 
                        className={cn(
                          "h-1 w-10 transition-colors",
                          step > index + 1 ? "bg-pen-primary" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {step === 1 && "Welcome to EcoNote!"}
              {step === 2 && "Tell us about yourself"}
              {step === 3 && "How will you use EcoNote?"}
              {step === 4 && "Do you have a smart pen?"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "Let's set up your account to get started"}
              {step === 2 && "This helps us personalize your experience"}
              {step === 3 && "This helps us tailor the experience to your needs"}
              {step === 4 && "Connect your smart pen to enhance your note-taking"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="flex flex-col items-center space-y-6">
                <Sparkles className="h-16 w-16 text-pen-primary" />
                <p className="text-center">
                  Thanks for joining EcoNote! We're excited to help you transform your handwritten notes into digital content.
                </p>
                <div className="space-y-4 w-full">
                  <div className="flex items-start space-x-3 p-3 rounded-lg border">
                    <PenTool className="h-8 w-8 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Write Naturally</h3>
                      <p className="text-sm text-gray-500">Capture your handwriting in real-time with a smart pen or take photos of existing notes.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border">
                    <BrainCircuit className="h-8 w-8 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">AI-Powered Insights</h3>
                      <p className="text-sm text-gray-500">Transform, organize, and extract key information from your notes automatically.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border">
                    <Notebook className="h-8 w-8 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Study Smarter</h3>
                      <p className="text-sm text-gray-500">Create flashcards, summaries, and study guides from your notes.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {step === 2 && (
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
                  <Label htmlFor="lastName">Last Name (Optional)</Label>
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
            
            {step === 3 && (
              <div className="space-y-4">
                <Label>How will you primarily use EcoNote?</Label>
                <RadioGroup value={usageType} onValueChange={setUsageType} className="space-y-3">
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="personal" id="personal" />
                    <Label htmlFor="personal" className="flex-1 cursor-pointer">
                      <div className="font-medium">Personal Notes</div>
                      <div className="text-sm text-gray-500">For journaling, ideas, and personal projects</div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="study" id="study" />
                    <Label htmlFor="study" className="flex-1 cursor-pointer">
                      <div className="font-medium">Study & Education</div>
                      <div className="text-sm text-gray-500">For lectures, study guides, and academic notes</div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="work" id="work" />
                    <Label htmlFor="work" className="flex-1 cursor-pointer">
                      <div className="font-medium">Work & Professional</div>
                      <div className="text-sm text-gray-500">For meetings, projects, and work-related content</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {step === 4 && (
              <div className="space-y-4">
                <Label>Do you have a smart pen?</Label>
                <RadioGroup value={hasPen || ''} onValueChange={setHasPen} className="space-y-3">
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="yes" id="yes-pen" />
                    <Label htmlFor="yes-pen" className="flex-1 cursor-pointer">
                      <div className="font-medium">Yes, I have a smart pen</div>
                      <div className="text-sm text-gray-500">You'll be able to connect it in the next step</div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="no" id="no-pen" />
                    <Label htmlFor="no-pen" className="flex-1 cursor-pointer">
                      <div className="font-medium">No, I don't have a smart pen</div>
                      <div className="text-sm text-gray-500">You can still use the app with your camera to scan notes</div>
                    </Label>
                  </div>
                </RadioGroup>
                
                {hasPen === 'yes' && (
                  <div className="mt-4 rounded-lg border p-4 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-start space-x-3">
                      <Wifi className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-blue-700 dark:text-blue-300">Smart Pen Detected</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          We'll help you connect your pen in the settings after setup is complete.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex w-full space-x-3">
              {step > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              
              <Button 
                className={cn(
                  "flex-1 bg-pen-primary hover:bg-pen-dark",
                  step === 1 && "w-full"
                )}
                onClick={step < totalSteps ? handleNext : handleComplete}
                disabled={isLoading || !canProceed()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {step < totalSteps ? "Continue" : "Complete Setup"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
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
