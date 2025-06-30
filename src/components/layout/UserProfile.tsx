import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  ChevronDown,
  Mail,
  Clock,
  LogIn
} from 'lucide-react';
import { format } from 'date-fns';

interface UserProfileProps {
  variant?: 'desktop' | 'mobile';
}

export function UserProfile({ variant = 'desktop' }: UserProfileProps) {
  const { user, signOut, session, isAuthenticated } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleLoginClick = () => {
    // In a real app with routing, this would navigate to login
    // For now, we'll reload the page to show the auth form
    window.location.reload();
  };

  // If user is not authenticated, show login button
  if (!isAuthenticated || !user) {
    if (variant === 'mobile') {
      return (
        <Button 
          onClick={handleLoginClick}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs"
        >
          <LogIn className="h-3 w-3 mr-1" />
          Login
        </Button>
      );
    }

    return (
      <Button 
        onClick={handleLoginClick}
        variant="outline"
        size="sm"
        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 bg-white"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Login
      </Button>
    );
  }

  // User is authenticated, show user profile
  const userInitials = user.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'U';

  const sessionCreated = 'Active';

  if (variant === 'mobile') {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg max-w-full">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-xs">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate">
            {user.email}
          </p>
          <p className="text-xs text-gray-500">Admin</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              disabled={isSigningOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6 flex-shrink-0"
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="mx-4 max-w-[90vw] sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Sign Out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out of GymPulse? You'll need to sign in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2 h-auto p-2 hover:bg-white/50 transition-colors bg-white text-gray-700"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900 max-w-32 truncate">
                {user.email}
              </span>
              <span className="text-xs text-gray-500">Administrator</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-72 bg-white">
          <DropdownMenuLabel className="pb-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <div className="px-2 py-2 space-y-1">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Mail className="h-3 w-3" />
              <span>Email: {user.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Session: {sessionCreated}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <User className="h-3 w-3" />
              <span>ID: {user.id.slice(0, 8)}...</span>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile Settings
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center space-x-2">
                  <LogOut className="h-5 w-5 text-red-600" />
                  <span>Sign Out of GymPulse</span>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out? You'll need to enter your credentials again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSigningOut ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing Out...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </div>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}