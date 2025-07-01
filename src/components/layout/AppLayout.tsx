import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from './UserProfile';
import { 
  Users, 
  Home, 
  UserPlus, 
  BarChart3, 
  Menu,
  X,
  Dumbbell
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'visitors', label: 'All Visitors', icon: Users },
  { id: 'add-visitor', label: 'Add Visitor', icon: UserPlus },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tabRoutes: Record<string, string> = {
    dashboard: '/',
    visitors: '/visitors',
    'add-visitor': '/add-visitor',
    stats: '/stats',
  };
  const getActiveTab = () => {
    if (location.pathname === '/' || location.pathname.startsWith('/dashboard')) return 'dashboard';
    if (location.pathname.startsWith('/visitors')) return 'visitors';
    if (location.pathname.startsWith('/add-visitor')) return 'add-visitor';
    if (location.pathname.startsWith('/stats')) return 'stats';
    return '';
  };
  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-40 w-full">
        <div className="flex items-center justify-between p-2 sm:p-3 w-full max-w-full">
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1 max-w-[60%]">
            <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">GymPulse</h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <div className="max-w-[220px] sm:max-w-none">
              <UserProfile variant="mobile" />
            </div>
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-white hover:bg-gray-50 text-gray-700 p-1 sm:p-2 flex-shrink-0"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar - Only show if authenticated */}
        {isAuthenticated && (
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30">
            <div className="flex flex-col flex-grow bg-white shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center space-x-2">
                  <Dumbbell className="h-8 w-8 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900">GymPulse</h1>
                </div>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start bg-white hover:bg-gray-50 text-gray-700",
                        activeTab === item.id && "bg-blue-600 text-white hover:bg-blue-700"
                      )}
                      onClick={() => navigate(tabRoutes[item.id])}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
              <div className="p-4 border-t">
                <UserProfile variant="desktop" />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Overlay - Only show if authenticated */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="fixed inset-y-0 left-0 w-64 sm:w-72 bg-white shadow-xl max-w-[85vw]">
              <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 border-b">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <Dumbbell className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <h1 className="text-lg font-bold text-gray-900 truncate">GymPulse</h1>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-white hover:bg-gray-50 text-gray-700 p-2 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="px-3 sm:px-4 py-4 space-y-2 overflow-y-auto max-h-[calc(100vh-180px)]">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start bg-white hover:bg-gray-50 text-gray-700 text-sm",
                        activeTab === item.id && "bg-blue-600 text-white hover:bg-blue-700"
                      )}
                      onClick={() => {
                        navigate(tabRoutes[item.id]);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
              <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-4">
                <UserProfile variant="mobile" />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={cn(
          "flex-1 min-h-screen w-full",
          isAuthenticated && "lg:ml-64"
        )}>
          <main className="p-2 sm:p-3 lg:p-6 xl:p-8 w-full">
            {/* Desktop Header with User Profile - Only show if authenticated */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="text-sm text-gray-600 truncate">
                    Welcome back, <span className="font-medium text-gray-900">{user?.email}</span>
                  </div>
                </div>
                <UserProfile variant="desktop" />
              </div>
            )}
            
            {/* Content Container */}
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation - Only show if authenticated */}
        {isAuthenticated && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30 w-full">
            <div className="flex justify-around py-1 px-1 w-full">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex flex-col items-center space-y-0.5 py-1.5 px-1 min-w-0 bg-white hover:bg-gray-50 text-gray-700 flex-1 max-w-[25%]",
                      activeTab === item.id && "text-blue-600 bg-blue-50"
                    )}
                    onClick={() => navigate(tabRoutes[item.id])}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs truncate w-full text-center leading-tight">
                      {item.label.split(' ')[0]}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}