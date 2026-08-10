import { AlertTriangle, Calendar, Clock, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import FormMessage from '../components/FormMessage';
import PageHeader from '../components/PageHeader';
import { formatCurrency, formatDateTime, formatTime } from '../utils/booking';

const HOUR_OPTIONS = [3, 4, 5, 6, 8, 10, 12];

const BookingFormPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  // Round current time to nearest 15 minutes for default
  const roundedNow = useMemo(() => {
    const d = new Date();
    const ms = 15 * 60 * 1000;
    return new Date(Math.ceil(d.getTime() / ms) * ms);
  }, []);

  const toLocalInputValue = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [form, setForm] = useState({
    customer: '',
    room: '',
    durationHours: 0,
    customHours: '',
    startTime: toLocalInputValue(roundedNow),
    depositAmount: 0,
    note: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [roomBookings, setRoomBookings] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/rooms'), api.get('/customers')])
      .then(([roomsRes, customersRes]) => {
        setRooms(roomsRes.data);
        setCustomers(customersRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  // Fetch existing bookings when room changes
  useEffect(() => {
    if (!form.room) {
      setRoomBookings([]);
      return;
    }
    api.get(`/bookings?room=${form.room}`)
      .then((res) => {
        // Only keep active bookings (not cancelled/completed)
        setRoomBookings(
          res.data.filter((b) => b.status !== 'cancelled' && b.status !== 'completed')
        );
      })
      .catch(() => setRoomBookings([]));
  }, [form.room]);

  const selectedRoom = useMemo(() => rooms.find((room) => room._id === form.room), [rooms, form.room]);

  // Actual hours to book: preset or custom
  const activeHours = form.durationHours > 0 ? form.durationHours : Number(form.customHours) || 0;

  const totalPrice = activeHours > 0 && selectedRoom ? activeHours * selectedRoom.pricePerHour : 0;

  // Compute start and end times based on user-selected startTime
  const startTime = form.startTime ? new Date(form.startTime) : null;
  const endTime = startTime && activeHours > 0 ? new Date(startTime.getTime() + activeHours * 60 * 60 * 1000) : null;

  // Check for overlapping bookings
  const overlapBookings = useMemo(() => {
    if (!startTime || !endTime || !form.room) return [];
    return roomBookings.filter((b) => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      // Overlap: newStart < oldEnd AND newEnd > oldStart
      return startTime < bEnd && endTime > bStart;
    });
  }, [roomBookings, startTime, endTime, form.room]);

  const hasOverlap = overlapBookings.length > 0;

  const selectPresetHours = (hours) => {
    setForm({ ...form, durationHours: hours, customHours: '' });
  };

  const handleCustomHoursChange = (value) => {
    setForm({ ...form, durationHours: 0, customHours: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (activeHours < 1) {
      setError('Vui lòng chọn số tiếng thuê (tối thiểu 1 tiếng)');
      return;
    }

    if (!form.customer) {
      setError('Vui lòng chọn khách hàng');
      return;
    }

    if (!form.room) {
      setError('Vui lòng chọn phòng');
      return;
    }

    if (!form.startTime) {
      setError('Vui lòng chọn thời gian bắt đầu');
      return;
    }

    setSubmitting(true);
    try {
      const submitStartTime = new Date(form.startTime);
      const submitEndTime = new Date(submitStartTime.getTime() + activeHours * 60 * 60 * 1000);

      const res = await api.post('/bookings', {
        customer: form.customer,
        room: form.room,
        startTime: submitStartTime.toISOString(),
        endTime: submitEndTime.toISOString(),
        depositAmount: Number(form.depositAmount || 0),
        note: form.note,
      });
      navigate(`/bookings/${res.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Tạo booking" description="Chọn khách, phòng và số tiếng thuê." />

      <form className="grid gap-5 grid-cols-1 lg:grid-cols-[1fr_320px]" onSubmit={handleSubmit}>
        <div className="panel p-5">
          <div className="mb-5">
            <FormMessage>{error}</FormMessage>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="booking-customer">Khách hàng</label>
              <select
                id="booking-customer"
                className="field"
                value={form.customer}
                onChange={(event) => setForm({ ...form, customer: event.target.value })}
                required
              >
                <option value="">Chọn khách hàng</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="booking-room">Phòng</label>
              <select
                id="booking-room"
                className="field"
                value={form.room}
                onChange={(event) => setForm({ ...form, room: event.target.value })}
                required
              >
                <option value="">Chọn phòng</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.roomName} - {formatCurrency(room.pricePerHour)}/giờ
                  </option>
                ))}
              </select>
            </div>

            {/* Duration hour selection */}
            <div className="md:col-span-2">
              <label className="label">
                <Clock size={14} className="inline mr-1.5 -mt-0.5" />
                Số tiếng thuê
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {HOUR_OPTIONS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => selectPresetHours(h)}
                    className={`
                      relative flex flex-col items-center justify-center rounded-xl border-2 px-3 py-2 sm:px-5 sm:py-3
                      text-sm font-bold transition-all duration-200 cursor-pointer select-none min-w-[52px]
                      ${form.durationHours === h
                        ? 'border-pine bg-pine/15 text-pine shadow-lg shadow-pine/10 scale-105'
                        : 'border-surface-border bg-surface-hover/30 text-ink-muted hover:border-pine/40 hover:bg-pine/5 hover:text-pine'
                      }
                    `}
                  >
                    <span className="text-lg">{h}</span>
                    <span className="text-[10px] font-medium opacity-70">tiếng</span>
                    {form.durationHours === h && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pine text-[10px] text-white">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom hours input */}
              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <span className="text-xs text-ink-dim whitespace-nowrap">Hoặc nhập số tiếng khác:</span>
                <input
                  id="booking-custom-hours"
                  className="field !w-28"
                  type="number"
                  min="1"
                  max="72"
                  step="1"
                  placeholder="VD: 7"
                  value={form.customHours}
                  onChange={(event) => handleCustomHoursChange(event.target.value)}
                />
                {form.customHours && Number(form.customHours) > 0 && (
                  <span className="text-xs font-semibold text-pine">{form.customHours} tiếng</span>
                )}
              </div>
            </div>

            {/* Start time picker */}
            <div className="md:col-span-2">
              <label className="label" htmlFor="booking-start-time">
                <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
                Thời gian bắt đầu
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-1">
                <input
                  id="booking-start-time"
                  className="field"
                  type="datetime-local"
                  step="900"
                  value={form.startTime}
                  onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                  required
                />
                <button
                  type="button"
                  className="text-xs font-medium text-pine hover:text-pine/80 transition-colors underline underline-offset-2"
                  onClick={() => setForm({ ...form, startTime: toLocalInputValue(new Date()) })}
                >
                  Đặt về hiện tại
                </button>
              </div>
              {endTime && (
                <p className="mt-2 text-xs text-ink-dim">
                  Kết thúc dự kiến: <span className="font-semibold text-pine">{formatDateTime(endTime)}</span>
                </p>
              )}

              {/* Overlap warning */}
              {hasOverlap && (
                <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-rose-400">
                    <AlertTriangle size={16} />
                    Trùng lịch! Phòng đã có booking trong khung giờ này:
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {overlapBookings.map((b) => (
                      <li key={b._id} className="flex items-center gap-2 text-xs text-rose-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                        <span className="font-medium">{b.customer?.name || 'N/A'}</span>
                        <span className="text-rose-400/70">
                          {formatTime(b.startTime)} - {formatTime(b.endTime)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="label" htmlFor="booking-deposit">Tiền cọc</label>
              <input
                id="booking-deposit"
                className="field"
                type="number"
                min="0"
                value={form.depositAmount}
                onChange={(event) => setForm({ ...form, depositAmount: event.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label" htmlFor="booking-note">Ghi chú nội bộ ban đầu</label>
              <textarea
                id="booking-note"
                className="textarea-field"
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
                placeholder="Ví dụ: khách hỏi qua fanpage, đã tư vấn giá phòng..."
              />
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="panel h-fit p-5">
          <h2 className="text-base font-bold gradient-text">Tạm tính</h2>

          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-dim">Phòng</dt>
              <dd className="font-semibold text-ink">{selectedRoom ? selectedRoom.roomName : '-'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-dim">Số tiếng</dt>
              <dd className="font-semibold text-ink">
                {activeHours > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-pine/15 px-2 py-0.5 text-pine">
                    <Clock size={12} />
                    {activeHours} tiếng
                  </span>
                ) : '-'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-dim">Giá mỗi giờ</dt>
              <dd className="font-semibold text-ink">{selectedRoom ? formatCurrency(selectedRoom.pricePerHour) : '-'}</dd>
            </div>

            {/* Date/time display */}
            <div className="rounded-xl border border-surface-border bg-surface-hover/30 p-3 space-y-2">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-dim text-xs">Ngày</dt>
                <dd className="font-semibold text-ink text-xs">
                  {startTime && !Number.isNaN(startTime.getTime())
                    ? new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(startTime)
                    : '-'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-dim text-xs">Bắt đầu</dt>
                <dd className="font-semibold text-ink text-xs">
                  {startTime && !Number.isNaN(startTime.getTime()) ? formatDateTime(startTime) : '-'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-dim text-xs">Kết thúc</dt>
                <dd className="font-semibold text-ink text-xs">{endTime ? formatDateTime(endTime) : '-'}</dd>
              </div>
            </div>

            <div className="border-t border-surface-border pt-4">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-dim">Tổng tiền</dt>
                <dd className="text-xl font-bold text-pine">{formatCurrency(totalPrice)}</dd>
              </div>
            </div>
          </dl>

          <button
            id="booking-submit"
            className="primary-btn mt-6 w-full justify-center !h-11"
            disabled={submitting || activeHours < 1 || hasOverlap}
          >
            <Save size={16} />
            {hasOverlap ? 'Không thể đặt — trùng lịch' : submitting ? 'Đang tạo...' : 'Tạo booking'}
          </button>
        </aside>
      </form>
    </>
  );
};

export default BookingFormPage;
