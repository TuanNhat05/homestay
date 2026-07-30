import { BedDouble, Calendar, ChevronLeft, ChevronRight, Clock, Eye, Layers } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import FormMessage from '../components/FormMessage';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import PaymentBadge from '../components/PaymentBadge';
import {
  bookingStatusColors,
  bookingStatusLabels,
  formatTime,
  formatDate,
  formatCurrency,
} from '../utils/booking';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_WIDTH = 80;
const ROOM_COL_WIDTH = 180;
const LANE_HEIGHT = 38;
const LANE_GAP = 4;
const HEADER_HEIGHT = 34;
const TIMELINE_WIDTH = HOURS.length * HOUR_WIDTH;

const WEEKDAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const getDateKey = (value) => new Date(value).toISOString().slice(0, 10);

const getHourOffset = (dateStr, baseDate) => {
  const d = new Date(dateStr);
  const base = new Date(baseDate);
  base.setHours(0, 0, 0, 0);
  return (d - base) / (1000 * 60 * 60);
};

const getWeekDates = (centerDate) => {
  const d = new Date(centerDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date.toISOString().slice(0, 10);
  });
};

// Active statuses (not cancelled/completed)
const ACTIVE_STATUSES = ['new', 'consulting', 'waiting_deposit', 'deposited', 'confirmed', 'using'];

