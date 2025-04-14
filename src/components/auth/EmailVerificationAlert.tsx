
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EmailVerificationAlertProps {
  onResendEmail: () => void;
  isLoading: boolean;
}

const EmailVerificationAlert = ({ onResendEmail, isLoading }: EmailVerificationAlertProps) => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Email Verification Required</AlertTitle>
      <AlertDescription>
        <p className="mb-2">Please check your email and click the verification link to activate your account.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onResendEmail}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Sending...
            </>
          ) : "Resend Verification Email"}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationAlert;
