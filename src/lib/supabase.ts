import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ksuyqhahxsbfzcmftjkh.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzdXlxaGFoeHNiZnpjbWZ0amtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzIyODQsImV4cCI6MjA2Njc0ODI4NH0.-htPE6iL4iugQn467Nh2I_x7EhzvVXJmSRksIHOWZgg";

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
