import { getPaymentStatus, paymentStatusIcons, paymentStatusLabels, paymentStatusStyles } from '../utils/booking';

const PaymentBadge = ({ booking, size = 'sm' }) => {
  const status = getPaymentStatus(booking);
  const label = paymentStatusLabels[status];
  const style = paymentStatusStyles[status];
  const icon = paymentStatusIcons[status];

  const sizeClasses = size === 'lg'
    ? 'min-h-9 px-4 py-1.5 text-sm gap-2'
    : 'min-h-7 px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-semibold transition-all duration-200 ${style} ${sizeClasses}`}
    >
      <span className="text-[0.85em]">{icon}</span>
      {label}
    </span>
  );
};

export default PaymentBadge;
