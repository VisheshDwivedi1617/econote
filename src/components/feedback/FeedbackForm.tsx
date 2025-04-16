
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { 
  MessageCircle, 
  Bug, 
  Lightbulb, 
  ThumbsUp, 
  Heart, 
  HelpCircle, 
  Loader2,
  Image,
  X,
  Camera 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type FeedbackType = "bug" | "suggestion" | "question" | "praise";

interface FeedbackFormProps {
  className?: string;
  buttonVariant?: "default" | "secondary" | "outline" | "ghost";
}

const FeedbackForm = ({ className, buttonVariant = "outline" }: FeedbackFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Pre-fill email if user is logged in
  useState(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  });
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your feedback",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would be implemented with a backend API call
      // For now we'll simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear form
      setTitle("");
      setDetails("");
      setFeedbackType("bug");
      setScreenshot(null);
      
      // Close dialog
      setIsOpen(false);
      
      // Show success toast
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! We'll review it soon.",
      });
    } catch (error) {
      toast({
        title: "Error submitting feedback",
        description: "There was a problem submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const captureScreenshot = async () => {
    try {
      // In a real app, you would use the browser's screenshot API or a library
      // For this demo, we'll just show a message
      toast({
        title: "Screenshot feature",
        description: "In a production app, this would capture the current screen.",
      });
    } catch (error) {
      toast({
        title: "Screenshot failed",
        description: "Unable to capture screenshot",
        variant: "destructive",
      });
    }
  };
  
  const renderFeedbackTypeIcon = () => {
    switch (feedbackType) {
      case "bug":
        return <Bug className="h-5 w-5 text-red-500" />;
      case "suggestion":
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case "question":
        return <HelpCircle className="h-5 w-5 text-blue-500" />;
      case "praise":
        return <Heart className="h-5 w-5 text-pink-500" />;
      default:
        return <MessageCircle className="h-5 w-5" />;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant}
          size="sm" 
          className={cn("gap-1.5", className)}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Share your thoughts, report issues, or suggest improvements
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Feedback type</Label>
            <Select 
              value={feedbackType} 
              onValueChange={(value) => setFeedbackType(value as FeedbackType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-red-500" />
                    <span>Report a bug</span>
                  </div>
                </SelectItem>
                <SelectItem value="suggestion">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span>Suggest a feature</span>
                  </div>
                </SelectItem>
                <SelectItem value="question">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-500" />
                    <span>Ask a question</span>
                  </div>
                </SelectItem>
                <SelectItem value="praise">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span>Share praise</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback-title">Title</Label>
            <Input 
              id="feedback-title" 
              placeholder={
                feedbackType === "bug" 
                  ? "Briefly describe the issue" 
                  : feedbackType === "suggestion"
                    ? "Briefly describe your idea"
                    : feedbackType === "question"
                      ? "What do you want to know?"
                      : "What do you like about the app?"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback-details">Details</Label>
            <Textarea 
              id="feedback-details" 
              placeholder={
                feedbackType === "bug" 
                  ? "What happened? What did you expect to happen?" 
                  : feedbackType === "suggestion"
                    ? "How would this feature work? Why is it valuable?"
                    : feedbackType === "question"
                      ? "Please provide more details about your question"
                      : "Tell us what you enjoy about the app"
              }
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback-email">Your email (optional)</Label>
            <Input 
              id="feedback-email" 
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              We'll only use this to follow up on your feedback if needed
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Screenshot (optional)</Label>
              <div className="flex space-x-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-3.5 w-3.5 mr-1" /> Upload
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={captureScreenshot}
                >
                  <Camera className="h-3.5 w-3.5 mr-1" /> Capture
                </Button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            
            {screenshot && (
              <div className="relative mt-2 border rounded-md overflow-hidden">
                <img 
                  src={screenshot} 
                  alt="Screenshot" 
                  className="max-h-48 w-full object-contain"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => setScreenshot(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !title.trim()}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {renderFeedbackTypeIcon()}
                Submit Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
