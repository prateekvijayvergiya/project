import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExpiryAlertBanner } from '@/components/alerts/ExpiryAlertBanner';
import { useVisitors } from '@/hooks/useVisitors';
import { useExpiryAlerts } from '@/hooks/useExpiryAlerts';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar,
  AlertTriangle,
  Activity,
  UserX,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

interface VisitorsDashboardProps {
  onNavigateToVisitors?: () => void;
}

export function VisitorsDashboard({ onNavigateToVisitors }: VisitorsDashboardProps) {
  const { visitors, stats, loading } = useVisitors();
  const { expiringVisitors } = useExpiryAlerts();

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 pb-16 lg:pb-6 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 sm:p-4">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const recentVisitors = visitors
    .filter(v => v.status === 'active')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const handleViewExpiringVisitors = () => {
    // Navigate to visitors list and highlight expiring visitors
    onNavigateToVisitors?.();
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-16 lg:pb-6 w-full">
      <div className="w-full px-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Visitors Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm">Overview of your gym visitors and subscription status</p>
      </div>

      {/* Expiry Alert Banner */}
      <ExpiryAlertBanner onViewExpiring={handleViewExpiringVisitors} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-blue-100 text-xs truncate">Total Visitors</p>
                <p className="text-lg sm:text-xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-green-100 text-xs truncate">Active Visitors</p>
                <p className="text-lg sm:text-xl font-bold">{stats.active}</p>
              </div>
              <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-orange-100 text-xs truncate">Expiring Soon</p>
                <p className="text-lg sm:text-xl font-bold">{expiringVisitors.length}</p>
              </div>
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-red-100 text-xs truncate">Expired</p>
                <p className="text-lg sm:text-xl font-bold">{stats.expired}</p>
              </div>
              <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-red-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 w-full">
        {/* Recent Visitors */}
        <Card className="w-full">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Activity className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Recent Visitors</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              {recentVisitors.length === 0 ? (
                <p className="text-gray-500 text-center py-3 text-sm">No recent visitors</p>
              ) : (
                recentVisitors.map((visitor) => (
                  <div key={visitor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg w-full">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-medium text-xs">
                          {visitor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{visitor.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          Joined: {format(new Date(visitor.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs flex-shrink-0">
                      {visitor.subscription_type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Soon Details */}
        <Card className="w-full">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span className="text-base sm:text-lg truncate">Expiring Subscriptions</span>
              </div>
              {expiringVisitors.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewExpiringVisitors}
                  className="text-xs flex-shrink-0"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              {expiringVisitors.length === 0 ? (
                <p className="text-gray-500 text-center py-3 text-sm">No upcoming expirations</p>
              ) : (
                expiringVisitors.slice(0, 5).map((visitor) => {
                  const urgencyColor = visitor.daysUntilExpiry === 0 
                    ? 'border-red-200 bg-red-50' 
                    : visitor.daysUntilExpiry === 1 
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-yellow-200 bg-yellow-50';
                  
                  return (
                    <div key={visitor.id} className={`flex items-center justify-between p-2 border rounded-lg ${urgencyColor} w-full`}>
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center border flex-shrink-0">
                          <span className="text-gray-600 font-medium text-xs">
                            {visitor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs sm:text-sm truncate">{visitor.name}</p>
                          <p className={`text-xs font-medium ${
                            visitor.daysUntilExpiry === 0 
                              ? 'text-red-600' 
                              : visitor.daysUntilExpiry === 1 
                                ? 'text-orange-600'
                                : 'text-yellow-600'
                          }`}>
                            {visitor.daysUntilExpiry === 0 
                              ? 'Expires today!' 
                              : visitor.daysUntilExpiry === 1 
                                ? 'Expires tomorrow'
                                : `Expires in ${visitor.daysUntilExpiry} days`
                            }
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs flex-shrink-0 ${
                        visitor.daysUntilExpiry === 0 
                          ? 'border-red-500 text-red-700' 
                          : visitor.daysUntilExpiry === 1 
                            ? 'border-orange-500 text-orange-700'
                            : 'border-yellow-500 text-yellow-700'
                      }`}>
                        {visitor.subscription_type}
                      </Badge>
                    </div>
                  );
                })
              )}
              {expiringVisitors.length > 5 && (
                <div className="text-center pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleViewExpiringVisitors}
                    className="text-xs"
                  >
                    View {expiringVisitors.length - 5} more expiring subscriptions
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Distribution */}
      <Card className="w-full">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Subscription Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            {['basic', 'premium', 'vip'].map((type) => {
              const count = stats.subscriptionTypes[type as keyof typeof stats.subscriptionTypes];
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              
              return (
                <div key={type} className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize text-sm truncate">{type}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">{count} visitors</span>
                  </div>
                  <Progress value={percentage} className="h-2 w-full" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}