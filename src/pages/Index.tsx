import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Users, FileText, MessageSquare, Shield, ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && role) {
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

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Access Control",
      description: "Role-based dashboards for admins, supervisors, and students with encrypted data protection.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Smart Supervision",
      description: "Intelligent student-supervisor matching and workload management system.",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Project Tracking",
      description: "Submit, review, and track proposals and chapters with real-time status updates.",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Seamless Communication",
      description: "Built-in messaging and announcements for effective collaboration.",
    },
  ];

  const benefits = [
    "Streamlined proposal submission process",
    "Real-time feedback on chapters",
    "Centralized project documentation",
    "Progress tracking and analytics",
    "Automated notifications and reminders",
    "Secure file storage and sharing",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.jpg" 
                alt="CSS UDS Logo" 
                className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div>
                <span className="text-xl font-bold text-foreground">CSS FYP</span>
                <p className="text-xs text-muted-foreground">Project Supervision</p>
              </div>
            </div>
            <Link to="/auth">
              <Button className="rounded-xl shadow-lg shadow-primary/20">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>

        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Shield className="h-4 w-4" />
              Computer Science Department
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Final Year Project
              <span className="block text-primary mt-2">Assessment & Supervision</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A comprehensive platform designed to streamline the management of final year student projects, 
              from proposal submission to supervisor feedback and seamless communication.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto gap-2 rounded-xl h-14 px-8 text-base font-semibold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to make project supervision efficient and effective
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Simplify Your Academic Journey
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Our platform is designed specifically for the unique needs of final year project management, 
                helping students and supervisors stay organized and connected throughout the process.
              </p>
              
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 lg:p-12">
                <img 
                  src="/logo.jpg" 
                  alt="CSS UDS Logo" 
                  className="w-48 h-48 mx-auto rounded-full object-cover ring-8 ring-white shadow-2xl"
                />
                <div className="text-center mt-8">
                  <h3 className="text-2xl font-bold text-foreground">CSS FYP Manager</h3>
                  <p className="text-muted-foreground mt-2">University for Development Studies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join your fellow students and supervisors in managing final year projects effectively.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="rounded-xl h-14 px-8 text-base font-semibold shadow-xl">
              Sign In Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="CSS UDS Logo" className="h-10 w-10 rounded-full object-cover" />
              <span className="font-semibold text-foreground">CSS FYP Manager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Computer Science Department. Built for academic project management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
