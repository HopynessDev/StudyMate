import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components (to be created)
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages (to be created)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import CreateMaterial from './pages/CreateMaterial';
import StudyFlashcards from './pages/StudyFlashcards';
import StudyQuiz from './pages/StudyQuiz';
import StudySummary from './pages/StudySummary';
import Wellness from './pages/Wellness';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Root Route that redirects based on auth status
const RootRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials"
            element={
              <ProtectedRoute>
                <Materials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/create"
            element={
              <ProtectedRoute>
                <CreateMaterial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/flashcards/:id"
            element={
              <ProtectedRoute>
                <StudyFlashcards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/quiz/:id"
            element={
              <ProtectedRoute>
                <StudyQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/summary/:id"
            element={
              <ProtectedRoute>
                <StudySummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wellness"
            element={
              <ProtectedRoute>
                <Wellness />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Default Routes */}
          <Route path="/" element={<RootRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;