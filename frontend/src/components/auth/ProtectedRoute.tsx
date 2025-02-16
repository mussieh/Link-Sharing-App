import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAppSelector } from "../../store/hooks";

type ProtectedRouteProps = {
    children: ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const isAuthenticated = useAppSelector(
        (state) => state.auth.isAuthenticated
    );

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};
