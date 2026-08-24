interface StatusBadgeProps {
  status: string;
  variant?: 'booking' | 'inquiry' | 'payment';
}

const BOOKING_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  no_show: 'bg-gray-100 text-gray-600 border-gray-200',
};

const INQUIRY_STYLES: Record<string, string> = {
  new: 'bg-rose-100 text-rose-700 border-rose-200',
  responded: 'bg-blue-100 text-blue-800 border-blue-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
};

const PAYMENT_STYLES: Record<string, string> = {
  unpaid: 'bg-gray-100 text-gray-600 border-gray-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  refunded: 'bg-amber-100 text-amber-800 border-amber-200',
};

const LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
  new: 'New',
  responded: 'Responded',
  closed: 'Closed',
  unpaid: 'Unpaid',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

export default function StatusBadge({ status, variant = 'booking' }: StatusBadgeProps) {
  const styles =
    variant === 'inquiry'
      ? INQUIRY_STYLES
      : variant === 'payment'
        ? PAYMENT_STYLES
        : BOOKING_STYLES;

  const cls = styles[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const label = LABELS[status] ?? status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border ${cls}`}
    >
      {label}
    </span>
  );
}
