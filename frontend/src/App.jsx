import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import "./App.css";
import "./styles/themes.css";
import "./i18n";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import AuthWrapper from "./components/AuthWrapper";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import CourseView from "./pages/CourseView";
import AllCourses from "./pages/AllCourses";
import Profile from "./pages/Profile";
import { ChatButton } from "./components/chatbot";
import { Link } from "react-router-dom";
import Summary from "./pages/summary";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Role-based Dashboard Component
const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  switch (user?.role) {
    case "admin":
      return (
        <>
          <Header />
          <AdminDashboard />
        </>
      );
    case "teacher":
      return (
        <>
          <Header />
          <TeacherDashboard />
        </>
      );
    case "student":
      return (
        <>
          <Header />
          <StudentDashboard />
        </>
      );
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <ThemeProvider>
      <Router>
        <AuthWrapper>
          <div className="App">
            <ChatButton />
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login />
                )
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

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
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Header />
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <Header />
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Header />
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:id"
              element={
                <ProtectedRoute>
                  <Header />
                  <CourseView />
                </ProtectedRoute>
              }
            />

             <Route path="/summary" element={<Summary />} />
             
            <Route
              path="/courses"
              element={
                <>
                  <Header />
                  <AllCourses />
                </>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Header />
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Fallback Routes */}
            <Route
              path="/unauthorized"
              element={
                <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-light">
                  <div className="text-center">
                    <i
                      className="bi bi-shield-exclamation text-danger"
                      style={{ fontSize: "5rem" }}
                    ></i>
                    <h1 className="display-4 fw-bold text-danger mt-3">
                      Unauthorized Access
                    </h1>
                    <p className="lead text-muted">
                      You don't have permission to access this page.
                    </p>
                    <Link
                      to="/"
                      className="btn btn-primary px-4 py-2 rounded-3"
                    >
                      <i className="bi bi-house-fill me-2"></i>
                      Go Home
                    </Link>
                  </div>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </AuthWrapper>
      </Router>
    </ThemeProvider>
  );
}

export default App;
