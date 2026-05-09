'use client';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const autoVariant: Record<string, StatusBadgeProps['variant']> = {
  active: 'success', approved: 'success', verified: 'success', converted: 'success', open: 'success',
  pending: 'warning', contacted: 'warning', qualified: 'warning', negotiation: 'warning', paused: 'warning',
  suspended: 'danger', banned: 'danger', rejected: 'danger', failed: 'danger', lost: 'danger', expired: 'danger',
  new: 'info', created: 'info',
};

export function StatusBadge({ status, variant, size = 'sm', dot = true }: StatusBadgeProps) {
  const resolved = variant || autoVariant[status.toLowerCase()] || 'neutral';
  return (
    <span className={`ops-status-badge ${resolved} ${size}`}>
      {dot && <span className="ops-status-dot" />}
      {status}
    </span>
  );
}
