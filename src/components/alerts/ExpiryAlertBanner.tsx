import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useExpiryAlerts } from '@/hooks/useExpiryAlerts';
import { 
  AlertTriangle, 
  X, 
  Eye, 
  Clock, 
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExpiryAlertBannerProps {
  onViewExpiring?: (visitorIds: string[]) => void;
  className?: string;
}

export function ExpiryAlertBanner({ onViewExpiring, className }: ExpiryAlertBannerProps) {
  const { 
    expiringVisitors, 
    hasExpiringVisitors, 
    alertDismissed, 
    dismissAlert,
    refreshCheck 
  } = useExpiryAlerts();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!hasExpiringVisitors || alertDismissed) {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshCheck();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleViewExpiring = () => {
    const visitorIds = expiringVisitors.map(v => v.id);
    onViewExpiring?.(visitorIds);
  };

  const expiringToday = expiringVisitors.filter(v => v.daysUntilExpiry === 0);
  const expiringTomorrow = expiringVisitors.filter(v => v.daysUntilExpiry === 1);
  const expiringIn2Days = expiringVisitors.filter(v => v.daysUntilExpiry === 2);
  const expiringIn3Days = expiringVisitors.filter(v => v.daysUntilExpiry === 3);

  const getUrgencyColor = (days: number) => {
    if (days === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (days === 1) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getUrgencyBadge = (days: number) => {
    if (days === 0) return 'bg-red-100 text-red-800 border-red-300';
    if (days === 1) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  return (
    <div className={cn("space-y-2 sm:space-y-3 w-full", className)}>
      {/* Main Alert Banner */}
      <Alert className={cn(
        "border-2 shadow-lg w-full",
        expiringToday.length > 0 
          ? "border-red-200 bg-red-50" 
          : expiringTomorrow.length > 0 
            ? "border-orange-200 bg-orange-50"
            : "border-yellow-200 bg-yellow-50"
      )}>
        <AlertTriangle className={cn(
          "h-4 w-4 flex-shrink-0",
          expiringToday.length > 0 
            ? "text-red-600" 
            : expiringTomorrow.length > 0 
              ? "text-orange-600"
              : "text-yellow-600"
        )} />
        <AlertDescription className="w-full">
          <div className="flex flex-col space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-semibold text-sm sm:text-base",
                  expiringToday.length > 0 
                    ? "text-red-800" 
                    : expiringTomorrow.length > 0 
                      ? "text-orange-800"
                      : "text-yellow-800"
                )}>
                  {expiringVisitors.length} Subscription{expiringVisitors.length > 1 ? 's' : ''} About to Expire!
                </p>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                  {expiringToday.length > 0 && (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs">
                      {expiringToday.length} expire today
                    </Badge>
                  )}
                  {expiringTomorrow.length > 0 && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                      {expiringTomorrow.length} expire tomorrow
                    </Badge>
                  )}
                  {(expiringIn2Days.length > 0 || expiringIn3Days.length > 0) && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                      {expiringIn2Days.length + expiringIn3Days.length} expire in 2-3 days
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-white hover:bg-gray-50 text-xs h-7 px-2"
                >
                  <RefreshCw className={cn("h-3 w-3 mr-1", isRefreshing && "animate-spin")} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="bg-white hover:bg-gray-50 text-xs h-7 px-2"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Hide</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Details</span>
                    </>
                  )}
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleViewExpiring}
                  className={cn(
                    "text-white text-xs h-7 px-2",
                    expiringToday.length > 0 
                      ? "bg-red-600 hover:bg-red-700" 
                      : expiringTomorrow.length > 0 
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-yellow-600 hover:bg-yellow-700"
                  )}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissAlert}
                  className="text-gray-500 hover:text-gray-700 hover:bg-white/50 p-1 h-7 w-7"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Expanded Details */}
      {isExpanded && (
        <Card className="shadow-lg border-0 bg-white w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center space-x-2">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>Expiring Subscriptions Details</span>
                </h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs self-start sm:self-auto">
                  {expiringVisitors.length} total
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {expiringVisitors.map((visitor) => (
                  <div
                    key={visitor.id}
                    className={cn(
                      "p-2 sm:p-3 rounded-lg border-2 transition-all hover:shadow-md",
                      getUrgencyColor(visitor.daysUntilExpiry)
                    )}
                  >
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate text-sm">
                            {visitor.name}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">{visitor.phone}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs flex-shrink-0 ml-1", getUrgencyBadge(visitor.daysUntilExpiry))}
                        >
                          {visitor.subscription_type.charAt(0).toUpperCase()}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs">
                          <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 truncate">
                            Expires: {format(visitor.expiryDate, 'MMM dd, yyyy')}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs">
                          <Clock className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className={cn(
                            "font-medium",
                            visitor.daysUntilExpiry === 0 
                              ? "text-red-700" 
                              : visitor.daysUntilExpiry === 1 
                                ? "text-orange-700"
                                : "text-yellow-700"
                          )}>
                            {visitor.daysUntilExpiry === 0 
                              ? 'Expires today!' 
                              : visitor.daysUntilExpiry === 1 
                                ? 'Expires tomorrow'
                                : `Expires in ${visitor.daysUntilExpiry} days`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t space-y-2 sm:space-y-0">
                <p className="text-xs text-gray-600">
                  Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="text-xs h-7 px-2"
                  >
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Collapse
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleViewExpiring}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-2"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">View in Visitors List</span>
                    <span className="sm:hidden">View List</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}