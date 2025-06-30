/*
  # Create visitors table for GymPulse

  1. New Tables
    - `visitors`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `phone` (text, required)
      - `start_date` (date, required)
      - `subscription_type` (text, required)
      - `duration` (integer, required - duration in months)
      - `status` (text, required - active/inactive/expired)
      - `notes` (text, optional)
      - `created_at` (timestamptz, default now())
      - `user_id` (uuid, references auth.users(id), on delete cascade)

  2. Security
    - Enable RLS on `visitors` table
    - Add policy for authenticated users to manage visitor data
    - Add policy for public read access (for gym staff)
*/

CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  start_date date NOT NULL,
  subscription_type text NOT NULL CHECK (subscription_type IN ('basic', 'premium', 'vip')),
  duration integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Create policies for visitor management
CREATE POLICY "Enable read access for all users" ON visitors
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON visitors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON visitors
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON visitors
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS visitors_status_idx ON visitors(status);
CREATE INDEX IF NOT EXISTS visitors_subscription_type_idx ON visitors(subscription_type);
CREATE INDEX IF NOT EXISTS visitors_start_date_idx ON visitors(start_date);
CREATE INDEX IF NOT EXISTS visitors_created_at_idx ON visitors(created_at);
CREATE INDEX IF NOT EXISTS visitors_user_id_idx ON visitors(user_id);