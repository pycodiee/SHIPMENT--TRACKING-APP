import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import NotFound from "./pages/NotFound";
import SelectUserType from "./pages/SelectUserType";
import Subscription from "./pages/Subscription";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { FloatingShapes } from "@/components/FloatingShapes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen relative overflow-hidden">
            <AnimatedBackground />
            <FloatingShapes />
            <div className="relative z-10">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/select-user-type" element={<SelectUserType />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/agent" element={<AgentDashboard />} />
                <Route path="/customer" element={<CustomerDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
