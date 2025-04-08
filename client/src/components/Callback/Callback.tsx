import { useHandleSignInCallback } from '@logto/react';
import { useNavigate, useLocation } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, error } = useHandleSignInCallback(() => {
    const returnTo = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(returnTo, { replace: true });
  });

  if (isLoading) {
    return <div>Redirecting...</div>;
  }

  if (error) {
    return <div>Login failed. Please try again.</div>;
  }

  return null;
};

export default Callback;