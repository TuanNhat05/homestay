import { Clock, CreditCard, MessageSquarePlus, Save, User, BedDouble, Phone, Facebook } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import FormMessage from '../components/FormMessage';
import PageHeader from '../components/PageHeader';
import PaymentBadge from '../components/PaymentBadge';
import StatusBadge from '../components/StatusBadge';
import {
  bookingStatusLabels,
  formatCurrency,
  formatDateTime,
  statusOptions,
} from '../utils/booking';

const BookingDetailPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchBooking = async () => {
    const res = await api.get(`/bookings/${id}`);
    setBooking(res.data);
    setStatus(res.data.status);
  };

  useEffect(() => {
    fetchBooking().catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  const updateStatus = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await api.patch(`/bookings/${id}/status`, { status });
      setBooking(res.data);
      setMessage('Đã cập nhật trạng thái');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const addNote = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await api.post(`/bookings/${id}/notes`, { note });
      setBooking(res.data);
      setNote('');
      setMessage('Đã thêm ghi chú');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!booking) {
    return (
      <>
        <PageHeader title="Chi tiết booking" />
        <FormMessage>{error}</FormMessage>
        {!error ? (
          <div className="space-y-3">
            <div className="skeleton h-8 w-48" />
            <div className="skeleton h-40 w-full" />
          </div>
        ) : null}
      </>
    );
  }

  const infoItems = [
    { icon: User, label: 'Khách', value: booking.customer?.name },
    { icon: Phone, label: 'Điện thoại', value: booking.customer?.phone },
    { icon: Facebook, label: 'Facebook', value: booking.customer?.facebookName || '-' },
    { icon: BedDouble, label: 'Phòng', value: booking.room?.roomName },
    { icon: Clock, label: 'Thời lượng', value: `${booking.durationHours} giờ` },
    { icon: User, label: 'Nhân viên', value: booking.assignedStaff?.name },
  ];

  return (
    <>
      <PageHeader
        title={`Booking ${booking.customer?.name || ''}`}
        description={`${booking.room?.roomName || '-'} • ${formatDateTime(booking.startTime)} → ${formatDateTime(booking.endTime)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            <PaymentBadge booking={booking} size="lg" />
          </div>
        }
      />

      <div className="mb-4 space-y-3">
        <FormMessage>{error}</FormMessage>
        <FormMessage type="success">{message}</FormMessage>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          {/* Info cards */}
          <section className="panel p-5">
            <h2 className="mb-5 text-base font-bold gradient-text">Thông tin booking</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {infoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3 rounded-xl bg-surface-hover/50 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-dim">
                      <Icon size={15} />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-ink-dim">{item.label}</div>
                      <div className="mt-0.5 text-sm font-semibold text-ink">{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Money section */}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-surface-border bg-pine/5 p-4">
                <div className="flex items-center gap-2 text-xs text-ink-dim">
                  <CreditCard size={13} />
                  Giá giờ
                </div>
                <div className="mt-1 text-lg font-bold text-pine">{formatCurrency(booking.pricePerHour)}</div>
              </div>
              <div className="rounded-xl border border-surface-border bg-pine/5 p-4">
                <div className="flex items-center gap-2 text-xs text-ink-dim">
                  <CreditCard size={13} />
                  Tổng tiền
                </div>
                <div className="mt-1 text-lg font-bold text-pine">{formatCurrency(booking.totalPrice)}</div>
              </div>
              <div className="rounded-xl border border-surface-border bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 text-xs text-ink-dim">
                  <CreditCard size={13} />
                  Tiền cọc
                </div>
                <div className="mt-1 text-lg font-bold text-amber-400">{formatCurrency(booking.depositAmount)}</div>
              </div>
            </div>
          </section>

          {/* Notes — chat style */}
          <section className="panel p-5">
            <h2 className="mb-5 text-base font-bold gradient-text">Ghi chú nội bộ</h2>
            <div className="space-y-3">
              {booking.notes?.map((item, index) => (
                <div
                  key={`${item.createdAt}-${index}`}
                  className="rounded-xl border border-surface-border bg-surface-hover/30 p-4 transition-colors duration-200 hover:bg-surface-hover/50"
                >
                  <div className="mb-2 flex flex-wrap justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-ocean">
                      <div className="h-5 w-5 rounded-md bg-ocean/15 flex items-center justify-center text-[10px]">
                        {(item.user?.name || 'N')[0]}
                      </div>
                      {item.user?.name || 'Nhân viên'}
                    </span>
                    <span className="text-[10px] text-ink-dim">{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed">{item.note}</p>
                </div>
              ))}
              {booking.notes?.length === 0 ? (
                <p className="text-sm text-ink-dim py-4 text-center">Chưa có ghi chú.</p>
              ) : null}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-5">
          {/* Status update */}
          <form className="panel p-5" onSubmit={updateStatus}>
            <h2 className="mb-4 text-base font-bold gradient-text">Cập nhật trạng thái</h2>
            <label className="label" htmlFor="detail-status">Trạng thái</label>
            <select
              id="detail-status"
              className="field"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {bookingStatusLabels[option]}
                </option>
              ))}
            </select>
            <button id="detail-save-status" className="primary-btn mt-4 w-full justify-center">
              <Save size={16} />
              Lưu trạng thái
            </button>
          </form>

          {/* Add note */}
          <form className="panel p-5" onSubmit={addNote}>
            <h2 className="mb-4 text-base font-bold gradient-text">Thêm ghi chú</h2>
            <textarea
              id="detail-note"
              className="textarea-field"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Nội dung tư vấn, yêu cầu của khách, tình trạng cọc..."
              required
            />
            <button id="detail-add-note" className="secondary-btn mt-4 w-full justify-center">
              <MessageSquarePlus size={16} />
              Thêm ghi chú
            </button>
          </form>

          {/* History timeline */}
          <section className="panel p-5">
            <h2 className="mb-4 text-base font-bold gradient-text">Lịch sử</h2>
            <div className="space-y-0">
              {booking.logs?.map((log, index) => (
                <div key={`${log.createdAt}-${index}`} className="relative flex gap-3 pb-4">
                  {/* Timeline line */}
                  {index < booking.logs.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-surface-border" />
                  )}
                  {/* Dot */}
                  <div className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-pine bg-surface">
                    <div className="h-1.5 w-1.5 rounded-full bg-pine" />
                  </div>
                  {/* Content */}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink">{log.action}</div>
                    <div className="text-[10px] text-ink-dim">{formatDateTime(log.createdAt)}</div>
                    <div className="mt-1 text-xs text-ink-muted">
                      {log.oldValue || '-'} → {log.newValue || '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
};

export default BookingDetailPage;
