import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Supervisors from "./pages/admin/Supervisors";
import Students from "./pages/admin/Students";
import Assignments from "./pages/admin/Assignments";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import MyStudents from "./pages/supervisor/MyStudents";
import Proposals from "./pages/supervisor/Proposals";
import Messages from "./pages/supervisor/Messages";
import Announcements from "./pages/supervisor/Announcements";
import StudentDashboard from "./pages/student/StudentDashboard";
import Proposal from "./pages/student/Proposal";
import StudentMessages from "./pages/student/StudentMessages";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";
import Chapters from "./pages/student/Chapters";
import ChapterReviews from "./pages/supervisor/ChapterReviews";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="css-fyp-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/supervisors" element={<ProtectedRoute allowedRoles={["admin"]}><Supervisors /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin"]}><Students /></ProtectedRoute>} />
            <Route path="/admin/assignments" element={<ProtectedRoute allowedRoles={["admin"]}><Assignments /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Settings /></ProtectedRoute>} />
            
            {/* Supervisor Routes */}
            <Route path="/supervisor" element={<ProtectedRoute allowedRoles={["supervisor"]}><SupervisorDashboard /></ProtectedRoute>} />
            <Route path="/supervisor/students" element={<ProtectedRoute allowedRoles={["supervisor"]}><MyStudents /></ProtectedRoute>} />
            <Route path="/supervisor/proposals" element={<ProtectedRoute allowedRoles={["supervisor"]}><Proposals /></ProtectedRoute>} />
            <Route path="/supervisor/messages" element={<ProtectedRoute allowedRoles={["supervisor"]}><Messages /></ProtectedRoute>} />
            <Route path="/supervisor/announcements" element={<ProtectedRoute allowedRoles={["supervisor"]}><Announcements /></ProtectedRoute>} />
            <Route path="/supervisor/chapters" element={<ProtectedRoute allowedRoles={["supervisor"]}><ChapterReviews /></ProtectedRoute>} />
            <Route path="/supervisor/settings" element={<ProtectedRoute allowedRoles={["supervisor"]}><Settings /></ProtectedRoute>} />
            
            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/proposal" element={<ProtectedRoute allowedRoles={["student"]}><Proposal /></ProtectedRoute>} />
            <Route path="/student/messages" element={<ProtectedRoute allowedRoles={["student"]}><StudentMessages /></ProtectedRoute>} />
            <Route path="/student/announcements" element={<ProtectedRoute allowedRoles={["student"]}><StudentAnnouncements /></ProtectedRoute>} />
            <Route path="/student/chapters" element={<ProtectedRoute allowedRoles={["student"]}><Chapters /></ProtectedRoute>} />
            <Route path="/student/settings" element={<ProtectedRoute allowedRoles={["student"]}><Settings /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
