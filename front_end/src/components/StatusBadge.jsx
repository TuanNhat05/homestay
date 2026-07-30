import { bookingStatusLabels, bookingStatusStyles } from '../utils/booking';

const StatusBadge = ({ status }) => {
  const isUsing = status === 'using';

  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
        bookingStatusStyles[status] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'
      }`}
    >
      {isUsing && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
        </span>
      )}
      {!isUsing && (
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            status === 'cancelled' ? 'bg-rose-400' :
            status === 'completed' ? 'bg-green-400' :
            status === 'deposited' || status === 'confirmed' ? 'bg-emerald-400' :
            status === 'waiting_deposit' ? 'bg-amber-400' :
            status === 'consulting' ? 'bg-sky-400' :
            'bg-slate-400'
          }`}
        />
      )}
      {bookingStatusLabels[status] || status}
    </span>
  );
};

export default StatusBadge;
