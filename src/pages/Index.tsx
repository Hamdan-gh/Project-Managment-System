import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAssetUrl } from "@/lib/utils";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle, 
  BookOpen,
  Clock,
  Award,
  Search,
  Calendar,
  Shield,
  Star,
  Eye,
  DollarSign,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

const Index = () => {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();

  // Add console log to debug
  console.log("Index component rendering", { user, role, isLoading });

  useEffect(() => {
    console.log("useEffect triggered", { isLoading, user, role });
    if (!isLoading && user && role) {
      console.log("Redirecting user", { role });
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
  }, [user, role, isLoading, navigate]);

  // If still loading, show loading state (AFTER all hooks)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Proposal Management",
      description: "Submit, track, and manage your project proposals with ease. Get feedback from supervisors and track approval status.",
      color: "bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-600 dark:from-blue-400/30 dark:to-blue-500/30 dark:text-blue-400"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Supervisor Matching",
      description: "Connect with expert supervisors in your field. Browse profiles, expertise areas, and availability.",
      color: "bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-600 dark:from-green-400/30 dark:to-green-500/30 dark:text-green-400"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Real-time Communication",
      description: "Stay connected with supervisors through secure messaging, voice notes, and progress updates.",
      color: "bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-600 dark:from-purple-400/30 dark:to-purple-500/30 dark:text-purple-400"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Chapter Submissions",
      description: "Submit chapters, receive feedback, and track your writing progress throughout your project journey.",
      color: "bg-gradient-to-br from-orange-500/20 to-orange-600/20 text-orange-600 dark:from-orange-400/30 dark:to-orange-500/30 dark:text-orange-400"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Progress Tracking",
      description: "Monitor milestones, deadlines, and project phases. Never miss important submission dates.",
      color: "bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-600 dark:from-red-400/30 dark:to-red-500/30 dark:text-red-400"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Quality Assurance",
      description: "Ensure academic standards with built-in quality checks, plagiarism detection, and formatting guidelines.",
      color: "bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-600 dark:from-indigo-400/30 dark:to-indigo-500/30 dark:text-indigo-400"
    }
  ];

  const steps = [
    {
      number: "01",
      icon: <FileText className="h-6 w-6" />,
      title: "Submit Proposal",
      description: "Create and submit your project proposal with detailed objectives, methodology, and timeline."
    },
    {
      number: "02", 
      icon: <Users className="h-6 w-6" />,
      title: "Get Supervisor",
      description: "Get matched with an expert supervisor based on your project area and research interests."
    },
    {
      number: "03",
      icon: <BookOpen className="h-6 w-6" />,
      title: "Track Progress", 
      description: "Submit chapters, receive feedback, and monitor your progress through project milestones."
    },
    {
      number: "04",
      icon: <Award className="h-6 w-6" />,
      title: "Complete & Graduate",
      description: "Successfully defend your project and graduate with confidence in your academic achievement."
    }
  ];



  const benefits = [
    "Streamlined proposal submission and approval process",
    "Real-time progress tracking and milestone management",
    "Direct communication with supervisors and feedback",
    "Centralized document storage and version control",
    "Automated notifications and deadline reminders",
    "Comprehensive project portfolio and documentation",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img 
                    src={getAssetUrl("logo.jpg")} 
                    alt="CSS Logo" 
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div className="relative">
                  <img 
                    src="/uds.jpg" 
                    alt="UDS Logo" 
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-500/20 shadow-lg"
                  />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent dark:bg-none dark:text-white">
                  Project Management System
                </span>
                <p className="text-xs text-muted-foreground dark:text-white">University for Development Studies</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <Link to="/auth">
                <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group">
                  <span>Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20 text-primary dark:text-primary-foreground px-6 py-3 rounded-full text-sm font-medium mb-8 border border-primary/20 dark:border-primary/40 shadow-lg backdrop-blur-sm">
              <Lightbulb className="h-4 w-4 text-primary dark:text-yellow-400" />
              <span className="text-primary dark:text-primary-foreground font-semibold">Computer Science & Development Studies</span>
              <Badge variant="secondary" className="ml-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground border-primary/20 dark:border-primary/40">2026</Badge>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
              <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Final Year Project
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground dark:text-white max-w-3xl mx-auto leading-relaxed mb-8">
              Streamline your final year project journey from proposal submission to completion. 
              Connect with supervisors, track progress, and manage all aspects of your academic project in one place.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["Proposal Submission", "Progress Tracking", "Supervisor Communication", "Document Management"].map((feature, index) => (
                <Badge key={index} variant="outline" className="px-4 py-2 text-sm">
                  {feature}
                </Badge>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto gap-3 rounded-full h-16 px-10 text-lg font-semibold shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 transition-all duration-300 group bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                  <Lightbulb className="h-5 w-5" />
                  Submit Your Proposal
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  <img 
                    src={getAssetUrl("1.png")} 
                    alt="Student 1" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-background shadow-lg"
                  />
                  <img 
                    src="/2.jpg" 
                    alt="Student 2" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-background shadow-lg"
                  />
                  <img 
                    src="/3.jpg" 
                    alt="Student 3" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-background shadow-lg"
                  />
                </div>
                <span>Join 500+ students managing their FYP successfully</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Core Features</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need for
              <span className="block text-primary">Project Success</span>
            </h2>
            <p className="text-muted-foreground dark:text-white text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive tools and resources designed specifically for final year project management
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border-0 shadow-lg hover:shadow-2xl dark:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50 dark:from-card dark:to-card/80 backdrop-blur-sm"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-8">
                  <div className={`h-16 w-16 rounded-2xl ${feature.color} dark:bg-opacity-30 dark:backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg dark:shadow-primary/20`}>
                    <div className="text-current dark:text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-foreground dark:text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground dark:text-white leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Active Students" },
              { number: "50+", label: "Expert Supervisors" },
              { number: "200+", label: "Completed Projects" },
              { number: "95%", label: "Success Rate" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-2">{stat.number}</div>
                <div className="text-muted-foreground dark:text-white">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background dark:from-muted/20 dark:to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 dark:border-primary/50 text-primary dark:text-primary-foreground">Simple Process</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground dark:text-foreground mb-6">
              How It
              <span className="block text-primary dark:text-primary">Works</span>
            </h2>
            <p className="text-muted-foreground dark:text-white text-lg max-w-2xl mx-auto">
              Follow these simple steps to successfully complete your final year project
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent dark:from-primary/70 dark:to-transparent z-0" />
                )}
                
                <Card className="relative z-10 border-0 shadow-lg hover:shadow-2xl dark:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50 dark:from-card dark:to-card/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <div className="text-white dark:text-white">
                          {step.icon}
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="font-bold text-xl text-foreground dark:text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground dark:text-white leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Badge variant="outline" className="mb-4">Why Choose Our System</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Simplify Your
                <span className="block text-primary">Academic Journey</span>
              </h2>
              <p className="text-muted-foreground dark:text-white text-lg mb-8 leading-relaxed">
                Our comprehensive platform is designed specifically for final year project management, 
                helping students and supervisors stay organized and connected throughout the entire process.
              </p>
              
              <div className="grid gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary to-blue-500 dark:from-primary dark:to-blue-400 flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform shadow-lg dark:shadow-primary/20">
                      <CheckCircle className="h-4 w-4 text-white dark:text-white" />
                    </div>
                    <span className="text-foreground dark:text-foreground font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Link to="/auth">
                  <Button size="lg" className="rounded-full">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4 text-primary" />
                  <span>Academic excellence guaranteed</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="relative">
                {/* Main Card */}
                <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-0 shadow-2xl overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-8">
                      <div className="flex items-center justify-center gap-4">
                        <img 
                          src={getAssetUrl("logo.jpg")} 
                          alt="CSS Logo" 
                          className="w-24 h-24 rounded-full object-cover ring-6 ring-primary/20 shadow-2xl"
                        />
                        <img 
                          src="/uds.jpg" 
                          alt="UDS Logo" 
                          className="w-24 h-24 rounded-full object-cover ring-6 ring-blue-500/20 shadow-2xl"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">FYP Management Hub</h3>
                    <p className="text-muted-foreground mb-6">University for Development Studies</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary dark:text-white">500+</div>
                        <div className="text-xs text-muted-foreground dark:text-white">Students</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary dark:text-white">50+</div>
                        <div className="text-xs text-muted-foreground dark:text-white">Supervisors</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary dark:text-white">95%</div>
                        <div className="text-xs text-muted-foreground dark:text-white">Success Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating Elements */}
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-2xl flex items-center justify-center shadow-lg dark:shadow-primary/30 animate-bounce">
                  <FileText className="h-8 w-8 text-white dark:text-white" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 dark:from-green-400 dark:to-blue-400 rounded-2xl flex items-center justify-center shadow-lg dark:shadow-primary/30 animate-bounce" style={{ animationDelay: '1s' }}>
                  <Lightbulb className="h-8 w-8 text-white dark:text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-blue-600 to-purple-600 dark:from-primary dark:via-blue-500 dark:to-purple-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative">
          <Badge variant="secondary" className="mb-6 bg-white/20 dark:bg-white/30 text-white border-white/30 dark:border-white/50 backdrop-blur-sm">
            Ready to Start?
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white dark:text-white mb-6">
            Complete Your Final Year
            <span className="block">Project Successfully</span>
          </h2>
          <p className="text-white/90 dark:text-white/95 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of students who have successfully completed their final year projects using our comprehensive management system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="rounded-full h-14 px-8 text-base font-semibold shadow-xl bg-white dark:bg-white text-primary dark:text-primary hover:bg-white/90 dark:hover:bg-white/95 backdrop-blur-sm">
                <FileText className="mr-2 h-5 w-5 text-primary dark:text-primary" />
                Submit Your Proposal
                <ArrowRight className="ml-2 h-5 w-5 text-primary dark:text-primary" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-white/80 dark:text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-white dark:text-white" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white dark:text-white" />
              <span>24/7 support</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-white dark:text-white" />
              <span>Industry recognized</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 dark:bg-muted/20 border-t border-border/50 dark:border-border/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <img src={getAssetUrl("logo.jpg")} alt="CSS Logo" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 dark:ring-primary/40" />
                  <img src={getAssetUrl("uds.jpg")} alt="UDS Logo" className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/20 dark:ring-blue-500/40" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/80 bg-clip-text text-transparent dark:bg-none dark:text-white">
                  Project Management System
                </span>
              </div>
              <p className="text-muted-foreground dark:text-white text-sm leading-relaxed">
                Comprehensive final year project management platform for Computer Science students at the University for Development Studies.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground dark:text-foreground mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link to="/auth" className="block text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors">
                  Student Portal
                </Link>
                <Link to="/auth" className="block text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors">
                  Supervisor Dashboard
                </Link>
                <Link to="/auth" className="block text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors">
                  Admin Panel
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground dark:text-foreground mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground dark:text-muted-foreground">
                <p>Computer Science Department</p>
                <p>University for Development Studies</p>
                <p>Tamale, Ghana</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/50 dark:border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              © 2026 FYP Management System. Built for academic project excellence.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs border-primary/30 dark:border-primary/50 text-primary dark:text-primary-foreground">
                Final Year Project System
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
