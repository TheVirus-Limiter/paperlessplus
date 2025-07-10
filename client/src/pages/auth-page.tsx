import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, LogIn, UserPlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    firstName: ""
  });
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (!isLoading && user) {
    setLocation("/");
    return null;
  }

  const loginMutation = useMutation({
    mutationFn: async (data: AuthFormData) => {
      const res = await apiRequest("POST", "/api/login", data);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: AuthFormData) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Account created!",
        description: "Welcome to PaperTrail. Let's get started.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (isLogin) {
      loginMutation.mutate(formData);
    } else {
      if (!formData.firstName?.trim()) {
        toast({
          title: "Missing information",
          description: "Please enter your first name.",
          variant: "destructive",
        });
        return;
      }
      registerMutation.mutate(formData);
    }
  };

  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:block space-y-8 text-white">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold">
              Welcome to PaperTrail
            </h1>
            <p className="text-xl text-slate-300">
              Your privacy-focused document tracker
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-lg">Privacy First</h3>
                <p className="text-slate-400">
                  Track documents without scanning or uploading them. Your data stays private.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-lg">Smart Organization</h3>
                <p className="text-slate-400">
                  Categorize and tag documents with expiration reminders and search functionality.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-lg">Cross-Device Sync</h3>
                <p className="text-slate-400">
                  Access your document information from any device with secure synchronization.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                {isLogin ? (
                  <>
                    <LogIn className="h-6 w-6" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="h-6 w-6" />
                    Create Account
                  </>
                )}
              </CardTitle>
              <p className="text-slate-400">
                {isLogin 
                  ? "Welcome back to PaperTrail" 
                  : "Join PaperTrail to get started"
                }
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={formData.firstName || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        firstName: e.target.value 
                      }))}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      disabled={isSubmitting}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      email: e.target.value 
                    }))}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      password: e.target.value 
                    }))}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    disabled={isSubmitting}
                  />
                  {!isLogin && (
                    <p className="text-xs text-slate-400">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </div>
                  ) : (
                    isLogin ? "Sign In" : "Create Account"
                  )}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormData({ email: "", password: "", firstName: "" });
                    }}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                    disabled={isSubmitting}
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}