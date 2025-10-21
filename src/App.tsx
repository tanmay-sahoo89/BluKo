import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import { ChatbotPage } from './pages/ChatbotPage';
import { ResumePage } from './pages/ResumePage';
import { useNavigate } from './hooks/useNavigate';

function AppContent() {
  const { user, loading } = useAuth();
  const { currentPage, navigate } = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#002B5C] via-[#003A6E] to-[#1E4C80] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (currentPage === 'profile') {
    return <ProfilePage onBack={() => navigate('dashboard')} onNavigate={navigate} />;
  }

  if (currentPage === 'chatbot') {
    return <ChatbotPage onBack={() => navigate('dashboard')} onNavigate={navigate} />;
  }

  if (currentPage === 'resume') {
    return <ResumePage onBack={() => navigate('dashboard')} onNavigate={navigate} />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
