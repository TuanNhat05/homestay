export const formatCurrency = (value = 0) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDateTime = (value) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const formatTime = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

export const getDurationHours = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  return (end - start) / (1000 * 60 * 60);
};

export const getBookingTimeError = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return 'Vui lòng chọn thời gian bắt đầu và kết thúc';
  }

  const durationHours = getDurationHours(startTime, endTime);

  if (durationHours <= 0) {
    return 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu';
  }

  if (durationHours < 1) {
    return 'Thời gian thuê tối thiểu là 1 tiếng';
  }

  return '';
};

export const bookingStatusLabels = {
  new: 'Khách mới hỏi',
  consulting: 'Đang tư vấn',
  waiting_deposit: 'Chờ cọc',
  deposited: 'Đã cọc',
  confirmed: 'Đã xác nhận',
  using: 'Đang sử dụng',
  completed: 'Đã trả phòng',
  cancelled: 'Đã hủy',
};

export const bookingStatusStyles = {
  new: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  consulting: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  waiting_deposit: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  deposited: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  confirmed: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  using: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  completed: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export const bookingStatusColors = {
  new: '#94a3b8',
  consulting: '#38bdf8',
  waiting_deposit: '#fbbf24',
  deposited: '#34d399',
  confirmed: '#2dd4bf',
  using: '#818cf8',
  completed: '#4ade80',
  cancelled: '#fb7185',
};

export const statusOptions = Object.keys(bookingStatusLabels);

// ─── Payment Status helpers ───
export const getPaymentStatus = (booking) => {
  if (!booking) return 'unpaid';

  if (booking.status === 'completed' && booking.depositAmount >= booking.totalPrice) {
    return 'paid';
  }

  if (booking.depositAmount > 0) {
    return 'deposited';
  }

  return 'unpaid';
};

export const paymentStatusLabels = {
  paid: 'Đã thanh toán',
  deposited: 'Đã cọc',
  unpaid: 'Chưa thanh toán',
};

export const paymentStatusStyles = {
  paid: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  deposited: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  unpaid: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export const paymentStatusIcons = {
  paid: '✓',
  deposited: '◑',
  unpaid: '✕',
};
