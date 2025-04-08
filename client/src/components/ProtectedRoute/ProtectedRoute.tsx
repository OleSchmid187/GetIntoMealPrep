import { JSX } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useLogto } from '@logto/react';

type ProtectedRouteProps = {
  children: JSX.Element;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useLogto();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('User is not authenticated. Redirecting to login page.');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
