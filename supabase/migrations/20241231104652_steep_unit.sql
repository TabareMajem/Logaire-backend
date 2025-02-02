/*
  # User Management System Migration

  1. Tables
    - user_profiles: Extended user information
    - user_permissions: Granular user permissions
    - user_roles: Role definitions and permissions
    - user_sessions: User session tracking
    - auth_audit_logs: Authentication audit trail

  2. Security
    - RLS enabled on all tables
    - User-specific access policies
    - Admin override policies
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  first_name text,
  last_name text,
  company_id uuid,
  role text NOT NULL DEFAULT 'user',
  status text NOT NULL DEFAULT 'active',
  preferences jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user permissions table
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  subject text NOT NULL,
  conditions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, action, subject)
);

-- Create user roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  ip_address text,
  user_agent text,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create auth audit logs table
CREATE TABLE IF NOT EXISTS public.auth_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event_type ON auth_audit_logs(event_type);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
    DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
    DROP POLICY IF EXISTS "Users can view their own audit logs" ON auth_audit_logs;
    DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can manage all permissions" ON user_permissions;
    DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

    -- Create new policies
    CREATE POLICY "Users can view their own profile"
      ON user_profiles FOR SELECT
      TO authenticated
      USING (id = auth.uid());

    CREATE POLICY "Users can update their own profile"
      ON user_profiles FOR UPDATE
      TO authenticated
      USING (id = auth.uid());

    CREATE POLICY "Users can view their own permissions"
      ON user_permissions FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());

    CREATE POLICY "Users can view their own sessions"
      ON user_sessions FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());

    CREATE POLICY "Users can view their own audit logs"
      ON auth_audit_logs FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());

    CREATE POLICY "Admins can manage all profiles"
      ON user_profiles FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );

    CREATE POLICY "Admins can manage all permissions"
      ON user_permissions FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );

    CREATE POLICY "Admins can manage all roles"
      ON user_roles FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
END
$$;

-- Create functions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id uuid)
RETURNS TABLE (
  action text,
  subject text,
  conditions jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT p.action, p.subject, p.conditions
  FROM user_permissions p
  WHERE p.user_id = user_id
  UNION
  SELECT p.action, p.subject, p.conditions
  FROM user_profiles up
  JOIN user_roles ur ON up.role = ur.name
  CROSS JOIN LATERAL jsonb_to_recordset(ur.permissions) AS p(action text, subject text, conditions jsonb)
  WHERE up.id = user_id;
END;
$$;

-- Insert default roles
INSERT INTO user_roles (name, description, permissions)
VALUES 
  ('admin', 'Full system access', '[{"action": "manage", "subject": "all"}]'::jsonb),
  ('manager', 'Department manager access', '[
    {"action": "read", "subject": "dashboard"},
    {"action": "create", "subject": "shipments"},
    {"action": "read", "subject": "shipments"},
    {"action": "update", "subject": "shipments"},
    {"action": "create", "subject": "bookings"},
    {"action": "read", "subject": "bookings"},
    {"action": "update", "subject": "bookings"},
    {"action": "read", "subject": "reports"}
  ]'::jsonb),
  ('user', 'Standard user access', '[
    {"action": "read", "subject": "dashboard"},
    {"action": "read", "subject": "shipments"},
    {"action": "read", "subject": "bookings"}
  ]'::jsonb)
ON CONFLICT (name) DO NOTHING;