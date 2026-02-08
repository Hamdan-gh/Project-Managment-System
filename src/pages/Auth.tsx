import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Loader2, Shield, Users, FileText, MessageSquare } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Please enter your email or matric number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const { signIn, user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && role) {
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "supervisor":
          navigate("/supervisor");
          break;
        case "student":
          navigate("/student");
          break;
      }
    }
  }, [user, role, navigate]);

  const formatIdentifierAsEmail = (identifier: string): string => {
    if (identifier.includes("@")) {
      return identifier;
    }
    const formatted = identifier.toLowerCase().replace(/\//g, ".");
    return `${formatted}@student.fyp`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ identifier: loginIdentifier, password: loginPassword });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginIdentifier, loginPassword);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid credentials. Please try again." 
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }
  };

  const features = [
    { icon: <Shield className="h-5 w-5" />, text: "Secure Role-Based Access" },
    { icon: <Users className="h-5 w-5" />, text: "Student-Supervisor Matching" },
    { icon: <FileText className="h-5 w-5" />, text: "Proposal & Chapter Tracking" },
    { icon: <MessageSquare className="h-5 w-5" />, text: "Real-time Communication" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-primary-foreground">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <img 
              src="/logo.jpg" 
              alt="CSS UDS Logo" 
              className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30 shadow-2xl"
            />
            <div>
              <h1 className="text-3xl font-bold">CSS FYP</h1>
              <p className="text-primary-foreground/80 text-sm">Project Supervision System</p>
            </div>
          </div>
          
          {/* Tagline */}
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Manage Your<br />
            Final Year Project<br />
            <span className="text-primary-foreground/80">With Ease</span>
          </h2>
          
          <p className="text-primary-foreground/70 text-lg mb-10 max-w-md">
            A comprehensive platform for students and supervisors to collaborate on academic projects seamlessly.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
              >
                <div className="text-primary-foreground/90">
                  {feature.icon}
                </div>
                <span className="text-sm font-medium text-primary-foreground/90">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <img 
              src="/logo.jpg" 
              alt="CSS UDS Logo" 
              className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20 shadow-xl mb-4"
            />
            <h1 className="text-2xl font-bold text-foreground">CSS FYP Manager</h1>
            <p className="text-muted-foreground text-sm">Project Supervision System</p>
          </div>

          {/* Login Card */}
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground mt-2">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-identifier" className="text-sm font-medium">
                  Email or Matric Number
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="login-identifier"
                    type="text"
                    placeholder="CSC/000/00 or email@domain.com"
                    className="h-12 pl-12 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                  Students use matric number (e.g., CSC/000/00)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    className="h-12 pl-12 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Computer Science Department • Final Year Project System
          </p>
        </div>
      </div>
    </div>
  );
}