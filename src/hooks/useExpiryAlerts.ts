import { useState, useEffect } from "react";
import { useVisitors } from "./useVisitors";
import { addMonths, differenceInDays } from "date-fns";
import { toast } from "sonner";

export interface ExpiringVisitor {
  id: string;
  name: string;
  phone: string;
  start_date: string;
  duration: number;
  subscription_type: string;
  expiryDate: Date;
  daysUntilExpiry: number;
}

export function useExpiryAlerts() {
  const { visitors } = useVisitors();
  const [expiringVisitors, setExpiringVisitors] = useState<ExpiringVisitor[]>(
    []
  );
  const [lastAlertTime, setLastAlertTime] = useState<number>(0);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Check for expiring subscriptions
  const checkExpiringSubscriptions = () => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const expiring = visitors
      .filter((visitor) => visitor.status === "active") // Only check active visitors
      .map((visitor) => {
        const expiryDate = addMonths(
          new Date(visitor.start_date),
          visitor.duration
        );
        const daysUntilExpiry = differenceInDays(expiryDate, today);

        return {
          ...visitor,
          expiryDate,
          daysUntilExpiry,
        };
      })
      .filter((visitor) => {
        // Include visitors expiring today or within next 3 days
        return visitor.daysUntilExpiry >= 0 && visitor.daysUntilExpiry <= 3;
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry); // Sort by urgency

    setExpiringVisitors(expiring);

    // Show toast notification if there are new expiring visitors and enough time has passed
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (
      expiring.length > 0 &&
      now - lastAlertTime > oneHour &&
      !alertDismissed
    ) {
      const expiringToday = expiring.filter((v) => v.daysUntilExpiry === 0);
      const expiringTomorrow = expiring.filter((v) => v.daysUntilExpiry === 1);
      const expiringIn2Days = expiring.filter((v) => v.daysUntilExpiry === 2);
      const expiringIn3Days = expiring.filter((v) => v.daysUntilExpiry === 3);

      let message = "";
      if (expiringToday.length > 0) {
        message = `${expiringToday.length} subscription${
          expiringToday.length > 1 ? "s" : ""
        } expire today!`;
      } else if (expiringTomorrow.length > 0) {
        message = `${expiringTomorrow.length} subscription${
          expiringTomorrow.length > 1 ? "s" : ""
        } expire tomorrow!`;
      } else if (expiringIn2Days.length > 0) {
        message = `${expiringIn2Days.length} subscription${
          expiringIn2Days.length > 1 ? "s" : ""
        } expire in 2 days!`;
      } else {
        message = `${expiringIn3Days.length} subscription${
          expiringIn3Days.length > 1 ? "s" : ""
        } expire in 3 days!`;
      }

      toast.warning("Subscription Alert", {
        description: message,
        duration: 6000,
      });

      setLastAlertTime(now);
    }

    return expiring;
  };

  // Run check on component mount and when visitors change
  useEffect(() => {
    if (visitors.length > 0) {
      checkExpiringSubscriptions();
    }
  }, [visitors]);

  // Set up periodic checking (every 30 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (visitors.length > 0) {
        checkExpiringSubscriptions();
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [visitors, lastAlertTime, alertDismissed]);

  const dismissAlert = () => {
    setAlertDismissed(true);
    // Reset dismissal after 4 hours
    setTimeout(() => {
      setAlertDismissed(false);
    }, 4 * 60 * 60 * 1000);
  };

  const refreshCheck = () => {
    setAlertDismissed(false);
    return checkExpiringSubscriptions();
  };

  return {
    expiringVisitors,
    hasExpiringVisitors: expiringVisitors.length > 0,
    alertDismissed,
    dismissAlert,
    refreshCheck,
    checkExpiringSubscriptions,
  };
}
