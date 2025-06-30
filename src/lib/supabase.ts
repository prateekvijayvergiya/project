import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export interface Visitor {
  id: string;
  name: string;
  phone: string;
  start_date: string;
  subscription_type: "basic" | "premium" | "vip";
  duration: number;
  status: "active" | "inactive" | "expired";
  notes: string;
  created_at: string;
  user_id: string;
}

export type VisitorInsert = Omit<Visitor, "id" | "created_at">;
export type VisitorUpdate = Partial<VisitorInsert>;
