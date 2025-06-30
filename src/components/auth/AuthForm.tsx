import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AuthForm() {
  const { signIn, signUp, resetPassword, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await signIn(formData.email, formData.password);
        toast.success('Welcome back! Redirecting to dashboard...');
      } else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          return;
        }
        await signUp(formData.email, formData.password);
      } else if (mode === 'reset') {
        if (!formData.email) {
          toast.error('Please enter your email address');
          return;
        }
        await resetPassword(formData.email);
        setMode('signin');
        setFormData({ email: formData.email, password: '', confirmPassword: '' });
      }
    } catch (error) {
      // Error handling is done in the auth context
      console.error('Auth error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GymPulse</h1>
              <p className="text-sm text-gray-600">Gym Management System</p>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
            </CardTitle>
            <p className="text-sm text-gray-600 text-center">
              {mode === 'signin' && 'Sign in to access your gym dashboard'}
              {mode === 'signup' && 'Create a new account to get started'}
              {mode === 'reset' && 'Enter your email to reset your password'}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Field */}
              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                      minLength={6}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                      minLength={6}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {mode === 'signin' && 'Signing In...'}
                      {mode === 'signup' && 'Creating Account...'}
                      {mode === 'reset' && 'Sending Email...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {mode === 'signin' && <ArrowRight className="h-4 w-4" />}
                    {mode === 'signup' && <User className="h-4 w-4" />}
                    {mode === 'reset' && <Mail className="h-4 w-4" />}
                    <span>
                      {mode === 'signin' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'reset' && 'Send Reset Email'}
                    </span>
                  </div>
                )}
              </Button>
            </form>

            {/* Mode Switching */}
            <div className="space-y-4">
              <Separator />
              
              <div className="text-center space-y-3">
                {mode === 'signin' && (
                  <>
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                        disabled={isSubmitting}
                      >
                        Sign up here
                      </button>
                    </p>
                    <p className="text-sm text-gray-600">
                      Forgot your password?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                        disabled={isSubmitting}
                      >
                        Reset it
                      </button>
                    </p>
                  </>
                )}
                
                {mode === 'signup' && (
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                      disabled={isSubmitting}
                    >
                      Sign in here
                    </button>
                  </p>
                )}
                
                {mode === 'reset' && (
                  <p className="text-sm text-gray-600">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                      disabled={isSubmitting}
                    >
                      Sign in here
                    </button>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}