-- MetalHub Ops Dashboard Schema Extensions
-- RBAC, CRM Pipeline, Enhanced Audit Logging, Notifications

-- ============================================
-- 18. OPS ROLES (RBAC)
-- ============================================
CREATE TABLE IF NOT EXISTS ops_roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ops_permissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  module TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ops_permissions_module ON ops_permissions(module);
CREATE INDEX IF NOT EXISTS idx_ops_permissions_resource ON ops_permissions(resource);

CREATE TABLE IF NOT EXISTS ops_role_permissions (
  role_id TEXT NOT NULL REFERENCES ops_roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES ops_permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS ops_user_roles (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES ops_roles(id) ON DELETE CASCADE,
  granted_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- 19. CRM LEADS (Sales Pipeline)
-- ============================================
DO $$ BEGIN
  CREATE TYPE lead_stage AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'CONVERTED', 'LOST');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  source TEXT DEFAULT 'MANUAL',
  stage lead_stage DEFAULT 'NEW',
  deal_value DECIMAL(12, 2),
  probability INT DEFAULT 0,
  assigned_to TEXT REFERENCES users(id),
  notes TEXT,
  next_follow_up TIMESTAMPTZ,
  lost_reason TEXT,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

CREATE TABLE IF NOT EXISTS lead_activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_user_id ON lead_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at);

-- ============================================
-- 20. ENHANCED AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- 21. NOTIFICATION SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- SEED: System Roles + Permissions
-- ============================================
INSERT INTO ops_roles (name, display_name, description, is_system) VALUES
  ('super_admin', 'Super Admin', 'Full platform access — all modules, all actions', true),
  ('finance_admin', 'Finance Admin', 'Revenue operations, payouts, transactions', true),
  ('moderator', 'Moderator', 'Listing moderation, content review, user reports', true),
  ('support_agent', 'Support Agent', 'Support tickets, user assistance, escalations', true),
  ('sales_manager', 'Sales Manager', 'Full CRM access — pipeline, customers, analytics', true),
  ('crm_agent', 'CRM Agent', 'Lead management, customer profiles', true),
  ('marketing', 'Marketing', 'Campaign management, CMS, content', true),
  ('analyst', 'Analyst', 'Read-only access across all modules', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO ops_permissions (code, module, resource, action, description) VALUES
  -- Admin permissions
  ('admin.dashboard.read', 'admin', 'dashboard', 'read', 'View admin command center'),
  ('admin.users.read', 'admin', 'users', 'read', 'View user list and profiles'),
  ('admin.users.write', 'admin', 'users', 'write', 'Edit user details'),
  ('admin.users.suspend', 'admin', 'users', 'suspend', 'Suspend user accounts'),
  ('admin.users.ban', 'admin', 'users', 'ban', 'Ban user accounts'),
  ('admin.users.impersonate', 'admin', 'users', 'impersonate', 'Impersonate user sessions'),
  ('admin.listings.read', 'admin', 'listings', 'read', 'View listing moderation queue'),
  ('admin.listings.approve', 'admin', 'listings', 'approve', 'Approve pending listings'),
  ('admin.listings.reject', 'admin', 'listings', 'reject', 'Reject listings'),
  ('admin.moderation.read', 'admin', 'moderation', 'read', 'View moderation queue'),
  ('admin.moderation.action', 'admin', 'moderation', 'action', 'Take moderation actions'),
  ('admin.security.read', 'admin', 'security', 'read', 'View security dashboard'),
  ('admin.security.manage', 'admin', 'security', 'manage', 'Manage security settings'),
  ('admin.finance.read', 'admin', 'finance', 'read', 'View financial data'),
  ('admin.finance.export', 'admin', 'finance', 'export', 'Export financial reports'),
  ('admin.audit.read', 'admin', 'audit', 'read', 'View audit logs'),
  ('admin.cms.read', 'admin', 'cms', 'read', 'View CMS content'),
  ('admin.cms.write', 'admin', 'cms', 'write', 'Edit CMS content'),
  ('admin.support.read', 'admin', 'support', 'read', 'View support tickets'),
  ('admin.support.manage', 'admin', 'support', 'manage', 'Manage support tickets'),
  ('admin.settings.read', 'admin', 'settings', 'read', 'View platform settings'),
  ('admin.settings.write', 'admin', 'settings', 'write', 'Edit platform settings'),
  -- CRM permissions
  ('crm.dashboard.read', 'crm', 'dashboard', 'read', 'View CRM command center'),
  ('crm.leads.read', 'crm', 'leads', 'read', 'View lead pipeline'),
  ('crm.leads.write', 'crm', 'leads', 'write', 'Create and edit leads'),
  ('crm.leads.delete', 'crm', 'leads', 'delete', 'Delete leads'),
  ('crm.customers.read', 'crm', 'customers', 'read', 'View customer profiles'),
  ('crm.customers.write', 'crm', 'customers', 'write', 'Edit customer data'),
  ('crm.revenue.read', 'crm', 'revenue', 'read', 'View revenue analytics'),
  ('crm.campaigns.read', 'crm', 'campaigns', 'read', 'View campaigns'),
  ('crm.campaigns.write', 'crm', 'campaigns', 'write', 'Manage campaigns'),
  ('crm.tasks.read', 'crm', 'tasks', 'read', 'View tasks'),
  ('crm.tasks.write', 'crm', 'tasks', 'write', 'Manage tasks'),
  ('crm.analytics.read', 'crm', 'analytics', 'read', 'View sales analytics')
ON CONFLICT (code) DO NOTHING;

-- Link super_admin to ALL permissions
INSERT INTO ops_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM ops_roles r CROSS JOIN ops_permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Link moderator to moderation + listing permissions
INSERT INTO ops_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM ops_roles r CROSS JOIN ops_permissions p
WHERE r.name = 'moderator' AND p.code IN (
  'admin.dashboard.read', 'admin.listings.read', 'admin.listings.approve',
  'admin.listings.reject', 'admin.moderation.read', 'admin.moderation.action',
  'admin.users.read'
) ON CONFLICT DO NOTHING;

-- Link sales_manager to all CRM permissions
INSERT INTO ops_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM ops_roles r CROSS JOIN ops_permissions p
WHERE r.name = 'sales_manager' AND p.module = 'crm'
ON CONFLICT DO NOTHING;

-- Link analyst to all read permissions
INSERT INTO ops_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM ops_roles r CROSS JOIN ops_permissions p
WHERE r.name = 'analyst' AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- Link finance_admin
INSERT INTO ops_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM ops_roles r CROSS JOIN ops_permissions p
WHERE r.name = 'finance_admin' AND p.code IN (
  'admin.dashboard.read', 'admin.finance.read', 'admin.finance.export',
  'crm.revenue.read', 'crm.dashboard.read'
) ON CONFLICT DO NOTHING;

-- Link support_agent
INSERT INTO ops_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM ops_roles r CROSS JOIN ops_permissions p
WHERE r.name = 'support_agent' AND p.code IN (
  'admin.dashboard.read', 'admin.support.read', 'admin.support.manage',
  'admin.users.read'
) ON CONFLICT DO NOTHING;
