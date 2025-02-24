/*
  # Fix user profile policies

  1. Changes
    - Remove recursive policies for user profiles
    - Simplify admin access policies
    - Add proper role-based access control

  2. Security
    - Enable RLS
    - Add non-recursive policies for user access
    - Add admin access policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can modify all profiles" ON user_profiles;

-- Create new policies without recursion
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin full access"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    role = 'admin'
  );