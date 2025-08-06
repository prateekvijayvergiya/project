import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVisitors } from '@/hooks/useVisitors';
import { 
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  Activity,
  Award
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function Statistics() {
  const { visitors, stats, loading } = useVisitors();

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 pb-16 lg:pb-6 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {[...Array(6)].map((_, i) => (
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

  // Calculate additional statistics
  const thisMonth = {
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  };

  const newVisitorsThisMonth = visitors.filter(visitor => 
    isWithinInterval(new Date(visitor.created_at), thisMonth)
  ).length;

  const activeThisWeek = visitors.filter(visitor => 
    visitor.status === 'active' && 
    isWithinInterval(new Date(visitor.created_at), {
      start: subDays(new Date(), 7),
      end: new Date()
    })
  ).length;

  const subscriptionTypes = {
    gym: visitors.filter(v => v.subscription_type === 'gym').length,
    cardio: visitors.filter(v => v.subscription_type === 'cardio').length,
    gym_and_cardio: visitors.filter(v => v.subscription_type === 'gym_and_cardio').length,
  };

  const averageDuration = visitors.length > 0 
    ? Math.round(visitors.reduce((sum, visitor) => sum + visitor.duration, 0) / visitors.length)
    : 0;

  const topVisitors = visitors
    .filter(v => v.status === 'active')
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);

  return (
    <div className="space-y-3 sm:space-y-4 pb-16 lg:pb-6 w-full">
      <div className="w-full px-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Statistics</h1>
        <p className="text-gray-600 mt-1 text-sm">Comprehensive gym analytics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 w-full">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-blue-100 text-xs truncate">Total Visitors</p>
                <p className="text-lg sm:text-xl font-bold">{stats.total}</p>
                <p className="text-xs text-blue-200 mt-1 truncate">
                  {stats.active} active
                </p>
              </div>
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-green-100 text-xs truncate">New This Month</p>
                <p className="text-lg sm:text-xl font-bold">{newVisitorsThisMonth}</p>
                <p className="text-xs text-green-200 mt-1 truncate">
                  {format(new Date(), 'MMMM yyyy')}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white col-span-2 lg:col-span-1">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-purple-100 text-xs truncate">Active This Week</p>
                <p className="text-lg sm:text-xl font-bold">{activeThisWeek}</p>
                <p className="text-xs text-purple-200 mt-1 truncate">
                  Last 7 days
                </p>
              </div>
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-purple-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 w-full">
        {/* Subscription Distribution */}
        <Card className="w-full">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Subscription Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(subscriptionTypes).map(([type, count]) => {
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const colors = {
                  gym: 'bg-gray-500',
                  cardio: 'bg-blue-500',
                  gym_and_cardio: 'bg-purple-500'
                };
                
                return (
                  <div key={type} className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className={`w-3 h-3 rounded-full ${colors[type as keyof typeof colors]} flex-shrink-0`}></div>
                        <span className="font-medium capitalize text-sm truncate">
                          {type === 'gym' ? 'Gym' : type === 'cardio' ? 'Cardio' : 'Gym & Cardio'}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2 w-full" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Visitors */}
        <Card className="w-full">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Award className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Longest Subscriptions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              {topVisitors.length === 0 ? (
                <p className="text-gray-500 text-center py-3 text-sm">No active visitors</p>
              ) : (
                topVisitors.map((visitor, index) => (
                  <div key={visitor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg w-full">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{visitor.name}</p>
                        <p className="text-xs text-gray-500">{visitor.duration} month{visitor.duration > 1 ? 's' : ''}</p>
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
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full">
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4 text-center">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mx-auto mb-2 flex-shrink-0" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{averageDuration}</p>
            <p className="text-xs sm:text-sm text-gray-600">Average Duration (months)</p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-3 sm:p-4 text-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mx-auto mb-2 flex-shrink-0" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Active Visitor Rate</p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-3 sm:p-4 text-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mx-auto mb-2 flex-shrink-0" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{activeThisWeek}</p>
            <p className="text-xs sm:text-sm text-gray-600">Weekly Active Users</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}