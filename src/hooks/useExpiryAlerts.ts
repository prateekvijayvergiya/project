import { useState, useEffect } from "react";
import { useVisitors } from "./useVisitors";
import { addMonths, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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

function isExpired(startDate: string, duration: number) {
  const expiryDate = addMonths(new Date(startDate), duration);
  const today = new Date();
  return differenceInDays(expiryDate, today) < 0;
}

export function useExpiryAlerts() {
  const { visitors } = useVisitors();
  const { user } = useAuth();
  const [expiringVisitors, setExpiringVisitors] = useState<ExpiringVisitor[]>(
    []
  );
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Always update expiringVisitors when visitors changes
  useEffect(() => {
    const today = new Date();
    const expiring = visitors
      .filter(
        (visitor) =>
          visitor.status === "active" &&
          !isExpired(visitor.start_date, visitor.duration)
      )
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
      .filter(
        (visitor) =>
          visitor.daysUntilExpiry >= 0 && visitor.daysUntilExpiry <= 3
      )
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    setExpiringVisitors(expiring);
  }, [visitors]);

  // Only show the toast once per user login/session
  useEffect(() => {
    if (!user) return;
    const alertKey = `expiryAlertShown_${user.id}`;
    if (
      visitors.length > 0 &&
      !alertDismissed &&
      !sessionStorage.getItem(alertKey)
    ) {
      // Use the same logic as above to get expiring visitors
      const today = new Date();
      const expiring = visitors
        .filter(
          (visitor) =>
            visitor.status === "active" &&
            !isExpired(visitor.start_date, visitor.duration)
        )
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
        .filter(
          (visitor) =>
            visitor.daysUntilExpiry >= 0 && visitor.daysUntilExpiry <= 3
        )
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
      if (expiring.length > 0) {
        const expiringToday = expiring.filter((v) => v.daysUntilExpiry === 0);
        const expiringTomorrow = expiring.filter(
          (v) => v.daysUntilExpiry === 1
        );
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
        sessionStorage.setItem(alertKey, "true");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitors, user]);

  const dismissAlert = () => {
    setAlertDismissed(true);
    // Reset dismissal after 4 hours
    setTimeout(() => {
      setAlertDismissed(false);
    }, 4 * 60 * 60 * 1000);
  };

  const refreshCheck = () => {
    setAlertDismissed(false);
    // Re-run the effect by updating visitors (handled by context)
  };

  return {
    expiringVisitors,
    hasExpiringVisitors: expiringVisitors.length > 0,
    alertDismissed,
    dismissAlert,
    refreshCheck,
  };
}
