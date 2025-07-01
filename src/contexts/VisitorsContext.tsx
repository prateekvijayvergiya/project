import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, type Visitor, type VisitorInsert, type VisitorUpdate } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VisitorsContextType {
  visitors: Visitor[];
  loading: boolean;
  error: string | null;
  addVisitor: (visitor: VisitorInsert) => Promise<Visitor | undefined>;
  updateVisitor: (id: string, updates: VisitorUpdate) => Promise<Visitor | undefined>;
  deleteVisitor: (id: string) => Promise<void>;
  refreshVisitors: () => Promise<void>;
  stats: ReturnType<typeof getStats>;
}

const VisitorsContext = createContext<VisitorsContextType | undefined>(undefined);

function getStats(visitors: Visitor[]) {
  const total = visitors.length;
  const active = visitors.filter((v) => v.status === 'active').length;
  const expired = visitors.filter((v) => v.status === 'expired').length;
  const inactive = visitors.filter((v) => v.status === 'inactive').length;
  const subscriptionTypes = {
    basic: visitors.filter((v) => v.subscription_type === 'basic').length,
    premium: visitors.filter((v) => v.subscription_type === 'premium').length,
    vip: visitors.filter((v) => v.subscription_type === 'vip').length,
  };
  return { total, active, expired, inactive, subscriptionTypes };
}

export function VisitorsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisitors = useCallback(async () => {
    if (!user) {
      setVisitors([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVisitors(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to fetch visitors');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const addVisitor = async (visitor: VisitorInsert) => {
    if (!user) {
      toast.error('You must be logged in to add visitors');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('visitors')
        .insert([{ ...visitor, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      setVisitors((prev) => [data, ...prev]);
      toast.success('Visitor added successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add visitor';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const updateVisitor = async (id: string, updates: VisitorUpdate) => {
    if (!user) {
      toast.error('You must be logged in to update visitors');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('visitors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setVisitors((prev) => prev.map((visitor) => (visitor.id === id ? data : visitor)));
      toast.success('Visitor updated successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update visitor';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const deleteVisitor = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete visitors');
      return;
    }
    try {
      const { error } = await supabase.from('visitors').delete().eq('id', id);
      if (error) throw error;
      setVisitors((prev) => prev.filter((visitor) => visitor.id !== id));
      toast.success('Visitor deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete visitor';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  return (
    <VisitorsContext.Provider
      value={{
        visitors,
        loading,
        error,
        addVisitor,
        updateVisitor,
        deleteVisitor,
        refreshVisitors: fetchVisitors,
        stats: getStats(visitors),
      }}
    >
      {children}
    </VisitorsContext.Provider>
  );
}

export function useVisitors() {
  const context = useContext(VisitorsContext);
  if (context === undefined) {
    throw new Error('useVisitors must be used within a VisitorsProvider');
  }
  return context;
} 