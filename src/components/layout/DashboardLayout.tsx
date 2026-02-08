import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
  UserCog,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Supervisors", href: "/admin/supervisors", icon: <UserCog className="h-5 w-5" /> },
  { label: "Students", href: "/admin/students", icon: <Users className="h-5 w-5" /> },
  { label: "Assignments", href: "/admin/assignments", icon: <UserPlus className="h-5 w-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
];

const supervisorNavItems: NavItem[] = [
  { label: "Dashboard", href: "/supervisor", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "My Students", href: "/supervisor/students", icon: <Users className="h-5 w-5" /> },
  { label: "Proposals", href: "/supervisor/proposals", icon: <FileText className="h-5 w-5" /> },
  { label: "Chapters", href: "/supervisor/chapters", icon: <FileText className="h-5 w-5" /> },
  { label: "Messages", href: "/supervisor/messages", icon: <MessageSquare className="h-5 w-5" /> },
  { label: "Announcements", href: "/supervisor/announcements", icon: <Bell className="h-5 w-5" /> },
  { label: "Settings", href: "/supervisor/settings", icon: <Settings className="h-5 w-5" /> },
];

const studentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "My Proposal", href: "/student/proposal", icon: <FileText className="h-5 w-5" /> },
  { label: "Chapters", href: "/student/chapters", icon: <FileText className="h-5 w-5" /> },
  { label: "Messages", href: "/student/messages", icon: <MessageSquare className="h-5 w-5" /> },
  { label: "Announcements", href: "/student/announcements", icon: <Bell className="h-5 w-5" /> },
  { label: "Settings", href: "/student/settings", icon: <Settings className="h-5 w-5" /> },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const navItems =
    role === "admin"
      ? adminNavItems
      : role === "supervisor"
      ? supervisorNavItems
      : studentNavItems;

  const roleLabel =
    role === "admin" ? "Administrator" : role === "supervisor" ? "Supervisor" : "Student";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
            <img 
              src="/logo.jpg"
              alt="CSS UDS Logo" 
              className="h-12 w-12 rounded-full object-cover ring-2 ring-sidebar-foreground/20"
            />
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">CSS FYP</h1>
              <p className="text-xs text-sidebar-foreground/70">Project Supervision</p>
            </div>
            <button
              className="ml-auto lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn("sidebar-item", isActive && "sidebar-item-active")}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border p-4">
            <div className="mb-4 rounded-lg bg-sidebar-accent p-3">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-sidebar-foreground/70">{roleLabel}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-8">
          <button
            className="lg:hidden text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
