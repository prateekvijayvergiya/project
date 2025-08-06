import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVisitors } from '@/hooks/useVisitors';
import { useExpiryAlerts } from '@/hooks/useExpiryAlerts';
import { ExpiryAlertBanner } from '@/components/alerts/ExpiryAlertBanner';
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  CheckCircle,
  Calendar
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

  // Helper for mapping old and new subscription types to display
  const getSubscriptionTypeDisplay = (type: string) => {
    if (type === 'basic' || type === 'gym') return 'Gym';
    if (type === 'premium' || type === 'cardio') return 'Cardio';
    if (type === 'vip' || type === 'gym_and_cardio') return 'Gym and Cardio';
    return type;
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

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-red-100 text-xs truncate">Expired Visitors</p>
                <p className="text-lg sm:text-xl font-bold">{stats.expired}</p>
              </div>
              <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-red-200 flex-shrink-0" />
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
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Visitors and Expiring Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
        {/* Recent Visitors */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-3 sm:p-4">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">Recent Active Visitors</h3>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  Latest {recentVisitors.length} active visitors
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {recentVisitors.length > 0 ? (
              <div className="space-y-2">
                {recentVisitors.map((visitor) => (
                  <div key={visitor.id} className="flex items-center justify-between p-2 border rounded-lg bg-white">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center border flex-shrink-0">
                        <span className="text-blue-600 font-medium text-xs">
                          {visitor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{visitor.name}</p>
                        <p className="text-xs text-gray-500">Joined {format(new Date(visitor.start_date), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {getSubscriptionTypeDisplay(visitor.subscription_type)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No active visitors yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Subscriptions */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b p-3 sm:p-4">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-1.5 bg-orange-100 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">Expiring Subscriptions</h3>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {expiringVisitors.length} subscription{expiringVisitors.length !== 1 ? 's' : ''} expiring soon
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {expiringVisitors.length > 0 ? (
              <div className="space-y-2">
                {expiringVisitors.slice(0, 5).map((visitor) => {
                  let urgencyColor = 'bg-yellow-50 border-yellow-200';
                  let textColor = 'text-yellow-800';
                  
                  if (visitor.daysUntilExpiry === 0) {
                    urgencyColor = 'bg-red-50 border-red-200';
                    textColor = 'text-red-800';
                  } else if (visitor.daysUntilExpiry === 1) {
                    urgencyColor = 'bg-orange-50 border-orange-200';
                    textColor = 'text-orange-800';
                  } else if (visitor.daysUntilExpiry === 2) {
                    urgencyColor = 'bg-yellow-50 border-yellow-200';
                    textColor = 'text-yellow-800';
                  }

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
                          <p className={`text-xs font-medium ${textColor}`}>
                            {visitor.daysUntilExpiry === 0 
                              ? 'Expires today!' 
                              : visitor.daysUntilExpiry === 1 
                                ? 'Expires tomorrow'
                                : `Expires in ${visitor.daysUntilExpiry} days`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Badge variant="outline" className={`text-xs ${
                          visitor.daysUntilExpiry === 0 
                            ? 'border-red-500 text-red-700' 
                            : visitor.daysUntilExpiry === 1 
                              ? 'border-orange-500 text-orange-700'
                              : 'border-yellow-500 text-yellow-700'
                        }`}>
                          {getSubscriptionTypeDisplay(visitor.subscription_type)}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => {
                            // setRenewDialog({ open: true, visitorId: visitor.id });
                            // setRenewType(visitor.subscription_type as 'basic' | 'premium' | 'vip');
                            // setRenewDuration(visitor.duration);
                          }}
                          className="text-xs h-6 px-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Renew
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No subscriptions expiring soon</p>
              </div>
            )}
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
            {(() => {
              // Create a local mapping for both old and new keys
              const subStats: Record<string, number> = {
                gym: stats.subscriptionTypes.gym || 0,
                cardio: stats.subscriptionTypes.cardio || 0,
                gym_and_cardio: stats.subscriptionTypes.gym_and_cardio || 0,
                basic: 0,
                premium: 0,
                vip: 0,
              };
              // If old keys exist, add them to the new ones
              if ('basic' in stats.subscriptionTypes) subStats.gym += (stats.subscriptionTypes as any).basic || 0;
              if ('premium' in stats.subscriptionTypes) subStats.cardio += (stats.subscriptionTypes as any).premium || 0;
              if ('vip' in stats.subscriptionTypes) subStats.gym_and_cardio += (stats.subscriptionTypes as any).vip || 0;
              return ['gym', 'cardio', 'gym_and_cardio'].map((type) => {
                const count = subStats[type] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={type} className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize text-sm truncate">{getSubscriptionTypeDisplay(type)}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">{count} visitors</span>
                    </div>
                    <Progress value={percentage} className="h-2 w-full" />
                  </div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}