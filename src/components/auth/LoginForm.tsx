
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

const LoginForm = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  onSubmit, 
  isLoading 
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <form onSubmit={onSubmit}>
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
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link 
              to="/forgot-password"
              className="text-xs text-pen-primary hover:text-pen-dark"
            >
              Forgot Password?
            </Link>
          </div>
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
              Signing in...
            </>
          ) : "Sign In"}
        </Button>
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-pen-primary hover:text-pen-dark font-medium">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </form>
  );
};

export default LoginForm;
