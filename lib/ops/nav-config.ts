// Ops Dashboard navigation configuration
import {
  LayoutDashboard, Users, Package, Shield, ShieldCheck, Lock, DollarSign,
  ScrollText, FileText, Headphones, Target, UserCircle,
  TrendingUp, Mail, CheckSquare, Calendar, BarChart3,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
}

export const adminNavItems: NavItem[] = [
  { label: 'Command Center', href: '/ops/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/ops/admin/users', icon: Users },
  { label: 'Listings', href: '/ops/admin/listings', icon: Package },
  { label: 'Moderation', href: '/ops/admin/moderation', icon: Shield },
  { label: 'Verification', href: '/ops/admin/verification', icon: ShieldCheck },
  { label: 'Security', href: '/ops/admin/security', icon: Lock },
  { label: 'Finance', href: '/ops/admin/finance', icon: DollarSign },
  { label: 'Audit Logs', href: '/ops/admin/audit', icon: ScrollText },
  { label: 'CMS', href: '/ops/admin/cms', icon: FileText },
  { label: 'Support', href: '/ops/admin/support', icon: Headphones },
];

export const crmNavItems: NavItem[] = [
  { label: 'Command Center', href: '/ops/crm', icon: LayoutDashboard },
  { label: 'Pipeline', href: '/ops/crm/pipeline', icon: Target },
  { label: 'Customers', href: '/ops/crm/customers', icon: UserCircle },
  { label: 'Revenue', href: '/ops/crm/revenue', icon: TrendingUp },
  { label: 'Campaigns', href: '/ops/crm/campaigns', icon: Mail },
  { label: 'Tasks', href: '/ops/crm/tasks', icon: CheckSquare },
  { label: 'Meetings', href: '/ops/crm/meetings', icon: Calendar },
  { label: 'Analytics', href: '/ops/crm/analytics', icon: BarChart3 },
];
