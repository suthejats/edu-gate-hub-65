import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import InstitutionLogin from "./pages/InstitutionLogin";
import InstitutionRegister from "./pages/InstitutionRegister";
import TeacherLogin from "./pages/TeacherLogin";
import ApprovalStatus from "./pages/ApprovalStatus";
import TeacherDashboard from "./pages/TeacherDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminApprovals from "./pages/AdminApprovals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/institution/login" element={<InstitutionLogin />} />
          <Route path="/institution/register" element={<InstitutionRegister />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/approval-status" element={<ApprovalStatus />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