const BookingCalendarPage = () => {
  const getToday = () => new Date().toISOString().slice(0, 10);
  const [today, setToday] = useState(getToday);
  const [date, setDate] = useState(getToday);
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'week'
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [hoveredBooking, setHoveredBooking] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = getToday();
      setToday((prev) => {
        if (prev !== now) {
          setDate((prevDate) => (prevDate === prev ? now : prevDate));
          return now;
        }
        return prev;
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Promise.all([api.get('/bookings'), api.get('/rooms')])
      .then(([bookingsRes, roomsRes]) => {
        setBookings(bookingsRes.data);
        setRooms(roomsRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const changeDate = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + (viewMode === 'week' ? delta * 7 : delta));
    setDate(d.toISOString().slice(0, 10));
  };

  const weekDates = useMemo(() => getWeekDates(date), [date]);

  // ── Day view data ──
  const dayData = useMemo(() => {
    return rooms.map((room) => {
      const roomBookings = bookings
        .filter((booking) => {
          if (booking.room?._id !== room._id) return false;
          if (booking.status === 'cancelled' || booking.status === 'completed') return false;
          const bStart = getDateKey(booking.startTime);
          const bEnd = getDateKey(booking.endTime);
          return bStart === date || bEnd === date || (bStart < date && bEnd > date);
        })
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

      const lanes = [];
      const laneMap = new Map();
      for (const booking of roomBookings) {
        let startH = Math.max(0, getHourOffset(booking.startTime, date));
        let endH = Math.min(24, getHourOffset(booking.endTime, date));
        if (endH <= startH) continue;

        let placed = false;
        for (let i = 0; i < lanes.length; i++) {
          if (startH >= lanes[i]) {
            lanes[i] = endH;
            laneMap.set(booking._id, i);
            placed = true;
            break;
          }
        }
        if (!placed) {
          laneMap.set(booking._id, lanes.length);
          lanes.push(endH);
        }
      }

      return { room, bookings: roomBookings, laneMap, laneCount: Math.max(lanes.length, 1) };
    });
  }, [rooms, bookings, date]);

  // ── Week view data ──
  const weekData = useMemo(() => {
    return rooms.map((room) => {
      const days = weekDates.map((dayDate) => {
        const dayBookings = bookings.filter((booking) => {
          if (booking.room?._id !== room._id) return false;
          if (booking.status === 'cancelled' || booking.status === 'completed') return false;
          const bStart = getDateKey(booking.startTime);
          const bEnd = getDateKey(booking.endTime);
          return bStart === dayDate || bEnd === dayDate || (bStart < dayDate && bEnd > dayDate);
        });
        return { date: dayDate, bookings: dayBookings };
      });
      return { room, days };
    });
  }, [rooms, bookings, weekDates]);

  // Stats
  const stats = useMemo(() => {
    const activeRooms = new Set();
    bookings.forEach((b) => {
      if (ACTIVE_STATUSES.includes(b.status)) {
        const bStart = getDateKey(b.startTime);
        const bEnd = getDateKey(b.endTime);
        if (bStart === date || bEnd === date || (bStart < date && bEnd > date)) {
          activeRooms.add(b.room?._id);
        }
      }
    });
    return {
      totalRooms: rooms.length,
      busyRooms: activeRooms.size,
      freeRooms: rooms.length - activeRooms.size,
    };
  }, [rooms, bookings, date]);

  const now = new Date();
  const isToday = date === today;
  const currentHourOffset = isToday ? now.getHours() + now.getMinutes() / 60 : -1;

  // Status legend items
  const legendItems = ACTIVE_STATUSES.map((status) => ({
    status,
    label: bookingStatusLabels[status],
    color: bookingStatusColors[status],
  }));

  return (
    <>
      <PageHeader
        title="Lịch phòng"
        description="Xem trực quan lịch đặt phòng theo timeline."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* View mode toggle */}
            <div className="flex rounded-xl border border-surface-border overflow-hidden">
              <button
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
                  viewMode === 'day'
                    ? 'bg-pine/20 text-pine'
                    : 'bg-surface-card text-ink-dim hover:text-ink'
                }`}
                onClick={() => setViewMode('day')}
              >
                <Clock size={13} />
                Ngày
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border-l border-surface-border ${
                  viewMode === 'week'
                    ? 'bg-pine/20 text-pine'
                    : 'bg-surface-card text-ink-dim hover:text-ink'
                }`}
                onClick={() => setViewMode('week')}
              >
                <Layers size={13} />
                Tuần
              </button>
            </div>

            {/* Date nav */}
            <button className="icon-btn !h-9 !w-9" onClick={() => changeDate(-1)} aria-label="Trước">
              <ChevronLeft size={16} />
            </button>
            <input
              className="field !w-40 text-center text-sm"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
            <button className="icon-btn !h-9 !w-9" onClick={() => changeDate(1)} aria-label="Sau">
              <ChevronRight size={16} />
            </button>
            {date !== today && (
              <button className="secondary-btn !h-9 text-xs" onClick={() => setDate(today)}>
                Hôm nay
              </button>
            )}
          </div>
        }
      />
      <FormMessage>{error}</FormMessage>

      {/* Top bar: date display + stats + legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 animate-fadeIn">
        {/* Date */}
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-pine" />
          <span className="text-lg font-bold text-ink">{formatDate(date)}</span>
          {isToday && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-pine/15 px-2 py-0.5 text-xs font-semibold text-pine">
              <span className="h-1.5 w-1.5 rounded-full bg-pine animate-pulse-dot" />
              Hôm nay
            </span>
          )}
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 rounded-xl bg-surface-card border border-surface-border px-3 py-1.5 text-xs">
            <BedDouble size={13} className="text-emerald-400" />
            <span className="text-ink-muted">Trống:</span>
            <span className="font-bold text-emerald-400">{stats.freeRooms}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-surface-card border border-surface-border px-3 py-1.5 text-xs">
            <BedDouble size={13} className="text-amber-400" />
            <span className="text-ink-muted">Có khách:</span>
            <span className="font-bold text-amber-400">{stats.busyRooms}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-2 animate-fadeIn">
        <span className="text-xs text-ink-dim mr-1">Trạng thái:</span>
        {legendItems.map((item) => (
          <div
            key={item.status}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium"
            style={{ backgroundColor: `${item.color}20`, color: item.color }}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>

      {/* ════════════ DAY VIEW ════════════ */}
      {viewMode === 'day' && (
        <div className="panel overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${ROOM_COL_WIDTH + TIMELINE_WIDTH}px` }}>
              {/* Header row */}
              <div className="flex border-b border-surface-border sticky top-0 z-10 bg-surface-card/95 backdrop-blur-md">
                {/* Room column header */}
                <div
                  className="flex-shrink-0 flex items-center px-4 py-2 border-r border-surface-border text-xs font-semibold text-ink-dim uppercase tracking-wider"
                  style={{ width: `${ROOM_COL_WIDTH}px` }}
                >
                  <BedDouble size={14} className="mr-2 text-pine" />
                  Phòng
                </div>
                {/* Hour headers */}
                <div className="flex">
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className={`flex-shrink-0 flex items-center justify-center py-2 text-[11px] font-medium border-r border-surface-border/60 ${
                        isToday && Math.floor(currentHourOffset) === h
                          ? 'text-pine font-bold bg-pine/5'
                          : 'text-ink-dim'
                      }`}
                      style={{ width: `${HOUR_WIDTH}px` }}
                    >
                      {String(h).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
              </div>

              {/* Room rows */}
              {dayData.map(({ room, bookings: roomBookings, laneMap, laneCount }) => {
                const rowHeight = laneCount * LANE_HEIGHT + (laneCount - 1) * LANE_GAP + 16;
                const hasBookings = roomBookings.length > 0;

                return (
                  <div
                    key={room._id}
                    className="flex border-b border-surface-border/60 group/row hover:bg-surface-hover/20 transition-colors"
                  >
                    {/* Room info (fixed left) */}
                    <div
                      className="flex-shrink-0 flex flex-col justify-center px-4 py-3 border-r border-surface-border"
                      style={{ width: `${ROOM_COL_WIDTH}px`, minHeight: `${Math.max(rowHeight, 60)}px` }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                            hasBookings ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]' : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]'
                          }`}
                        />
                        <span className="font-semibold text-sm text-ink truncate">{room.roomName}</span>
                      </div>
                      <div className="text-[11px] text-ink-dim mt-0.5 ml-[18px]">
                        {room.roomType} • {room.capacity} người
                      </div>
                      {hasBookings && (
                        <div className="mt-1.5 ml-[18px]">
                          <span className="inline-flex items-center rounded-md bg-pine/10 px-1.5 py-0.5 text-[10px] font-semibold text-pine">
                            {roomBookings.length} booking
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Timeline area */}
                    <div className="relative flex-1" style={{ height: `${Math.max(rowHeight, 60)}px` }}>
                      {/* Vertical grid lines */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {HOURS.map((h) => (
                          <div
                            key={h}
                            className="flex-shrink-0 border-r border-surface-border/30"
                            style={{ width: `${HOUR_WIDTH}px` }}
                          />
                        ))}
                      </div>

                      {/* Current time marker */}
                      {isToday && currentHourOffset >= 0 && currentHourOffset <= 24 && (
                        <div
                          className="absolute top-0 bottom-0 z-20 w-[2px] bg-coral/80"
                          style={{ left: `${currentHourOffset * HOUR_WIDTH}px` }}
                        >
                          <div className="absolute -top-0.5 -left-[3px] h-2 w-2 rounded-full bg-coral shadow-[0_0_8px_rgba(251,113,133,0.6)]" />
                        </div>
                      )}

                      {/* Booking blocks */}
                      {roomBookings.map((booking) => {
                        let startH = Math.max(0, getHourOffset(booking.startTime, date));
                        let endH = Math.min(24, getHourOffset(booking.endTime, date));
                        if (endH <= startH) return null;

                        const left = startH * HOUR_WIDTH;
                        const width = (endH - startH) * HOUR_WIDTH;
                        const color = bookingStatusColors[booking.status] || '#94a3b8';
                        const isUsing = booking.status === 'using';
                        const lane = laneMap.get(booking._id) || 0;
                        const top = 8 + lane * (LANE_HEIGHT + LANE_GAP);

                        return (
                          <div
                            key={booking._id}
                            className="absolute z-10"
                            style={{
                              top: `${top}px`,
                              left: `${left}px`,
                              width: `${Math.max(width, 70)}px`,
                              height: `${LANE_HEIGHT}px`,
                            }}
                            onMouseEnter={() => setHoveredBooking(booking._id)}
                            onMouseLeave={() => setHoveredBooking(null)}
                          >
                            <Link
                              to={`/bookings/${booking._id}`}
                              className="flex items-center gap-2 rounded-lg px-3 text-xs font-semibold h-full transition-all duration-200 hover:brightness-125 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                              style={{
                                background: `linear-gradient(135deg, ${color}30, ${color}18)`,
                                borderLeft: `3px solid ${color}`,
                                color: color,
                                boxShadow: `0 2px 8px ${color}15`,
                              }}
                            >
                              {isUsing && (
                                <span className="relative flex h-2 w-2 shrink-0">
                                  <span
                                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span
                                    className="relative inline-flex h-2 w-2 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                </span>
                              )}
                              <span className="truncate">{booking.customer?.name || 'N/A'}</span>
                              <span className="ml-auto shrink-0 opacity-60 text-[10px] font-medium">
                                {formatTime(booking.startTime)}-{formatTime(booking.endTime)}
                              </span>
                            </Link>

                            {/* Tooltip */}
                            {hoveredBooking === booking._id && (
                              <div className="absolute z-30 top-full mt-2 w-64 rounded-xl border border-surface-border bg-surface-card/95 p-4 shadow-glass backdrop-blur-xl animate-scaleIn pointer-events-none">
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold"
                                    style={{ backgroundColor: `${color}25`, color }}
                                  >
                                    {(booking.customer?.name || 'N')[0]}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-ink">{booking.customer?.name}</div>
                                    <div className="text-[11px] text-ink-dim">{booking.customer?.phone}</div>
                                  </div>
                                </div>
                                <div className="space-y-1.5 text-xs text-ink-muted">
                                  <div className="flex justify-between">
                                    <span>Thời gian</span>
                                    <span className="text-ink font-medium">
                                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Thời lượng</span>
                                    <span className="text-ink font-medium">{booking.durationHours}h</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tổng tiền</span>
                                    <span className="text-pine font-semibold">{formatCurrency(booking.totalPrice)}</span>
                                  </div>
                                </div>
                                <div className="mt-2.5 pt-2 border-t border-surface-border flex items-center gap-2">
                                  <StatusBadge status={booking.status} />
                                  <PaymentBadge booking={booking} />
                                </div>
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-ink-dim">
                                  <Eye size={10} />
                                  Click để xem chi tiết
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Empty state */}
                      {roomBookings.length === 0 && (
                        <div className="absolute inset-0 flex items-center px-4">
                          <span className="text-xs text-ink-dim/60 italic">Trống — chưa có booking</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room count footer */}
          {rooms.length > 0 && (
            <div className="px-5 py-2.5 border-t border-surface-border text-right text-[11px] text-ink-dim">
              {rooms.length} phòng • {dayData.reduce((sum, d) => sum + d.bookings.length, 0)} booking hôm nay
            </div>
          )}
        </div>
      )}

      {/* ════════════ WEEK VIEW ════════════ */}
      {viewMode === 'week' && (
        <div className="panel overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-surface-card/80 backdrop-blur-md">
                  <th
                    className="sticky left-0 z-10 bg-surface-card/95 backdrop-blur-md border-b border-r border-surface-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-dim"
                    style={{ width: `${ROOM_COL_WIDTH}px`, minWidth: `${ROOM_COL_WIDTH}px` }}
                  >
                    <div className="flex items-center gap-2">
                      <BedDouble size={14} className="text-pine" />
                      Phòng
                    </div>
                  </th>
                  {weekDates.map((wd) => {
                    const d = new Date(wd);
                    const isWdToday = wd === today;
                    const isSelected = wd === date;
                    return (
                      <th
                        key={wd}
                        className={`border-b border-r border-surface-border px-2 py-3 text-center text-xs font-semibold cursor-pointer transition-colors hover:bg-surface-hover/40 ${
                          isWdToday ? 'bg-pine/8' : ''
                        }`}
                        onClick={() => {
                          setDate(wd);
                          setViewMode('day');
                        }}
                      >
                        <div className={`text-[10px] uppercase tracking-wider ${isWdToday ? 'text-pine' : 'text-ink-dim'}`}>
                          {WEEKDAY_NAMES[d.getDay()]}
                        </div>
                        <div
                          className={`mt-0.5 text-lg font-bold ${
                            isWdToday
                              ? 'text-pine'
                              : isSelected
                              ? 'text-ocean'
                              : 'text-ink'
                          }`}
                        >
                          {d.getDate()}
                        </div>
                        {isWdToday && (
                          <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-pine animate-pulse-dot" />
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {weekData.map(({ room, days }) => (
                  <tr key={room._id} className="group hover:bg-surface-hover/20 transition-colors">
                    {/* Room cell */}
                    <td
                      className="sticky left-0 z-[5] bg-surface-card/95 backdrop-blur-md border-b border-r border-surface-border px-4 py-3"
                      style={{ width: `${ROOM_COL_WIDTH}px`, minWidth: `${ROOM_COL_WIDTH}px` }}
                    >
                      <div className="font-semibold text-sm text-ink truncate">{room.roomName}</div>
                      <div className="text-[11px] text-ink-dim">{room.roomType} • {room.capacity} người</div>
                    </td>

                    {/* Day cells */}
                    {days.map(({ date: dayDate, bookings: dayBookings }) => {
                      const isDayToday = dayDate === today;
                      const hasBookings = dayBookings.length > 0;
                      return (
                        <td
                          key={dayDate}
                          className={`border-b border-r border-surface-border p-1.5 align-top transition-colors cursor-pointer hover:bg-surface-hover/30 ${
                            isDayToday ? 'bg-pine/5' : ''
                          }`}
                          onClick={() => {
                            setDate(dayDate);
                            setViewMode('day');
                          }}
                        >
                          {hasBookings ? (
                            <div className="space-y-1">
                              {dayBookings.slice(0, 3).map((booking) => {
                                const color = bookingStatusColors[booking.status] || '#94a3b8';
                                return (
                                  <div
                                    key={booking._id}
                                    className="rounded-md px-1.5 py-1 text-[10px] font-semibold truncate transition-all hover:brightness-125"
                                    style={{
                                      background: `linear-gradient(135deg, ${color}30, ${color}15)`,
                                      borderLeft: `2px solid ${color}`,
                                      color,
                                    }}
                                    title={`${booking.customer?.name} • ${formatTime(booking.startTime)}-${formatTime(booking.endTime)}`}
                                  >
                                    {booking.customer?.name || 'N/A'}
                                  </div>
                                );
                              })}
                              {dayBookings.length > 3 && (
                                <div className="text-center text-[10px] text-ink-dim font-medium">
                                  +{dayBookings.length - 3} khác
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-8 flex items-center justify-center">
                              <span className="text-[10px] text-ink-dim/40">—</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {rooms.length > 0 && (
            <div className="px-5 py-2.5 border-t border-surface-border text-right text-[11px] text-ink-dim">
              {rooms.length} phòng • Tuần {weekDates[0] && formatDate(weekDates[0])} – {weekDates[6] && formatDate(weekDates[6])}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {rooms.length === 0 && (
        <div className="panel p-12 text-center animate-fadeIn">
          <div className="text-4xl mb-3">🏠</div>
          <div className="text-ink-muted">Chưa có phòng nào. Hãy thêm phòng trước.</div>
          <Link to="/rooms" className="primary-btn mt-4 inline-flex">
            Quản lý phòng
          </Link>
        </div>
      )}
    </>
  );
};

export default BookingCalendarPage;
