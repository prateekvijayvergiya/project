import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Visitor } from '@/lib/supabase';
import { addMonths, differenceInDays } from 'date-fns';

interface VisitorsContextType {
  visitors: Visitor[];
  stats: {
    total: number;
    active: number;
    expired: number;
    inactive: number;
    subscriptionTypes: {
      gym: number;
      cardio: number;
      gym_and_cardio: number;
    };
  };
  loading: boolean;
  fetchVisitors: () => Promise<void>;
  addVisitor: (visitor: Omit<Visitor, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  updateVisitor: (id: string, updates: Partial<Visitor>) => Promise<void>;
  deleteVisitor: (id: string) => Promise<void>;
}

const VisitorsContext = createContext<VisitorsContextType | undefined>(undefined);

function getStats(visitors: Visitor[]) {
  const total = visitors.length;
  const active = visitors.filter((v) => v.status === 'active' && !isExpired(v.start_date, v.duration)).length;
  const expired = visitors.filter((v) => v.status === 'expired' || isExpired(v.start_date, v.duration)).length;
  const inactive = visitors.filter((v) => v.status === 'inactive' && !isExpired(v.start_date, v.duration)).length;
  const subscriptionTypes = {
    gym: visitors.filter((v) => v.subscription_type === 'gym').length,
    cardio: visitors.filter((v) => v.subscription_type === 'cardio').length,
    gym_and_cardio: visitors.filter((v) => v.subscription_type === 'gym_and_cardio').length,
  };
  return { total, active, expired, inactive, subscriptionTypes };
}

function isExpired(startDate: string, duration: number) {
  const expiryDate = addMonths(new Date(startDate), duration);
  const today = new Date();
  return differenceInDays(expiryDate, today) < 0;
}

export function VisitorsProvider({ children }: { children: React.ReactNode }) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check for expired subscriptions and update them
      const updatedVisitors = data.map(visitor => {
        if (visitor.status === 'active' && isExpired(visitor.start_date, visitor.duration)) {
          // Update the visitor status to expired in the database
          (async () => {
            try {
              await supabase
                .from('visitors')
                .update({ status: 'expired' })
                .eq('id', visitor.id);
              console.log(`Updated visitor ${visitor.name} to expired status`);
            } catch (error) {
              console.error(`Error updating visitor ${visitor.name} to expired status:`, error);
            }
          })();
          
          return { ...visitor, status: 'expired' as const };
        }
        return visitor;
      });

      setVisitors(updatedVisitors);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addVisitor = async (visitorData: Omit<Visitor, 'id' | 'created_at' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('visitors')
        .insert([{ ...visitorData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setVisitors(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding visitor:', error);
      throw error;
    }
  };

  const updateVisitor = async (id: string, updates: Partial<Visitor>) => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setVisitors(prev => prev.map(v => v.id === id ? data : v));
    } catch (error) {
      console.error('Error updating visitor:', error);
      throw error;
    }
  };

  const deleteVisitor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('visitors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setVisitors(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting visitor:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const stats = getStats(visitors);

  const value = {
    visitors,
    stats,
    loading,
    fetchVisitors,
    addVisitor,
    updateVisitor,
    deleteVisitor,
  };

  return <VisitorsContext.Provider value={value}>{children}</VisitorsContext.Provider>;
}

export function useVisitors() {
  const context = useContext(VisitorsContext);
  if (context === undefined) {
    throw new Error('useVisitors must be used within a VisitorsProvider');
  }
  return context;
} 