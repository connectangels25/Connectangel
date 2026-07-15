import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/shad" element={<ChatPage />} />
            <Route path="/chat" element={<ComingSoonChat />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/hide" element={<HidPage />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/my-events" element={
              <ProtectedRoute>
                <MyEventsPage />
              </ProtectedRoute>
            } />
            <Route path="/create-event" element={
              <ProtectedRoute>
                <CreateEventPage />
              </ProtectedRoute>
            } />
            <Route path="/edit-event/:id" element={
              <ProtectedRoute>
                <CreateEventPage />
              </ProtectedRoute>
            } />
            <Route path="/admindashboard" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="/eventdashboard" element={
              <AdminProtectedRoute>
                <EventDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="/usermanagement" element={
              <AdminProtectedRoute>
                <UserManagementDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="/potential" element={
              <AdminProtectedRoute>
                <PotentialPage />
              </AdminProtectedRoute>
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
