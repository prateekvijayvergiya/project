/*
  # Update RLS policies for authenticated users

  1. Security Updates
    - Update RLS policies to require authentication
    - Ensure only authenticated users can access visitor data
    - Maintain data security and privacy
*/

-- Add user_id column to visitors table
ALTER TABLE visitors ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS visitors_user_id_idx ON visitors(user_id);

-- Update RLS policies to restrict access to own visitors only
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON visitors;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON visitors;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON visitors;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON visitors;

CREATE POLICY "Users can read their own visitors" ON visitors
  FOR SELECT USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can insert their own visitors" ON visitors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can update their own visitors" ON visitors
  FOR UPDATE USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can delete their own visitors" ON visitors
  FOR DELETE USING (auth.role() = 'authenticated' AND user_id = auth.uid());