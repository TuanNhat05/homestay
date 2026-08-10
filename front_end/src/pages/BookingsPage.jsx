import { Eye, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import FormMessage from '../components/FormMessage';
import PageHeader from '../components/PageHeader';
import PaymentBadge from '../components/PaymentBadge';
import StatusBadge from '../components/StatusBadge';
import { bookingStatusLabels, formatCurrency, formatDateTime, statusOptions } from '../utils/booking';

const BookingsPage = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  // 'active' from dashboard means default view (hide completed & cancelled)
  const resolvedInitialStatus = initialStatus === 'active' ? '' : initialStatus;

  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(resolvedInitialStatus);

  useEffect(() => {
    api
      .get('/bookings')
      .then((res) => setBookings(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch = !search || (b.customer?.name || '').toLowerCase().includes(search.toLowerCase());
      // 'all' shows everything, empty hides completed & cancelled, specific status filters exact match
      let matchStatus;
      if (filterStatus === 'all') {
        matchStatus = true;
      } else if (filterStatus) {
        matchStatus = b.status === filterStatus;
      } else {
        matchStatus = b.status !== 'completed' && b.status !== 'cancelled';
      }
      return matchSearch && matchStatus;
    });
  }, [bookings, search, filterStatus]);

  return (
    <>
      <PageHeader
        title="Danh sách booking"
        description="Theo dõi các lượt hỏi phòng, cọc, xác nhận và sử dụng phòng."
        actions={
          <Link className="primary-btn" to="/bookings/new">
            <Plus size={16} />
            Tạo booking
          </Link>
        }
      />
      <FormMessage>{error}</FormMessage>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 animate-fadeIn">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim" />
          <input
            id="booking-search"
            className="field !pl-9"
            type="text"
            placeholder="Tìm theo tên khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="booking-filter-status"
          className="field sm:!w-auto sm:min-w-[160px]"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Đang hoạt động</option>
          <option value="all">Tất cả (gồm hoàn tất/hủy)</option>
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {bookingStatusLabels[opt]}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {filtered.map((booking) => (
          <Link
            key={booking._id}
            to={`/bookings/${booking._id}`}
            className="panel p-4 block no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-ink text-sm">{booking.customer?.name || '-'}</span>
              <StatusBadge status={booking.status} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-lg bg-surface-hover px-2 py-0.5 text-xs font-medium text-ink-muted">
                {booking.room?.roomName || '-'}
              </span>
              <PaymentBadge booking={booking} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted mt-2">
              <div>
                <span className="text-ink-dim">Bắt đầu: </span>
                <span className="text-ink">{formatDateTime(booking.startTime)}</span>
              </div>
              <div>
                <span className="text-ink-dim">Kết thúc: </span>
                <span className="text-ink">{formatDateTime(booking.endTime)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-border">
              <span className="text-sm font-bold text-pine">{formatCurrency(booking.totalPrice)}</span>
              <span className="text-xs text-ink-dim">{booking.assignedStaff?.name || '-'}</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="panel p-8 text-center text-ink-dim">
            <div className="text-3xl mb-2">📋</div>
            {bookings.length === 0 ? 'Chưa có booking nào.' : 'Không tìm thấy booking phù hợp.'}
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="table-wrap hidden md:block">
        <table className="min-w-[900px] w-full">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-3.5">Khách</th>
              <th className="px-4 py-3.5">Phòng</th>
              <th className="px-4 py-3.5">Bắt đầu</th>
              <th className="px-4 py-3.5">Kết thúc</th>
              <th className="px-4 py-3.5">Tổng tiền</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5">Thanh toán</th>
              <th className="px-4 py-3.5">Nhân viên</th>
              <th className="px-4 py-3.5">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((booking) => (
              <tr
                key={booking._id}
                className="group transition-colors duration-150 hover:bg-surface-hover/50"
              >
                <td className="table-cell font-semibold text-ink">{booking.customer?.name || '-'}</td>
                <td className="table-cell">
                  <span className="rounded-lg bg-surface-hover px-2 py-1 text-xs font-medium text-ink-muted">
                    {booking.room?.roomName || '-'}
                  </span>
                </td>
                <td className="table-cell">{formatDateTime(booking.startTime)}</td>
                <td className="table-cell">{formatDateTime(booking.endTime)}</td>
                <td className="table-cell font-semibold text-pine">{formatCurrency(booking.totalPrice)}</td>
                <td className="table-cell">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="table-cell">
                  <PaymentBadge booking={booking} />
                </td>
                <td className="table-cell">{booking.assignedStaff?.name || '-'}</td>
                <td className="table-cell">
                  <Link
                    className="secondary-btn !h-8 !px-3 text-xs"
                    to={`/bookings/${booking._id}`}
                  >
                    <Eye size={14} />
                    Xem
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td className="table-cell text-center text-ink-dim py-12" colSpan="9">
                  <div className="text-3xl mb-2">📋</div>
                  {bookings.length === 0 ? 'Chưa có booking nào.' : 'Không tìm thấy booking phù hợp.'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Count */}
      <div className="mt-3 text-right text-xs text-ink-dim animate-fadeIn">
        Hiển thị {filtered.length} / {bookings.length} booking
      </div>
    </>
  );
};

export default BookingsPage;
