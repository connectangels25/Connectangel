import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import PendingPlanGate from "@/components/PendingPlanGate";
import Index from "./pages/Index.tsx";
import ChatPage from "./pages/ChatPage.tsx";
import ComingSoonChat from "./pages/ComingSoonChat.tsx";
import BlogPage from "./pages/BlogPage.tsx";
import PricingPage from "./pages/PricingPage.tsx";
import HidPage from "./pages/HidPage.tsx";
import EventDetails from "./pages/EventDetails.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import AdminLoginPage from "./pages/AdminLoginPage.tsx";
import CreateEventPage from "./pages/CreateEventPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import MyEventsPage from "./pages/MyEventsPage.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import EventDashboard from "./pages/EventDashboard.tsx";
import UserManagementDashboard from "./pages/UserManagementDashboard.tsx";
import EventsPage from "./pages/EventsPage.tsx";
import PotentialPage from "./pages/PotentialPage.tsx";
import TestPage from "./pages/TestPage.tsx";
import ExpiredPlanOverlay from "@/components/ExpiredPlanOverlay";
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ExpiredPlanOverlay />
          <Routes>
            <Route path="/test" element={<TestPage />} />
            <Route path="/" element={<PendingPlanGate><Index /></PendingPlanGate>} />
            <Route path="/events" element={<PendingPlanGate><EventsPage /></PendingPlanGate>} />
            <Route path="/shad" element={<PendingPlanGate><ChatPage /></PendingPlanGate>} />
            <Route path="/chat" element={<PendingPlanGate><ComingSoonChat /></PendingPlanGate>} />
            <Route path="/blog" element={<PendingPlanGate><BlogPage /></PendingPlanGate>} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/hide" element={<PendingPlanGate><HidPage /></PendingPlanGate>} />
            <Route path="/event/:id" element={<PendingPlanGate><EventDetails /></PendingPlanGate>} />
            <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
            <Route path="/signup" element={<RedirectIfAuthenticated><SignupPage /></RedirectIfAuthenticated>} />
            <Route path="/admin" element={<RedirectIfAuthenticated><AdminLoginPage /></RedirectIfAuthenticated>} />
            <Route path="/my-events" element={
              <ProtectedRoute>
                <PendingPlanGate><MyEventsPage /></PendingPlanGate>
              </ProtectedRoute>
            } />
            <Route path="/create-event" element={
              <ProtectedRoute>
                <PendingPlanGate><CreateEventPage /></PendingPlanGate>
              </ProtectedRoute>
            } />
            <Route path="/edit-event/:id" element={
              <ProtectedRoute>
                <PendingPlanGate><CreateEventPage /></PendingPlanGate>
              </ProtectedRoute>
            } />
            <Route path="/admindashboard" element={
              <AdminProtectedRoute>
                <PendingPlanGate><AdminDashboard /></PendingPlanGate>
              </AdminProtectedRoute>
            } />
            <Route path="/eventdashboard" element={
              <AdminProtectedRoute>
                <PendingPlanGate><EventDashboard /></PendingPlanGate>
              </AdminProtectedRoute>
            } />
            <Route path="/usermanagement" element={
              <AdminProtectedRoute>
                <PendingPlanGate><UserManagementDashboard /></PendingPlanGate>
              </AdminProtectedRoute>
            } />
            <Route path="/potential" element={
              <ProtectedRoute>
                <PendingPlanGate><PotentialPage /></PendingPlanGate>
              </ProtectedRoute>
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
