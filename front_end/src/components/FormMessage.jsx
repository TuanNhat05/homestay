import { AlertCircle, CheckCircle2 } from 'lucide-react';

const FormMessage = ({ type = 'error', children }) => {
  if (!children) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium animate-scaleIn ${
        isSuccess
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
      }`}
    >
      {isSuccess ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
      {children}
    </div>
  );
};

export default FormMessage;
