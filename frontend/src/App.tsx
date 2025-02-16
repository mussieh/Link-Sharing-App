import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LinkPreview from "./pages/LinkPreview";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Links from "./pages/Links";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAppSelector } from "./store/hooks";
import { useCheckAuthQuery } from "./store/authAPI";
import Loader from "./components/common/Loader";

function App() {
    const isAuthenticated = useAppSelector(
        (state) => state.auth.isAuthenticated
    );

    const { isLoading } = useCheckAuthQuery();

    if (isLoading) {
        return <Loader />;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/links" replace />
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/register"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/links" replace />
                        ) : (
                            <Register />
                        )
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/links"
                    element={
                        <ProtectedRoute>
                            <Links />
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
                <Route
                    path="/links/preview"
                    element={
                        <ProtectedRoute>
                            <LinkPreview />
                        </ProtectedRoute>
                    }
                />

                {/* Default Route */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/links" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Catch-All Route for 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
