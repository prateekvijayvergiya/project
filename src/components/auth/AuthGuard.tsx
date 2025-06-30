import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from './AuthForm';
import { Dumbbell, Shield, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, session } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Give a moment for the auth state to stabilize
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, session]);

  // Show loading screen while checking authentication
  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg animate-pulse">
              <Dumbbell className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GymPulse</h1>
              <p className="text-sm text-gray-600">Loading your session...</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <Shield className="absolute inset-0 m-auto h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-gray-700 font-medium">Verifying authentication...</p>
              <p className="text-sm text-gray-500">Please wait while we secure your session</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login form if user is not authenticated
  if (!user || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute top-4 left-4 flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">Authentication Required</span>
        </div>
        <AuthForm />
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}